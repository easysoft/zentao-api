import { afterEach, describe, expect, mock, spyOn, test } from 'bun:test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  ZentaoClient, ZentaoError, defineModuleActions, defineModules, extendModuleAction, request, setGlobalOptions, supportsFileBinding,
  type ClientRequestOptions, type FileWarning, type ServerConfig, type WriteOutcome,
} from '../src/index';
import { resetModuleDefinitions } from '../src/modules/registry';

const config: ServerConfig = {
  version: '23.0', systemMode: 'ALM', sprintConcept: 'sprint', requestType: 'PATH_INFO',
  requestFix: '-', moduleVar: 'm', methodVar: 'f', viewVar: 't', sessionVar: 'sid',
};
const bodySchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    content: { type: 'string', description: '正文 (HTML)' },
    spec: { type: 'string', textType: 'html' },
    plain: { type: 'string' },
  },
};
type Call = { path: string; options: ClientRequestOptions };
type Handler = (call: Call) => unknown | Promise<unknown>;

function setup(handler?: Handler, mainResult: unknown = { status: 'success', data: { id: 77, title: 'Created' } }) {
  defineModules({
    name: 'article',
    actions: [
      { name: 'create', type: 'create', path: '/articles', minVersion: ['23.0'], requestBody: { schema: bodySchema } },
      {
        name: 'update', type: 'update', path: '/articles/{articleID}', minVersion: ['23.0'],
        pathParams: { articleID: 'ID' }, requestBody: { schema: bodySchema },
      },
    ],
  });
  const client = new ZentaoClient('https://zentao.test');
  const calls: Call[] = [];
  let nextFileID = 100;
  const getConfig = spyOn(client, 'getZentaoConfig').mockResolvedValue(config);
  const implementation = async (path: string, options: ClientRequestOptions = {}): Promise<unknown> => {
    const call = { path, options };
    calls.push(call);
    const custom = await handler?.(call);
    if (custom !== undefined) return custom;
    if (path === '/files') return { status: 'success', data: { id: nextFileID++ } };
    if (/^\/files\/\d+$/.test(path) && options.method === 'DELETE') return { status: 'success' };
    if (path.startsWith('/files/')) throw new Error(`Unexpected file request: ${options.method} ${path}`);
    return mainResult;
  };
  const transport = spyOn(client, 'request').mockImplementation(implementation as ZentaoClient['request']);
  setGlobalOptions({ version: '23.0', client });
  return {
    client, calls, getConfig, transport,
    uploads: () => calls.filter(call => call.path === '/files'),
    removals: () => calls.filter(call => /^\/files\/\d+$/.test(call.path) && call.options.method === 'DELETE'),
    objects: () => calls.filter(call => !call.path.startsWith('/files')),
  };
}

function multipart(call: Call): FormData {
  expect(call.options.body).toBeInstanceOf(FormData);
  return call.options.body as FormData;
}

function data(call: Call): Record<string, unknown> {
  return call.options.body as Record<string, unknown>;
}

const blob = () => new Blob(['image bytes'], { type: 'image/png' });

afterEach(() => {
  mock.restore();
  resetModuleDefinitions();
  setGlobalOptions({
    version: undefined, client: undefined, fileResolver: undefined,
    continueOnFileResolveError: undefined, continueOnFileUploadError: undefined, onFileError: undefined,
    autoFill: undefined, throwOnFail: undefined, relative: undefined, persistProfiles: undefined,
    timeout: undefined, insecure: undefined, actionAssistant: undefined, limit: undefined,
  });
});

