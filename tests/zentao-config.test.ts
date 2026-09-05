import { afterEach, describe, expect, test } from 'bun:test';
import { ZentaoClient, request, setGlobalOptions } from '../src/index';

afterEach(() => {
  setGlobalOptions({ version: undefined, client: undefined, timeout: undefined, insecure: undefined,
    persistProfiles: undefined, skipVersionCheckOnConfigError: undefined });
});

describe('getZentaoConfig', () => {
  test('uses the site subdirectory, sends no Token, caches copies and deduplicates refreshes', async () => {
    const urls: string[] = [];
    const server = Bun.serve({ port: 0, async fetch(req) {
      urls.push(req.url);
      expect(req.method).toBe('GET');
      expect(req.headers.has('Token')).toBe(false);
      await Bun.sleep(5);
      return Response.json({ version: 'biz13.5', extra: { retained: true } });
    } });
    try {
      const client = new ZentaoClient({ baseUrl: `${server.url}zentao/api.php/v2`, token: 'secret' });
      const configs = await Promise.all(Array.from({ length: 6 }, () => client.getZentaoConfig()));
      expect(urls).toEqual([`${server.url}zentao/?mode=getconfig`]);
      configs[0].version = 'biz99';
      expect(configs[1].version).toBe('biz13.5');
      expect(await client.getZentaoConfig()).toMatchObject({ version: 'biz13.5', extra: { retained: true } });
      await Promise.all(Array.from({ length: 4 }, () => client.getZentaoConfig({ forceRefresh: true })));
      expect(urls).toHaveLength(2);
    } finally { server.stop(true); }
  });

  test('propagates timeout and abort, permits cancelling a waiter, and clears failed refreshes', async () => {
    const server = Bun.serve({ port: 0, async fetch() {
      await Bun.sleep(40);
      return Response.json({ version: '22.5' });
    } });
    try {
      const client = new ZentaoClient(server.url.toString());
      await expect(client.getZentaoConfig({ timeout: 5 })).rejects.toMatchObject({ code: 'E_TIMEOUT' });
      const controller = new AbortController();
      const pending = client.getZentaoConfig({ timeout: 1000, signal: controller.signal });
      controller.abort();
      await expect(pending).rejects.toMatchObject({ code: 'E_ABORTED' });
      const successful = client.getZentaoConfig({ timeout: 1000 });
      const waiterController = new AbortController();
      const waiter = client.getZentaoConfig({ signal: waiterController.signal });
      waiterController.abort();
      await expect(waiter).rejects.toMatchObject({ code: 'E_ABORTED' });
      await expect(successful).resolves.toMatchObject({ version: '22.5' });
      await expect(client.getZentaoConfig({ signal: waiterController.signal })).rejects.toMatchObject({ code: 'E_ABORTED' });
    } finally { server.stop(true); }
  });

  test('forces config discovery on login despite a global version or fresh cache', async () => {
    let configs = 0;
    let fail = false;
    const receivedTokens: Array<string | null> = [];
    const server = Bun.serve({ port: 0, fetch(req) {
      const url = new URL(req.url);
      if (url.searchParams.has('mode')) {
        configs++;
        expect(req.headers.has('Token')).toBe(false);
        return fail ? new Response('Unavailable', { status: 503 }) : Response.json({ version: 'max8.5' });
      }
      if (url.pathname.endsWith('/users/login')) return Response.json({ status: 'success', token: 'new-token' });
      receivedTokens.push(req.headers.get('Token'));
      return Response.json({ status: 'success' });
    } });
    try {
      setGlobalOptions({ version: '22.5' });
      const client = new ZentaoClient({ baseUrl: server.url.toString(), token: 'original-token' });
      await client.getZentaoConfig();
      fail = true;
      await expect(client.login('admin', 'password')).rejects.toMatchObject({ code: 'E_HTTP_ERROR' });
      await client.get('/products');
      expect(receivedTokens).toEqual(['original-token']);
      setGlobalOptions({ skipVersionCheckOnConfigError: true });
      await client.login('admin', 'password');
      await client.get('/products');
      expect(receivedTokens).toEqual(['original-token', 'new-token']);
      fail = false;
      await client.login('admin', 'password');
      expect(configs).toBe(4);
      setGlobalOptions({ version: undefined });
      await request('story/getGrades', {}, { client });
      expect(configs).toBe(4);
    } finally { server.stop(true); }
  });

  test('rejects malformed config and version formats even with the global skip flag', async () => {
    let response: unknown = { version: '22.5-beta1' };
    const server = Bun.serve({ port: 0, fetch: () => Response.json(response) });
    try {
      setGlobalOptions({ skipVersionCheckOnConfigError: true });
      const client = new ZentaoClient(server.url.toString());
      await expect(client.getZentaoConfig()).rejects.toMatchObject({ code: 'E_INVALID_ZENTAO_VERSION' });
      for (response of [null, [], {}, { version: '' }, { version: 22 }]) {
        await expect(client.getZentaoConfig()).rejects.toMatchObject({ code: 'E_INVALID_ZENTAO_CONFIG' });
      }
    } finally { server.stop(true); }
  });
});
