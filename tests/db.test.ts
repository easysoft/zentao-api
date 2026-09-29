import { afterEach, expect, test } from 'bun:test';
import { ZentaoClient, request, setGlobalOptions } from '../src/index';
import { resetModuleDefinitions } from '../src/modules/registry';

afterEach(() => {
  resetModuleDefinitions();
  setGlobalOptions({ version: undefined });
});

const queryResult = {
  status: 'success',
  sql: 'select id from zt_config LIMIT 9, 3',
  columns: [{ name: 'id', type: 'long', masked: false }],
  rows: [{ id: 12 }, { id: 13 }, { id: 14 }],
  total: 204,
  page: 4,
  limit: 3,
  elapsed: 0.0101,
};

test.each([
  { sql: 'select id from zt_config', page: '4', limit: '3' },
  { data: { sql: 'select id from zt_config', page: 4, limit: 3 } },
  { data: '{"sql":"select id from zt_config","page":4,"limit":3}' },
])('db/query sends JSON and normalizes rows and pagination for %p', async params => {
  const received: { method: string; path: string; body: unknown }[] = [];
  let result = queryResult;
  const server = Bun.serve({ port: 0, async fetch(req) {
    const url = new URL(req.url);
    received.push({ method: req.method, path: url.pathname + url.search, body: await req.json() });
    return Response.json(result);
  } });
  try {
    resetModuleDefinitions();
    setGlobalOptions({ version: 'ipd5.7' });
    const client = new ZentaoClient(server.url.href);
    await expect(request('db/query', params, { client })).resolves.toMatchObject({
      status: 'success', data: queryResult.rows, pager: { total: 204, page: 4, recPerPage: 3 },
    });
    expect(received).toEqual([{
      method: 'POST', path: '/api.php/v2/db/query',
      body: { sql: 'select id from zt_config', page: 4, limit: 3 },
    }]);
    expect(await request('db/query', params, { client, raw: true })).toEqual(queryResult);
    await expect(request('db/query', {}, { client })).rejects.toMatchObject({ code: 'E_MISSING_PARAM' });
    expect(received).toHaveLength(2);

    result = { ...queryResult, rows: [], total: 0 };
    await expect(request('db/query', params, { client })).resolves.toMatchObject({
      status: 'success', data: [], pager: { total: 0, page: 4, recPerPage: 3 },
    });
  } finally { server.stop(true); }
});

test('db table requests preserve metadata and SQL on the verified tables route after a reset', async () => {
  const table = { name: 'zt_config', title: '配置', description: '', group: 'admin' };
  const metadata = {
    ...table, primaryKey: 'id',
    columns: [{ name: 'id', title: '编号', type: 'int', length: 10, nullable: false, key: 'PRI', default: '', description: '' }],
  };
  const sql = { status: 'success', ...table, dialect: 'mysql', sql: 'CREATE TABLE `zt_config` (`id` int);' };
  const received: string[] = [];
  const server = Bun.serve({ port: 0, fetch(req) {
    const url = new URL(req.url);
    received.push(`${req.method} ${url.pathname}${url.search}`);
    if (url.pathname === '/api.php/v2/db/tables') return Response.json({ status: 'success', total: 1, tables: [table] });
    if (url.pathname === '/api.php/v2/db/tables/zt_config') {
      return Response.json(url.searchParams.get('type') === 'sql' ? sql : { status: 'success', table: metadata });
    }
    return new Response('Unknown route', { status: 404 });
  } });
  try {
    resetModuleDefinitions();
    setGlobalOptions({ version: 'ipd5.7' });
    const client = new ZentaoClient(server.url.href);
    expect((await request('db/tables', {}, { client })).data).toEqual([table]);
    expect((await request('db/table', { table: 'zt_config' }, { client })).data).toEqual(metadata);
    expect((await request('db/table', { table: 'zt_config', type: 'meta' }, { client })).data).toEqual(metadata);
    expect((await request('db/table', { table: 'zt_config', type: 'sql' }, { client })).data).toEqual(sql);
    await expect(request('db/table', {}, { client })).rejects.toMatchObject({ code: 'E_MISSING_PARAM' });
    expect(received).toEqual([
      'GET /api.php/v2/db/tables',
      'GET /api.php/v2/db/tables/zt_config?type=meta',
      'GET /api.php/v2/db/tables/zt_config?type=meta',
      'GET /api.php/v2/db/tables/zt_config?type=sql',
    ]);
  } finally { server.stop(true); }
});

test.each([
  ['db/query', { sql: 'select id from zt_config' }],
  ['db/tables', {}],
  ['db/table', { table: 'zt_config' }],
] as const)('%s does not treat an HTTP 200 PHP error as success', async (name, params) => {
  const responseText = 'ERROR: the control file module/db/control.php not found.';
  const server = Bun.serve({ port: 0, fetch: () => new Response(responseText, {
    headers: { 'content-type': 'text/html' },
  }) });
  try {
    setGlobalOptions({ version: 'ipd5.7' });
    const client = new ZentaoClient(server.url.href);
    await expect(request(name, params, { client })).resolves.toMatchObject({
      status: 'fail', raw: { httpStatus: 200, responseText },
    });
    await expect(request(name, params, { client, throwOnFail: true })).rejects.toMatchObject({ code: 'E_API_FAILED' });
  } finally { server.stop(true); }
});