describe('HTML file references in high-level requests', () => {
  test('uploads once across HTML fields and binds both references in the save request', async () => {
    const h = setup();
    const source = blob();
    const params = Object.freeze({
      title: 'Created', content: '<p><img src="image-1" alt="photo.png"></p>',
      spec: '<a href="image-1" title="photo.png"><img src="image-1" alt="photo.png"></a>', plain: '<img src="ignore">',
    });
    const before = JSON.stringify(params);
    const response = await request('article/create', params, { fileResolver: { 'image-1': { blob: source } } });
    expect(h.calls.map(call => [call.path, call.options.method])).toEqual([['/files', 'POST'], ['/articles', 'POST']]);
    const upload = h.uploads()[0];
    const uid = upload.options.query?.uid;
    expect(uid).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(upload.options.query).toEqual({ uid, extra: 'editor' });
    expect([...multipart(upload).keys()]).toEqual(['file']);
    expect((multipart(upload).get('file') as File).name).toBe('photo.png');
    expect(data(h.objects()[0])).toMatchObject({
      uid, content: '<p><img src="/file-read-100.png" alt="photo.png"></p>',
      spec: '<a href="image-1" title="photo.png"><img src="/file-read-100.png" alt="photo.png"></a>', plain: '<img src="ignore">',
    });
    expect(h.getConfig).toHaveBeenCalledTimes(1);
    expect(response).not.toHaveProperty('fileWarnings');
    expect(JSON.stringify(params)).toBe(before);
  });

  test('uploads a local image and uses the server URL including its subdirectory and query', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'zentao-html-file-'));
    const file = join(dir, 'file with spaces.png');
    writeFileSync(file, 'image contents');
    try {
      const url = '/zentao/index.php?m=file&f=read&t=png&fileID=53';
      const h = setup(call => call.path === '/files' ? { status: 'success', url, data: { id: 53 } } : undefined);
      await request('article/update', { id: 9, content: `<img src="${pathToFileURL(file).href}" alt="report.png">` });
      const upload = h.uploads()[0];
      const form = await new Response(multipart(upload)).formData();
      expect([...form.keys()]).toEqual(['file']);
      expect((form.get('file') as File).name).toBe('report.png');
      expect(await (form.get('file') as File).text()).toBe('image contents');
      expect(data(h.objects()[0])).toMatchObject({
        uid: upload.options.query?.uid, content: '<img src="/zentao/index.php?m=file&amp;f=read&amp;t=png&amp;fileID=53" alt="report.png">',
      });
      expect(h.getConfig).not.toHaveBeenCalled();
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  test.each([
    ['project/createStory', 'POST', '/projects/12/stories', 'spec', { projectID: 12, title: 'Story' }],
    ['bug/update', 'PUT', '/bugs/8', 'steps', { id: 8 }],
    ['story/change', 'PUT', '/stories/8/change', 'spec', { id: 8, title: 'Changed' }],
    ['meeting/minutes', 'PUT', '/meetings/8/minutes', 'minutes', { meetingID: 8 }],
  ] as const)('%s sends two distinct images and one object save over HTTP', async (name, method, path, field, params) => {
    const calls: string[] = [];
    const uploadUids: Array<string | null> = [];
    let saved: Record<string, unknown> = {};
    const server = Bun.serve({ port: 0, async fetch(req) {
      const url = new URL(req.url);
      calls.push(`${req.method} ${url.pathname}`);
      if (url.searchParams.get('mode') === 'getconfig') return Response.json(config);
      expect(req.headers.get('Token')).toBe('object-token');
      if (url.pathname === '/api.php/v2/files') {
        expect(url.searchParams.get('extra')).toBe('editor');
        expect([...(await req.formData()).keys()]).toEqual(['file']);
        uploadUids.push(url.searchParams.get('uid'));
        const id = uploadUids.length;
        return Response.json({ status: 'success', id, url: `/zentao/${id}.png` });
      }
      expect(req.headers.get('Content-Type')).toContain('application/json');
      saved = await req.json() as Record<string, unknown>;
      return Response.json({ status: 'success' });
    } });
    try {
      const client = new ZentaoClient({ baseUrl: server.url.href, token: 'object-token' });
      await client.getZentaoConfig();
      await request(name, { ...params, [field]: '<img src="one"><img src="two"><img src="one">' }, {
        client, autoFill: false, fileResolver: { one: { blob: blob() }, two: { blob: blob() } },
      });
      expect(calls).toEqual(['GET /', 'POST /api.php/v2/files', 'POST /api.php/v2/files', `${method} /api.php/v2${path}`]);
      expect(uploadUids[0]).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(uploadUids[1]).toBe(uploadUids[0]);
      expect(saved.uid).toBe(uploadUids[0]);
      expect(saved[field]).toBe('<img src="/zentao/1.png"><img src="/zentao/2.png"><img src="/zentao/1.png">');
    } finally { server.stop(true); }
  });

  test.each([42, { status: 'success', data: 42 }])('uses the configured route for a bare upload ID: %p', async upload => {
    const h = setup(call => call.path === '/files' ? upload : undefined);
    await request('article/create', { content: '<img src="source">' }, { fileResolver: { source: { blob: blob() } } });
    expect(data(h.objects()[0]).content).toBe('<img src="/file-read-42.png">');
    expect(h.calls.map(call => call.path)).toEqual(['/files', '/articles']);
  });

  test.each([
    ['/editor-assets/new.png?size=full', undefined],
    ['/index.php?m=file&f=read&t=png&fileID=45', 45],
  ] as const)('uses a URL-only upload and cleans it when the route identifies the new file: %s', async (url, id) => {
    const h = setup(call => call.path === '/files' ? { status: 'success', data: { url } } : undefined,
      { status: 'fail', message: 'Invalid title' });
    const response = await request('article/create', { uid: 'url-batch', content: '<img src="source">' }, {
      fileResolver: { source: { blob: blob() } },
    });
    expect(data(h.objects()[0]).content).toBe(`<img src="${url.replaceAll('&', '&amp;')}">`);
    if (id) {
      expect(response.fileWarnings).toBeUndefined();
      expect(h.removals().map(call => call.path)).toEqual([`/files/${id}`]);
    } else {
      expect(response.fileWarnings).toEqual([expect.objectContaining({ stage: 'cleanup', uid: 'url-batch', path: 'source' })]);
      expect(h.calls.map(call => call.path)).toEqual(['/files', '/articles']);
    }
  });

  test('saves without a response ID and applies pick and convertSingle normally', async () => {
    const h = setup(undefined, { status: 'success', data: { title: 'Created' } });
    const response = await request('article/create', { content: '<img src="source">' }, {
      fileResolver: { source: { blob: blob() } }, pick: ['title'],
      convertSingle: value => ({ ...value, title: 'Converted' }),
    });
    expect(response.data).toEqual({ title: 'Converted' });
    expect(response.fileWarnings).toBeUndefined();
    expect(h.calls).toHaveLength(2);
  });

  test('raw preserves the save acknowledgement and sends upload warnings to the callback', async () => {
    const raw = { status: 'success' };
    const h = setup(call => call.path === '/files' ? { status: 'error', message: 'Cannot upload' } : undefined, raw);
    const warnings: FileWarning[] = [];
    const result = await request('article/create', { content: '<img src="source">' }, {
      raw: true, fileResolver: { source: { blob: blob() } }, onFileError: warning => { warnings.push(warning); },
    });
    expect(result).toBe(raw);
    expect(raw).not.toHaveProperty('fileWarnings');
    expect(warnings).toContainEqual(expect.objectContaining({ stage: 'upload', uid: data(h.objects()[0]).uid }));
  });

  test('forwards explicit batch IDs even when all images were pre-uploaded', async () => {
    const h = setup();
    const content = '<img src="/zentao/file-read-42.png">';
    for (const params of [
      { uid: 'pre-uploads', content },
      { uid: 'unused', data: { uid: 'pre-uploads', content } },
      { uid: 'unused', data: JSON.stringify({ uid: 'pre-uploads', content }) },
    ]) await request('article/create', params);
    expect(h.objects().map(call => data(call))).toEqual(Array(3).fill({ uid: 'pre-uploads', content }));
    expect(h.uploads()).toHaveLength(0);
  });

  test('isolates concurrent batches on the same Token and keeps each upload with its own save', async () => {
    const uploads = new Map<string, string[]>();
    const saves = new Map<string, string>();
    const server = Bun.serve({ port: 0, async fetch(req) {
      const url = new URL(req.url);
      expect(req.headers.get('Token')).toBe('shared-token');
      if (url.pathname === '/api.php/v2/files') {
        const uid = url.searchParams.get('uid')!;
        expect(uid).toMatch(/^[A-Za-z0-9_-]+$/);
        expect(url.searchParams.get('extra')).toBe('editor');
        const entries = uploads.get(uid) ?? [];
        uploads.set(uid, entries);
        const form = await req.formData();
        entries.push((form.get('file') as File).name);
        expect([...form.keys()]).toEqual(['file']);
        return Response.json({ status: 'success', id: entries.length, url: `/zentao/${uid}/${entries.length}.png` });
      }
      const { uid, steps } = await req.json() as { uid: string; steps: string };
      expect(req.method).toBe('PUT');
      expect(steps).toBe(`<img src="/zentao/${uid}/1.png"><img src="/zentao/${uid}/2.png">`);
      saves.set(url.pathname, uid);
      return Response.json({ status: 'success' });
    } });
    try {
      const client = new ZentaoClient({ baseUrl: server.url.href, token: 'shared-token' });
      setGlobalOptions({ version: '23.0' });
      await Promise.all([10, 11].map(id => request('bug/update', {
        id, steps: '<img src="left"><img src="right">',
      }, { client, fileResolver: ({ path }) => ({ blob: blob(), name: `${id}-${path}.png` }) })));
      expect(saves.size).toBe(2);
      expect(uploads.size).toBe(2);
      for (const id of [10, 11]) {
        expect(uploads.get(saves.get(`/api.php/v2/bugs/${id}`)!)).toEqual([`${id}-left.png`, `${id}-right.png`]);
      }
    } finally { server.stop(true); }
  });

  test('shares an explicit uid between manual pre-upload, additional images and the save', async () => {
    let nextID = 42;
    const h = setup(call => {
      if (call.path !== '/files') return;
      const id = nextID++;
      return { status: 'success', data: { id, url: `/file-read-${id}.png` } };
    });
    const preupload = await request('file/create', { uid: 'manual_43', file: blob() });
    await request('article/update', {
      id: 7, uid: 'flat', data: { uid: 'manual_43', content: `<img src="${preupload.data!.url}"><img src="new">` },
    }, { fileResolver: { new: { blob: blob() } } });
    expect(h.calls.map(call => call.path)).toEqual(['/files', '/files', '/articles/7']);
    expect(h.uploads().map(call => call.options.query?.uid)).toEqual(['manual_43', 'manual_43']);
    expect(data(h.objects()[0])).toEqual({ uid: 'manual_43', content: '<img src="/file-read-42.png"><img src="/file-read-43.png">' });
  });

  test('autoFill never copies a prior upload batch into a new save', async () => {
    const h = setup(call => call.options.method === 'GET' ? { status: 'success', data: { uid: 'prior-batch', title: 'Saved title' } } : undefined);
    defineModuleActions('article', { name: 'get', type: 'get', path: '/articles/{articleID}', minVersion: ['23.0'], pathParams: { articleID: 'ID' } });
    extendModuleAction('article', 'update', {
      method: 'PUT', requestBody: { schema: { ...bodySchema, properties: { ...bodySchema.properties, uid: { type: 'string' } } } },
    });
    await request('article/update', { id: 9, content: '<img src="new">' }, { autoFill: true, fileResolver: { new: { blob: blob() } } });
    const uid = h.uploads()[0].options.query?.uid;
    expect(uid).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(uid).not.toBe('prior-batch');
    expect(data(h.calls.at(-1)!)).toMatchObject({ uid, title: 'Saved title' });
  });

  test('validates explicit uid before uploading or saving', async () => {
    const h = setup();
    for (const uid of ['', null, 12, [], '0', '1', 'apiv2', 'used', 'bad/uid', 'has space', 'last\n']) {
      await expect(request('article/create', { data: { uid }, content: '<img src="source">' }, {
        fileResolver: { source: { blob: blob() } },
      })).rejects.toMatchObject({ code: 'E_INVALID_PARAM', params: { param: 'uid' } });
      await expect(request('file/create', { file: blob(), data: { uid } }))
        .rejects.toMatchObject({ code: 'E_INVALID_PARAM', params: { param: 'uid' } });
    }
    expect(h.calls).toHaveLength(0);
  });

  test('awaits the resolver once per reference and preserves names when the result omits one', async () => {
    const h = setup();
    const resolver = mock(async ({ path, name }: { path: string; name?: string }) => {
      await Promise.resolve();
      expect(path).toBe('asset');
      expect(name).toBe('picture.png');
      return { blob: blob() };
    });
    await request('article/update', { id: 9, content: '<img src="asset" alt="picture.png">' }, { fileResolver: resolver });
    expect(resolver).toHaveBeenCalledTimes(1);
    expect((multipart(h.uploads()[0]).get('file') as File).name).toBe('picture.png');
  });

  test('mapping uses path before name, falls back to names, and uses a string entry key as the filename', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'zentao-html-map-'));
    const file = join(dir, 'stored.bin');
    writeFileSync(file, 'source');
    try {
      const h = setup();
      await request('article/update', {
        id: 9, content: '<img src="path-key" alt="label.png"><img src="unknown-key" alt="other.png">',
      }, { fileResolver: {
        'path-key': { blob: blob(), name: 'preferred.png' },
        'label.png': { url: 'https://wrong.test/image.png' },
        'other.png': file,
      } });
      expect(h.uploads()).toHaveLength(2);
      expect((multipart(h.uploads()[0]).get('file') as File).name).toBe('preferred.png');
      const secondForm = await new Response(multipart(h.uploads()[1])).formData();
      expect((secondForm.get('file') as File).name).toBe('other.png');
      expect(data(h.objects()[0]).content).toContain('/file-read-101.png');
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  test('network links and non-file protocols bypass even a strict resolver', async () => {
    const h = setup();
    const html = '<img src="https://example.test/photo.png"><img src="//example.test/p.png">'
      + '<a href="http://example.test/file.pdf">Download</a><a href="#part">Jump</a><a href="mailto:a@b.test">Mail</a>';
    const resolver = mock(() => { throw new Error('Should not resolve'); });
    await request('article/update', { id: 9, content: html }, { fileResolver: resolver });
    expect(data(h.objects()[0]).content).toBe(html);
    expect(resolver).not.toHaveBeenCalled();
    expect(h.uploads()).toHaveLength(0);
    expect(h.getConfig).not.toHaveBeenCalled();
  });

  test('a resolver URL rewrites the reference without uploading or loading route config', async () => {
    const h = setup();
    await request('article/update', { id: 9, content: '<img src="cover.png" alt="Cover">' }, {
      fileResolver: { 'cover.png': { url: 'https://cdn.test/cover.png?a=1&b=2' } },
    });
    expect(data(h.objects()[0]).content).toBe('<img src="https://cdn.test/cover.png?a=1&amp;b=2" alt="Cover">');
    expect(h.uploads()).toHaveLength(0);
    expect(h.getConfig).not.toHaveBeenCalled();
  });

  test('existing file IDs use fixed relative links without uploading or associating', async () => {
    const h = setup();
    setGlobalOptions({ relative: false });
    await request('article/create', { content: '<img src="file:7" alt="image.png"><a href="file:8">report.pdf</a>' });
    expect(data(h.objects()[0]).content).toBe('<img src="/file-read-7.png" alt="image.png"><a href="file:8">report.pdf</a>');
    expect(h.uploads()).toHaveLength(0);
  });

  test('existing relative ZenTao file links bypass the resolver', async () => {
    const h = setup();
    const html = '<img src="/file-read-7.png"><img src="/index.php?m=file&amp;f=read&amp;fileID=7"><a href="file-read-8.pdf">Download</a>';
    const resolver = mock(() => { throw new Error('Existing links do not need resolution'); });
    await request('article/update', { id: 9, content: html }, { fileResolver: resolver });
    expect(data(h.objects()[0]).content).toBe(html);
    expect(resolver).not.toHaveBeenCalled();
    expect(h.uploads()).toHaveLength(0);
    expect(h.getConfig).toHaveBeenCalledTimes(1);
  });

  test('does no additional work for unmarked fields, plain text, and unresolved relative references', async () => {
    const h = setup();
    const params = {
      id: 9, plain: '<img src="file:///does-not-exist.png">', spec: 'No attachments',
      content: '<img src="image-1"><img src="images/a.png"><img src="/uploads/a.png">',
    };
    await request('article/update', params);
    expect(h.calls).toHaveLength(1);
    expect(h.getConfig).not.toHaveBeenCalled();
    expect(data(h.objects()[0]).content).toBe(params.content);
    expect(data(h.objects()[0]).plain).toBe(params.plain);
  });

  test('a local download link bypasses the resolver and write batch entirely', async () => {
    const h = setup();
    const content = '<a href="file:///missing.pdf" download title="keep">Read <b>&amp;</b></a>';
    const resolver = mock(() => { throw new Error('Unexpected resolver call'); });
    await request('article/create', { content }, { fileResolver: resolver, continueOnFileUploadError: false });
    expect(h.calls.map(call => call.path)).toEqual(['/articles']);
    expect(data(h.calls[0])).toEqual({ content });
    expect(resolver).not.toHaveBeenCalled();
    expect(h.getConfig).not.toHaveBeenCalled();
  });

  test('uses final hook data and preserves params.data precedence without modifying caller data', async () => {
    const h = setup();
    const input = Object.freeze({ content: '<img src="data" alt="data.png">' });
    extendModuleAction('article', 'update', {
      beforeRequest: async command => {
        expect(command.data?.content).toBe(input.content);
        return { data: { ...command.data, content: '<img src="hook" alt="hook.png">' } };
      },
    });
    const resolver = mock(({ path }: { path: string }) => {
      expect(path).toBe('hook');
      return { blob: blob() };
    });
    await request('article/update', { id: 9, content: '<img src="flat">', data: input }, { fileResolver: resolver });
    expect((multipart(h.uploads()[0]).get('file') as File).name).toBe('hook.png');
    expect(input.content).toBe('<img src="data" alt="data.png">');
    expect(resolver).toHaveBeenCalledTimes(1);
  });

  test('single-request settings override global resolver and notification defaults', async () => {
    const h = setup(call => call.path === '/files' ? { status: 'fail', message: 'Upload rejected' } : undefined);
    const globalWarning = mock(() => {});
    const localWarning = mock(() => {});
    const globalResolver = mock(() => { throw new Error('Wrong resolver'); });
    setGlobalOptions({ fileResolver: globalResolver, continueOnFileUploadError: false, onFileError: globalWarning });
    const response = await request('article/update', { id: 9, content: '<img src="source">' }, {
      fileResolver: { source: { blob: blob() } }, continueOnFileUploadError: true, onFileError: localWarning,
    });
    expect(response.status).toBe('success');
    expect(globalResolver).not.toHaveBeenCalled();
    expect(globalWarning).not.toHaveBeenCalled();
    expect(localWarning).toHaveBeenCalledTimes(1);
    expect(h.objects()).toHaveLength(1);
  });

  test('forwards transport options to internal requests without applying result transformations', async () => {
    const h = setup();
    const assistant = { name: 'Tests', info: 'HTML upload' };
    await request('article/create', { content: '<img src="source">' }, {
      fileResolver: { source: { blob: blob() } }, timeout: 1250, insecure: false,
      actionAssistant: assistant, pick: ['title'], autoFill: true,
    });
    for (const call of h.calls) {
      expect(call.options).toMatchObject({ timeout: 1250, insecure: false, actionAssistant: assistant });
    }
    expect(h.calls.every(call => call.options.method !== 'GET')).toBe(true);
  });
});

