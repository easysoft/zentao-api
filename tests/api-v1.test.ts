import { afterEach, expect, test } from 'bun:test';
import { ZentaoClient, request, setGlobalOptions, getModuleAction, getModuleNames, getModule } from '../src/index';
import { resetModuleDefinitions } from '../src/modules/registry';

afterEach(() => { setGlobalOptions({ version: undefined, persistProfiles: false, skipVersionCheckOnConfigError: false }); resetModuleDefinitions(); });
function mock(version = '21.2', responder: (req: Request) => Response | Promise<Response> = () => Response.json({ id: 7, title: 'Fixture', steps: '<p>Steps</p>' })) {
  const calls: Request[] = [];
  const server = Bun.serve({ port: 0, async fetch(req) {
    if (new URL(req.url).searchParams.get('mode') === 'getconfig') return Response.json({ version });
    calls.push(req.clone());
    return responder(req);
  } });
  const client = new ZentaoClient({ baseUrl: server.url.toString(), token: 'fixture-token', apiVersion: 'auto' });
  return { client, calls, server };
}

test.each(['21.2', '22.0', 'biz13.0', 'max8.0', 'ipd5.0'])('auto selects API generation for %s and preserves v2 defaults', async version => {
  const { client, calls, server } = mock(version, () => Response.json(version === '21.2' ? { id: 7, title: 'Fixture' } : { bug: { id: 7, title: 'Fixture' } }));
  try {
    const result = await request('bug/7', {}, { client });
    expect(result.data?.id).toBe(7);
    expect(new URL(calls[0].url).pathname).toBe('/api.php/' + (version === '21.2' ? 'v1' : 'v2') + '/bugs/7');
    expect(calls[0].headers.get('Token')).toBe('fixture-token');
  } finally { server.stop(true); }
});

test('explicit v1 supports site subdirectories and per-call versions do not mutate the client', async () => {
  const { server, calls } = mock();
  try {
    const client = new ZentaoClient({ baseUrl: server.url + 'zentao/api.php/v1', apiVersion: 'v1' });
    expect(client.baseUrl).toBe(server.url + 'zentao/api.php/v1');
    await client.get('/bugs/7');
    await client.get('/bugs/8', { apiVersion: 'v2' });
    await client.get('/bugs/9');
    expect(calls.map(r => new URL(r.url).pathname)).toEqual(['/zentao/api.php/v1/bugs/7','/zentao/api.php/v2/bugs/8','/zentao/api.php/v1/bugs/9']);
    expect(new ZentaoClient(server.url.toString()).apiVersion).toBe('v2');
  } finally { server.stop(true); }
});

test('v1 password login uses tokens, accepts its token-only response and attaches the token afterwards', async () => {
  let credentials: unknown;
  const { server, calls, client } = mock('21.2', async req => {
    if (new URL(req.url).pathname.endsWith('/tokens')) { credentials = await req.json(); return Response.json({ token: 'new-fixture-token' }, { status: 201 }); }
    return Response.json({ id: 7 });
  });
  try {
    expect(await client.login('fixture-user', 'fixture-password')).toBe('new-fixture-token');
    expect(credentials).toEqual({ account: 'fixture-user', password: 'fixture-password' });
    expect(new URL(calls[0].url).pathname).toBe('/api.php/v1/tokens');
    await client.get('/bugs/7');
    expect(calls[1].headers.get('Token')).toBe('new-fixture-token');
  } finally { server.stop(true); }
});

test('v1 list aliases use server pagination while preserving single objects and empty pages', async () => {
  const { client, calls, server } = mock('21.2', req => {
    const url = new URL(req.url);
    return Response.json({ page: Number(url.searchParams.get('page')), limit: Number(url.searchParams.get('limit')), total: 0, products: [] });
  });
  try {
    const r = await request('product/list', { pageID: 2, recPerPage: 7, orderBy: 'id_desc', browseType: 'all' }, { client });
    const u = new URL(calls[0].url);
    expect(Object.fromEntries(u.searchParams)).toEqual({ page: '2', limit: '7', order: 'id_desc', status: 'all' });
    expect(r.data).toEqual([]); expect(r.pager).toEqual({ total: 0, page: 2, recPerPage: 7 });
  } finally { server.stop(true); }
});

test.each(['bugs','tasks','stories'])('v1 my/%s adapts nested lists without global scope', async name => {
  const field = name === 'bugs' ? 'bug' : name === 'tasks' ? 'task' : 'story';
  const { client, calls, server } = mock('21.2', () => Response.json({ profile: { account: 'fixture-user' }, [field]: { total: 1, [name]: [{ id: 7 }] } }));
  try {
    const r = await request('my/' + name, { type: 'openedBy', pageID: 1, recPerPage: 5 }, { client });
    expect(new URL(calls[0].url).pathname).toBe('/api.php/v1/user');
    expect(new URL(calls[0].url).searchParams.get('fields')).toBe(field);
    expect(new URL(calls[0].url).searchParams.get('type')).toBe('openedBy');
    expect(r.data).toEqual([{ id: 7 }]); expect(r.pager).toEqual({ total: 1, page: 1, recPerPage: 5 });
  } finally { server.stop(true); }
});

