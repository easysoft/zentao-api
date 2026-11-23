import { afterEach, beforeEach, expect, mock, spyOn, test } from 'bun:test';
import { extendModuleAction, request, setGlobalOptions, ZentaoClient, ZentaoError, type WriteOutcome } from '../src/index';
import { resetModuleDefinitions } from '../src/modules/registry';

const client = new ZentaoClient('https://zentao.test');
const bug = { productID: 1, title: 'Example', openedBuild: ['trunk'] };

beforeEach(() => setGlobalOptions({ version: '23.0' }));
afterEach(() => {
  mock.restore();
  resetModuleDefinitions();
  setGlobalOptions({ version: undefined });
});

function disconnectAfterReading() {
  const received: { method: string; path: string; body: string }[] = [];
  const server = Bun.serve({
    hostname: '127.0.0.1', port: 0,
    async fetch(req, server) {
      received.push({ method: req.method, path: new URL(req.url).pathname, body: await req.text() });
      void server.stop(true);
      return new Response();
    },
  });
  return { server, received, client: new ZentaoClient(server.url.href) };
}

test.each([false, true])('a disconnected autoFill GET never starts the object PUT (raw=%p)', async raw => {
  const { server, received, client } = disconnectAfterReading();
  const onWriteOutcome = mock<(outcome: WriteOutcome) => void>();
  try {
    await expect(request('bug/update', { id: 7, steps: '<img src="screenshot">' }, {
      client, raw, autoFill: true, fileResolver: { screenshot: { blob: new Blob(['image']) } }, onWriteOutcome,
    })).rejects.toMatchObject({ code: 'E_NETWORK_ERROR', writeOutcome: 'not-sent' });
    expect(received).toEqual([{ method: 'GET', path: '/api.php/v2/bugs/7', body: '' }]);
    expect(onWriteOutcome.mock.calls).toEqual([['not-sent']]);
  } finally { await server.stop(true); }
});

test.each([false, true])('a plain create whose POST loses its receipt has an unknown outcome (raw=%p)', async raw => {
  const { server, received, client } = disconnectAfterReading();
  const onWriteOutcome = mock<(outcome: WriteOutcome) => void>();
  try {
    await expect(request('bug/create', bug, { client, raw, onWriteOutcome })).rejects.toMatchObject({
      code: 'E_NETWORK_ERROR', writeOutcome: 'unknown',
    });
    expect(received).toHaveLength(1);
    expect(received[0]).toMatchObject({ method: 'POST', path: '/api.php/v2/bugs' });
    expect(JSON.parse(received[0].body)).toMatchObject({ title: bug.title });
    expect(onWriteOutcome.mock.calls).toEqual([['unknown']]);
  } finally { await server.stop(true); }
});

test('a strict JSON write that loses the response body after HTTP 200 is unconfirmed', async () => {
  const disconnected = new TypeError('Response body disconnected');
  const fetch = spyOn(globalThis, 'fetch').mockResolvedValue(new Response(new ReadableStream({
    start(controller) { controller.error(disconnected); },
  })));
  await expect(request('product/create', { name: 'Example' }, { client })).rejects.toMatchObject({
    code: 'E_NETWORK_ERROR', writeOutcome: 'unknown', details: disconnected,
  });
  expect(fetch.mock.calls.map(([, init]) => init?.method)).toEqual(['POST']);
});

test.each([
  [{ status: 'success', id: 7 }, 'confirmed'],
  [{ result: 'fail', message: 'Rejected' }, 'rejected'],
  [{ status: 'success', result: 'fail' }, 'rejected'],
  [{ status: 'success', data: { id: 7, result: 'fail' } }, 'confirmed'],
  [{ receipt: 'queued' }, 'unknown'],
] as const)('raw returns the original receipt alongside its independent outcome: %p', async (receipt, expected) => {
  Object.freeze(receipt);
  spyOn(client, 'request').mockResolvedValue(receipt);
  const onWriteOutcome = mock<(outcome: WriteOutcome) => void>();
  expect(await request('bug/create', bug, { client, raw: true, throwOnFail: true, onWriteOutcome })).toBe(receipt);
  expect(onWriteOutcome.mock.calls).toEqual([[expected]]);
});

test('an explicit rejection is reported in normalized and throwing modes', async () => {
  const receipt = { result: 'fail', message: 'Validation failed' };
  spyOn(client, 'request').mockResolvedValue(receipt);
  await expect(request('bug/create', bug, { client })).resolves.toMatchObject({
    status: 'fail', writeOutcome: 'rejected', raw: receipt,
  });
  await expect(request('bug/create', bug, { client, throwOnFail: true })).rejects.toMatchObject({
    code: 'E_API_FAILED', writeOutcome: 'rejected', details: { raw: receipt },
  });
});

