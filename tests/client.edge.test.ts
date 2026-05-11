import { afterEach, describe, expect, test } from 'bun:test';
import { ZentaoClient, ZentaoError, setGlobalOptions } from '../src/index';
import { withInsecureTls } from '../src/misc/environment';

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

describe('ZentaoClient edge cases', () => {
  test('GET requests ignore body and parse empty responses as undefined', async () => {
    let receivedBody = 'not-read';
    const server = createMockServer(async (req) => {
      receivedBody = await req.text();
      return new Response('', { status: 204 });
    });

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });
      const response = await client.request('/products', {
        body: { shouldNotBeSent: true },
      });

      expect(receivedBody).toBe('');
      expect(response).toBeUndefined();
    } finally {
      server.stop();
    }
  });

  test('parses non-JSON successful responses as text', async () => {
    const server = createMockServer(() => new Response('plain text'));

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });

      await expect(client.get('/plain')).resolves.toBe('plain text');
    } finally {
      server.stop();
    }
  });

  test('HTTP errors include response details and response body', async () => {
    const server = createMockServer(() => new Response('missing product', {
      status: 404,
      statusText: 'Not Found',
    }));

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });

      try {
        await client.get('/products/404');
        throw new Error('Expected request to fail');
      } catch (error) {
        expect(error).toBeInstanceOf(ZentaoError);
        expect((error as ZentaoError).code).toBe('E_HTTP_ERROR');
        expect((error as ZentaoError).details).toEqual(expect.objectContaining({
          status: 404,
          statusText: 'Not Found',
          body: 'missing product',
        }));
      }
    } finally {
      server.stop();
    }
  });

  test('request timeout rejects with E_TIMEOUT', async () => {
    const server = createMockServer(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return Response.json({ status: 'success' });
    });

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });

      await expect(client.request('/slow', { timeout: 1 })).rejects.toMatchObject({
        code: 'E_TIMEOUT',
      });
    } finally {
      server.stop();
    }
  });

  test('login rejects when the API does not return a token', async () => {
    const server = createMockServer(() => Response.json({ status: 'fail', message: 'bad account' }));

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });

      await expect(client.login('admin', 'wrong')).rejects.toMatchObject({
        code: 'E_LOGIN_FAILED',
      });
    } finally {
      server.stop();
    }
  });
});

describe('insecure TLS environment handling', () => {
  test('insecure requests do not mutate NODE_TLS_REJECT_UNAUTHORIZED while pending', async () => {
    const previous = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    let valueDuringRequest: string | undefined;
    const server = createMockServer(async () => {
      valueDuringRequest = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      return Response.json({ status: 'success' });
    });

    try {
      delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;

      const client = new ZentaoClient({ baseUrl: server.url.toString() });
      await client.get('/products');
      await client.request('/products', { insecure: true });

      expect(valueDuringRequest).toBeUndefined();
      expect(process.env.NODE_TLS_REJECT_UNAUTHORIZED).toBeUndefined();
    } finally {
      server.stop();
      if (previous === undefined) {
        delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      } else {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = previous;
      }
    }
  });

  test('withInsecureTls leaves existing NODE_TLS_REJECT_UNAUTHORIZED values untouched', async () => {
    const previous = process.env.NODE_TLS_REJECT_UNAUTHORIZED;

    try {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';

      const valueDuringRequest = await withInsecureTls(true, async () => process.env.NODE_TLS_REJECT_UNAUTHORIZED);

      expect(valueDuringRequest).toBe('1');
      expect(process.env.NODE_TLS_REJECT_UNAUTHORIZED).toBe('1');
    } finally {
      if (previous === undefined) {
        delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      } else {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = previous;
      }
    }
  });
});
