import { afterEach, beforeEach, describe, expect, expectTypeOf, test } from 'bun:test';
import {
  ZentaoClient, defineModules, defineModuleActions, extendModuleAction, exportRegistry,
  getModuleAction, request, setGlobalOptions,
  type ModuleAction, type ModuleActionResultObjectType, type ResponseData,
} from '../src/index';
import type { ModuleActionResultObjectType as BrowserResultObjectType } from '../src/browser';
import { resetModuleDefinitions } from '../src/modules/registry';
import { BUILTIN_MODULES } from '../src/modules/generated';

const base = { minVersion: ['22.0'], name: 'get', type: 'get', path: '/fixture' } satisfies ModuleAction;

beforeEach(() => {
  setGlobalOptions({ version: '22.7', client: new ZentaoClient('http://unused.test'), limit: undefined });
});
afterEach(() => {
  resetModuleDefinitions();
  setGlobalOptions({ version: undefined, client: undefined, limit: undefined });
});

function fixture(raw: unknown, patch: Partial<ModuleAction> = {}): void {
  defineModules({ name: 'fixture', actions: [{ ...base, request: async () => raw, ...patch }] });
}

describe('result object type registration', () => {
  test('defaults consistently across registration, replacement, extension and export', () => {
    fixture({ id: 1 });
    expect(getModuleAction('fixture', 'get')!.resultObjectType).toBe('fixture');
    defineModuleActions('FIXTURE', [
      { ...base, name: 'list', type: 'list' },
      { ...base, name: 'close', type: 'action' },
    ]);
    expect(getModuleAction('fixture', 'list')!.resultObjectType).toBe('fixture');
    expect(getModuleAction('fixture', 'close')!.resultObjectType).toBeNull();
    extendModuleAction('fixture', 'get', { resultObjectType: 'external-resource' });
    expect(getModuleAction('fixture', 'get')!.resultObjectType).toBe('external-resource');
    extendModuleAction('fixture', 'get', { resultObjectType: null });
    expect(getModuleAction('fixture', 'get')!.resultObjectType).toBeNull();
    extendModuleAction('fixture', 'get', action => {
      delete action.resultObjectType;
      return action;
    });
    expect(getModuleAction('fixture', 'get')!.resultObjectType).toBe('fixture');
    defineModules({ name: 'fixture', actions: [{ ...base, resultObjectType: 'bug' }] });
    expect(getModuleAction('fixture', 'get')!.resultObjectType).toBe('bug');
    defineModules({ name: 'fixture', actions: [{ ...base }] }, { replace: true });
    expect(exportRegistry().fixture.actions[0].resultObjectType).toBe('fixture');
  });

  test('clones, freezes and JSON-exports rules, including after builtin reset', () => {
    const rule = { param: 'kind', map: { issue: 'risk' } };
    fixture([], { resultObjectType: rule });
    rule.map.issue = 'bug';
    const stored = getModuleAction('fixture', 'get')!.resultObjectType;
    expect(stored).toEqual({ param: 'kind', map: { issue: 'risk' } });
    expect(Object.isFrozen(stored)).toBe(true);
    expect(Object.isFrozen((stored as typeof rule).map)).toBe(true);
    for (const raw of [false, true]) {
      expect(JSON.parse(JSON.stringify(exportRegistry({ raw }))).fixture.actions[0].resultObjectType).toEqual(stored);
    }
    resetModuleDefinitions();
    expect(getModuleAction('my', 'info')!.resultObjectType).toBe('user');
    expect(getModuleAction('product', 'repos')!.resultObjectType).toBe('repo');
    expect(getModuleAction('file', 'read')!.resultObjectType).toBeNull();
  });

  test.each([
    0, false, '', '  ', [], {}, { param: '' }, { param: 1 }, { param: 'kind', map: [] },
    { param: 'kind', map: { a: null } }, { param: 'kind', map: { a: ' ' } },
    { param: 'kind', map: { '': 'bug' } }, { param: 'kind', prefix: 'workflow_' }, () => 'bug',
  ].map(value => [value]))('rejects invalid metadata: %p', value => {
    expect(() => fixture([], { resultObjectType: value as ModuleActionResultObjectType }))
      .toThrow(expect.objectContaining({ code: 'E_INVALID_ACTION_DEFINITION' }));
  });

  test('exports the public type from Node and browser entries', () => {
    expectTypeOf<BrowserResultObjectType>().toEqualTypeOf<ModuleActionResultObjectType>();
    expectTypeOf<ResponseData['resultObjectType']>().toEqualTypeOf<string | undefined>();
  });
});

