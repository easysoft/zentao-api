import { afterEach, expect, test } from 'bun:test';
import { iteratePages, request, setGlobalOptions, ZentaoClient } from '../src/index';

let server: ReturnType<typeof Bun.serve> | undefined;

function serve(reply: (page: number) => Record<string, unknown>) {
  const pages: number[] = [];
  const queries: URLSearchParams[] = [];
  const configReads: string[] = [];
  const bodies: Record<string, unknown>[] = [];
  server = Bun.serve({
    hostname: '127.0.0.1', port: 0,
    async fetch(req) {
      const url = new URL(req.url);
      const query = url.searchParams;
      if (query.get('mode') === 'getconfig') {
        configReads.push(url.pathname);
        return Response.json({ version: '23.0' });
      }
      const body = req.method === 'POST' ? await req.json() as Record<string, unknown> : undefined;
      if (body) bodies.push(body);
      const page = Number(query.get('pageID') ?? body?.pageID ?? body?.page);
      pages.push(page);
      queries.push(query);
      return Response.json({ status: 'success', ...reply(page) });
    },
  });
  setGlobalOptions({ client: new ZentaoClient(server.url.href), version: '23.0' });
  return { pages, bodies, queries, configReads };
}

afterEach(() => {
  server?.stop(true);
  setGlobalOptions({ client: undefined, version: undefined, limit: undefined });
});

const repos = ['Web', 'iOS', '发布工具', '文档', '发布脚本'].map((name, i) => ({ id: i + 1, name }));
const params = Object.freeze({ spaceID: 10, recPerPage: 2, orderBy: 'id_asc' });
function repoPage(page: number) {
  return {
    repos: repos.slice((page - 1) * 2, page * 2),
    pager: { pageID: String(page), recPerPage: '2', recTotal: String(repos.length) },
  };
}

test('fetches on demand across a locally empty page and stops as soon as the caller breaks', async () => {
  const { pages } = serve(repoPage);
  const stream = iteratePages('repo/list', params, { search: ['发布'], searchFields: ['name'], pick: ['name'] });
  expect(pages).toEqual([]);
  const matches = [];
  for await (const page of stream) {
    expect(pages.length).toBe(page.pager.page);
    expect(page.pager).toMatchObject({ total: 5, recPerPage: 2 });
    matches.push(page.data);
    if (page.data.length) break;
  }
  expect(matches).toEqual([[], [{ name: '发布工具' }]]);
  expect(pages).toEqual([1, 2]);
  expect((await stream.next()).done).toBe(true);
  expect(pages).toEqual([1, 2]);
});

test('starts from the requested page and uses server totals even when a global limit hides every row', async () => {
  const { pages } = serve(repoPage);
  setGlobalOptions({ limit: '0' });
  const stream = iteratePages('repo', { ...params, page: '2' });
  const second = await stream.next();
  expect(second.value).toMatchObject({ data: [], pager: { page: 2 } });
  if (!second.done) second.value.pager.page = 99;
  expect((await stream.next()).value).toMatchObject({ data: [], pager: { page: 3 } });
  expect(await stream.next()).toMatchObject({ done: true });
  expect(pages).toEqual([2, 3]);
});

test.each([1, 3])('rejects a response reporting page %i for the second request before yielding it', async received => {
  const { pages } = serve(page => repoPage(page === 2 ? received : page));
  const stream = iteratePages('repo', params);
  expect((await stream.next()).value).toMatchObject({ pager: { page: 1 } });
  await expect(stream.next()).rejects.toMatchObject({
    code: 'E_PAGINATION_INCOMPLETE', params: { page: 2, reason: `received page ${received}` },
  });
  expect((await stream.next()).done).toBe(true);
  expect(pages).toEqual([1, 2]);
});

test.each([1, 2])('reports incomplete results when page %i lacks its pager', async missing => {
  const { pages } = serve(page => ({ ...repoPage(page), ...(page === missing ? { pager: undefined } : {}) }));
  const stream = iteratePages('repo', params);
  if (missing === 2) expect((await stream.next()).value).toMatchObject({ pager: { page: 1 } });
  await expect(stream.next()).rejects.toMatchObject({ code: 'E_PAGINATION_INCOMPLETE', params: { page: missing } });
  expect(pages).toEqual(missing === 1 ? [1] : [1, 2]);
});

