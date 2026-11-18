import { strict as assert } from 'node:assert';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const api = await import(pathToFileURL(join(root, 'dist/index.js')).href);
assert.equal(typeof api.ZentaoClient, 'function');
assert.equal(typeof api.request, 'function');
assert.equal(api.VERSION, packageJson.version);
assert.match(api.BUILD, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

const linkProfile = {
  server: 'https://zentao.example.com/zentao',
  serverConfig: { requestType: 'PATH_INFO2', requestFix: '-' },
};
const pageLink = api.createLink(linkProfile, { moduleName: 'bug', methodName: 'view', vars: 'bugID=7' });
assert.equal(pageLink, 'https://zentao.example.com/zentao/index.php/bug-view-7.html');
assert.equal(api.parseLink(linkProfile, pageLink).vars[0][1], '7');

const client = new api.ZentaoClient('https://zentao.example.com/api.php/v2');
assert.equal(client.baseUrl, 'https://zentao.example.com/api.php/v2');
await assert.rejects(
  client.request('/stream', {
    method: 'POST',
    bodyType: 'raw',
    body: new ReadableStream(),
  }),
  (error) => error?.code === 'E_INVALID_PARAM',
);

const uploadDir = mkdtempSync(join(tmpdir(), 'zentao-api-node-smoke-'));
const uploadPath = join(uploadDir, 'node-smoke.txt');
writeFileSync(uploadPath, 'node upload smoke');
let receivedContentType = '';
let receivedBody = '';
let receivedAssistant;
const receivedRequests = [];
const server = createServer((request, response) => {
  if (request.url === '/?mode=getconfig') {
    assert.equal(request.headers.token, undefined);
    assert.equal(request.headers['zentao-action-assistant'], undefined);
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ version: '23.0', requestType: 'PATH_INFO', requestFix: '-' }));
    return;
  }
  receivedContentType = String(request.headers['content-type'] ?? '');
  receivedAssistant = request.headers['zentao-action-assistant'];
  if (request.url?.startsWith('/api.php/v2/files/1/read?')) {
    const bytes = Buffer.from([0, 255, 195, 40]);
    const base64 = new URL(request.url, 'http://localhost').searchParams.get('stream') === '1';
    response.writeHead(200, { 'Content-Type': base64 ? 'text/plain' : 'application/octet-stream' });
    response.end(base64 ? bytes.toString('base64') : bytes);
    return;
  }
  const chunks = [];
  request.on('data', (chunk) => chunks.push(chunk));
  request.on('end', () => {
    receivedBody = Buffer.concat(chunks).toString('utf8');
    receivedRequests.push({ path: request.url, method: request.method, body: receivedBody });
    response.writeHead(200, { 'Content-Type': 'application/json' });
    if (request.url === '/api.php/v2/files/1/link') {
      assert.equal(request.method, 'PUT');
      response.end(JSON.stringify({ status: 'success', id: 1, ...JSON.parse(receivedBody) }));
      return;
    }
    response.end(JSON.stringify({ status: 'success', data: { id: 1, url: '/file-read-1.txt' } }));
  });
});

try {
  await new Promise((resolveListen, rejectListen) => {
    server.once('error', rejectListen);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  const address = server.address();
  assert(address && typeof address === 'object');
  const uploadClient = new api.ZentaoClient({
    baseUrl: `http://127.0.0.1:${address.port}`, actionAssistant: { name: 'Node', info: 'smoke' },
  });
  const rawResponse = await uploadClient.request('/raw', { responseType: 'response' });
  const rawClone = rawResponse.clone();
  assert.equal(rawClone.url, rawResponse.url);
  assert.equal(rawClone.type, rawResponse.type);
  assert.throws(() => rawResponse.headers.set('X-Smoke-Test', 'changed'));
  const rawReader = rawResponse.body.getReader({ mode: 'byob' });
  const rawChunks = [];
  while (true) {
    const { value, done } = await rawReader.read(new Uint8Array(256));
    if (done) break;
    rawChunks.push(value);
  }
  const [rawBody, rawCloneBody] = await Promise.all([
    Promise.resolve(Buffer.concat(rawChunks).toString('utf8')),
    rawClone.text(),
  ]);
  assert.equal(rawBody, rawCloneBody);
  assert.equal(receivedAssistant, 'Node <smoke>');

  const uploaded = await api.request('file/create', {
    file: uploadPath,
    objectType: 'story',
    objectID: 1,
  }, { client: uploadClient, actionAssistant: 'AI <upload>' });

  assert.equal(uploaded.data.id, 1);
  assert.equal(receivedAssistant, 'AI <upload>');
  assert.match(receivedContentType, /^multipart\/form-data; boundary=/);
  assert.match(receivedBody, /filename="node-smoke\.txt"/);
  assert.match(receivedBody, /Content-Type: text\/plain/i);
  assert.match(receivedBody, /node upload smoke/);
  assert.match(receivedBody, /name="objectID"[\s\S]*\r\n\r\n1\r\n/);

  const content = await api.request('file/read', { id: 1 }, { client: uploadClient, pick: ['id'] });
  assert(content.data instanceof ArrayBuffer);
  assert.deepEqual(new Uint8Array(content.data), new Uint8Array([0, 255, 195, 40]));
  const base64 = await api.request('file/read', { fileID: 1, stream: 1 }, { client: uploadClient });
  assert.equal(base64.data, Buffer.from([0, 255, 195, 40]).toString('base64'));

  api.defineModules({ name: 'htmlsmoke', actions: [{
    name: 'create', type: 'create', path: '/htmlsmoke', minVersion: ['23.0'],
    requestBody: { schema: { type: 'object', properties: { content: { type: 'string', description: '(HTML)' } } } },
  }] });
  const beforeHTML = receivedRequests.length;
  const created = await api.request('htmlsmoke/create', {
    content: `<a href="${pathToFileURL(uploadPath).href}">download.txt</a><img src="file:24" alt="existing.png">`,
  }, { client: uploadClient });
  assert.equal(created.status, 'success');
  assert.equal(created.fileWarnings, undefined);
  const htmlRequests = receivedRequests.slice(beforeHTML);
  assert.deepEqual(htmlRequests.map(({ path, method }) => [path, method]), [
    ['/api.php/v2/files', 'POST'], ['/api.php/v2/htmlsmoke', 'POST'], ['/api.php/v2/files/1/link', 'PUT'],
  ]);
  assert.match(htmlRequests[0].body, /filename="download\.txt"/);
  assert.equal(JSON.parse(htmlRequests[1].body).content,
    '<a href="/file-read-1.txt" download="download.txt">download.txt</a><img src="/file-read-24.png" alt="existing.png">');
  assert.deepEqual(JSON.parse(htmlRequests[2].body), { objectType: 'htmlsmoke', objectID: 1 });
} finally {
  await new Promise((resolveClose) => server.close(resolveClose));
  rmSync(uploadDir, { recursive: true, force: true });
}

const browserApi = await import(pathToFileURL(join(root, 'dist/browser.js')).href);
assert.equal(typeof browserApi.ZentaoClient, 'function');
assert.equal(browserApi.VERSION, api.VERSION);
assert.equal(browserApi.BUILD, api.BUILD);
assert.equal(browserApi.createLink, api.createLink);
assert.equal(browserApi.parseLink, api.parseLink);

console.log(`Node ${process.version} package smoke test passed.`);
