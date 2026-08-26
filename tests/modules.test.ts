import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, test } from 'bun:test';
import {
  ZentaoClient,
  defineModuleActions,
  defineModules,
  extendModuleAction,
  getModule,
  getModuleAction,
  getModuleNames,
  getObjectProps,
  request,
  setGlobalOptions,
  type ModuleAction,
  type ModuleDefinition,
} from '../src/index';
import { resetModuleDefinitions } from '../src/modules/registry';

interface ApiActionMapping {
  module?: string;
  name?: string;
  [property: string]: unknown;
}

function createMockServer(handler: (req: Request) => Response | Promise<Response>) {
  return Bun.serve({
    port: 0,
    fetch: handler,
  });
}

function createBlockDocContent(): string {
  return JSON.stringify({
    type: 'page',
    blocks: {
      type: 'block',
      flavour: 'affine:page',
      props: {
        title: {
          '$blocksuite:internal:text$': true,
          delta: [{ insert: 'API document' }],
        },
      },
      children: [{
        type: 'block',
        flavour: 'affine:note',
        children: [{
          type: 'block',
          flavour: 'affine:paragraph',
          props: {
            text: {
              '$blocksuite:internal:text$': true,
              delta: [{ insert: 'Document body' }],
            },
          },
        }],
      }],
    },
  });
}

afterEach(() => {
  resetModuleDefinitions();
  setGlobalOptions({
    client: undefined,
    recPerPage: undefined,
    limit: undefined,
    timeout: undefined,
    insecure: undefined,
    throwOnFail: undefined,
    autoFill: undefined,
  });
});

