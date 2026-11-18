import { describe, expect, test } from 'bun:test';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import vm from 'node:vm';

describe('browser bundle', () => {
  test('rewrites HTML using Blob resolvers without a DOM or Node and never fetches embedded URLs', async () => {
    const bundle = await Bun.build({ entrypoints: ['src/browser-global.ts'], target: 'browser', format: 'iife', globalName: 'ZentaoAPI' } as any);
    expect(bundle.success).toBe(true);
    const calls: string[] = [];
    const bodies: unknown[] = [];
    const context = vm.createContext({
      window: {}, self: {}, console, setTimeout, clearTimeout, structuredClone, URL, URLSearchParams,
      AbortController, Headers, Response, FormData, Blob, crypto,
      fetch: async (url: string, init?: RequestInit) => {
        calls.push(url);
        const parsed = new URL(url);
        expect(parsed.origin).toBe('https://zentao.example.com');
        if (parsed.searchParams.get('mode') === 'getconfig') {
          return Response.json({ version: '23.0', requestType: 'PATH_INFO', requestFix: '-' });
        }
        bodies.push(init?.body);
        if (parsed.pathname === '/api.php/v2/files') {
          const form = init?.body as FormData;
          expect(form.get('file')).toBeInstanceOf(Blob);
          expect([...form.keys()]).toEqual(['file']);
          expect(parsed.searchParams.get('uid')).toMatch(/^[A-Za-z0-9_-]+$/);
          expect(parsed.searchParams.get('extra')).toBe('editor');
          return Response.json({ status: 'success', data: { id: 41, url: '/zentao/file-read-41.png' } });
        }
        expect(parsed.pathname).toBe('/api.php/v2/articles/7');
        return Response.json({ status: 'success', id: 7 });
      },
    });
    vm.runInContext(await bundle.outputs[0].text(), context);
    const api = (context as any).ZentaoAPI;
    api.defineModules([{ name: 'article', actions: [{
      name: 'update', type: 'update', minVersion: ['23.0'], path: '/articles/{articleID}',
      pathParams: { articleID: 'ID' }, requestBody: { schema: {
        type: 'object', properties: { content: { type: 'string', description: '(HTML)' } },
      } },
    }] }]);
    api.setGlobalOptions({ client: new api.ZentaoClient('https://zentao.example.com'), version: '23.0' });
    const input = '<img src="image-1" alt="screen.png"><img src="https://remote.test/a.png"><script>"<img src=ignored>"</script>';
    const response = await api.request('article/update', { id: 7, content: input }, {
      fileResolver: { 'image-1': { blob: new Blob(['png'], { type: 'image/png' }) } },
    });
    expect(response.status).toBe('success');
    expect(calls).toHaveLength(2);
    expect(JSON.parse(bodies[1] as string)).toEqual({
      uid: new URL(calls[0]).searchParams.get('uid'),
      content: input.replace('src="image-1"', 'src="/zentao/file-read-41.png"'),
    });
    expect((context as any).document).toBeUndefined();
    expect((context as any).process).toBeUndefined();

    const local = await api.request('article/update', { id: 7, content: '<img src="file:///tmp/image.png">' });
    expect(local.fileWarnings[0].code).toBe('E_UPLOAD_PATH_UNSUPPORTED');
    expect(JSON.parse(bodies.at(-1) as string).content).toContain('alt="Local file paths');
    expect(calls).toHaveLength(3);
  });

  test('exposes window.ZentaoAPI with build info and rejects insecure requests in browser runtime', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'zentao-api-browser-'));
    const injectedVersion = '1.2.3-test';
    const injectedBuild = '2026-05-10T01:02:03.000Z';
    const storage = new Map<string, string>();
    let receivedToken: string | undefined;
    let receivedBody: unknown;

    try {
      const result = await Bun.build({
        entrypoints: ['src/browser-global.ts'],
        outdir: dir,
        target: 'browser',
        format: 'iife',
        globalName: 'ZentaoAPI',
        define: {
          __ZENTAO_API_BUILD__: JSON.stringify(injectedBuild),
          __ZENTAO_API_VERSION__: JSON.stringify(injectedVersion),
        },
      } as any);

      expect(result.success).toBe(true);

      const code = readFileSync(join(dir, 'browser-global.js'), 'utf8');
      const context = vm.createContext({
        window: {},
        self: {},
        console,
        setTimeout,
        clearTimeout,
        structuredClone,
        URL,
        URLSearchParams,
        AbortController,
        Headers,
        Response,
        FormData,
        Blob,
        localStorage: {
          getItem: (key: string) => storage.get(key) ?? null,
          setItem: (key: string, value: string) => storage.set(key, value),
          removeItem: (key: string) => storage.delete(key),
          clear: () => storage.clear(),
          key: (index: number) => Array.from(storage.keys())[index] ?? null,
          get length() {
            return storage.size;
          },
        },
        fetch: (_url: string, init?: RequestInit) => {
          if (new URL(_url).searchParams.get('mode') === 'getconfig') {
            expect(new Headers(init?.headers).has('Token')).toBe(false);
            expect(init?.cache).toBe('no-store');
            expect(init?.credentials).toBe('omit');
            return Promise.resolve(Response.json({ version: 'biz13.5' }));
          }
          expect(init?.credentials).toBeUndefined();
          const headers = new Headers(init?.headers);
          receivedToken = headers.get('Token') ?? undefined;
          receivedBody = init?.body;
          return Promise.resolve(Response.json({ status: 'success' }));
        },
      });

      vm.runInContext(code, context);

      const api = (context as any).ZentaoAPI ?? (context as any).window.ZentaoAPI;
      expect((context as any).window.ZentaoAPI.VERSION).toBe(injectedVersion);
      expect((context as any).window.ZentaoAPI.BUILD).toBe(injectedBuild);
      expect(api.VERSION).toBe(injectedVersion);
      expect(api.BUILD).toBe(injectedBuild);
      expect(api.ZentaoClient).toBeFunction();
      const client = new api.ZentaoClient('https://zentao.example.com');

      await expect(client.getZentaoConfig()).resolves.toMatchObject({ version: 'biz13.5' });
      expect(storage.size).toBe(0);
      await expect(client.request('/products', { insecure: true })).rejects.toThrow('insecure');

      await api.addProfile({
        server: 'https://zentao.example.com/',
        account: 'admin',
        token: 'browser-token',
      });
      expect(storage.get(api.ZENTAO_PROFILES_STORAGE_KEY)).toContain('admin@https://zentao.example.com');
      await expect(api.getProfile()).resolves.toEqual(expect.objectContaining({
        key: 'admin@https://zentao.example.com',
        token: 'browser-token',
      }));

      const profileClient = await api.ZentaoClient.fromProfile();
      await profileClient.get('/products');
      expect(receivedToken).toBe('browser-token');

      await api.request('file/create', {
        file: new Blob(['browser upload'], { type: 'text/plain' }),
        objectType: 'story',
        objectID: 1,
      }, { client: profileClient });
      expect(receivedBody).toBeInstanceOf(FormData);
      expect((receivedBody as FormData).get('objectID')).toBe('1');
      expect((receivedBody as FormData).get('file')).toBeInstanceOf(Blob);
      expect(((receivedBody as FormData).get('file') as File).name).toBe('file.txt');

      await expect(api.request('file/create', {
        file: '/tmp/browser-cannot-read.txt',
        objectType: 'story',
        objectID: 1,
      }, { client: profileClient })).rejects.toMatchObject({ code: 'E_UPLOAD_PATH_UNSUPPORTED' });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
