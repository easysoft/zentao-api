/** Run explicitly: bun --env-file=env.local scripts/test-real-html-files.ts
 * Creates persistent fixtures. DELETE requests, including SDK cleanup, never reach the server.
 */
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { deflateSync } from 'node:zlib';
import {
  ZentaoClient, request, setGlobalOptions, createLink, getModuleAction, parseLink,
  type ClientRequestOptions, type RequestOptions, type ResponseData, type FileWarning,
} from '../src/index';
import { parseHtmlFiles } from '../src/request/html-files';
import { formatRealEnvError, validateRealEnvResponse, resolveRealEnvWorkflowGroup } from '../tests/real-env-support';

const server = process.env.ZENTAO_URL ?? process.env.ZENTAO_BASE_URL;
assert(server, 'env.local must configure ZENTAO_URL or ZENTAO_BASE_URL.');
const verifyPath = Bun.argv.find(x => x.startsWith('--verify='))?.slice('--verify='.length);
const previous = verifyPath ? JSON.parse(readFileSync(verifyPath, 'utf8')) : undefined;
const runID: string = previous?.runID ?? `html-files-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomUUID().slice(0, 8)}`;
const outputDir = verifyPath ? dirname(resolve(verifyPath)) : resolve('reports', `${runID}.local`);
mkdirSync(outputDir, { recursive: true });
const client = new ZentaoClient({
  baseUrl: server, token: process.env.ZENTAO_TOKEN,
  timeout: Number(process.env.ZENTAO_TIMEOUT ?? 30000),
  insecure: /^(1|true|yes|on)$/i.test(process.env.ZENTAO_INSECURE ?? ''),
  actionAssistant: { name: 'Codex', info: runID },
});
setGlobalOptions({ persistProfiles: false });

type ObjectEntry = { type: string; id: number; title: string; case: string; url?: string; parentID?: number };
type FileEntry = {
  id: number; name: string; case: string; bytes: number; sha256: string;
  metadata?: Record<string, unknown>; downloadMatches?: boolean; url?: string;
  expectedObjectType?: string; expectedObjectID?: number; uid?: string;
};
const objects: ObjectEntry[] = previous?.objects ?? [];
const files: FileEntry[] = previous?.files ?? [];
const calls: { case: string; method: string; path: string; ms: number; status?: unknown; error?: string }[] = previous?.calls ?? [];
const checks: { name: string; status: 'pass' | 'fail' | 'skip'; ms: number; detail?: string }[] = previous?.checks.filter((x: { name: string }) => !x.name.startsWith('最终清单')) ?? [];
const blockedDeletes: string[] = previous?.blockedDeletes ?? [];
let currentCase = 'setup';
let config: Awaited<ReturnType<ZentaoClient['getZentaoConfig']>>;
let phase = 'running';
const hash = (value: Uint8Array) => createHash('sha256').update(value).digest('hex');
const record = (value: unknown): Record<string, unknown> => value !== null && typeof value === 'object' ? value as Record<string, unknown> : {};
const idOf = (value: unknown): number => {
  const root = record(value);
  const id = Number(root.id ?? record(root.data).id ?? record(root.doc).id);
  assert(Number.isSafeInteger(id) && id > 0, 'Expected a positive result ID.');
  return id;
};
const originalRequest = client.request.bind(client);
client.request = (async (path: string, options: ClientRequestOptions = {}) => {
  const method = options.method ?? 'GET';
  if (method === 'DELETE') {
    blockedDeletes.push(path);
    throw new Error(`Test retention policy blocked DELETE ${path}`);
  }
  assert(!verifyPath || method === 'GET' || path === '/users/login', 'Verification only permits reads and authentication.');
  const started = performance.now();
  const entry: typeof calls[number] = { case: currentCase, method, path, ms: 0 };
  calls.push(entry);
  try {
    const raw = await originalRequest(path, options);
    entry.status = record(raw).status;
    const result = method === 'POST' && raw instanceof Response ? await raw.clone().json().catch(() => ({})) : raw;
    if (method === 'POST' && path === '/files' && record(raw).status === 'success') {
      const id = idOf(raw);
      const form = options.body as FormData;
      // Reparse multipart to observe Bun's transmitted filename rather than its source File.name.
      const sent = await new Response(form).formData();
      const source = sent.get('file') as File;
      const bytes = new Uint8Array(await source.arrayBuffer());
      const uid = options.query?.uid;
      assert(typeof uid === 'string' && /^[A-Za-z0-9_-]+$/.test(uid));
      assert.equal(options.query?.extra, 'editor');
      files.push({ id, name: source.name, case: currentCase, bytes: bytes.length, sha256: hash(bytes), uid });
      save();
    }
    if (method === 'POST' && record(result).status !== 'fail') {
      const type = path === '/products' ? 'product' : path === '/stories' ? 'story'
        : path === '/bugs' ? 'bug' : path === '/projects' ? 'project'
        : path === '/meetings' ? 'meeting' : /\/libs$/.test(path) ? 'doclib'
        : /\/docs$/.test(path) ? 'doc' : undefined;
      if (type) {
        try {
          const body = record(options.body);
          objects.push({ type, id: idOf(result), title: String(body.title ?? body.name ?? runID), case: currentCase });
          save();
        } catch { /* The check records malformed success results separately. */ }
      }
    }
    return raw;
  } catch (error) {
    entry.error = formatRealEnvError(error);
    throw error;
  } finally { entry.ms = Math.round(performance.now() - started); }
}) as ZentaoClient['request'];