describe('module registry', () => {
  test('gets generated module and action definitions', () => {
    expect(getModule('product')!.name).toBe('product');
    expect(getModuleAction('product', 'list')!.path).toBe('/products');
  });

  test('applies API mappings to modules, names, and action properties', () => {
    const actionMap = JSON.parse(
      readFileSync(new URL('../scripts/zentao-api-map.json', import.meta.url), 'utf-8'),
    ) as Record<string, ApiActionMapping>;

    for (const [api, mapping] of Object.entries(actionMap)) {
      const separator = api.indexOf(' ');
      const sourceMethod = api.slice(0, separator);
      const sourcePath = api.slice(separator + 1);
      const expectedPath = typeof mapping.path === 'string' ? mapping.path : sourcePath;
      const expectedMethod = typeof mapping.method === 'string' ? mapping.method : sourceMethod;
      const candidates = getModuleNames().flatMap(moduleName =>
        getModule(moduleName)!.actions
          .filter(action => action.path === expectedPath && action.method?.toLowerCase() === expectedMethod.toLowerCase())
          .map(action => ({ moduleName, action })),
      ).filter(candidate => !mapping.module || candidate.moduleName === mapping.module);
      const candidate = candidates.find(({ action }) => !mapping.name || action.name === mapping.name);
      const action = candidate?.action;

      expect(action, api).toBeDefined();
      if (mapping.module) expect(candidate!.moduleName, `${api} module`).toBe(mapping.module);
      if (mapping.name) expect(action!.name, `${api} name`).toBe(mapping.name);
      expect(action!.path, api).toBe(expectedPath);
      expect(action!.method?.toLowerCase(), api).toBe(
        expectedMethod.toLowerCase(),
      );

      const { module: _module, name: _name, ...actionProperties } = mapping;
      for (const [property, value] of Object.entries(actionProperties)) {
        expect((action as unknown as Record<string, unknown>)[property], `${api} ${property}`).toEqual(value);
      }
    }

    const my = getModule('my')!;
    expect(new Set(my.actions.map(action => action.name)).size).toBe(my.actions.length);
    expect(getModuleAction('my', 'todos')!.path).toBe('/my/todos');
    expect(getModuleAction('my', 'tasks')!.path).toBe('/my/tasks');

    const project = getModule('project')!;
    expect(new Set(project.actions.map(action => action.name)).size).toBe(project.actions.length);
    expect(getModuleAction('project', 'team')!.path).toBe('/projects/team');
    expect(getModuleAction('project', 'close')!.path).toBe('/projects/{projectID}/close');
    expect(getModuleAction('project', 'createStory')!.path).toBe('/projects/{projectID}/stories');

    for (const moduleName of ['product', 'project', 'execution']) {
      const close = getModuleAction(moduleName, 'close')!;
      expect(close.type, `${moduleName}/close type`).toBe('action');
      expect(close.resultType, `${moduleName}/close resultType`).toBe('text');
    }

    const getContract = getModuleAction('workflow', 'getContract')!;
    expect(getContract.type).toBe('get');
    expect(getContract.resultType).toBe('object');
    expect(getContract.pagerGetter).toBeUndefined();

    const moduleTreeActions = [
      ['story', '/{scope}/{scopeID}/stories', '/products/{productID}/story/modules', 'productID', '产品ID'],
      ['bug', '/{scope}/{scopeID}/bugs', '/products/{productID}/bug/modules', 'productID', '产品ID'],
      ['testcase', '/{scope}/{scopeID}/testcases', '/products/{productID}/testcase/modules', 'productID', '产品ID'],
      ['task', '/executions/{executionID}/tasks', '/executions/{executionID}/task/modules', 'executionID', '执行ID'],
    ] as const;

    for (const [moduleName, listPath, modulesPath, pathParam, pathParamDescription] of moduleTreeActions) {
      const module = getModule(moduleName)!;
      expect(new Set(module.actions.map(action => action.name)).size, moduleName).toBe(module.actions.length);
      expect(getModuleAction(moduleName, 'list')!.path, `${moduleName}/list`).toBe(listPath);
      const modules = getModuleAction(moduleName, 'modules')!;
      expect(modules.path, `${moduleName}/modules`).toBe(modulesPath);
      expect(modules.pathParams?.[pathParam], `${moduleName}/modules ${pathParam}`).toBe(pathParamDescription);
    }
  });

  test('defines resultGetter for every generated GET action', () => {
    for (const moduleName of getModuleNames()) {
      const module = getModule(moduleName)!;
      for (const action of module.actions) {
        if (action.method?.toLowerCase() !== 'get') continue;
        expect(action.resultGetter, `${moduleName}/${action.name}`).toBeDefined();
        expect(action.resultGetter!.length, `${moduleName}/${action.name}`).toBeGreaterThan(0);
      }
    }
  });

  test('defines pagerGetter only when the list response contains a pager', () => {
    expect(getModuleAction('project', 'programProjects')!.pagerGetter).toBe('pager');
    expect(getModuleAction('project', 'projectMembers')!.pagerGetter).toBeUndefined();
    expect(getModuleAction('execution', 'executionMembers')!.pagerGetter).toBeUndefined();
  });

  test('getObjectProps returns Chinese labels for OpenAPI object modules', () => {
    const objectModules = [
      'user', 'program', 'product', 'project', 'execution', 'productplan',
      'story', 'epic', 'requirement', 'bug', 'testcase', 'task',
      'issue', 'risk', 'meeting', 'feedback', 'ticket', 'system',
      'build', 'testtask', 'release', 'file', 'workflow', 'doc', 'todo', 'my',
    ];
    for (const name of objectModules) {
      const props = getObjectProps(name);
      expect(props, name).toBeDefined();
      expect(Object.keys(props).length, name).toBeGreaterThan(0);
      for (const [field, label] of Object.entries(props)) {
        expect(label.length, `${name}.${field}`).toBeGreaterThan(0);
      }
    }
    expect(getObjectProps('product').projects).toBe('关联项目数');
    expect(getObjectProps('project').teamMembers).toBe('团队成员');
    expect(getObjectProps('execution').projectName).toBe('所属项目');
    expect(getObjectProps('issue').title).toBe('问题名称');
    expect(getObjectProps('issue').objectID).toBe('关联对象');
    expect(getObjectProps('issue').approvedDate).toBe('审批日期');
    expect(getObjectProps('risk').name).toBe('风险名称');
    expect(getObjectProps('meeting').name).toBe('会议名称');
    expect(getObjectProps('doc').title).toBe('文档标题');
    expect(getObjectProps('doc').objects).toBe('所属对象');
    expect(getObjectProps('doc').order).toBe('排序');
    expect(getObjectProps('todo').name).toBe('待办名称');
    expect(getObjectProps('workflow').name).toBe('工作流名');
    expect(getObjectProps('my').todo).toBe('我的待办');
  });

  test('classifies OpenAPI brace-style detail paths as get', () => {
    const action = getModuleAction('product', 'get');
    expect(action).toBeDefined();
    expect(action!.type).toBe('get');
    expect(action!.path).toBe('/products/{productID}');
    expect(action!.pathParams?.productID).toBe('产品ID');
  });

  test('classifies OpenAPI brace-style verb paths as named actions', () => {
    const action = getModuleAction('story', 'activate');
    expect(action).toBeDefined();
    expect(action!.type).toBe('action');
    expect(action!.method).toBe('put');
    expect(action!.path).toBe('/stories/{storyID}/activate');
    expect(action!.pathParams?.storyID).toBe('需求ID');
  });

  test('parses query options whose labels contain nested parentheses', () => {
    const action = getModuleAction('my', 'meetings');
    const browseType = action?.params?.find(param => param.name === 'browseType');

    expect(browseType?.defaultValue).toBe('futureMeeting');
    expect(browseType?.options).toEqual([
      { value: 'futureMeeting', label: '我参加的（未开始）' },
      { value: 'all', label: '全部' },
      { value: 'booked', label: '我预约的' },
      { value: 'participate', label: '我参加的（全部）' },
    ]);
  });

  test('defineModules merges same-name generated modules by default', () => {
    const extension: ModuleDefinition = {
      name: 'product',
      display: 'Custom Product',
      actions: [
        {
          name: 'list',
          type: 'list',
          method: 'GET',
          path: '/custom-products',
          resultType: 'list',
          resultGetter: 'items',
        },
        {
          name: 'archive',
          type: 'action',
          method: 'PUT',
          path: '/products/{productID}/archive',
          pathParams: { productID: 'Product ID' },
          resultType: 'text',
        },
      ],
    };

    defineModules(extension);

    expect(getModule('product')!.display).toBe('Custom Product');
    expect(getModuleAction('product', 'list')!.path).toBe('/custom-products');
    expect(getModuleAction('product', 'create')!.path).toBe('/products');
    expect(getModuleAction('product', 'archive')!.path).toBe('/products/{productID}/archive');
  });

  test('defineModules replaces same-name generated modules when replace is true', () => {
    const replacement: ModuleDefinition = {
      name: 'product',
      display: 'Custom Product',
      actions: [
        {
          name: 'list',
          type: 'list',
          method: 'GET',
          path: '/custom-products',
          resultType: 'list',
          resultGetter: 'items',
        },
      ],
    };

    defineModules(replacement, { replace: true });

    expect(getModule('product')!.display).toBe('Custom Product');
    expect(getModuleAction('product', 'list')!.path).toBe('/custom-products');
    expect(getModuleAction('product', 'create')).toBeUndefined();
  });

  test('defineModuleActions appends new actions and replaces same-name actions', () => {
    const module: ModuleDefinition = {
      name: 'custom',
      actions: [
        {
          name: 'list',
          type: 'list',
          method: 'GET',
          path: '/custom',
          resultType: 'list',
        },
      ],
    };
    const extra: ModuleAction = {
      name: 'archive',
      type: 'action',
      method: 'PUT',
      path: '/custom/{customID}/archive',
      pathParams: { customID: 'Custom ID' },
      resultType: 'text',
    };
    const replacement: ModuleAction = {
      ...extra,
      path: '/custom/{customID}/archive-now',
    };

    defineModules(module);
    defineModuleActions('custom', extra);
    defineModuleActions('custom', replacement);

    expect(getModuleAction('custom', 'archive')!.path).toBe('/custom/{customID}/archive-now');
  });

  test('getModule and getModuleAction return undefined for missing definitions', () => {
    expect(getModule('missing')).toBeUndefined();
    expect(getModuleAction('product', 'missing')).toBeUndefined();
  });

  test('getModule and getModuleAction return frozen registry entries', () => {
    const module = getModule('product')!;
    expect(Object.isFrozen(module)).toBe(true);
    expect(Object.isFrozen(module.actions)).toBe(true);
    expect(() => {
      (module.actions as ModuleAction[]).length = 0;
    }).toThrow(TypeError);

    const action = getModuleAction('product', 'list')!;
    expect(Object.isFrozen(action)).toBe(true);
    expect(() => {
      (action as { path: string }).path = '/mutated-products';
    }).toThrow(TypeError);

    expect(getModuleAction('product', 'list')!.path).toBe('/products');
  });
});

