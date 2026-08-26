import { afterEach, describe, expect, test } from 'bun:test';
import {
  ERRORS,
  ZentaoClient,
  getGlobalOptions,
  setGlobalOptions,
} from '../src/index';

function createMockServer(handler: (req: Request) => Response | Promise<Response>) {
  return Bun.serve({
    port: 0,
    fetch: handler,
  });
}

afterEach(() => {
  setGlobalOptions({
    client: undefined,
    recPerPage: undefined,
    limit: undefined,
    timeout: undefined,
    insecure: undefined,
  });
});

describe('ZentaoClient', () => {
  test('normalizes site root baseUrl to API v2 base URL', () => {
    const client = new ZentaoClient({ baseUrl: 'https://zentao.example.com/' });

    expect(client.baseUrl).toBe('https://zentao.example.com/api.php/v2');
  });

  test('rejects invalid base URLs early', () => {
    expect(() => new ZentaoClient({ baseUrl: 'zentao.example.com' })).toThrow('Invalid ZenTao baseUrl');
    expect(() => new ZentaoClient({ baseUrl: 'ftp://zentao.example.com' })).toThrow('Invalid ZenTao baseUrl');
    expect(() => new ZentaoClient({ baseUrl: 'https://zentao.example.com?token=bad' })).toThrow('Invalid ZenTao baseUrl');
  });

  test('request defaults to GET and attaches token when present', async () => {
    let receivedMethod = '';
    let receivedToken: string | null = null;
    let receivedContentType: string | null = null;
    let receivedUrl = '';
    const server = createMockServer((req) => {
      receivedMethod = req.method;
      receivedToken = req.headers.get('Token');
      receivedContentType = req.headers.get('Content-Type');
      receivedUrl = req.url;
      return Response.json({ status: 'success', value: 1 });
    });

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString(), token: 'test-token' });
      const response = await client.request('/products', { query: { pageID: 2 } });

      expect(response).toEqual({ status: 'success', value: 1 });
      expect(receivedMethod).toBe('GET');
      expect(receivedToken ?? '').toBe('test-token');
      expect(receivedContentType).toBeNull();
      expect(new URL(receivedUrl).pathname).toBe('/api.php/v2/products');
      expect(new URL(receivedUrl).searchParams.get('pageID')).toBe('2');
    } finally {
      server.stop();
    }
  });

  test('serializes structured query values with deepObject bracket keys', async () => {
    let receivedUrl = '';
    const server = createMockServer((req) => {
      receivedUrl = req.url;
      return Response.json({ status: 'success' });
    });

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });
      await client.request('/bugs', {
        query: {
          filters: [
            { field: 'status', operator: '=', value: 'active' },
            { field: 'title', operator: 'include', value: 'crash' },
          ],
        },
      });

      const search = new URL(receivedUrl).searchParams;
      expect(search.get('filters[0][field]')).toBe('status');
      expect(search.get('filters[0][operator]')).toBe('=');
      expect(search.get('filters[0][value]')).toBe('active');
      expect(search.get('filters[1][field]')).toBe('title');
      expect(search.get('filters[1][operator]')).toBe('include');
      expect(search.get('filters[1][value]')).toBe('crash');
      expect([...search.keys()]).toHaveLength(6);
    } finally {
      server.stop();
    }
  });

  test('does not throw for ZenTao status fail payloads', async () => {
    const server = createMockServer(() => Response.json({ status: 'fail', message: 'bad params' }));

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });
      await expect(client.get('/products')).resolves.toEqual({ status: 'fail', message: 'bad params' });
    } finally {
      server.stop();
    }
  });

  test('login stores token on the instance and returns it', async () => {
    const tokens: Array<string | null> = [];
    const server = createMockServer((req) => {
      if (new URL(req.url).pathname.endsWith('/users/login')) {
        return Response.json({ status: 'success', token: 'login-token' });
      }
      tokens.push(req.headers.get('Token'));
      return Response.json({ status: 'success' });
    });

    try {
      const client = new ZentaoClient(server.url.toString());

      await expect(client.login('admin', 'secret')).resolves.toBe('login-token');
      await client.get('/products');

      expect(tokens).toEqual(['login-token']);
    } finally {
      server.stop();
    }
  });

  test('POST requests send JSON content type when a body is present', async () => {
    let receivedContentType: string | null = null;
    let receivedBody: unknown;
    const server = createMockServer(async (req) => {
      receivedContentType = req.headers.get('Content-Type');
      receivedBody = await req.json();
      return Response.json({ status: 'success' });
    });

    try {
      const client = new ZentaoClient(server.url.toString());

      await client.post('/products', {});

      expect(receivedContentType).not.toBeNull();
      expect(receivedContentType ?? '').toContain('application/json');
      expect(receivedBody).toEqual({});
    } finally {
      server.stop();
    }
  });

  test('init creates and stores global singleton client', () => {
    const client = ZentaoClient.init({ baseUrl: 'https://zentao.example.com', token: 'tok' });

    expect(client).toBeInstanceOf(ZentaoClient);
    expect(getGlobalOptions().client).toBe(client);
  });

  test('exposes transport error messages through ERRORS', () => {
    expect(ERRORS.E_NO_GLOBAL_CLIENT).toContain('client');
    expect(ERRORS.E_HTTP_ERROR).toContain('HTTP');
  });
});