describe('HTML file failure lifecycle', () => {
  test('preserves missing image descriptions as text and binds the resolved images on the same save', async () => {
    const h = setup(call => call.path === '/files' ? { id: 100, url: '/file-read-100.png' } : undefined);
    const source = blob();
    const warnings: FileWarning[] = [];
    const content = '<p>before <A href="/item"><IMG SRC="chat/a&amp;b.png" ALT="&lt;diagram&gt; &amp; notes" /></A>'
      + '<img src="ok" alt="ok.png"> after</p>';
    const response = await request('article/update', {
      id: 9, content, data: { spec: '<img src="ok" alt="ok.png"><img src="chat/a&amp;b.png">' },
    }, {
      continueOnFileResolveError: true, continueOnFileUploadError: false,
      fileResolver: async ({ path }) => {
        if (path === 'ok') return { blob: source };
        throw new Error('Workspace image missing');
      },
      onFileError: warning => { warnings.push(warning); },
    });
    expect(response.writeOutcome).toBe('confirmed');
    expect(h.calls.map(call => [call.path, call.options.method])).toEqual([['/files', 'POST'], ['/articles/9', 'PUT']]);
    expect(data(h.objects()[0])).toMatchObject({
      uid: h.uploads()[0].options.query?.uid,
      content: '<p>before <A href="/item">&lt;diagram&gt; &amp; notes</A><img src="/file-read-100.png" alt="ok.png"> after</p>',
      spec: '<img src="/file-read-100.png" alt="ok.png">chat/a&amp;b.png',
    });
    expect(h.getConfig).not.toHaveBeenCalled();
    expect(warnings.map(({ stage, code, field, path }) => ({ stage, code, field, path }))).toEqual([
      { stage: 'resolve', code: 'E_FILE_RESOLVE_FAILED', field: 'content', path: 'chat/a&b.png' },
      { stage: 'resolve', code: 'E_FILE_RESOLVE_FAILED', field: 'spec', path: 'chat/a&b.png' },
    ]);
    expect(warnings[0].message).toContain('Workspace image missing');
    expect(response.fileWarnings).toEqual(warnings);
  });

  test('saves text once without generating a uid when every image is missing, including raw mode', async () => {
    const receipt = { status: 'success', id: 77 };
    const h = setup(undefined, receipt);
    const warnings: FileWarning[] = [];
    setGlobalOptions({ continueOnFileResolveError: true, fileResolver: { invalid: { url: 'relative' } } });
    const raw = await request('article/create', {
      spec: '<p><img src="missing" alt="说明"> / <img src="invalid" alt="   "></p>',
    }, { raw: true, onFileError: warning => { warnings.push(warning); } });
    expect(raw).toBe(receipt);
    expect(receipt).not.toHaveProperty('fileWarnings');
    expect(h.calls.map(call => call.path)).toEqual(['/articles']);
    expect(data(h.calls[0])).toEqual({ spec: '<p>说明 / invalid</p>' });
    expect(warnings.map(({ stage, field, path }) => [stage, field, path])).toEqual([
      ['resolve', 'spec', 'missing'], ['resolve', 'spec', 'invalid'],
    ]);
    expect(h.getConfig).not.toHaveBeenCalled();
  });

  test('a strict request overrides global continuation and fails before uploading any resolved image', async () => {
    const h = setup();
    setGlobalOptions({ continueOnFileResolveError: true });
    await expect(request('article/create', {
      content: '<img src="found">', spec: '<img src="chat/missing.png">',
    }, {
      fileResolver: { found: { blob: blob() } }, continueOnFileResolveError: false,
    })).rejects.toMatchObject({
      code: 'E_FILE_RESOLVE_FAILED', writeOutcome: 'not-sent',
      details: { fileWarnings: [expect.objectContaining({ stage: 'resolve', field: 'spec', path: 'chat/missing.png' })] },
    });
    expect(h.calls).toHaveLength(0);
  });

  test('an older site can save the story text using the same version check and no attachment batch', async () => {
    const paths: string[] = [];
    let saved: unknown;
    const server = Bun.serve({ port: 0, async fetch(req) {
      const url = new URL(req.url);
      paths.push(`${req.method} ${url.pathname}${url.search}`);
      if (url.searchParams.has('mode')) return Response.json({ ...config, version: 'ipd5.7' });
      saved = await req.json();
      return Response.json({ status: 'success' });
    } });
    try {
      const client = new ZentaoClient(server.url.href);
      const canBind = await supportsFileBinding({ client });
      expect(canBind).toBe(false);
      const response = await request('story/change', {
        id: 9, spec: '<p>操作步骤 <img src="chat/a.png" alt="登录截图"></p>',
      }, {
        client, continueOnFileResolveError: true,
        fileResolver: () => {
          if (!canBind) throw new Error('Attachment binding unavailable');
          return { blob: blob() };
        },
      });
      expect(response.fileWarnings).toMatchObject([{ stage: 'resolve', field: 'spec', path: 'chat/a.png' }]);
      expect(saved).toMatchObject({ spec: '<p>操作步骤 登录截图</p>' });
      expect(saved).not.toHaveProperty('uid');
      expect(paths).toEqual(['GET /?mode=getconfig', 'PUT /api.php/v2/stories/9/change']);
    } finally { server.stop(true); }
  });

  test('finishes resolving all references before any upload, even in continue mode', async () => {
    const h = setup();
    await expect(request('article/create', { content: '<img src="first"><img src="missing">' }, {
      fileResolver: { first: { blob: blob() } }, continueOnFileUploadError: true,
    })).rejects.toMatchObject({ code: 'E_FILE_RESOLVE_FAILED' });
    expect(h.calls).toHaveLength(0);
  });

  test('ignores inherited mapping entries and stops when a resolver rejects', async () => {
    const h = setup();
    const inherited = Object.create({ source: { blob: blob() } }) as Record<string, { blob: Blob }>;
    await expect(request('article/create', { content: '<img src="source">' }, { fileResolver: inherited }))
      .rejects.toMatchObject({ code: 'E_FILE_RESOLVE_FAILED' });
    await expect(request('article/create', { content: '<img src="source">' }, {
      fileResolver: async () => { throw new Error('Resolver rejected'); },
    })).rejects.toMatchObject({ code: 'E_FILE_RESOLVE_FAILED' });
    expect(h.calls).toHaveLength(0);
  });

  test('default upload failure annotates the image and preserves the complete anchor', async () => {
    const h = setup(call => call.path === '/files' ? { status: 'fail', message: 'File "too large" <limit>' } : undefined);
    const warnings: FileWarning[] = [];
    const response = await request('article/create', { content: '<img src="one" alt="photo.png"><a href="two">report.pdf</a>' }, {
      fileResolver: { one: { blob: blob() }, two: { blob: blob() } }, onFileError: warning => { warnings.push(warning); },
    });
    expect(response.status).toBe('success');
    expect(response.fileWarnings).toHaveLength(1);
    expect(warnings).toHaveLength(1);
    expect(warnings.every(warning => warning.stage === 'upload')).toBe(true);
    const html = String(data(h.objects()[0]).content);
    expect(html).toContain('src="one"');
    expect(html).toContain('href="two"');
    expect(html).toContain('&quot;too large&quot; &lt;limit&gt;');
    expect(html).toContain('<a href="two">report.pdf</a>');
  });

  test('local read and upload-size failures follow the configured upload failure policy', async () => {
    const h = setup();
    const response = await request('article/update', { id: 9, content: '<img src="file:///__zentao_missing__/image.png">' });
    expect(response.status).toBe('success');
    expect(response.fileWarnings).toContainEqual(expect.objectContaining({ stage: 'upload', code: 'E_UPLOAD_FILE_NOT_FOUND' }));
    expect(h.uploads()).toHaveLength(0);
    await expect(request('article/create', { content: '<img src="source">' }, {
      fileResolver: { source: { blob: blob() } }, maxUploadBytes: 1, continueOnFileUploadError: false,
    })).rejects.toMatchObject({ code: 'E_UPLOAD_FILE_TOO_LARGE' });
    expect(h.objects()).toHaveLength(1);
  });

  test('an upload callback rejecting with undefined records a warning and keeps the original reference', async () => {
    const h = setup();
    extendModuleAction('file', 'create', { request: async () => { throw undefined; } });
    const warning = mock(() => {});
    const response = await request('article/create', { content: '<img src="source" alt="image.png">' }, {
      fileResolver: { source: { blob: blob() } }, onFileError: warning,
    });
    expect(response.status).toBe('success');
    expect(response.fileWarnings).toContainEqual(expect.objectContaining({ stage: 'upload', path: 'source' }));
    expect(warning).toHaveBeenCalledTimes(1);
    expect(data(h.objects()[0]).content).toContain('src="source"');
    expect(data(h.objects()[0]).content).not.toContain('/file-read-undefined');
  });

  test('strict upload failure cleans previously uploaded files and never sends the main request', async () => {
    let uploads = 0;
    const h = setup(call => call.path === '/files' && ++uploads === 2 ? { status: 'fail', message: 'Upload failed' } : undefined);
    await expect(request('article/create', { content: '<img src="one"><img src="two">' }, {
      fileResolver: { one: { blob: blob() }, two: { blob: blob() } }, continueOnFileUploadError: false,
    })).rejects.toMatchObject({ code: 'E_API_FAILED', writeOutcome: 'not-sent' });
    expect(h.objects()).toHaveLength(0);
    expect(h.removals().map(call => call.path)).toEqual(['/files/100']);
  });

  test.each([false, true])('creation failure cleans only newly uploaded files (throwOnFail=%p)', async throwOnFail => {
    const h = setup(undefined, { status: 'fail', message: 'Cannot create' });
    const pending = request('article/create', { content: '<img src="source"><img src="file:7">' }, {
      fileResolver: { source: { blob: blob() } }, throwOnFail,
    });
    if (throwOnFail) await expect(pending).rejects.toMatchObject({ code: 'E_API_FAILED' });
    else await expect(pending).resolves.toMatchObject({ status: 'fail', message: 'Cannot create' });
    expect(h.removals().map(call => call.path)).toEqual(['/files/100']);
  });

  test('prevents a new Token from submitting or deleting files from the previous session', async () => {
    const h = setup(async call => {
      if (call.path === '/users/login') return { status: 'success', token: 'other-session' };
      if (call.path === '/files') {
        await h.client.login('another-user', 'test-password');
        return { status: 'success', id: 49, url: '/file-read-49.png' };
      }
    });
    setGlobalOptions({ persistProfiles: false });
    spyOn(h.client, 'fetch').mockResolvedValue(config);
    await expect(request('article/update', { id: 9, uid: 'original-batch', content: '<img src="source">' }, {
      fileResolver: { source: { blob: blob() } },
    })).rejects.toMatchObject({ code: 'E_FILE_SESSION_CHANGED', details: {
      uid: 'original-batch', fileIDs: [49], fileWarnings: [expect.objectContaining({ stage: 'cleanup', fileID: 49 })],
    } });
    expect(h.calls.map(call => call.path)).toEqual(['/files', '/users/login']);
  });

  test('a pre-uploaded batch keeps its session through the Bug confirmation prefetch', async () => {
    const h = setup(async call => {
      if (call.path === '/users/login') return { status: 'success', token: 'other-session' };
      if (call.path === '/bugs/7') {
        await h.client.login('another-user', 'test-password');
        return { status: 'success', bug: { status: 'active', assignedTo: 'qa', type: 'codeerror', pri: 2, deadline: '', mailto: [] } };
      }
    });
    setGlobalOptions({ persistProfiles: false });
    spyOn(h.client, 'fetch').mockResolvedValue(config);
    await expect(request('bug/confirm', { id: 7, uid: 'manual-batch' })).rejects.toMatchObject({
      code: 'E_FILE_SESSION_CHANGED', details: { uid: 'manual-batch', fileIDs: [] },
    });
    expect(h.calls.map(call => call.path)).toEqual(['/bugs/7', '/users/login']);
  });

  test('a timed-out creation retains files and reports their IDs for reconciliation', async () => {
    const h = setup(call => {
      if (call.path === '/articles') throw new ZentaoError('E_TIMEOUT');
    });
    await expect(request('article/create', { content: '<img src="source">' }, {
      fileResolver: { source: { blob: blob() } },
    })).rejects.toMatchObject({ code: 'E_TIMEOUT', writeOutcome: 'unknown', details: expect.objectContaining({ uid: expect.any(String), fileIDs: [100] }) });
    expect(h.removals()).toHaveLength(0);
  });

  test.each(['E_NETWORK_ERROR', 'E_TIMEOUT'] as const)('%s preserves its native cause when file context is attached', async code => {
    const native = new Error('Socket was closed');
    const original = new ZentaoError(code, { message: native.message }, native);
    const h = setup(call => {
      if (call.path === '/articles') throw original;
    });
    const thrown = await request('article/create', { content: '<img src="source">' }, {
      fileResolver: { source: { blob: blob() } },
    }).then(() => undefined, error => error as ZentaoError);
    expect(thrown).toBeInstanceOf(ZentaoError);
    expect(thrown?.code).toBe(code);
    expect(thrown?.details).toMatchObject({ fileIDs: [100] });
    expect((thrown?.details as { cause?: unknown }).cause).toBe(native);
    expect(h.removals()).toHaveLength(0);
  });

  test('a custom error with non-configurable details is not masked while attaching file context', async () => {
    const original = new Error('Custom transport failed');
    const originalDetails = { traceID: 'trace-123' };
    Object.defineProperty(original, 'details', { value: originalDetails, configurable: false });
    const h = setup(call => {
      if (call.path === '/articles') throw original;
    });
    const thrown = await request('article/create', { content: '<img src="source">' }, {
      fileResolver: { source: { blob: blob() } },
    }).then(() => undefined, error => error as Error & { details?: unknown });
    expect(thrown).toBeInstanceOf(Error);
    expect(thrown).not.toBeInstanceOf(TypeError);
    expect(thrown?.message).toBe(original.message);
    expect(thrown?.details).toMatchObject({ fileIDs: [100] });
    expect((original as Error & { details?: unknown }).details).toBe(originalDetails);
    expect(h.removals()).toHaveLength(0);
  });

  test('cleanup failure preserves the original creation failure and identifies the orphaned file', async () => {
    const h = setup(call => call.options.method === 'DELETE' ? { status: 'fail', message: 'Delete denied' } : undefined,
      { status: 'fail', message: 'Creation denied' });
    const warnings: FileWarning[] = [];
    const response = await request('article/create', { content: '<img src="source">' }, {
      fileResolver: { source: { blob: blob() } }, onFileError: warning => { warnings.push(warning); },
    });
    expect(response).toMatchObject({ status: 'fail', message: 'Creation denied' });
    expect(response.fileWarnings).toContainEqual(expect.objectContaining({ stage: 'cleanup', fileID: 100 }));
    expect(warnings).toContainEqual(expect.objectContaining({ stage: 'cleanup', fileID: 100 }));
    expect(h.removals()).toHaveLength(1);
  });

  test.each([
    '<html>Incomplete response</html>',
    { status: 'fail', httpStatus: 200, responseText: 'PHP error' },
    { message: 'unrecognized acknowledgement' },
  ])('preserves files and uid when the save response is inconclusive: %p', async raw => {
    const h = setup(undefined, raw);
    await expect(request('article/update', { id: 8, uid: 'retry-batch', content: '<img src="new">' }, {
      fileResolver: { new: { blob: blob() } },
    })).rejects.toMatchObject({ code: 'E_FILE_SAVE_UNCONFIRMED', writeOutcome: 'unknown', details: { uid: 'retry-batch', fileIDs: [100] } });
    expect(h.removals()).toHaveLength(0);
  });

  test('raw preserves an inconclusive image save receipt and retains its uploads', async () => {
    const receipt = Object.freeze({ receipt: 'queued' });
    const h = setup(undefined, receipt);
    const onWriteOutcome = mock<(outcome: WriteOutcome) => void>();
    const raw = await request('article/update', { id: 8, content: '<img src="new">' }, {
      fileResolver: { new: { blob: blob() } }, raw: true, throwOnFail: true, onWriteOutcome,
    });
    expect(raw).toBe(receipt);
    expect(onWriteOutcome.mock.calls).toEqual([['unknown']]);
    expect(h.uploads()).toHaveLength(1);
    expect(h.objects()).toHaveLength(1);
    expect(h.removals()).toHaveLength(0);
  });

  test.each([
    'PHP Fatal error: cleanup did not finish',
    {},
    { result: 'fail', message: 'Cleanup denied' },
    { status: 'success', result: 'fail', message: 'Cleanup denied' },
  ])('malformed or explicitly failed file cleanup response preserves the main failure: %p', async fileResult => {
    const h = setup(call => call.options.method === 'DELETE' ? fileResult : undefined,
      { status: 'fail', message: 'Creation denied' });
    const response = await request('article/create', { content: '<img src="source">' }, {
      fileResolver: { source: { blob: blob() } },
    });
    expect(response).toMatchObject({ status: 'fail', message: 'Creation denied' });
    expect(response.fileWarnings).toContainEqual(expect.objectContaining({ stage: 'cleanup', fileID: 100 }));
    expect(h.removals()).toHaveLength(1);
  });

  test('cleans only this request’s image after a rejected edit with pre-uploaded files', async () => {
    const h = setup(undefined, { status: 'error', message: 'Invalid edit' });
    const result = await request('article/update', { id: 9, uid: 'pre-uploads', content: '<img src="file:17"><img src="new">' }, {
      fileResolver: { new: { blob: blob() } },
    });
    expect(result.status).toBe('fail');
    expect(h.removals().map(call => call.path)).toEqual(['/files/100']);
  });

  test.each([[409, true], [422, true], [500, false], [408, false]] as const)('only cleans after a definitive HTTP rejection (%i)', async (status, rejected) => {
    const h = setup(call => {
      if (call.path === '/articles/8') throw new ZentaoError('E_HTTP_ERROR', { status, statusText: 'Error' }, { status });
    });
    await expect(request('article/update', { id: 8, uid: 'http-batch', content: '<img src="new">' }, {
      fileResolver: { new: { blob: blob() } },
    })).rejects.toMatchObject({
      code: 'E_HTTP_ERROR', writeOutcome: rejected ? 'rejected' : 'unknown',
      details: { status, uid: 'http-batch', fileIDs: rejected ? [] : [100] },
    });
    expect(h.removals()).toHaveLength(rejected ? 1 : 0);
  });

  test('rejects uid binding before uploading, including saves using pre-uploaded images', async () => {
    const h = setup();
    extendModuleAction('article', 'create', { minVersion: ['22.5'] });
    setGlobalOptions({ version: '22.5' });
    h.getConfig.mockResolvedValue({ ...config, version: '22.5' });
    await expect(request('article/create', { content: '<img src="source">' }, {
      fileResolver: { source: { blob: blob() } },
    })).rejects.toMatchObject({ code: 'E_UNSUPPORTED_ZENTAO_VERSION', params: { action: 'article/create' } });
    await expect(request('article/create', { uid: 'manual-batch' })).rejects.toMatchObject({ code: 'E_UNSUPPORTED_ZENTAO_VERSION' });
    expect(h.calls).toHaveLength(0);
  });
});
