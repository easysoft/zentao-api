import { afterEach, expect, mock, spyOn, test } from 'bun:test';
import { ZentaoClient, extendModuleAction, request, setGlobalOptions } from '../src/index';
import { resetModuleDefinitions } from '../src/modules/registry';

afterEach(() => {
  mock.restore();
  resetModuleDefinitions();
  setGlobalOptions({ version: undefined });
});

test.each([
  ['flat number', { productID: 77 }, 77],
  ['flat string', { productID: '77' }, 77],
  ['object data', { data: Object.freeze({ productID: '78' }) }, 78],
  ['JSON data', { data: '{"productID":"79"}' }, 79],
  ['object precedence', { productID: 77, data: Object.freeze({ productID: '88' }) }, 88],
  ['JSON precedence', { productID: 77, data: '{"productID":"89"}' }, 89],
] as const)('bug create copies the resolved product ID from %s into the query', async (_name, params, productID) => {
  const received: Array<{ path: string; method: string; query: Record<string, string>; body: unknown }> = [];
  const snapshot = JSON.stringify(params);
  const server = Bun.serve({ port: 0, async fetch(req) {
    const url = new URL(req.url);
    received.push({ path: url.pathname, method: req.method, query: Object.fromEntries(url.searchParams), body: await req.json() });
    return Response.json(url.searchParams.has('productID')
      ? { status: 'success', id: 101 }
      : { status: 'fail', message: 'Missing required parameter: productID.' });
  } });
  try {
    resetModuleDefinitions();
    // Consumer-defined query parameters must survive the builtin hook.
    extendModuleAction('bug', 'create', { params: [{ name: 'source', type: 'string' }] });
    setGlobalOptions({ version: '22.5' });
    const client = new ZentaoClient(server.url.href);
    const response = await request('bug/create', { title: 'Regression bug', openedBuild: 'trunk', source: 'sdk', ...params }, { client });
    expect(response.status).toBe('success');
    expect(received).toEqual([{
      path: '/api.php/v2/bugs', method: 'POST', query: { source: 'sdk', productID: String(productID) },
      body: { productID, title: 'Regression bug', openedBuild: ['trunk'] },
    }]);
    expect(JSON.stringify(params)).toBe(snapshot);
  } finally { server.stop(true); }
});

test('bug create still rejects a missing product ID before transport', async () => {
  setGlobalOptions({ version: '22.5' });
  const client = new ZentaoClient('http://zentao.test');
  const transport = spyOn(client, 'request').mockResolvedValue({ status: 'success' });
  await expect(request('bug/create', { title: 'Missing product', openedBuild: 'trunk' }, { client }))
    .rejects.toMatchObject({ code: 'E_MISSING_PARAM', params: { param: 'productID' } });
  expect(transport).not.toHaveBeenCalled();
});