describe('action method / resultType inference', () => {
  test('infers method and resultType from type when omitted', () => {
    const cases: Array<{ type: ModuleAction['type']; method: ModuleAction['method']; resultType: ModuleAction['resultType'] }> = [
      { type: 'list', method: 'get', resultType: 'list' },
      { type: 'get', method: 'get', resultType: 'object' },
      { type: 'create', method: 'post', resultType: 'object' },
      { type: 'update', method: 'put', resultType: 'object' },
      { type: 'delete', method: 'delete', resultType: 'text' },
      { type: 'action', method: 'post', resultType: 'text' },
    ];

    defineModules({
      name: 'inferred',
      actions: cases.map(({ type }) => ({
        name: type,
        type,
        path: `/inferred/${type}`,
      })),
    });

    for (const { type, method, resultType } of cases) {
      const action = getModuleAction('inferred', type)!;
      expect(action.method).toBe(method);
      expect(action.resultType).toBe(resultType);
    }
  });

  test('keeps explicit method / resultType over inferred defaults', () => {
    defineModules({
      name: 'explicit',
      actions: [
        { name: 'remove', type: 'action', method: 'delete', resultType: 'object', path: '/explicit/{id}' },
      ],
    });

    const action = getModuleAction('explicit', 'remove')!;
    expect(action.method).toBe('delete');
    expect(action.resultType).toBe('object');
  });

  test('throws when method cannot be inferred from an unknown type', () => {
    expect(() =>
      defineModules({
        name: 'bad-method',
        actions: [
          { name: 'weird', type: 'mystery' as unknown as ModuleAction['type'], path: '/bad' },
        ],
      }),
    ).toThrow('method');
  });

  test('throws when resultType cannot be inferred from an unknown type', () => {
    expect(() =>
      defineModules({
        name: 'bad-result',
        actions: [
          { name: 'weird', type: 'mystery' as unknown as ModuleAction['type'], method: 'get', path: '/bad' },
        ],
      }),
    ).toThrow('result type');
  });

  test('infers omitted fields through defineModuleActions and extendModuleAction', () => {
    defineModules({
      name: 'infer-extend',
      actions: [{ name: 'list', type: 'list', path: '/infer-extend' }],
    });

    defineModuleActions('infer-extend', { name: 'close', type: 'action', path: '/infer-extend/{id}/close' });
    expect(getModuleAction('infer-extend', 'close')!.method).toBe('post');
    expect(getModuleAction('infer-extend', 'close')!.resultType).toBe('text');

    extendModuleAction('infer-extend', 'list', { display: 'Listed' });
    const list = getModuleAction('infer-extend', 'list')!;
    expect(list.method).toBe('get');
    expect(list.resultType).toBe('list');
  });
});