describe('result object type responses', () => {
  test.each([{ id: 7 }, [], [{ id: 7 }]].map(data => [data]))('annotates object and list results without copying data: %p', async data => {
    fixture({ status: 'success', data });
    const response = await request('fixture/get');
    expect(response.resultObjectType).toBe('fixture');
    expect(response.data).toBe(data);
  });

  test('handles direct arrays and explicit types on text actions', async () => {
    const raw: unknown[] = [];
    fixture(raw, { type: 'list' });
    expect(await request('fixture/get')).toEqual({ status: 'success', data: raw, resultObjectType: 'fixture' });
    expect((await request('fixture/get')).data).toBe(raw);
    fixture({ status: 'success', id: 7 }, { type: 'action', resultObjectType: 'workflowfield' });
    expect((await request('fixture/get')).resultObjectType).toBe('workflowfield');
  });

  test('keeps declared types through local processing without changing record objectType', async () => {
    const rows = [{ id: 1, objectType: 'bug' }, { id: 2, objectType: 'task' }];
    fixture({ data: rows }, { type: 'list', resultObjectType: 'knowledge' });
    const response = await request('fixture/get', {}, {
      convert: records => records.map(row => ({ ...row, label: 'entry' })),
      sort: 'id:desc', limit: '1', pick: ['id', 'objectType'],
    });
    expect(response).toMatchObject({ resultObjectType: 'knowledge', data: [{ id: 2, objectType: 'task' }] });
    expect(rows[0]).toEqual({ id: 1, objectType: 'bug' });
    fixture({ data: { id: 1 } });
    expect(await request('fixture/get', {}, { convertSingle: () => ({ title: 'projected' }), pick: ['title'] }))
      .toMatchObject({ resultObjectType: 'fixture', data: { title: 'projected' } });
  });

  test('resolves final params, aliases and unknown values using own map entries', async () => {
    fixture({ data: [] }, {
      resultObjectType: { param: 'kind', map: { projectdeliverable: 'deliverable' } },
      beforeRequest: async ({ params }) => ({ params: { ...params, kind: params.finalKind } }),
    });
    for (const [value, expected] of [['projectdeliverable', 'deliverable'], ['workflow_custom', 'workflow_custom'], ['constructor', 'constructor']]) {
      expect((await request('fixture/get', { kind: 'bug', finalKind: value })).resultObjectType).toBe(expected);
    }
    for (const value of [undefined, null, '', '  ', 1, {}, []]) {
      expect(await request('fixture/get', { kind: 'bug', finalKind: value })).not.toHaveProperty('resultObjectType');
    }
  });

  test('omits types for untyped, missing, binary, scalar and failure results and preserves raw', async () => {
    for (const data of [undefined, null, 7, 'saved', new ArrayBuffer(8), new Uint8Array(8)]) {
      fixture({ data });
      // A getter is necessary to distinguish missing data from an unwrapped object response.
      extendModuleAction('fixture', 'get', { resultGetter: 'data' });
      const response = await request('fixture/get');
      expect(response).not.toHaveProperty('resultObjectType');
      expect(response.data).toBe(data);
    }
    for (const raw of [{ status: 'success' }, { data: [{ objectType: 'bug' }, { objectType: 'task' }] }]) {
      fixture(raw, { resultObjectType: null });
      expect(await request('fixture/get')).not.toHaveProperty('resultObjectType');
    }
    const raw = { status: 'fail', data: { id: 1 } };
    fixture(raw);
    expect(await request('fixture/get')).not.toHaveProperty('resultObjectType');
    await expect(request('fixture/get', {}, { throwOnFail: true })).rejects.toMatchObject({ code: 'E_API_FAILED' });
    expect(await request('fixture/get', {}, { raw: true })).toBe(raw);
    const success = { data: [] };
    fixture(success);
    expect(await request('fixture/get', {}, { raw: true })).toBe(success);
    expect(success).not.toHaveProperty('resultObjectType');
  });

  test('annotates builtin HTTP results with no additional requests', async () => {
    const paths: string[] = [];
    const server = Bun.serve({ port: 0, fetch(req) {
      const path = new URL(req.url).pathname;
      paths.push(path);
      return Response.json(path.includes('/candidates/') ? { status: 'success', objects: [] }
        : path.endsWith('/bugs/7') ? { status: 'success', bug: { id: 7 } }
        : { status: 'success' });
    } });
    try {
      const client = new ZentaoClient(server.url.href);
      expect((await request('bug/7', {}, { client })).resultObjectType).toBe('bug');
      expect((await request('relation/candidates', {
        objectType: 'story', objectID: 1, relatedObjectType: 'projectdeliverable',
      }, { client })).resultObjectType).toBe('deliverable');
      expect(await request('user/update', { id: 1 }, { client })).not.toHaveProperty('resultObjectType');
      expect(paths).toHaveLength(3);
    } finally { server.stop(true); }
  });

  test('preserves known result getters when OpenAPI omits the response fields', async () => {
    const cases: Array<[`${string}/${string}`, string, string, boolean]> = [
      ['task/get', 'task', 'task', false], ['epic/get', 'epic', 'epic', false],
      ['requirement/get', 'requirement', 'requirement', false],
      ['system/list', 'systems', 'system', true], ['doc/myDocs', 'docs', 'doc', true],
      ['doc/productDocs', 'docs', 'doc', true], ['doc/projectDocs', 'docs', 'doc', true],
    ];
    let raw: Record<string, unknown> = {};
    let calls = 0;
    const server = Bun.serve({ port: 0, fetch() { calls++; return Response.json(raw); } });
    try {
      const client = new ZentaoClient(server.url.href);
      for (const [name, getter, type, list] of cases) {
        for (const data of list ? [[], [{ id: 7 }]] : [{ id: 7 }]) {
          raw = { status: 'success', [getter]: data };
          const response = await request(name, { id: 7, productID: 7, projectID: 7, spaceID: 7, libID: 7 }, { client });
          expect(response, name).toMatchObject({ status: 'success', data, resultObjectType: type });
        }
      }
      expect(calls).toBe(11);
    } finally { server.stop(true); }
  });

  test('types write results omitted from OpenAPI without changing their data shape', async () => {
    const cases: Array<[`${string}/${string}`, string, Record<string, unknown>, Record<string, unknown>]> = [
      ['epic/create', 'epic', { id: 7 }, { productID: 7, title: 'Epic' }],
      ['requirement/create', 'requirement', { id: 7 }, { productID: 7, title: 'Requirement' }],
      ['todo/create', 'todo', { id: 7 }, { date: '2026-11-17', type: 'custom', name: 'Todo' }],
      ['feedback/createBug', 'bug', { id: 7 }, { feedbackID: 7, productID: 7, title: 'Bug', openedBuild: ['trunk'] }],
      ['ticket/createBug', 'bug', { id: 7 }, { ticketID: 7, productID: 7, title: 'Bug', openedBuild: ['trunk'] }],
      ['workflow/create', 'workflow_contract', { recordID: 7, actionID: 8 }, { name: 'Contract' }],
      ['workflow/update', 'workflow_contract', { recordID: 7, actionID: 8 }, { id: 7, name: 'Contract' }],
      ['auditplan/create', 'auditplan', { idList: [7] }, { projectID: 7, process: 1, objectID: 2 }],
      ['auditplan/batchCreate', 'auditplan', { idList: [7] }, { projectID: 7, process: ['1'], objectID: ['2'], checkDate: ['2026-11-17'] }],
      ['opportunity/batchCreate', 'opportunity', { idList: [7] }, { projectID: 7, name: ['Opportunity'] }],
      ['doc/update', 'doc', { doc: { id: 7, title: 'Doc' } }, { id: 7, title: 'Doc', content: '<p>Content</p>' }],
    ];
    let raw: Record<string, unknown> = {};
    const server = Bun.serve({ port: 0, fetch() { return Response.json(raw); } });
    try {
      const client = new ZentaoClient(server.url.href);
      for (const [name, type, result, params] of cases) {
        raw = { status: 'success', ...result };
        expect(await request(name, params, { client }), name).toMatchObject({ data: raw, resultObjectType: type });
      }
      // Scalar IDs have action metadata but remain scalars, without response object metadata.
      raw = { status: 'success', data: 7 };
      expect(getModuleAction('task', 'update')!.resultObjectType).toBe('task');
      const response = await request<number>('task/update', { id: 7 }, { client });
      expect(response.data).toBe(7);
      expect(response).not.toHaveProperty('resultObjectType');
    } finally { server.stop(true); }
  });
});

