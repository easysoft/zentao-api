import { afterEach, expect, test } from 'bun:test';
import { ZentaoClient, getModule, getModuleAction, request, setGlobalOptions } from '../src/index';
import { resetModuleDefinitions } from '../src/modules/registry';
import { resolveActionRequest } from '../src/modules/resolve';

afterEach(() => {
  resetModuleDefinitions();
  setGlobalOptions({ version: undefined, recPerPage: undefined, client: undefined });
});

test('structured filters keep their full field descriptions without scalar options', () => {
  const filters = getModuleAction('user', 'list')!.params!.find(param => param.name === 'filters')!;
  expect(filters).toMatchObject({ type: 'array', style: 'deepObject', explode: true });
  expect(filters.options).toBeUndefined();
  expect(filters.defaultValue).toBeUndefined();
  expect(filters.description).toContain('role(职位，枚举：dev 研发');
  expect(filters.description).toContain('gender(性别，枚举：m 男 | f 女)');
});

test('activity lists leave server defaults unset and forward explicit browse types', () => {
  const module = getModule('my')!;
  const actions = module.actions.filter(action => action.name.startsWith('activity'));
  expect(actions).toHaveLength(13);
  for (const action of actions) {
    expect(resolveActionRequest(module, action.name).query).not.toHaveProperty('browseType');
    expect(resolveActionRequest(module, action.name, { browseType: 'openedBy' }).query)
      .toMatchObject({ browseType: 'openedBy' });
  }
});

test('audit plan defaults match their options without changing case-sensitive task filters', () => {
  const module = getModule('my')!;
  const browseType = getModuleAction('my', 'auditPlans')!.params!.find(param => param.name === 'browseType')!;
  expect(browseType.defaultValue).toBe('mychecking');
  expect(browseType.options!.map(option => option.value)).toContain(browseType.defaultValue);
  expect(resolveActionRequest(module, 'auditPlans').query).toMatchObject({ browseType: 'mychecking' });
  expect(resolveActionRequest(module, 'auditPlans', { browseType: 'checked' }).query).toMatchObject({ browseType: 'checked' });
  expect(resolveActionRequest(module, 'tasks').query).toMatchObject({ browseType: 'assignedTo' });
});

test('workflow definitions coexist with contract actions and preserve child paths and JSON writes', async () => {
  const received: Array<{ method: string; path: string; body?: unknown }> = [];
  const server = Bun.serve({ port: 0, async fetch(req) {
    const path = new URL(req.url).pathname;
    received.push({ method: req.method, path, ...(req.method !== 'GET' ? { body: await req.json() } : {}) });
    return Response.json(req.method === 'GET' ? { status: 'success', fields: [{ id: 8, field: 'name' }] } : { status: 'success', id: 8 });
  } });
  try {
    setGlobalOptions({ version: '22.7' });
    const client = new ZentaoClient(server.url.href);
    await request('workflow/createFlow', { module: 'contract', name: '合同' }, { client });
    expect((await request('workflow/fields', { module: 'contract' }, { client })).data).toEqual([{ id: 8, field: 'name' }]);
    await request('workflow/setActionJS', { actionID: 8, js: 'return true;' }, { client });
    expect(received).toEqual([
      { method: 'POST', path: '/api.php/v2/workflows', body: { module: 'contract', name: '合同' } },
      { method: 'GET', path: '/api.php/v2/workflows/contract/fields' },
      { method: 'PUT', path: '/api.php/v2/workflowactions/8/setJS', body: { js: 'return true;' } },
    ]);
    expect(getModuleAction('workflow', 'list')!.path).toBe('/workflow/contract');
    expect(getModuleAction('workflow', 'create')!.path).toBe('/workflow/contract');
    for (const name of ['fields', 'actions', 'labels', 'tables']) {
      expect(resolveActionRequest(getModule('workflow')!, name, { module: 'contract' }).path)
        .toBe(`/workflows/contract/${name}`);
    }
  } finally { server.stop(true); }
});