describe('extendModuleAction', () => {
  test('deep-merges a partial patch and keeps untouched fields', () => {
    const before = getModuleAction('product', 'list')!;

    extendModuleAction('product', 'list', { display: 'Patched list' });

    const after = getModuleAction('product', 'list')!;
    expect(after.display).toBe('Patched list');
    expect(after.path).toBe(before.path);
    expect(after.method).toBe(before.method);
    expect(after.resultType).toBe(before.resultType);
  });

  test('recursively merges nested objects without dropping sibling keys', () => {
    defineModules({
      name: 'custom',
      actions: [
        {
          name: 'create',
          type: 'action',
          method: 'POST',
          path: '/customs',
          resultType: 'text',
          requestBody: {
            required: true,
            schema: {
              name: { type: 'string', description: '名称' },
              owner: { type: 'string', description: '负责人' },
            },
          },
        },
      ],
    });

    extendModuleAction('custom', 'create', {
      requestBody: { schema: { owner: { description: '指派给' } } },
    });

    const action = getModuleAction('custom', 'create')!;
    // 嵌套对象递归合并：owner.description 被改写，owner.type 与 name 字段保留。
    expect(action.requestBody).toEqual({
      required: true,
      schema: {
        name: { type: 'string', description: '名称' },
        owner: { type: 'string', description: '指派给' },
      },
    });
  });

  test('replaces arrays wholesale instead of concatenating', () => {
    defineModules({
      name: 'custom',
      actions: [
        {
          name: 'list',
          type: 'list',
          method: 'GET',
          path: '/customs',
          resultType: 'list',
          params: [{ name: 'status', type: 'string' }],
        },
      ],
    });

    extendModuleAction('custom', 'list', { params: [{ name: 'product', type: 'number' }] });

    expect(getModuleAction('custom', 'list')!.params).toEqual([{ name: 'product', type: 'number' }]);
  });

  test('uses a function return value as the full action without merging', () => {
    const before = getModuleAction('product', 'list')!;

    // 函数返回完整动作定义直接取代原定义，不做合并。
    extendModuleAction('product', 'list', (current) => ({ ...current, display: `${current.display} (extended)` }));

    const after = getModuleAction('product', 'list')!;
    expect(after.display).toBe(`${before.display} (extended)`);
    expect(after.path).toBe(before.path);
    expect(after.method).toBe(before.method);
  });

  test('function return replaces wholesale: fields omitted by the function are dropped', () => {
    defineModules({
      name: 'custom',
      actions: [
        {
          name: 'list',
          type: 'list',
          method: 'GET',
          path: '/customs',
          resultType: 'list',
          params: [{ name: 'status', type: 'string' }],
        },
      ],
    });

    // 返回的动作没有 params，合并不会发生，旧的 params 被整体丢弃。
    extendModuleAction('custom', 'list', (current) => {
      const { params: _drop, ...rest } = current;
      return rest as typeof current;
    });

    expect(getModuleAction('custom', 'list')!.params).toBeUndefined();
  });

  test('does not mutate the previously returned frozen action', () => {
    const before = getModuleAction('product', 'list')!;

    extendModuleAction('product', 'list', { display: 'New display' });

    // 旧引用保持冻结且未被改动，扩展产生的是新对象。
    expect(before.display).not.toBe('New display');
    expect(getModuleAction('product', 'list')).not.toBe(before);
    expect(Object.isFrozen(getModuleAction('product', 'list'))).toBe(true);
  });

  test('throws for unknown module or action', () => {
    expect(() => extendModuleAction('missing', 'list', {})).toThrow('module');
    expect(() => extendModuleAction('product', 'missing', {})).toThrow('action');
  });

  test('throws when the resulting action is no longer valid', () => {
    expect(() =>
      extendModuleAction('product', 'list', { path: undefined as unknown as string }),
    ).not.toThrow();
    // 函数返回完整动作，但 method 非法 → 校验失败。
    expect(() =>
      extendModuleAction('product', 'list', (current) => ({
        ...current,
        method: 123 as unknown as ModuleAction['method'],
      })),
    ).toThrow();
  });

  test('survives a registry reset back to the builtin baseline', () => {
    const original = getModuleAction('product', 'list')!.display;

    extendModuleAction('product', 'list', { display: 'Temporary' });
    expect(getModuleAction('product', 'list')!.display).toBe('Temporary');

    resetModuleDefinitions();
    expect(getModuleAction('product', 'list')!.display).toBe(original);
  });
});