describe('builtin result object types', () => {
  test.each([
    ['bug', 'list', 'bug'], ['my', 'info', 'user'], ['my', 'activityTasks', 'task'],
    ['my', 'auditPlans', 'auditplan'], ['my', 'reviewIssues', 'reviewissue'],
    ['project', 'createStory', 'story'], ['project', 'createRisk', 'risk'],
    ['feedback', 'createTicket', 'ticket'], ['ticket', 'createStory', 'story'],
    ['project', 'team', 'team'], ['execution', 'executionMembers', 'team'],
    ['product', 'createBugModule', 'module'], ['task', 'modules', 'module'],
    ['doc', 'productSpaces', 'docspace'], ['doc', 'createMyLib', 'doclib'], ['doc', 'myModules', 'module'],
    ['workflow', 'getContract', 'workflow_contract'], ['workflow', 'tables', 'workflow'],
    ['workflow', 'fields', 'workflowfield'], ['workflow', 'setActionJS', 'workflowaction'],
    ['workflow', 'deleteLabel', 'workflowlabel'], ['workflow', 'datasources', 'workflowdatasource'],
    ['workflow', 'getRule', 'workflowrule'], ['story', 'getGrades', 'storygrade'], ['product', 'repos', 'repo'],
    ['relation', 'list', null], ['db', 'query', null], ['db', 'tables', null], ['db', 'table', null],
    ['resourcecalendar', 'get', null], ['deliverable', 'options', null], ['file', 'read', null],
    ['knowledge', 'embeddingsSearch', null], ['knowledge', 'get', 'knowledge'],
    ['user', 'update', null], ['feedback', 'createTodo', null], ['system', 'create', null],
    ['workflow', 'create', 'workflow_contract'], ['workflow', 'update', 'workflow_contract'],
    ['workflow', 'delete', null], ['doc', 'update', 'doc'],
    ['story', 'update', 'story'], ['story', 'change', 'story'], ['story', 'close', 'story'],
    ['epic', 'update', 'epic'], ['epic', 'change', 'epic'], ['epic', 'close', 'epic'],
    ['requirement', 'update', 'requirement'], ['requirement', 'change', 'requirement'], ['requirement', 'close', 'requirement'],
    ['bug', 'update', 'bug'], ['bug', 'activate', 'bug'], ['bug', 'close', 'bug'],
    ['bug', 'confirm', 'bug'], ['bug', 'resolve', 'bug'], ['testcase', 'update', 'testcase'],
  ])('%s/%s returns %p', (moduleName, name, type) => {
    expect(getModuleAction(moduleName!, name!)!.resultObjectType).toBe(type);
  });

  test('generated metadata covers all actions', () => {
    for (const module of BUILTIN_MODULES) {
      for (const action of module.actions) expect(action.resultObjectType).not.toBeUndefined();
    }
  });
});