function save(): void {
  const profile = config && { server: client.siteUrl, serverConfig: config };
  if (profile) {
    for (const item of objects) item.url = createLink(profile, {
      moduleName: item.type === 'doclib' ? 'doc' : item.type,
      methodName: item.type === 'doclib' ? 'browse' : 'view',
      vars: `${item.type === 'doclib' ? 'libID' : `${item.type}ID`}=${item.id}`,
    });
    for (const item of files) item.url = createLink(profile, {
      moduleName: 'file', methodName: 'read', vars: `fileID=${item.id}`,
      viewType: item.name.split('.').at(-1) || 'png',
    });
  }
  const summary = { runID, phase, server: client.siteUrl, version: config?.version, checks, objects, files, blockedDeletes, calls };
  writeFileSync(join(outputDir, 'report.json'), JSON.stringify(summary, null, 2));
  const cell = (value: unknown) => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
  writeFileSync(join(outputDir, 'report.md'), [
    `# 富文本关联文件测试 ${runID}`, '',
    `环境：${client.siteUrl}；版本：${config?.version ?? 'pending'}；状态：${phase}。`,
    '本次创建的对象、上传文件和本地样本全部保留；所有 DELETE 请求均在本地拦截。', '',
    '| 检查 | 结果 | 耗时 ms | 说明 |', '| --- | --- | ---: | --- |',
    ...checks.map(x => `| ${cell(x.name)} | ${x.status} | ${x.ms} | ${cell(x.detail)} |`), '',
    '| 类型 | ID | 名称 | 创建场景 | 禅道链接 |', '| --- | ---: | --- | --- | --- |',
    ...objects.map(x => `| ${x.type} | ${x.id} | ${cell(x.title)} | ${cell(x.case)} | [查看](${x.url}) |`), '',
    '| 文件 ID | 名称 | 字节 | 实际归属 | 预期归属 | 内容校验 | 禅道链接 |', '| ---: | --- | ---: | --- | --- | --- | --- |',
    ...files.map(x => `| ${x.id} | ${cell(x.name)} | ${x.bytes} | ${cell(x.metadata?.objectType)} #${cell(x.metadata?.objectID)} | ${cell(x.expectedObjectType)} #${cell(x.expectedObjectID)} | ${x.downloadMatches ?? 'pending'} | [下载](${x.url}) |`), '',
    `拦截的清理请求：${blockedDeletes.join(', ') || '无'}。`,
    '详细请求路径、耗时和 SHA-256 见同目录 report.json；未记录凭据和业务响应正文。', '',
  ].join('\n'));
}

async function check(name: string, run: () => Promise<void>): Promise<void> {
  currentCase = name;
  const start = performance.now();
  try {
    await run();
    checks.push({ name, status: 'pass', ms: Math.round(performance.now() - start) });
    console.log(`PASS ${name}`);
  } catch (error) {
    const detail = formatRealEnvError(error);
    checks.push({ name, status: 'fail', ms: Math.round(performance.now() - start), detail });
    console.log(`FAIL ${name}: ${detail}`);
  }
  save();
}

