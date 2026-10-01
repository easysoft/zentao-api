import { afterEach, expect, test } from 'bun:test';
import { ZentaoClient, request, setGlobalOptions } from '../src/index';
import { resetModuleDefinitions } from '../src/modules/registry';

afterEach(() => {
  resetModuleDefinitions();
  setGlobalOptions({ version: undefined });
});

test('knowledge lists send filters and normalize pagination and empty pages after a reset', async () => {
  const library = { id: 12, title: '研发知识库', description: '', type: 'team' };
  const knowledge = { id: 502, title: '登录超时', type: 'object', objectType: 'bug' };
  const received: { method: string; path: string; query: Record<string, string>; token: string | null }[] = [];
  const server = Bun.serve({ port: 0, fetch(req) {
    const url = new URL(req.url);
    received.push({ method: req.method, path: url.pathname, query: Object.fromEntries(url.searchParams), token: req.headers.get('Token') });
    const pageID = Number(url.searchParams.get('pageID'));
    return Response.json({
      status: 'success',
      data: pageID === 99 ? [] : [url.pathname.endsWith('/knowledgelibs') ? library : knowledge],
      pager: { pageID, recPerPage: Number(url.searchParams.get('recPerPage')), recTotal: 35, pageTotal: 4 },
    });
  } });
  try {
    resetModuleDefinitions();
    setGlobalOptions({ version: 'ipd5.7' });
    const client = new ZentaoClient({ baseUrl: server.url.href, token: 'test-token' });
    await expect(request('knowledgelib', { type: 'team', keyword: '研发' }, { client })).resolves.toMatchObject({
      status: 'success', data: [library], pager: { total: 35, page: 1, recPerPage: 20 },
    });
    await expect(request('knowledge/list', { libID: 12, type: 'object', objectType: 'bug', page: 2 }, { client, recPerPage: '10' }))
      .resolves.toMatchObject({ status: 'success', data: [knowledge], pager: { total: 35, page: 2, recPerPage: 10 } });
    await expect(request('knowledge', { libID: 12, objectType: 'bug', pageID: 99 }, { client }))
      .resolves.toMatchObject({ status: 'success', data: [], pager: { total: 35, page: 99, recPerPage: 20 } });
    await expect(request('knowledge/list', {}, { client })).rejects.toMatchObject({ code: 'E_MISSING_PARAM', message: 'Missing required parameter: libID' });
    expect(received).toEqual([
      { method: 'GET', path: '/api.php/v2/ai/knowledgelibs', query: { type: 'team', keyword: '研发', pageID: '1', recPerPage: '20' }, token: 'test-token' },
      { method: 'GET', path: '/api.php/v2/ai/knowledgelibs/12/knowledges', query: { type: 'object', objectType: 'bug', pageID: '2', recPerPage: '10' }, token: 'test-token' },
      { method: 'GET', path: '/api.php/v2/ai/knowledgelibs/12/knowledges', query: { objectType: 'bug', pageID: '99', recPerPage: '20' }, token: 'test-token' },
    ]);
  } finally { server.stop(true); }
});

const embeddingsParams = { keyword: '登录超时', libIDs: [12, 18], type: 'object', objectType: 'bug', minSimilarity: 0, limit: 10 };

test.each([embeddingsParams, { data: embeddingsParams }, { data: JSON.stringify(embeddingsParams) }])(
  'knowledge/embeddingsSearch sends JSON without pagination and preserves chunk identifiers for %p', async params => {
    const chunks = [
      { chunkID: 'chunk_501_01', knowledgeID: 501, libID: 12, title: '登录超时', type: 'object', objectType: 'bug', content: '片段一', similarity: 0.91 },
      { chunkID: 'chunk_501_02', knowledgeID: 501, libID: 12, title: '登录超时', type: 'object', objectType: 'bug', content: '片段二', similarity: 0.83 },
    ];
    let result = { status: 'success', data: chunks };
    const received: { method: string; path: string; contentType: string | null; body: unknown }[] = [];
    const server = Bun.serve({ port: 0, async fetch(req) {
      const url = new URL(req.url);
      received.push({ method: req.method, path: url.pathname + url.search, contentType: req.headers.get('Content-Type'), body: await req.json() });
      return Response.json(result);
    } });
    try {
      setGlobalOptions({ version: 'biz13.7' });
      const client = new ZentaoClient(server.url.href);
      const response = await request('knowledge/embeddingsSearch', params, { client, recPerPage: '100' });
      expect(response.data).toEqual(chunks);
      expect(response.pager).toBeUndefined();
      expect(received).toEqual([{
        method: 'POST', path: '/api.php/v2/ai/knowledges/embeddingssearch', contentType: 'application/json', body: embeddingsParams,
      }]);
      expect(await request('knowledge/embeddingsSearch', params, { client, raw: true })).toEqual(result);
      result = { status: 'success', data: [] };
      expect((await request('knowledge/embeddingsSearch', { keyword: '无匹配结果', libIDs: [12] }, { client })).data).toEqual([]);
      expect(received.at(-1)?.body).toEqual({ keyword: '无匹配结果', libIDs: [12], minSimilarity: 0.5, limit: 5 });
      await expect(request('knowledge/embeddingsSearch', { libIDs: [12] }, { client })).rejects.toMatchObject({ code: 'E_MISSING_PARAM' });
      await expect(request('knowledge/embeddingsSearch', { keyword: '登录超时' }, { client })).rejects.toMatchObject({ code: 'E_MISSING_PARAM' });
      expect(received).toHaveLength(3);
    } finally { server.stop(true); }
  },
);

const searchParams = {
  keywords: [' 登录 ', '登录', '50%', 'user_name', 'C:\\logs', 'a,b'], libIDs: [12, 18],
  matchMode: 'all', type: 'object', objectType: 'bug', pageID: 2, recPerPage: 10,
};