describe('builtin overrides (override.ts)', () => {
  test('execution/create adds products to required fields', () => {
    const required = getModuleAction('execution', 'create')!.requestBody?.schema?.required;
    expect(Array.isArray(required)).toBe(true);
    expect(required).toContain('products');
  });

  test('story/update adds the plan field and changes category to string', () => {
    const properties = getModuleAction('story', 'update')!.requestBody?.schema?.properties as Record<
      string,
      Record<string, unknown>
    >;
    expect(properties.plan).toEqual({ type: 'integer', description: '所属计划', format: 'int32' });
    expect(properties.category).toEqual({ type: 'string', description: '类别' });
  });

  test('task/list keeps the generated execution-scoped contract', () => {
    const action = getModuleAction('task', 'list')!;
    expect(action.path).toBe('/executions/{executionID}/tasks');
    expect(action.pathParams?.executionID).toBe('所属执行ID');
  });

  test.each([
    ['product', 'create'],
    ['product', 'update'],
    ['execution', 'create'],
    ['execution', 'update'],
  ] as const)('%s/%s defaults acl to open', (moduleName, actionName) => {
    const properties = getModuleAction(moduleName, actionName)!.requestBody?.schema?.properties as Record<
      string,
      Record<string, unknown>
    >;
    expect(properties.acl?.defaultValue).toBe('open');
  });

  test('overrides are reapplied after a registry reset', () => {
    extendModuleAction('task', 'list', { path: '/mutated-tasks' });
    expect(getModuleAction('task', 'list')!.path).toBe('/mutated-tasks');

    resetModuleDefinitions();

    // 重置恢复生成注册表，并重新应用仍需保留的内置覆盖。
    expect(getModuleAction('task', 'list')!.path).toBe('/executions/{executionID}/tasks');
  });
});