test('request still returns one page, including responses without pagination', async () => {
  const { pages } = serve(page => ({ ...repoPage(page), ...(page === 2 ? { pager: undefined } : {}) }));
  const first = await request('repo', params, { filter: ['id>2'] });
  expect(first.data).toEqual([]);
  expect(first.pager).toEqual({ page: 1, total: 5, recPerPage: 2 });
  expect(pages).toEqual([1]);
  const second = await request('repo', { ...params, pageID: 2 });
  expect(second.data).toEqual(repos.slice(2, 4));
  expect(second.pager).toBeUndefined();
  expect(pages).toEqual([1, 2]);
});

test('distinguishes a contradictory empty source page from a genuinely empty result before local conversion', async () => {
  let total = 5;
  const { pages } = serve(page => ({ repos: [], pager: { pageID: page, recPerPage: 2, recTotal: total } }));
  const stream = iteratePages('repo', params, { convert(rows) { rows.push({ id: 7 }); return rows; } });
  await expect(stream.next()).rejects.toMatchObject({ code: 'E_PAGINATION_INCOMPLETE' });
  total = 0;
  const empty = iteratePages('repo', params);
  expect((await empty.next()).value).toMatchObject({ data: [], pager: { total: 0 } });
  expect((await empty.next()).done).toBe(true);
  expect(pages).toEqual([1, 1]);
});

test.each([
  { pageID: 1, recPerPage: 0, recTotal: 5 },
  { pageID: 1, recPerPage: 2, recTotal: null },
  { pageID: 1, recPerPage: 2 },
])('rejects an incomplete or unusable pager %j', async pager => {
  const { pages } = serve(() => ({ repos, pager }));
  await expect(iteratePages('repo', params).next()).rejects.toMatchObject({ code: 'E_PAGINATION_INCOMPLETE' });
  expect(pages).toEqual([1]);
});

test('advances a POST list body using its declared page field and the winning JSON data', async () => {
  const { pages, bodies } = serve(page => ({ rows: [{ id: page }], page, limit: 1, total: 3 }));
  const data = JSON.stringify({ sql: 'SELECT id FROM zt_product', page: 2, limit: 1 });
  const input = Object.freeze({ page: 1, data });
  const ids = [];
  for await (const page of iteratePages<{ id: number }>('db/query', input)) ids.push(page.data[0].id);
  expect(ids).toEqual([2, 3]);
  expect(pages).toEqual([2, 3]);
  expect(bodies).toEqual([2, 3].map(page => ({ ...JSON.parse(data), page })));
  expect(input.data).toBe(data);
});

test('sends pageID to workflow lists with a pager and keeps the starting client, size and version across pulls', async () => {
  const { pages, queries, configReads } = serve(page => ({
    datasources: [{ id: page }], pager: { pageID: page, recPerPage: 1, recTotal: 2 },
  }));
  const input = { recPerPage: 1 };
  const stream = iteratePages('workflow/datasources', input, { forceRefreshConfig: true });
  expect((await stream.next()).value).toMatchObject({ data: [{ id: 1 }] });
  setGlobalOptions({ client: undefined, version: '1.0', limit: '0' });
  input.recPerPage = 10;
  expect((await stream.next()).value).toMatchObject({ data: [{ id: 2 }] });
  expect((await stream.next()).done).toBe(true);
  expect(pages).toEqual([1, 2]);
  expect(queries.map(query => query.get('recPerPage'))).toEqual(['1', '1']);
  expect(configReads).toHaveLength(1);
});

test('propagates API failures and rejects write actions and invalid starting pages before dispatch', async () => {
  const { pages } = serve(() => ({ status: 'fail', message: 'Cannot read repositories' }));
  await expect(iteratePages('bug/create', { productID: 1, title: 'Bug', openedBuild: ['trunk'] }).next())
    .rejects.toMatchObject({ code: 'E_INVALID_PARAM' });
  await expect(iteratePages('repo', { ...params, pageID: 0 }).next()).rejects.toMatchObject({ code: 'E_INVALID_PARAM' });
  expect(pages).toEqual([]);
  await expect(iteratePages('repo', params).next()).rejects.toMatchObject({ code: 'E_API_FAILED' });
  expect(pages).toEqual([1]);
});