async function api(name: string, params: Record<string, unknown>, options: RequestOptions = {}): Promise<ResponseData> {
  const response = await request(name, params, { client, throwOnFail: true, ...options }) as ResponseData;
  validateRealEnvResponse(response);
  return response;
}
const data = async (name: string, id: number) => record((await api(name, { id })).data);
function ownObject(type: string): ObjectEntry {
  const result = objects.find(x => x.type === type);
  assert(result, `Missing test ${type}.`);
  return result;
}
async function verifyFile(item: FileEntry, objectType: string, objectID: number): Promise<void> {
  const metadata = await data('file/get', item.id);
  item.metadata = Object.fromEntries(['id', 'title', 'extension', 'objectType', 'objectID', 'extra', 'size'].map(k => [k, metadata[k]]));
  item.expectedObjectType ??= objectType;
  item.expectedObjectID ??= objectID;
  const response = await api('file/read', { fileID: item.id, stream: 0 });
  assert(response.data instanceof ArrayBuffer, 'file/read must return bytes.');
  item.downloadMatches = hash(new Uint8Array(response.data)) === item.sha256;
  assert(item.downloadMatches, `File #${item.id} content differs.`);
  save();
  assert.equal(metadata.objectType, objectType, `File #${item.id} objectType`);
  assert.equal(Number(metadata.objectID), objectID, `File #${item.id} objectID`);
}
function assertImage(html: unknown, id: number): void {
  const documents = parseHtmlFiles({ steps: html }, getModuleAction('bug', 'update')!);
  const profile = { server: client.siteUrl, serverConfig: config };
  assert(documents.some(document => document.references.some(reference => {
    const link = parseLink(profile, reference.path, { requestType: 'auto' });
    return link.moduleName === 'file' && link.methodName === 'read' && (link.params?.fileID ?? link.params?.$1) === String(id);
  })), `Missing image for file #${id}`);
}

const newFiles = (since: number) => files.slice(since);
function noWarnings(response: ResponseData): void {
  assert.equal(response.fileWarnings?.length ?? 0, 0, JSON.stringify(response.fileWarnings));
}

// A visible striped PNG fixture, with no image dependency.
function png(): Uint8Array {
  const chunk = (name: string, content: Uint8Array) => {
    const body = Buffer.concat([Buffer.from(name), content]);
    let crc = 0xffffffff;
    for (const value of body) {
      crc ^= value;
      for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
    const size = Buffer.alloc(4); size.writeUInt32BE(content.length);
    const end = Buffer.alloc(4); end.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
    return Buffer.concat([size, body, end]);
  };
  const width = 320, height = 100;
  const header = Buffer.alloc(13); header.writeUInt32BE(width); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 2;
  const pixels = Buffer.alloc(height * (width * 3 + 1));
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const color = x < 107 ? [30, 120, 210] : x < 214 ? [30, 175, 125] : [245, 165, 40];
    pixels.set(color, y * (width * 3 + 1) + 1 + x * 3);
  }
  return Buffer.concat([Buffer.from('89504e470d0a1a0a', 'hex'), chunk('IHDR', header), chunk('IDAT', deflateSync(pixels)), chunk('IEND', Buffer.alloc(0))]);
}
const imagePath = join(outputDir, '本地 image & sample.png');
const imageBytes = png();
writeFileSync(imagePath, imageBytes);
const missingURL = pathToFileURL(join(outputDir, 'missing.png')).href;
const imageBlob = () => new Blob([new Uint8Array(imageBytes)], { type: 'image/png' });