test.each([
  ['file/create', { status: 'success', message: 'Uploaded', data: { id: 7, result: 'fail' } }, undefined],
  ['File/Create', { status: 'success', message: 'Uploaded', data: { id: 7, status: 'error', message: 'Quota exceeded' } }, 'Quota exceeded'],
  ['file/create', { status: 'fail', message: 'Upload denied', data: { result: 'fail', message: 'Invalid file' } }, 'Upload denied'],
  ['file/create', { status: 'fail', data: { result: 'success', message: 'Uploaded' } }, undefined],
  ['File/Delete', { status: 'success', message: 'Deleted', data: { id: 7, result: 'fail', message: 'Delete denied' } }, 'Delete denied'],
] as const)('%s reports the failed layer of the file receipt %p', async (name, receipt, message) => {
  Object.freeze(receipt);
  spyOn(client, 'request').mockResolvedValue(receipt);
  const onWriteOutcome = mock<(outcome: WriteOutcome) => void>();
  const options = { client, onWriteOutcome };
  const params = name === 'File/Delete' ? { fileID: 7 } : { file: new Blob(['sample'], { type: 'image/png' }) };
  const failure = { status: 'fail', writeOutcome: 'rejected', raw: receipt, message };

  await expect(request(name, params, options)).resolves.toMatchObject(failure);
  await expect(request(name, params, { ...options, throwOnFail: true })).rejects.toMatchObject({
    code: 'E_API_FAILED', writeOutcome: 'rejected', details: failure, params: { message: message ?? '' },
  });
  expect(await request(name, params, { ...options, raw: true, throwOnFail: true })).toBe(receipt);
  expect(onWriteOutcome.mock.calls).toEqual([['rejected'], ['rejected'], ['rejected']]);
});

test.each([
  [{ id: 7 }, 'unknown'],
  [{ result: 'success' }, 'confirmed'],
] as const)('file/delete requires an explicit success marker to confirm deletion: %p', async (receipt, outcome) => {
  spyOn(client, 'request').mockResolvedValue(receipt);
  const response = await request('file/delete', { fileID: 7 }, { client });
  expect(response.writeOutcome).toBe(outcome);
});

test('keeps a structured failure message from the upload receipt', async () => {
  const reason = Object.freeze({ file: ['Quota exceeded'] });
  const receipt = { status: 'fail', message: '', data: { status: 'error', message: reason } };
  spyOn(client, 'request').mockResolvedValue(receipt);
  const response = await request('file/create', { file: new Blob(['sample']) }, { client });
  expect(response.rawMessage).toBe(reason);
  expect(response.message).toBe(JSON.stringify(reason));
  expect(response.raw).toBe(receipt);
});

test('applies upload result processing after extracting the ID and honors a custom result getter', async () => {
  const receipt = Object.freeze({ id: '7', data: Object.freeze({ title: 'Image' }) });
  spyOn(client, 'request').mockResolvedValue(receipt);
  const params = { file: new Blob(['sample']) };
  const picked = await request('file/create', params, { client, pick: ['id'] });
  expect(picked.data).toEqual({ id: 7 });
  extendModuleAction('file', 'create', { resultGetter: 'data' });
  const custom = await request('file/create', params, { client });
  expect(custom.data).toBe(receipt.data);
  expect(await request('file/create', params, { client, raw: true })).toBe(receipt);
});

test('a read-only POST never reports an object write', async () => {
  spyOn(client, 'request').mockResolvedValue(Response.json({ status: 'success', data: [] }));
  const onWriteOutcome = mock<(outcome: WriteOutcome) => void>();
  const response = await request('db/query', { sql: 'SELECT 1' }, { client, onWriteOutcome });
  expect(response).not.toHaveProperty('writeOutcome');
  expect(onWriteOutcome).not.toHaveBeenCalled();
});

test('header validation stops before transport and an observer cannot mask the error', async () => {
  const fetch = spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Unexpected dispatch'));
  const onWriteOutcome = mock(async (_outcome: WriteOutcome) => { throw new Error('Observer failed'); });
  await expect(request('bug/create', bug, { client, actionAssistant: { name: '' }, onWriteOutcome })).rejects.toMatchObject({
    code: 'E_INVALID_PARAM', writeOutcome: 'not-sent',
  });
  expect(fetch).not.toHaveBeenCalled();
  expect(onWriteOutcome.mock.calls).toEqual([['not-sent']]);
});

test('a shared configuration error is classified per request', async () => {
  const shared = new ZentaoError('E_NETWORK_ERROR', { message: 'Config disconnected' });
  setGlobalOptions({ version: undefined });
  spyOn(client, 'getZentaoConfig').mockRejectedValue(shared);
  const [write, read] = await Promise.all([
    request('bug/create', bug, { client }).catch(error => error),
    request('bug/get', { id: 7 }, { client }).catch(error => error),
  ]);
  expect(write).toMatchObject({ writeOutcome: 'not-sent', cause: shared });
  expect(read).toBe(shared);
  expect(shared).not.toHaveProperty('writeOutcome');
});

test('custom callbacks retain their own errors and report only the observed phase', async () => {
  const original = Object.freeze(new ZentaoError('E_API_FAILED', { message: 'Custom validation' }));
  const reject = async () => { throw original; };
  const onWriteOutcome = mock<(outcome: WriteOutcome) => void>();
  extendModuleAction('bug', 'create', { beforeRequest: reject });
  await expect(request('bug/create', bug, { client, onWriteOutcome })).rejects.toBe(original);
  extendModuleAction('bug', 'create', { beforeRequest: async () => ({}), request: reject });
  await expect(request('bug/create', bug, { client, onWriteOutcome })).rejects.toBe(original);
  extendModuleAction('bug', 'create', { request: async () => ({ result: 'fail' }) });
  await expect(request('bug/create', bug, { client, onWriteOutcome, throwOnFail: true })).rejects.toMatchObject({
    code: 'E_API_FAILED', writeOutcome: 'rejected',
  });
  expect(onWriteOutcome.mock.calls).toEqual([['not-sent'], ['unknown'], ['rejected']]);
});