test('relation candidates extract objects and pagination while raw mode preserves relationPairs', async () => {
  const received: Array<{ path: string; query: Record<string, string> }> = [];
  const result = { status: 'success', objects: [{ id: 3, title: '任务' }], relationPairs: { implements: '实现' }, pager: { pageID: 2, recPerPage: 5, recTotal: 6 } };
  const server = Bun.serve({ port: 0, fetch(req) {
    const url = new URL(req.url);
    received.push({ path: url.pathname, query: Object.fromEntries(url.searchParams) });
    return Response.json(result);
  } });
  try {
    setGlobalOptions({ version: '22.7' });
    const client = new ZentaoClient(server.url.href);
    const params = { objectType: 'story', objectID: 1, relatedObjectType: 'task', browseType: 'all', pageID: 2, recPerPage: 5 };
    const response = await request('relation/candidates', params, { client });
    expect(response.data).toEqual(result.objects);
    expect(response.pager).toMatchObject({ page: 2, recPerPage: 5, total: 6 });
    expect(received[0]).toEqual({ path: '/api.php/v2/relations/story/1/candidates/task', query: { browseType: 'all', pageID: '2', recPerPage: '5' } });
    expect(await request('relation/candidates', params, { client, raw: true })).toEqual(result);
  } finally { server.stop(true); }
});

test('deliverable options return a definition map independently of submitted deliverables', async () => {
  const received: Array<{ path: string; query: Record<string, string> }> = [];
  const definitions = { 157: '需求规格说明书', 158: '测试报告' };
  const submitted = [{ id: 8, deliverable: 157 }];
  const server = Bun.serve({ port: 0, fetch(req) {
    const url = new URL(req.url);
    received.push({ path: url.pathname, query: Object.fromEntries(url.searchParams) });
    return Response.json(url.pathname.endsWith('/deliverable-options')
      ? { status: 'success', deliverables: definitions }
      : { status: 'success', deliverables: submitted, pager: { pageID: 1, recPerPage: 20, recTotal: 1 } });
  } });
  try {
    setGlobalOptions({ version: '22.7' });
    const client = new ZentaoClient(server.url.href);
    const options = await request('deliverable/options', { projectID: 2 }, { client });
    expect(options.data).toEqual(definitions);
    expect(options.pager).toBeUndefined();
    const list = await request('deliverable/list', { projectID: 2, browseType: 'reviewing' }, { client });
    expect(list.data).toEqual(submitted);
    expect(list.pager).toMatchObject({ page: 1, total: 1 });
    expect(received[0]).toEqual({ path: '/api.php/v2/projects/2/deliverable-options', query: {} });
    expect(received[1]).toMatchObject({ path: '/api.php/v2/projects/2/deliverables', query: { browseType: 'reviewing' } });
    expect(getModuleAction('deliverable', 'options')).toMatchObject({
      type: 'get', resultType: 'object', resultGetter: 'deliverables',
    });
    expect(getModuleAction('deliverable', 'options')!.pagerGetter).toBeUndefined();
    const filters = getModuleAction('deliverable', 'list')!.params!.find(param => param.name === 'browseType')!;
    expect(filters.defaultValue).toBe('normal');
    expect(filters.options).toEqual(expect.arrayContaining([
      { value: 'normal', label: '已提交' },
      { value: 'wait', label: '未提交' },
      { value: 'mine', label: '我提交' },
      { value: 'pending', label: '待评审' },
      { value: 'reviewing', label: '评审中' },
    ]));
  } finally { server.stop(true); }
});

test('relation unlink deletes by the relation ID returned by the list action', async () => {
  const received: Array<{ method: string; path: string }> = [];
  const relations = [{ relationID: 8, relationKey: '1', relationType: 'custom', relatedObjectID: 3 }];
  const server = Bun.serve({ port: 0, fetch(req) {
    received.push({ method: req.method, path: new URL(req.url).pathname });
    return Response.json(req.method === 'GET' ? { status: 'success', relations } : { status: 'success' });
  } });
  try {
    setGlobalOptions({ version: '22.7' });
    const client = new ZentaoClient(server.url.href);
    const list = await request('relation/list', { objectType: 'story', objectID: 1 }, { client });
    expect(list.data).toEqual(relations);
    const result = await request('relation/unlink', { relationID: list.data![0]!.relationID }, { client });
    expect(result.status).toBe('success');
    expect(received).toEqual([
      { method: 'GET', path: '/api.php/v2/relations/story/1' },
      { method: 'DELETE', path: '/api.php/v2/relations/8' },
    ]);
    expect(Object.keys(getModuleAction('relation', 'unlink')!.pathParams!)).toEqual(['relationID']);
    expect(() => resolveActionRequest(getModule('relation')!, 'unlink', {
      objectType: 'story', objectID: 1, relatedObjectType: 'task', relatedObjectID: 3, relationName: '实现',
    })).toThrow(expect.objectContaining({ code: 'E_MISSING_PARAM', message: 'Missing required parameter: relationID' }));
  } finally { server.stop(true); }
});