test.each([searchParams, { data: searchParams }, { data: JSON.stringify(searchParams) }])(
  'knowledge/search sends literal keywords and JSON pagination and preserves empty content for %p', async params => {
    const knowledge = { id: 502, libID: 12, title: '登录超时 50%', type: 'object', objectType: 'bug', content: '# 请求日志\n\nuser_name C:\\logs a,b\n完整正文。', contentType: 'markdown' };
    const titleOnlyKnowledge = { ...knowledge, id: 501, title: '登录 50% user_name C:\\logs a,b', content: '' };
    let result = { status: 'success', data: [knowledge, titleOnlyKnowledge], pager: { pageID: 2, recPerPage: 10, recTotal: 12, pageTotal: 2 } };
    const received: { method: string; path: string; contentType: string | null; body: unknown }[] = [];
    const server = Bun.serve({ port: 0, async fetch(req) {
      const url = new URL(req.url);
      received.push({ method: req.method, path: url.pathname + url.search, contentType: req.headers.get('Content-Type'), body: await req.json() });
      return Response.json(result);
    } });
    try {
      resetModuleDefinitions();
      setGlobalOptions({ version: 'biz13.7' });
      const client = new ZentaoClient(server.url.href);
      await expect(request('knowledge/search', params, { client, recPerPage: '99' })).resolves.toMatchObject({
        status: 'success', data: [knowledge, titleOnlyKnowledge], pager: { page: 2, recPerPage: 10, total: 12 },
      });
      expect(received).toEqual([{
        method: 'POST', path: '/api.php/v2/ai/knowledges/search', contentType: 'application/json', body: searchParams,
      }]);
      expect(await request('knowledge/search', params, { client, raw: true })).toEqual(result);

      result = { status: 'success', data: [], pager: { pageID: 1, recPerPage: 20, recTotal: 0, pageTotal: 0 } };
      await expect(request('knowledge/search', { keywords: ['无匹配结果'], libIDs: [12] }, { client })).resolves.toMatchObject({
        status: 'success', data: [], pager: { page: 1, recPerPage: 20, total: 0 },
      });
      expect(received.at(-1)?.body).toEqual({ keywords: ['无匹配结果'], libIDs: [12], matchMode: 'any', pageID: 1, recPerPage: 20 });

      result.pager = { pageID: 99, recPerPage: 10, recTotal: 12, pageTotal: 2 };
      await expect(request('knowledge/search', { keywords: ['登录'], libIDs: [12], pageID: '99' }, { client, recPerPage: '10' }))
        .resolves.toMatchObject({ status: 'success', data: [], pager: { page: 99, recPerPage: 10, total: 12 } });
      expect(received.at(-1)?.body).toEqual({ keywords: ['登录'], libIDs: [12], matchMode: 'any', pageID: 99, recPerPage: 10 });

      await expect(request('knowledge/search', embeddingsParams, { client })).rejects.toMatchObject({
        code: 'E_MISSING_PARAM', message: 'Missing required parameter: keywords',
      });
      await expect(request('knowledge/search', { keywords: ['登录'] }, { client })).rejects.toMatchObject({ code: 'E_MISSING_PARAM' });
      expect(received).toHaveLength(4);
    } finally { server.stop(true); }
  },
);

test('knowledge/get accepts local knowledge IDs and preserves saved content and source fields', async () => {
  const knowledge = {
    id: 501, libID: 12, title: '接口接入指南', type: 'file', objectType: '', objectID: 0, fileID: 25,
    content: '', contentType: 'markdown', syncedDate: null,
  };
  const received: string[] = [];
  const server = Bun.serve({ port: 0, fetch(req) {
    const url = new URL(req.url);
    received.push(`${req.method} ${url.pathname}${url.search}`);
    return Response.json({ status: 'success', data: knowledge });
  } });
  try {
    setGlobalOptions({ version: 'max8.7' });
    const client = new ZentaoClient(server.url.href);
    expect((await request('knowledge/get', { knowledgeID: 501 }, { client })).data).toEqual(knowledge);
    knowledge.content = '# 接口接入指南\n\n已保存的正文。\n';
    expect((await request('knowledge/501', {}, { client })).data).toEqual(knowledge);
    await expect(request('knowledge/get', {}, { client })).rejects.toMatchObject({ code: 'E_MISSING_PARAM' });
    expect(received).toEqual(['GET /api.php/v2/ai/knowledges/501', 'GET /api.php/v2/ai/knowledges/501']);
  } finally { server.stop(true); }
});

test('knowledge embeddings search propagates service failures and rejects non-JSON success responses', async () => {
  let response = Response.json({ status: 'fail', message: '向量搜索服务请求失败，请稍后重试。' }, { status: 502 });
  const server = Bun.serve({ port: 0, fetch: () => response.clone() });
  try {
    setGlobalOptions({ version: 'biz13.7' });
    const client = new ZentaoClient(server.url.href);
    await expect(request('knowledge/embeddingsSearch', embeddingsParams, { client })).rejects.toMatchObject({ code: 'E_HTTP_ERROR', details: { status: 502 } });
    response = new Response('ERROR: knowledge extension not found.', { headers: { 'Content-Type': 'text/html' } });
    await expect(request('knowledge/embeddingsSearch', embeddingsParams, { client })).resolves.toMatchObject({
      status: 'fail', raw: { httpStatus: 200, responseText: 'ERROR: knowledge extension not found.' },
    });
    await expect(request('knowledge/embeddingsSearch', embeddingsParams, { client, throwOnFail: true })).rejects.toMatchObject({ code: 'E_API_FAILED' });
  } finally { server.stop(true); }
});
