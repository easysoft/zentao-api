import { afterEach, describe, expect, test } from 'bun:test';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { ZentaoClient, ZentaoError, setGlobalOptions } from '../src/index';

function createMockServer(handler: (req: Request) => Response | Promise<Response>) {
  return Bun.serve({
    port: 0,
    fetch: handler,
  });
}

async function listen(server: Server): Promise<string> {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as AddressInfo;
  return `http://127.0.0.1:${address.port}`;
}

async function closeServer(server: Server): Promise<void> {
  server.closeAllConnections();
  await new Promise<void>((resolve) => server.close(() => resolve()));
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

  test('passes through FormData bodies and merges custom headers', async () => {
    let receivedContentType = '';
    let receivedName: FormDataEntryValue | null = null;
    let receivedHeader: string | null = null;
    const server = createMockServer(async (req) => {
      receivedContentType = req.headers.get('Content-Type') ?? '';
      receivedHeader = req.headers.get('X-Zentao-Test');
      const form = await req.formData();
      receivedName = form.get('name');
      return Response.json({ status: 'success' });
    });

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });
      const form = new FormData();
      form.set('name', 'readme.txt');
      form.set('file', new Blob(['hello'], { type: 'text/plain' }), 'readme.txt');

      await client.request('/files', {
        method: 'POST',
        body: form,
        headers: { 'X-Zentao-Test': 'upload' },
      });

      expect(receivedContentType).toContain('multipart/form-data');
      expect(String(receivedName)).toBe('readme.txt');
      expect(String(receivedHeader)).toBe('upload');
    } finally {
      server.stop();
    }
  });

  test('supports urlencoded form bodies and binary response parsing', async () => {
    let receivedBody = '';
    let receivedContentType = '';
    const server = createMockServer(async (req) => {
      receivedBody = await req.text();
      receivedContentType = req.headers.get('Content-Type') ?? '';
      return new Response(new Uint8Array([1, 2, 3]));
    });

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });
      const response = await client.request('/form', {
        method: 'POST',
        bodyType: 'form',
        body: { name: '产品 A', tags: ['api', 'sdk'] },
        responseType: 'arrayBuffer',
      });

      expect(receivedContentType).toContain('application/x-www-form-urlencoded');
      expect(receivedBody).toContain('name=%E4%BA%A7%E5%93%81+A');
      expect(receivedBody).toContain('tags=api');
      expect(receivedBody).toContain('tags=sdk');
      expect(Array.from(new Uint8Array(response))).toEqual([1, 2, 3]);
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

  test('external cancellation rejects with E_ABORTED', async () => {
    const server = createMockServer(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return Response.json({ status: 'success' });
    });

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });
      const controller = new AbortController();
      const request = client.request('/slow', { signal: controller.signal });
      controller.abort();

      await expect(request).rejects.toMatchObject({ code: 'E_ABORTED' });
    } finally {
      server.stop();
    }
  });

  test('external cancellation still controls a raw response body', async () => {
    let streamTimer: ReturnType<typeof setTimeout> | undefined;
    const server = createMockServer(() => new Response(new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('partial'));
        streamTimer = setTimeout(() => {
          controller.enqueue(new TextEncoder().encode(' response'));
          controller.close();
        }, 100);
      },
      cancel() {
        if (streamTimer) clearTimeout(streamTimer);
      },
    })));

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });
      const controller = new AbortController();
      const response = await client.request('/stream', {
        responseType: 'response',
        signal: controller.signal,
        timeout: 1_000,
      });
      const body = response.text();
      controller.abort();

      await expect(body).rejects.toBeDefined();
    } finally {
      if (streamTimer) clearTimeout(streamTimer);
      server.stop(true);
    }
  });

  test('cleans external cancellation forwarding when a raw response body completes', async () => {
    const server = createMockServer(() => new Response('complete', {
      headers: { 'X-Response-Test': 'value' },
    }));

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });
      const controller = new AbortController();
      let removeCalls = 0;
      const removeEventListener = controller.signal.removeEventListener.bind(controller.signal);
      Object.defineProperty(controller.signal, 'removeEventListener', {
        value(...args: Parameters<AbortSignal['removeEventListener']>) {
          removeCalls += 1;
          return removeEventListener(...args);
        },
      });

      const response = await client.request('/stream', {
        responseType: 'response',
        signal: controller.signal,
        timeout: 60_000,
      });
      const responseBody = response.body;
      const clone = response.clone();

      expect(response.body).toBe(responseBody);
      expect(clone.url).toBe(response.url);
      expect(clone.type).toBe(response.type);
      await expect(Promise.all([response.text(), clone.text()]))
        .resolves.toEqual(['complete', 'complete']);
      expect(removeCalls).toBe(1);
    } finally {
      server.stop(true);
    }
  });

  test('keeps raw response cancellation active when a saved body cannot acquire the reader', async () => {
    let streamTimer: ReturnType<typeof setTimeout> | undefined;
    const server = createMockServer(() => new Response(new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('partial'));
        streamTimer = setTimeout(() => controller.close(), 1_000);
      },
      cancel() {
        if (streamTimer) clearTimeout(streamTimer);
      },
    })));

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });
      const controller = new AbortController();
      let removeCalls = 0;
      const removeEventListener = controller.signal.removeEventListener.bind(controller.signal);
      Object.defineProperty(controller.signal, 'removeEventListener', {
        value(...args: Parameters<AbortSignal['removeEventListener']>) {
          removeCalls += 1;
          return removeEventListener(...args);
        },
      });

      const response = await client.request('/stream', {
        responseType: 'response',
        signal: controller.signal,
        timeout: 60_000,
      });
      const savedBody = response.body!;
      const responseBody = response.text();

      expect(savedBody.locked).toBe(true);
      expect(() => savedBody.getReader()).toThrow(TypeError);
      await expect(savedBody.cancel()).rejects.toBeInstanceOf(TypeError);
      expect(removeCalls).toBe(0);
      controller.abort();

      await expect(responseBody).rejects.toBeDefined();
      expect(removeCalls).toBe(1);
    } finally {
      if (streamTimer) clearTimeout(streamTimer);
      server.stop(true);
    }
  });

  test('does not follow redirects with credentials or request bodies', async () => {
    let targetRequests = 0;
    const target = createMockServer(() => {
      targetRequests += 1;
      return Response.json({ status: 'success' });
    });
    const source = createMockServer(() => new Response(null, {
      status: 307,
      headers: { Location: new URL('/target', target.url).toString() },
    }));

    try {
      const client = new ZentaoClient({ baseUrl: source.url.toString(), token: 'secret-token' });

      await expect(client.post('/redirect', { password: 'secret' })).rejects.toMatchObject({
        code: 'E_HTTP_ERROR',
        details: expect.objectContaining({ status: 307 }),
      });
      expect(targetRequests).toBe(0);
    } finally {
      source.stop();
      target.stop();
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

  test('uses identity encoding because the custom transport does not decompress responses', async () => {
    const received: { acceptEncoding: string | null } = { acceptEncoding: null };
    const server = createMockServer((req) => {
      received.acceptEncoding = req.headers.get('Accept-Encoding');
      return Response.json({ status: 'success' });
    });

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });

      await client.request('/products', { insecure: true });

      expect(received.acceptEncoding).toBe('identity');
    } finally {
      server.stop();
    }
  });

  test('rejects ReadableStream bodies on both native and custom transports', async () => {
    let requests = 0;
    const server = createMockServer(() => {
      requests += 1;
      return Response.json({ status: 'success' });
    });

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString() });
      for (const insecure of [undefined, true]) {
        const body = new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('payload'));
            controller.close();
          },
        });

        await expect(client.request('/stream', {
          method: 'POST',
          bodyType: 'raw',
          body,
          insecure,
        })).rejects.toMatchObject({ code: 'E_INVALID_PARAM' });
      }
      expect(requests).toBe(0);
    } finally {
      server.stop();
    }
  });

  test('rejects when a response closes before its declared body is complete', async () => {
    const server = createServer((_request, response) => {
      response.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Length': '100',
      });
      response.write('{"status":"partial');
      setTimeout(() => response.destroy(), 10);
    });
    const baseUrl = await listen(server);

    try {
      const client = new ZentaoClient({ baseUrl });

      await expect(client.request('/partial', {
        insecure: true,
        timeout: 500,
      })).rejects.toMatchObject({ code: 'E_NETWORK_ERROR' });
    } finally {
      await closeServer(server);
    }
  });
});