test('resource calendars preserve object results and query parameters on a get action', async () => {
  const calendar = { users: { admin: { hours: 8 } }, days: ['2026-10-14'] };
  let query: Record<string, string> = {};
  const server = Bun.serve({ port: 0, fetch(req) {
    query = Object.fromEntries(new URL(req.url).searchParams);
    return Response.json({ status: 'success', resourceCalendars: calendar });
  } });
  try {
    setGlobalOptions({ version: '22.7' });
    const client = new ZentaoClient(server.url.href);
    const response = await request('resourcecalendar/get', { type: 'person', mode: 'done', accounts: 'admin', projectID: 2, depts: '1,2' }, { client });
    expect(response.data).toEqual(calendar);
    expect(query).toEqual({ type: 'person', mode: 'done', accounts: 'admin', projectID: '2', depts: '1,2' });
    expect(getModuleAction('resourcecalendar', 'get')!.pagerGetter).toBeUndefined();
  } finally { server.stop(true); }
});

test('all ten my searches and unfinished todos retain compatibility query parameters', async () => {
  const received: Array<{ path: string; query: Record<string, string> }> = [];
  const server = Bun.serve({ port: 0, fetch(req) {
    const url = new URL(req.url);
    received.push({ path: url.pathname, query: Object.fromEntries(url.searchParams) });
    return Response.json({ status: 'success', [url.pathname.split('/').at(-1)!]: [] });
  } });
  try {
    setGlobalOptions({ version: '22.7' });
    const client = new ZentaoClient(server.url.href);
    await request('my/bugs', {}, { client });
    expect(received[0]).toMatchObject({ query: { browseType: 'assignedTo' } });
    // OpenAPI still requires these inputs in browseType descriptions despite omitting their declarations.
    for (const name of ['bugs', 'epics', 'issues', 'requirements', 'reviewIssues', 'risks', 'stories', 'tasks', 'testcases', 'testtasks']) {
      const browseType = name === 'testtasks' ? 'bySearch' : 'bysearch';
      await request(`my/${name}`, { browseType, param: '12', pageID: 2, recPerPage: 5 }, { client });
      expect(received.at(-1)).toEqual({
        path: `/api.php/v2/my/${name.toLowerCase()}`,
        query: { browseType, param: '12', pageID: '2', recPerPage: '5' },
      });
    }
    await request('my/todos', { browseType: 'undone', status: 'undone' }, { client });
    expect(received.at(-1)).toMatchObject({ path: '/api.php/v2/my/todos', query: { browseType: 'undone', status: 'undone' } });
    expect(getModuleAction('my', 'bugs')!.params!.find(p => p.name === 'browseType')!.options)
      .toContainEqual({ value: 'assignedTo', label: '指派给我' });
  } finally { server.stop(true); }
});

test.each([
  ['process', 'processes', 'processList'],
  ['auditplan', 'auditplans', 'auditplans'],
  ['nc', 'ncs', 'ncs'],
  ['opportunity', 'opportunities', 'opportunities'],
])('%s lists resolve both project and execution scopes', (moduleName, resource, getter) => {
  const module = getModule(moduleName)!;
  expect(resolveActionRequest(module, 'list', { projectID: 2 }).path).toBe(`/projects/2/${resource}`);
  expect(resolveActionRequest(module, 'list', { executionID: 3 }).path).toBe(`/executions/3/${resource}`);
  expect(getModuleAction(moduleName, 'list')!.resultGetter).toBe(getter);
});