describe('high-level request', () => {
  test('uses global client and global recPerPage with moduleName/methodName', async () => {
    let receivedUrl = '';
    const server = createMockServer((req) => {
      receivedUrl = req.url;
      return Response.json({
        status: 'success',
        products: [{ id: 1 }, { id: 2 }],
        pager: { recTotal: 2, recPerPage: 50, pageID: 1 },
      });
    });

    try {
      ZentaoClient.init({ baseUrl: server.url.toString(), token: 'tok' });
      setGlobalOptions({ recPerPage: '50' });

      const response = await request('product/list', {});

      expect(new URL(receivedUrl).searchParams.get('recPerPage')).toBe('50');
      expect(response).toEqual({
        status: 'success',
        data: [{ id: 1 }, { id: 2 }],
        pager: { total: 2, page: 1, recPerPage: 50 },
      });
    } finally {
      server.stop();
    }
  });

  test('uses moduleName as the list action shortcut', async () => {
    let receivedUrl = '';
    const server = createMockServer((req) => {
      receivedUrl = req.url;
      return Response.json({
        status: 'success',
        products: [{ id: 1 }],
      });
    });

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });
      setGlobalOptions({ client });

      const response = await request('product', { recPerPage: 20 });

      const url = new URL(receivedUrl);
      expect(url.pathname).toBe('/api.php/v2/products');
      expect(url.searchParams.get('recPerPage')).toBe('20');
      expect(response.data).toEqual([{ id: 1 }]);
    } finally {
      server.stop();
    }
  });

  test('per-call options override globals and limit list response data', async () => {
    let receivedUrl = '';
    const server = createMockServer((req) => {
      receivedUrl = req.url;
      return Response.json({
        status: 'success',
        products: [{ id: 1 }, { id: 2 }, { id: 3 }],
      });
    });

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });
      setGlobalOptions({ client, recPerPage: '20', limit: '3' });

      const response = await request('product/list', {}, { recPerPage: '10', limit: '2' });

      expect(new URL(receivedUrl).searchParams.get('recPerPage')).toBe('10');
      expect(response.data).toEqual([{ id: 1 }, { id: 2 }]);
    } finally {
      server.stop();
    }
  });

  test('applies local filter/search/sort/pick to list data before limit', async () => {
    const server = createMockServer(() =>
      Response.json({
        status: 'success',
        products: [
          { id: 1, name: 'Alpha', pri: 1, status: 'active' },
          { id: 2, name: 'Beta', pri: 3, status: 'closed' },
          { id: 3, name: 'Gamma', pri: 2, status: 'active' },
          { id: 4, name: 'Delta', pri: 4, status: 'active' },
        ],
      }),
    );

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });
      setGlobalOptions({ client });

      const response = await request('product/list', {}, {
        filter: ['status=active'],
        sort: 'pri:desc',
        pick: ['id', 'name'],
        limit: '2',
      });

      // status=active 留下 1/3/4，按 pri 降序为 4/3/1，limit 截断到前 2，pick 仅留 id/name。
      expect(response.data).toEqual([
        { id: 4, name: 'Delta' },
        { id: 3, name: 'Gamma' },
      ]);
    } finally {
      server.stop();
    }
  });

  test('converts list data before applying local processing', async () => {
    const server = createMockServer(() =>
      Response.json({
        status: 'success',
        products: [
          { id: 1, name: 'Alpha', pri: 1 },
          { id: 2, name: 'Beta', pri: 3 },
          { id: 3, name: 'Gamma', pri: 2 },
        ],
      }),
    );

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });
      setGlobalOptions({ client });

      const response = await request('product/list', {}, {
        convert: (records) => records.map((record) => ({
          id: record.id,
          score: Number(record.pri) * 10,
        })),
        filter: ['score>=20'],
        sort: 'score:desc',
        pick: ['id'],
      });

      expect(response.data).toEqual([{ id: 2 }, { id: 3 }]);
    } finally {
      server.stop();
    }
  });

  test('applies convert without other local processing options', async () => {
    const server = createMockServer(() =>
      Response.json({
        status: 'success',
        products: [{ id: 1, name: 'Alpha' }],
      }),
    );

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });
      setGlobalOptions({ client });

      const response = await request('product/list', {}, {
        convert: (records) => records.map((record) => ({
          id: record.id,
          label: String(record.name).toUpperCase(),
        })),
      });

      expect(response.data).toEqual([{ id: 1, label: 'ALPHA' }]);
    } finally {
      server.stop();
    }
  });

  test('applies pick to a single object response', async () => {
    let receivedPathname = '';
    const server = createMockServer((req) => {
      receivedPathname = new URL(req.url).pathname;
      return Response.json({
        status: 'success',
        product: { id: 7, name: 'Solo', desc: 'detail', owner: 'admin' },
      });
    });

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });
      setGlobalOptions({ client });

      const response = await request('product/7', { id: 9 }, { pick: ['id', 'name'] });

      expect(receivedPathname).toBe('/api.php/v2/products/7');
      expect(response.data).toEqual({ id: 7, name: 'Solo' });
    } finally {
      server.stop();
    }
  });

  test('converts a single object before applying pick', async () => {
    const server = createMockServer(() =>
      Response.json({
        status: 'success',
        product: { id: 7, name: 'Solo', desc: '<p>detail</p>' },
      }),
    );

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });
      setGlobalOptions({ client });

      const response = await request('product/7', {}, {
        convertSingle: (record) => ({ ...record, desc: String(record.desc).replace(/<[^>]+>/g, '') }),
        pick: ['id', 'desc'],
      });

      expect(response.data).toEqual({ id: 7, desc: 'detail' });
    } finally {
      server.stop();
    }
  });

  test('converts doc snapshots, keeps the original content, and treats an empty pick as no-op', async () => {
    const rawContent = createBlockDocContent();
    const server = createMockServer(() =>
      Response.json({
        status: 'success',
        doc: {
          id: 7,
          title: 'API document',
          content: rawContent,
          rawContent: '',
          contentType: 'doc',
        },
      }),
    );

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });
      const expected = {
        id: 7,
        title: 'API document',
        content: '# API document\n\nDocument body\n',
        rawContent,
        contentType: 'doc',
      };

      await expect(request('doc/7', {}, { client })).resolves.toEqual({
        status: 'success',
        data: expected,
      });
      await expect(request('doc/7', {}, { client, pick: [] })).resolves.toEqual({
        status: 'success',
        data: expected,
      });
      await expect(request('doc/7', {}, { client, pick: ['rawContent'] })).resolves.toEqual({
        status: 'success',
        data: { rawContent },
      });
    } finally {
      server.stop();
    }
  });

  test('leaves non-snapshot document content and existing raw content unchanged', async () => {
    const server = createMockServer(() =>
      Response.json({
        status: 'success',
        doc: {
          id: 8,
          content: '<p>HTML body</p>',
          rawContent: 'server-raw-content',
          contentType: 'html',
        },
      }),
    );

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });

      await expect(request('doc/8', {}, { client })).resolves.toEqual({
        status: 'success',
        data: {
          id: 8,
          content: '<p>HTML body</p>',
          rawContent: 'server-raw-content',
          contentType: 'html',
        },
      });
    } finally {
      server.stop();
    }
  });

  test('keeps doc failure responses in the normal failure path', async () => {
    const server = createMockServer(() =>
      Response.json({ status: 'fail', message: '文档不存在' }),
    );

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });

      await expect(request('doc/404', {}, { client })).resolves.toEqual({
        status: 'fail',
        message: '文档不存在',
        data: undefined,
        pager: undefined,
        raw: { status: 'fail', message: '文档不存在' },
      });
      await expect(request('doc/404', {}, { client, throwOnFail: true })).rejects.toMatchObject({
        code: 'E_API_FAILED',
      });
    } finally {
      server.stop();
    }
  });

  test('resolves path params and request body from params', async () => {
    const requests: Array<{ method: string; pathname: string; body: unknown }> = [];
    const server = createMockServer(async (req) => {
      requests.push({
        method: req.method,
        pathname: new URL(req.url).pathname,
        body: await req.json(),
      });
      return Response.json({ status: 'success', id: 9 });
    });

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });
      setGlobalOptions({ client });

      const response = await request('product/update', { id: 9, name: '产品', acl: 'open' });

      expect(requests).toEqual([
        {
          method: 'PUT',
          pathname: '/api.php/v2/products/9',
          body: expect.objectContaining({ name: '产品', acl: 'open' }),
        },
      ]);
      expect(response.status).toBe('success');
    } finally {
      server.stop();
    }
  });

  test('returns ZenTao fail responses by default, throws E_API_FAILED when throwOnFail is set', async () => {
    const server = createMockServer(() => Response.json({ status: 'fail', message: '权限不足' }));

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });
      setGlobalOptions({ client });

      const response = await request('product/list', {});
      expect(response.status).toBe('fail');
      expect(response.message).toBe('权限不足');

      await expect(request('product/list', {}, { throwOnFail: true })).rejects.toMatchObject({
        code: 'E_API_FAILED',
      });

      setGlobalOptions({ throwOnFail: true });
      await expect(request('product/list', {})).rejects.toMatchObject({
        code: 'E_API_FAILED',
      });
    } finally {
      server.stop();
    }
  });

  test('rejects malformed request names with E_INVALID_REQUEST_NAME', async () => {
    const client = new ZentaoClient({ baseUrl: 'https://zentao.example.com' });
    setGlobalOptions({ client });

    await expect(request('product/list/extra', {})).rejects.toMatchObject({
      code: 'E_INVALID_REQUEST_NAME',
    });
  });

  test('preserves non-string failure messages and API codes', async () => {
    const server = createMockServer(() => Response.json({
      status: 'fail',
      message: { reason: '权限不足', fields: ['product'] },
      code: 40301,
    }));

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });
      setGlobalOptions({ client });

      const response = await request('product/list', {});
      expect(response.status).toBe('fail');
      expect(response.message).toBe('{"reason":"权限不足","fields":["product"]}');
      expect(response.rawMessage).toEqual({ reason: '权限不足', fields: ['product'] });
      expect(response.apiCode).toBe(40301);
      expect(response.raw).toEqual(expect.objectContaining({ status: 'fail', code: 40301 }));

      await expect(request('product/list', {}, { throwOnFail: true })).rejects.toMatchObject({
        code: 'E_API_FAILED',
        details: expect.objectContaining({
          rawMessage: { reason: '权限不足', fields: ['product'] },
          apiCode: 40301,
        }),
      });
    } finally {
      server.stop();
    }
  });

  test('autoFill fills omitted update fields from the current object before PUT', async () => {
    let getCalled = false;
    let putBody: Record<string, unknown> | undefined;
    const server = createMockServer(async (req) => {
      if (req.method === 'GET') {
        getCalled = true;
        return Response.json({
          status: 'success',
          bug: {
            id: 7,
            title: 'old title',
            severity: 2,
            pri: 1,
            type: 'codeerror',
            openedBuild: ['trunk'],
            steps: 'old steps',
            project: 0,
            execution: 0,
            story: 0,
            // 以下字段不在 update body schema 中，不应被带入 PUT。
            status: 'active',
            resolvedBy: 'admin',
          },
        });
      }
      putBody = (await req.json()) as Record<string, unknown>;
      return Response.json({ status: 'success', data: { id: 7 } });
    });

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });
      setGlobalOptions({ client });

      await request('bug/update', { id: 7, title: 'new title' }, { autoFill: true });

      expect(getCalled).toBe(true);
      // 用户显式传入的 title 保留，其余字段用现值补齐。
      expect(putBody).toEqual({
        title: 'new title',
        severity: 2,
        pri: 1,
        type: 'codeerror',
        openedBuild: ['trunk'],
        steps: 'old steps',
        project: 0,
        execution: 0,
        story: 0,
      });
      // schema 之外的字段不会被填充。
      expect(putBody).not.toHaveProperty('status');
      expect(putBody).not.toHaveProperty('resolvedBy');
    } finally {
      server.stop();
    }
  });

  test('autoFill selects the getter with the same path as the update action', async () => {
    const requests: Array<{ method: string; pathname: string; body?: unknown }> = [];
    const server = createMockServer(async (req) => {
      const request = {
        method: req.method,
        pathname: new URL(req.url).pathname,
        body: req.method === 'PUT' ? await req.json() : undefined,
      };
      requests.push(request);
      if (req.method === 'GET') {
        return Response.json({
          status: 'success',
          doc: {
            id: 7,
            moduleID: 3,
            title: 'old title',
            content: 'old content',
            contentType: 'doc',
          },
        });
      }
      return Response.json({ status: 'success', data: { id: 7 } });
    });

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });
      setGlobalOptions({ client });

      await request(
        'doc/update',
        { docID: 7, title: 'new title', content: 'new content' },
        { autoFill: true },
      );

      expect(requests).toEqual([
        {
          method: 'GET',
          pathname: '/api.php/v2/doc/docs/7',
          body: undefined,
        },
        {
          method: 'PUT',
          pathname: '/api.php/v2/doc/docs/7',
          body: {
            moduleID: 3,
            title: 'new title',
            content: 'new content',
            contentType: 'doc',
          },
        },
      ]);
    } finally {
      server.stop();
    }
  });

  test('autoFill skips updates without a getter for the same path', async () => {
    const requests: Array<{ method: string; pathname: string; body: unknown }> = [];
    const server = createMockServer(async (req) => {
      requests.push({
        method: req.method,
        pathname: new URL(req.url).pathname,
        body: await req.json(),
      });
      return Response.json({ status: 'success', data: { id: 7 } });
    });

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });
      setGlobalOptions({ client });

      await request('bug/updateModule', { moduleID: 7, name: 'new module' }, { autoFill: true });

      expect(requests).toEqual([{
        method: 'PUT',
        pathname: '/api.php/v2/bug/modules/7',
        body: { name: 'new module' },
      }]);
    } finally {
      server.stop();
    }
  });

  test('autoFill aborts update when the prefill GET returns fail', async () => {
    const methods: string[] = [];
    const server = createMockServer(async (req) => {
      methods.push(req.method);
      if (req.method === 'GET') {
        return Response.json({ status: 'fail', message: '无权读取 Bug' });
      }
      await req.text();
      return Response.json({ status: 'success', data: { id: 7 } });
    });

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });
      setGlobalOptions({ client });

      await expect(request('bug/update', { id: 7, title: 'new title' }, { autoFill: true })).rejects.toMatchObject({
        code: 'E_API_FAILED',
        details: expect.objectContaining({
          message: '无权读取 Bug',
        }),
      });
      expect(methods).toEqual(['GET']);
    } finally {
      server.stop();
    }
  });

  test('autoFill is skipped without the option, leaving omitted fields out of PUT', async () => {
    let getCalled = false;
    let putBody: Record<string, unknown> | undefined;
    const server = createMockServer(async (req) => {
      if (req.method === 'GET') {
        getCalled = true;
        return Response.json({ status: 'success', bug: { id: 7, severity: 2 } });
      }
      putBody = (await req.json()) as Record<string, unknown>;
      return Response.json({ status: 'success', data: { id: 7 } });
    });

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });
      setGlobalOptions({ client });

      await request('bug/update', { id: 7, title: 'new title' });

      expect(getCalled).toBe(false);
      expect(putBody).toEqual({ title: 'new title' });
    } finally {
      server.stop();
    }
  });

  test('autoFill can be enabled via global options', async () => {
    let getCalled = false;
    let putBody: Record<string, unknown> | undefined;
    const server = createMockServer(async (req) => {
      if (req.method === 'GET') {
        getCalled = true;
        return Response.json({ status: 'success', bug: { id: 7, title: 'old title', severity: 2 } });
      }
      putBody = (await req.json()) as Record<string, unknown>;
      return Response.json({ status: 'success', data: { id: 7 } });
    });

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });
      setGlobalOptions({ client, autoFill: true });

      await request('bug/update', { id: 7, title: 'new title' });

      expect(getCalled).toBe(true);
      expect(putBody).toMatchObject({ title: 'new title', severity: 2 });
    } finally {
      server.stop();
    }
  });

  test('per-call autoFill:false overrides global autoFill', async () => {
    let getCalled = false;
    let putBody: Record<string, unknown> | undefined;
    const server = createMockServer(async (req) => {
      if (req.method === 'GET') {
        getCalled = true;
        return Response.json({ status: 'success', bug: { id: 7, title: 'old title', severity: 2 } });
      }
      putBody = (await req.json()) as Record<string, unknown>;
      return Response.json({ status: 'success', data: { id: 7 } });
    });

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });
      setGlobalOptions({ client, autoFill: true });

      await request('bug/update', { id: 7, title: 'new title' }, { autoFill: false });

      expect(getCalled).toBe(false);
      expect(putBody).toEqual({ title: 'new title' });
    } finally {
      server.stop();
    }
  });

  test('autoFill keeps user-provided params.data fields over current values', async () => {
    let putBody: Record<string, unknown> | undefined;
    const server = createMockServer(async (req) => {
      if (req.method === 'GET') {
        return Response.json({
          status: 'success',
          bug: { id: 7, title: 'old title', severity: 2, pri: 1 },
        });
      }
      putBody = (await req.json()) as Record<string, unknown>;
      return Response.json({ status: 'success', data: { id: 7 } });
    });

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });
      setGlobalOptions({ client });

      await request('bug/update', { id: 7, data: { severity: 4 } }, { autoFill: true });

      // params.data 中的 severity 优先于现值，未传的 title/pri 用现值补齐。
      expect(putBody).toMatchObject({ title: 'old title', severity: 4, pri: 1 });
    } finally {
      server.stop();
    }
  });
});
