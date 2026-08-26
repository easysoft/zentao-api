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
const server = createServer((request, response) => {
  receivedContentType = String(request.headers['content-type'] ?? '');
  const chunks = [];
  request.on('data', (chunk) => chunks.push(chunk));
  request.on('end', () => {
    receivedBody = Buffer.concat(chunks).toString('utf8');
    response.writeHead(200, { 'Content-Type': 'application/json' });
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
  const uploadClient = new api.ZentaoClient(`http://127.0.0.1:${address.port}`);
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

  const uploaded = await api.request('file/create', {
    file: uploadPath,
    objectType: 'story',
    objectID: 1,
  }, { client: uploadClient });

  assert.equal(uploaded.data.id, 1);
  assert.match(receivedContentType, /^multipart\/form-data; boundary=/);
  assert.match(receivedBody, /filename="node-smoke\.txt"/);
  assert.match(receivedBody, /Content-Type: text\/plain/i);
  assert.match(receivedBody, /node upload smoke/);
  assert.match(receivedBody, /name="objectID"[\s\S]*\r\n\r\n1\r\n/);
} finally {
  await new Promise((resolveClose) => server.close(resolveClose));
  rmSync(uploadDir, { recursive: true, force: true });
}

const browserApi = await import(pathToFileURL(join(root, 'dist/browser.js')).href);
assert.equal(typeof browserApi.ZentaoClient, 'function');
assert.equal(browserApi.VERSION, api.VERSION);
assert.equal(browserApi.BUILD, api.BUILD);

console.log(`Node ${process.version} package smoke test passed.`);
