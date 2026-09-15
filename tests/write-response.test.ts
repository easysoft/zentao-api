import { afterEach, expect, test } from 'bun:test';
import { ZentaoClient, defineModuleActions, request, setGlobalOptions } from '../src/index';
import { resetModuleDefinitions } from '../src/modules/registry';

afterEach(() => {
  resetModuleDefinitions();
  setGlobalOptions({ version: undefined });
});

const cases: [string, Record<string, unknown>][] = [
  ['product/create', { name: 'Product' }],
  ['product/update', { id: 7, name: 'Product' }],
  ['feedback/close', { id: 7, closedReason: 'refuse', confirmClose: 'yes' }],
  ['bug/confirm', { id: 7, status: 'active', assignedTo: 'admin', type: 'codeerror', pri: 2, deadline: '', mailto: [] }],
];
for (const responseText of [
  '<pre class="alert alert-danger">Array to string conversion</pre>{"status":"success"}',
  "SQLSTATE[42S22]: Unknown column 'confirmClose' in 'SET'",
  '',
]) {
  test.each(cases)('%s rejects invalid JSON write responses in normal, throwing and raw modes', async (name, params) => {
    const server = Bun.serve({ port: 0, fetch: () => new Response(responseText, {
      status: 200, headers: { 'content-type': 'application/json' },
    }) });
    try {
      resetModuleDefinitions();
      setGlobalOptions({ version: 'ipd5.6' });
      const client = new ZentaoClient(server.url.href);
      const output = await request(name, params, { client });
      expect(output.status).toBe('fail');
      expect(output.raw).toMatchObject({ httpStatus: 200, responseText });
      await expect(request(name, params, { client, throwOnFail: true })).rejects.toMatchObject({ code: 'E_API_FAILED' });
      const raw = await request(name, params, { client, raw: true, throwOnFail: true });
      expect(raw).toMatchObject({ status: 'fail', httpStatus: 200, responseText });
    } finally { server.stop(true); }
  });
}

test.each([{ status: 'success' }, 7, 'Saved'])('valid JSON is retained even with a misleading content type: %p', async raw => {
  const server = Bun.serve({ port: 0, fetch: () => new Response(JSON.stringify(raw), { headers: { 'content-type': 'text/html' } }) });
  try {
    setGlobalOptions({ version: 'ipd5.6' });
    const client = new ZentaoClient(server.url.href);
    expect(await request('feedback/close', { id: 7, closedReason: 'refuse' }, { client, raw: true })).toEqual(raw);
  } finally { server.stop(true); }
});

test('HTTP failures retain the transport error code', async () => {
  const server = Bun.serve({ port: 0, fetch: () => new Response('Service unavailable', { status: 503 }) });
  try {
    setGlobalOptions({ version: 'ipd5.6' });
    const client = new ZentaoClient(server.url.href);
    await expect(request('product/create', { name: 'Product' }, { client })).rejects.toMatchObject({ code: 'E_HTTP_ERROR' });
  } finally { server.stop(true); }
});

test('custom text actions retain their response semantics', async () => {
  const server = Bun.serve({ port: 0, fetch: () => new Response('Saved') });
  try {
    setGlobalOptions({ version: 'ipd5.6' });
    defineModuleActions('product', { name: 'customText', type: 'action', path: '/custom', minVersion: ['ipd5.5'] });
    const client = new ZentaoClient(server.url.href);
    expect(await request('product/customText', {}, { client })).toEqual({ status: 'success', data: 'Saved' });
  } finally { server.stop(true); }
});