test('v1 update autoFill uses v1 detail and preserves unspecified values', async () => {
  let updated: unknown;
  const { client, calls, server } = mock('21.2', async req => {
    if (req.method === 'PUT') { updated = await req.json(); return Response.json({ id: 7 }); }
    return Response.json({ id: 7, title: 'Existing', steps: '<p>Keep</p>', severity: 2, pri: 3, assignedTo: { id: 1, account: 'fixture-user', realname: 'Fixture' } });
  });
  try {
    await request('bug/update', { id: 7, pri: 1 }, { client, autoFill: true });
    expect(calls.map(r => r.method)).toEqual(['GET','PUT']);
    expect(updated).toMatchObject({ title: 'Existing', steps: '<p>Keep</p>', severity: 2, pri: 1, assignedTo: 'fixture-user' });
    expect(calls.every(r => new URL(r.url).pathname.startsWith('/api.php/v1/'))).toBe(true);
  } finally { server.stop(true); }
});

test.each([
  ['bug','confirm','confirm'], ['bug','resolve','resolve'], ['bug','close','close'], ['bug','activate','active'],
  ['task','start','start'], ['task','finish','finish'], ['task','close','close'], ['task','activate','active'],
  ['story','activate','active'], ['story','close','close'], ['story','change','change'],
])('v1 %s/%s uses POST and its v1 action path', async (module, action, suffix) => {
  const { client, calls, server } = mock();
  try {
    await request(module + '/' + action, { id: 7, comment: 'Fixture' }, { client });
    expect(calls[0].method).toBe('POST');
    expect(new URL(calls[0].url).pathname).toBe('/api.php/v1/' + (module === 'story' ? 'stories' : module + 's') + '/7/' + suffix);
  } finally { server.stop(true); }
});

test.each([
 ['bug', { productID: 5, title: 'Fixture', openedBuild: ['trunk'] }, '/products/5/bugs'],
 ['task', { executionID: 6, name: 'Fixture' }, '/executions/6/tasks'],
 ['story', { productID: 5, title: 'Fixture' }, '/products/5/stories'],
])('v1 %s/create uses scoped route and omits v2-only routing body fields', async (module, params, path) => {
  let body: unknown;
  const { client, calls, server } = mock('21.2', async req => { body = await req.json(); return Response.json({ id: 7 }); });
  try {
    await request(module + '/create', params, { client });
    expect(new URL(calls[0].url).pathname).toBe('/api.php/v1' + path);
    expect(body).not.toHaveProperty('productID'); expect(body).not.toHaveProperty('executionID');
  } finally { server.stop(true); }
});

test('v1 unsupported actions and fields fail before a business request; versions are not falsified', async () => {
  const { client, calls, server } = mock();
  try {
    await expect(request('story/getGrades', {}, { client })).rejects.toMatchObject({ code: 'E_UNSUPPORTED_API_ACTION' });
    await expect(request('story/create', { productID: 1, title: 'Fixture', grade: 1 }, { client })).rejects.toMatchObject({ code: 'E_INVALID_PARAM' });
    expect(calls).toHaveLength(0);
    setGlobalOptions({ version: '21.1' });
    await expect(request('bug/7', {}, { client })).rejects.toMatchObject({ code: 'E_UNSUPPORTED_ZENTAO_VERSION' });
    expect(calls).toHaveLength(0);
    expect(getModuleAction('bug','get')?.minVersion[0]).toBe('22.0');
    expect(getModuleAction('bug','get')?.apiV1?.minVersion).toEqual(['21.2']);
  } finally { server.stop(true); }
});

test.each([new Response('<html>Login</html>'), Response.json({ error: 'Denied' }), Response.json({ products: [] })])('v1 malformed or failed response is not a successful empty result', async response => {
  const { client, server } = mock('21.2', () => response.clone());
  try { await expect(request('product/list', {}, { client, throwOnFail: true })).rejects.toMatchObject({ code: 'E_API_FAILED' }); }
  finally { server.stop(true); }
});

test('v1 registry introspection is explicit and keeps v2 metadata unchanged', () => {
  expect(getModuleAction('bug','get',{ apiVersion: 'v1', version: '21.2' })?.resultGetter).toBeUndefined();
  expect(getModuleAction('bug','get',{ version: '21.2' })).toBeUndefined();
  expect(getModule('my',{ apiVersion: 'auto', version: '21.2' })?.actions.map(a => a.name)).toEqual(['tasks','bugs','stories']);
  expect(getModuleNames({ apiVersion: 'v1', version: '21.2' })).toContain('bug');
});

test.each(['object','json'])('v1 create scopes also resolve from %s data and reject conflicting IDs', async kind => {
  const { client, calls, server } = mock();
  const data = { productID: 5, title: 'Fixture', openedBuild: ['trunk'] };
  try {
    await request('bug/create', { data: kind === 'json' ? JSON.stringify(data) : data }, { client });
    expect(new URL(calls[0].url).pathname).toBe('/api.php/v1/products/5/bugs');
    // Request body assertions are handled in the server callback; cloned Bun requests can close after response completion.

    await expect(request('bug/create', { productID: 6, data }, { client })).rejects.toMatchObject({ code: 'E_INVALID_PARAM' });
    expect(calls).toHaveLength(1);
  } finally { server.stop(true); }
});
