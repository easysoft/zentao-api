import { afterEach, describe, expect, test } from 'bun:test';
import {
  ZentaoClient,
  defineModuleActions,
  defineModules,
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

  test('getModule and getModuleAction do not expose mutable registry internals', () => {
    const module = getModule('product');
    module.actions.length = 0;

    expect(getModuleAction('product', 'list').path).toBe('/products');

    const action = getModuleAction('product', 'list');
    action.path = '/mutated-products';

    expect(getModuleAction('product', 'list').path).toBe('/products');
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
});
