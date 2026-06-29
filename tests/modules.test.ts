import { afterEach, describe, expect, test } from 'bun:test';
import {
  ZentaoClient,
  defineModuleActions,
  defineModules,
  extendModuleAction,
  getModule,
  getModuleAction,
  request,
  setGlobalOptions,
  type ModuleAction,
  type ModuleDefinition,
} from '../src/index';
import { resetModuleDefinitions } from '../src/modules/registry';

function createMockServer(handler: (req: Request) => Response | Promise<Response>) {
  return Bun.serve({
    port: 0,
    fetch: handler,
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
  });
});

describe('module registry', () => {
  test('gets generated module and action definitions', () => {
    expect(getModule('product').name).toBe('product');
    expect(getModuleAction('product', 'list').path).toBe('/products');
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

    expect(getModule('product').display).toBe('Custom Product');
    expect(getModuleAction('product', 'list').path).toBe('/custom-products');
    expect(getModuleAction('product', 'create').path).toBe('/products');
    expect(getModuleAction('product', 'archive').path).toBe('/products/{productID}/archive');
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

    expect(getModule('product').display).toBe('Custom Product');
    expect(getModuleAction('product', 'list').path).toBe('/custom-products');
    expect(() => getModuleAction('product', 'create')).toThrow('action');
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

    expect(getModuleAction('custom', 'archive').path).toBe('/custom/{customID}/archive-now');
  });

  test('getModule and getModuleAction throw for missing definitions', () => {
    expect(() => getModule('missing')).toThrow('module');
    expect(() => getModuleAction('product', 'missing')).toThrow('action');
  });

  test('getModule and getModuleAction return frozen registry entries', () => {
    const module = getModule('product');
    expect(Object.isFrozen(module)).toBe(true);
    expect(Object.isFrozen(module.actions)).toBe(true);
    expect(() => {
      (module.actions as ModuleAction[]).length = 0;
    }).toThrow(TypeError);

    const action = getModuleAction('product', 'list');
    expect(Object.isFrozen(action)).toBe(true);
    expect(() => {
      (action as { path: string }).path = '/mutated-products';
    }).toThrow(TypeError);

    expect(getModuleAction('product', 'list').path).toBe('/products');
  });
});

describe('extendModuleAction', () => {
  test('deep-merges a partial patch and keeps untouched fields', () => {
    const before = getModuleAction('product', 'list');

    extendModuleAction('product', 'list', { display: 'Patched list' });

    const after = getModuleAction('product', 'list');
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

    const action = getModuleAction('custom', 'create');
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

    expect(getModuleAction('custom', 'list').params).toEqual([{ name: 'product', type: 'number' }]);
  });

  test('uses a function return value as the full action without merging', () => {
    const before = getModuleAction('product', 'list');

    // 函数返回完整动作定义直接取代原定义，不做合并。
    extendModuleAction('product', 'list', (current) => ({ ...current, display: `${current.display} (extended)` }));

    const after = getModuleAction('product', 'list');
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

    expect(getModuleAction('custom', 'list').params).toBeUndefined();
  });

  test('does not mutate the previously returned frozen action', () => {
    const before = getModuleAction('product', 'list');

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
    const original = getModuleAction('product', 'list').display;

    extendModuleAction('product', 'list', { display: 'Temporary' });
    expect(getModuleAction('product', 'list').display).toBe('Temporary');

    resetModuleDefinitions();
    expect(getModuleAction('product', 'list').display).toBe(original);
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
});