try {
  if (!process.env.ZENTAO_TOKEN) {
    assert(process.env.ZENTAO_ACCOUNT && process.env.ZENTAO_PASSWORD, 'Missing authentication.');
    await client.login(process.env.ZENTAO_ACCOUNT, process.env.ZENTAO_PASSWORD);
  }
  config = await client.getZentaoConfig();
  console.log(JSON.stringify({ runID, server: client.siteUrl, version: config.version, outputDir }));

  if (!verifyPath) {
  await check('新建产品并绑定正文图片', async () => {
    const before = files.length;
    const response = await api('product/create', {
      name: runID, type: 'normal', acl: 'open',
      desc: `<h2>01 新建产品</h2><p>${runID}</p><img src="${pathToFileURL(imagePath).href}" alt="产品三色图.png"><a href="https://example.com/">网络链接原样保留</a>`,
    });
    noWarnings(response);
    const object = ownObject('product');
    assert.equal(newFiles(before).length, 1);
    const detail = await data('product/get', object.id);
    assertImage(detail.desc, newFiles(before)[0].id);
    assert(!String(detail.desc).includes('file:///'));
    for (const file of newFiles(before)) await verifyFile(file, 'product', object.id);
  });

  await check('修改产品：Blob、缺失文件默认继续及错误回调', async () => {
    const before = files.length;
    const object = ownObject('product');
    const original = String((await data('product/get', object.id)).desc);
    const warnings: FileWarning[] = [];
    const response = await api('product/update', { id: object.id, desc: `${original}<h2>02 修改与缺失文件</h2><img src="blob-image" alt="产品更新图.png"><img src="missing-image" alt="缺失图片">` }, {
      autoFill: true, fileResolver: ({ path }) => path === 'blob-image' ? { blob: imageBlob() } : path === 'missing-image' ? missingURL : path,
      onFileError: warning => { warnings.push(warning); throw new Error('Notification failure must be ignored.'); },
    });
    assert.equal(response.fileWarnings?.length, 1);
    assert.equal(warnings[0]?.stage, 'upload');
    assert.equal(newFiles(before).length, 1);
    const detail = await data('product/get', object.id);
    assert.match(String(detail.desc), /E_UPLOAD_FILE_NOT_FOUND|not found|does not exist/i);
    await verifyFile(files.at(-1)!, 'product', object.id);
  });

  await check('新建需求：映射解析、跨 HTML 字段去重与网络 URL', async () => {
    const before = files.length;
    const response = await api('story/create', {
      productID: ownObject('product').id, title: `${runID} 需求`, category: 'feature', source: 'po',
      spec: '<h2>03 需求描述</h2><img src="shared-image" alt="共享图.png">',
      verify: '<h2>验收标准</h2><img src="shared-image" alt="共享图.png"><img src="network-asset" alt="远程截图">',
    }, { fileResolver: { 'shared-image': { path: imagePath }, 'network-asset': { url: 'https://example.com/report.png', name: '远程截图.png' } } });
    noWarnings(response);
    assert.equal(newFiles(before).length, 1);
    const object = ownObject('story');
    const detail = await data('story/get', object.id);
    const id = files.at(-1)!.id;
    assertImage(detail.spec, id);
    assertImage(detail.verify, id);
    assert(String(detail.verify).includes('https://example.com/report.png'));
    await verifyFile(files.at(-1)!, 'story', object.id);
  });

  await check('变更需求：异步函数解析和已有 file:ID 引用', async () => {
    const object = ownObject('story');
    const before = files.length;
    const response = await api('story/change', {
      id: object.id, title: object.title,
      spec: `<h2>04 需求变更</h2><img src="function-image" alt="变更图.png"><img src="file:${files[0].id}" alt="已有产品图.png">`,
      verify: '<p>异步解析和已有文件 ID 均可展示。</p>',
    }, { fileResolver: async reference => ({ blob: imageBlob(), name: reference.name }) });
    noWarnings(response);
    assert.equal(newFiles(before).length, 1);
    const detail = await data('story/get', object.id);
    assertImage(detail.spec, files[0].id);
    assert(!String(detail.spec).includes(`file:${files[0].id}`));
    await verifyFile(files.at(-1)!, 'story', object.id);
    await verifyFile(files[0], 'product', ownObject('product').id);
  });

  await check('产品文档库及 HTML 文档：父级 ID、raw 响应和图片归属', async () => {
    const productID = ownObject('product').id;
    await api('doc/createProductLib', { productID, name: `${runID} 文档库`, acl: 'default' });
    const before = files.length;
    const raw = await request('doc/createProductDoc', {
      productID, libID: ownObject('doclib').id, title: `${runID} HTML 文档`, contentType: 'html',
      content: '<h2>05 HTML 文档</h2><img src="doc-image" alt="文档图.png"><p>父级库 ID 不应成为附件归属 ID。</p>',
    }, { client, raw: true, fileResolver: { 'doc-image': { blob: imageBlob() } } });
    assert.equal(record(raw).status, 'success');
    assert(!Object.hasOwn(record(raw), 'fileWarnings'));
    assert.equal(newFiles(before).length, 1);
    const object = ownObject('doc');
    const detail = await data('doc/get', object.id);
    assertImage(detail.content, files.at(-1)!.id);
    await verifyFile(files.at(-1)!, 'doc', object.id);
  });

  await check('修改 HTML 文档：映射字符串按文件名匹配，保留已有禅道链接', async () => {
    const object = ownObject('doc');
    const before = files.length;
    const original = String((await data('doc/get', object.id)).content);
    const response = await api('doc/update', {
      id: object.id, title: object.title, contentType: 'html',
      content: `${original}<h2>06 文档插图</h2><img src="custom-source" alt="文档 &amp; 清单.png">`,
    }, { fileResolver: { '文档 & 清单.png': imagePath } });
    noWarnings(response);
    assert.equal(newFiles(before).length, 1);
    assert.equal(files.at(-1)!.name, '文档 & 清单.png');
    await verifyFile(files.at(-1)!, 'doc', object.id);
    assertImage((await data('doc/get', object.id)).content, files.at(-1)!.id);
  });

  await check('新建 Bug：pick/convertSingle 不干扰附件关联', async () => {
    const before = files.length;
    const response = await api('bug/create', {
      productID: ownObject('product').id, title: `${runID} Bug`, openedBuild: ['trunk'], type: 'codeerror',
      steps: '<h2>07 Bug 步骤</h2><img src="bug-image" alt="Bug图.png"><p>期望：图片展示、附件归属正确。</p>',
    }, { fileResolver: { 'bug-image': { blob: imageBlob() } }, convertSingle: () => ({ inspection: 'processed' }), pick: ['inspection'] });
    noWarnings(response);
    assert.deepEqual(response.data, { inspection: 'processed' });
    assert.equal(newFiles(before).length, 1);
    await verifyFile(files.at(-1)!, 'bug', ownObject('bug').id);
  });

  await check('修改 Bug：全局选项被单次解析器覆盖', async () => {
    const object = ownObject('bug');
    const before = files.length;
    setGlobalOptions({ fileResolver: () => { throw new Error('Global resolver should be overridden.'); }, continueOnFileUploadError: false });
    try {
      const response = await api('bug/update', { id: object.id, steps: '<h2>08 修改 Bug</h2><img src="override" alt="Bug修改图.png">' }, {
        autoFill: true, fileResolver: { override: { blob: imageBlob() } }, continueOnFileUploadError: true,
      });
      noWarnings(response);
      assert.equal(newFiles(before).length, 1);
      await verifyFile(files.at(-1)!, 'bug', object.id);
    } finally { setGlobalOptions({ fileResolver: undefined, continueOnFileUploadError: undefined }); }
  });

  await check('会议纪要：创建隔离项目和会议，在 action 中上传', async () => {
    const projectList = await api('my/projects', { recPerPage: 100, pageID: 1 });
    const workflowGroup = resolveRealEnvWorkflowGroup(projectList.data as Record<string, unknown>[], process.env.ZENTAO_WORKFLOW_GROUP);
    const today = new Date().toISOString().slice(0, 10);
    const end = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    await api('project/create', { name: `${runID} 项目`, model: 'scrum', begin: today, end, workflowGroup, products: [ownObject('product').id] });
    const me = record((await api('my/info', {})).data);
    await api('meeting/create', {
      project: ownObject('project').id, name: `${runID} 会议`, begin: `${today} 14:00`, end: `${today} 15:00`,
      mode: 'online', host: me.account, participant: [me.account],
    });
    const object = ownObject('meeting');
    const before = files.length;
    const response = await api('meeting/minutes', { id: object.id, minutes: '<h2>09 会议纪要</h2><img src="minutes-image" alt="会议图.png">' }, {
      fileResolver: { 'minutes-image': { blob: imageBlob() } },
    });
    noWarnings(response);
    assert.equal(newFiles(before).length, 1);
    await verifyFile(files.at(-1)!, 'meeting', object.id);
    assertImage((await data('meeting/get', object.id)).minutes, files.at(-1)!.id);
  });

  await check('无待处理附件：只提交主请求，不调用文件 API', async () => {
    const object = ownObject('bug');
    const detail = await data('bug/get', object.id);
    const before = calls.length;
    const response = await api('bug/update', {
      id: object.id, steps: `${detail.steps}<p><a href="https://example.com/">HTTP 链接</a><a href="#inspection">锚点</a></p>`,
    });
    noWarnings(response);
    assert.equal(calls.length - before, 1);
    assert.equal(calls.at(-1)!.method, 'PUT');
  });

  await check('解析失败：上传和主请求之前终止', async () => {
    const before = calls.length;
    await assert.rejects(api('story/create', {
      productID: ownObject('product').id, title: `${runID} should-not-create`,
      spec: '<img src="first" alt="first.png"><img src="unresolved" alt="second.png">',
    }, { fileResolver: { first: { blob: imageBlob() } } }), { code: 'E_FILE_RESOLVE_FAILED' });
    assert.equal(calls.length, before);
  });

  await check('严格上传失败：主请求终止，已传文件按用户要求保留', async () => {
    const before = files.length;
    const objectsBefore = objects.length;
    const deletesBefore = blockedDeletes.length;
    const warnings: FileWarning[] = [];
    await assert.rejects(api('story/create', {
      productID: ownObject('product').id, title: `${runID} strict-should-not-create`,
      spec: `<img src="retained" alt="严格模式保留图.png"><img src="${missingURL}" alt="missing.png">`,
    }, {
      continueOnFileUploadError: false, fileResolver: ({ path }) => path === 'retained' ? { blob: imageBlob() } : path,
      onFileError: warning => { warnings.push(warning); },
    }), { code: 'E_UPLOAD_FILE_NOT_FOUND' });
    assert.equal(newFiles(before).length, 1);
    assert.equal(objects.length, objectsBefore);
    assert.equal(blockedDeletes.length - deletesBefore, 1);
    assert(warnings.some(x => x.stage === 'cleanup'));
    await verifyFile(files.at(-1)!, '', 0);
  });

  await check('同一 Token 下分别回读需求和 Bug 的图片归属', async () => {
    const storyImage = files.find(file => file.expectedObjectType === 'story');
    const bugImage = files.find(file => file.expectedObjectType === 'bug');
    assert(storyImage?.uid && bugImage?.uid, 'Expected separate story and Bug upload batches.');
    assert.notEqual(storyImage.uid, bugImage.uid);
    await verifyFile(storyImage, 'story', ownObject('story').id);
    await verifyFile(bugImage, 'bug', ownObject('bug').id);
  });
  }

  await check('最终清单：重新读取全部对象和附件，核对文件字节', async () => {
    const failures: string[] = [];
    for (const object of objects) {
      const action = object.type === 'doclib' ? 'doc/getLib' : `${object.type}/get`;
      try {
        if (object.type === 'project') {
          const projects = (await api('project/list', { recPerPage: 1000, pageID: 1 })).data as Record<string, unknown>[];
          assert(projects.some(x => Number(x.id) === object.id));
        } else if (object.type === 'system') {
          const systems = (await api('system/list', { productID: object.parentID })).data as Record<string, unknown>[];
          assert(systems.some(x => Number(x.id) === object.id));
        } else await data(action, object.id);
      } catch (error) { failures.push(`${object.type} #${object.id}: ${formatRealEnvError(error)}`); }
    }
    for (const file of files) {
      try {
        const metadata = await data('file/get', file.id);
        await verifyFile(file, file.expectedObjectType ?? String(metadata.objectType ?? ''), file.expectedObjectID ?? Number(metadata.objectID ?? 0));
      } catch (error) { failures.push(`file #${file.id}: ${formatRealEnvError(error)}`); }
    }
    for (const object of [...objects]) {
      if (object.type !== 'product' && object.type !== 'project') continue;
      const productID = object.type === 'product' ? object.id : undefined;
      for (const [action, type] of [[`doc/${object.type}Libs`, 'doclib'], ...(productID ? [['system/list', 'system']] : [])]) {
        const response = await api(action, { [`${object.type}ID`]: object.id });
        for (const child of response.data as Record<string, unknown>[]) {
          const id = Number(child.id);
          if (objects.some(x => x.type === type && x.id === id)) continue;
          objects.push({ type, id, title: String(child.name), case: `服务端随${object.type} #${object.id}自动创建`, parentID: object.id });
        }
      }
    }
    save();
    assert.deepEqual(failures, []);
  });
  phase = checks.some(x => x.status === 'fail') ? 'failed' : 'passed';
} catch (error) {
  phase = 'setup-failed';
  checks.push({ name: '初始化', status: 'fail', ms: 0, detail: formatRealEnvError(error) });
} finally { save(); }
console.log(JSON.stringify({ phase, passed: checks.filter(x => x.status === 'pass').length, failed: checks.filter(x => x.status === 'fail').length, objects: objects.length, files: files.length, report: join(outputDir, 'report.md') }));
if (phase !== 'passed') process.exitCode = 1;
