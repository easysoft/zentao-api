import { afterEach, beforeEach, describe, expect, spyOn, test } from 'bun:test';
import { mkdtempSync, rmSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  ZentaoClient,
  addProfile,
  deleteProfile,
  getAllProfiles,
  getProfile,
  request,
  setGlobalOptions,
  switchProfile,
  type ServerConfig,
} from '../src/index';

function createMockServer(handler: (req: Request) => Response | Promise<Response>) {
  return Bun.serve({
    port: 0,
    fetch: handler,
  });
}

let tempHome = '';
let previousHome: string | undefined;

beforeEach(async () => {
  tempHome = mkdtempSync(join(tmpdir(), 'zentao-api-profiles-'));
  previousHome = process.env.HOME;
  process.env.HOME = tempHome;
  setGlobalOptions({
    client: undefined,
    recPerPage: undefined,
    limit: undefined,
    timeout: undefined,
    insecure: undefined,
    persistProfiles: undefined,
    version: undefined,
    skipVersionCheckOnConfigError: undefined,
  });
});

afterEach(() => {
  setGlobalOptions({
    client: undefined,
    recPerPage: undefined,
    limit: undefined,
    timeout: undefined,
    insecure: undefined,
    persistProfiles: undefined,
    version: undefined,
    skipVersionCheckOnConfigError: undefined,
  });
  if (previousHome === undefined) {
    delete process.env.HOME;
  } else {
    process.env.HOME = previousHome;
  }
  rmSync(tempHome, { recursive: true, force: true });
});

describe('persistent profiles', () => {
  test('stores profiles on disk and uses account@server as profile key', async () => {
    await expect(getAllProfiles()).resolves.toEqual([]);

    const profile = await addProfile({
      server: 'https://zentao.example.com/',
      account: 'admin',
      token: 'token-1',
      user: { id: 1, realname: 'Admin' },
      config: { timeout: 5000 },
    });

    expect(profile.key).toBe('admin@https://zentao.example.com');
    await expect(getAllProfiles()).resolves.toEqual([
      expect.objectContaining({
        key: 'admin@https://zentao.example.com',
        server: 'https://zentao.example.com',
        account: 'admin',
        token: 'token-1',
        user: { id: 1, realname: 'Admin' },
      }),
    ]);
    await expect(getProfile('admin@https://zentao.example.com')).resolves.toEqual(expect.objectContaining({
      token: 'token-1',
    }));

    const stored = JSON.parse(readFileSync(join(tempHome, '.config/zentao/zentao.json'), 'utf8'));
    expect(stored.currentProfile).toBe('admin@https://zentao.example.com');
    expect(stored.profiles).toEqual([
      expect.objectContaining({
        server: 'https://zentao.example.com',
        account: 'admin',
        token: 'token-1',
      }),
    ]);
    expect(stored.profiles[0].key).toBeUndefined();
    expect(statSync(join(tempHome, '.config/zentao')).mode & 0o777).toBe(0o700);
    expect(statSync(join(tempHome, '.config/zentao/zentao.json')).mode & 0o777).toBe(0o600);
  });

  test('switches and deletes the current profile', async () => {
    await addProfile({ server: 'https://one.example.com', account: 'admin', token: 'one' });
    await addProfile({ server: 'https://two.example.com', account: 'dev', token: 'two' });

    await switchProfile('admin@https://one.example.com');

    await expect(getProfile()).resolves.toEqual(expect.objectContaining({
      key: 'admin@https://one.example.com',
      token: 'one',
    }));

    await expect(deleteProfile('admin@https://one.example.com')).resolves.toBe(true);
    await expect(getProfile()).resolves.toEqual(expect.objectContaining({
      key: 'dev@https://two.example.com',
      token: 'two',
    }));
    await expect(deleteProfile('missing@https://two.example.com')).resolves.toBe(false);
  });

  test('creates a client from the current profile', async () => {
    let receivedToken: string | null = null;
    const server = createMockServer((req) => {
      receivedToken = req.headers.get('Token');
      return Response.json({ status: 'success' });
    });

    try {
      await addProfile({
        server: server.url.toString(),
        account: 'admin',
        token: 'saved-token',
        config: { timeout: 1234, insecure: false },
      });

      const client = await ZentaoClient.fromProfile();
      await client.get('/products');

      expect(client.siteUrl).toBe(server.url.toString().replace(/\/$/, ''));
      expect(receivedToken ?? '').toBe('saved-token');
    } finally {
      server.stop();
    }
  });

  test('persists successful logins when enabled in global options', async () => {
    const server = createMockServer((req) => {
      if (new URL(req.url).pathname.endsWith('/users/login')) {
        return Response.json({
          status: 'success',
          token: 'login-token',
          user: { id: 1, account: 'admin', realname: 'Admin' },
        });
      }
      if (new URL(req.url).searchParams.get('mode') === 'getconfig') return Response.json({ version: '22.5' });
      return Response.json({ status: 'success' });
    });

    try {
      setGlobalOptions({ persistProfiles: true });
      const client = new ZentaoClient({ baseUrl: server.url.toString(), timeout: 3210 });

      await client.login('admin', 'secret');

      await expect(getProfile()).resolves.toEqual(expect.objectContaining({
        key: `admin@${server.url.toString().replace(/\/$/, '')}`,
        token: 'login-token',
        user: { id: 1, account: 'admin', realname: 'Admin' },
        config: expect.objectContaining({ timeout: 3210 }),
        serverConfig: { version: '22.5' },
        serverConfigFetchedAt: expect.any(String),
      }));
    } finally {
      server.stop();
    }
  });
});

function savedConfig(version: string): ServerConfig {
  return { version, systemMode: 'ALM', sprintConcept: '0', requestType: 'GET', requestFix: '-',
    moduleVar: 'm', methodVar: 'f', viewVar: 't', sessionVar: 'zentaosid' };
}

describe('profile server configuration cache', () => {
  test.each([
    ['fresh', 1000, 0],
    ['exactly one day', 86_400_000, 0],
    ['older than one day', 86_400_001, 1],
    ['future timestamp', -1000, 1],
    ['missing timestamp', undefined, 1],
    ['invalid timestamp', 'invalid', 1],
  ] as const)('restores profiles with %s', async (_label, age, expectedFetches) => {
    const now = Date.now();
    const clock = spyOn(Date, 'now').mockReturnValue(now);
    const fetchedAt = typeof age === 'number' ? new Date(now - age).toISOString() : age;
    let configs = 0;
    const server = createMockServer(req => {
      if (new URL(req.url).searchParams.has('mode')) {
        configs++;
        return Response.json(savedConfig('biz13.5'));
      }
      return Response.json({ status: 'success', products: [] });
    });
    try {
      setGlobalOptions({ persistProfiles: true });
      await addProfile({ server: server.url.toString(), account: 'admin', token: 'token',
        serverConfig: savedConfig('biz13.0'), serverConfigFetchedAt: fetchedAt });
      const client = await ZentaoClient.fromProfile();
      await request('product/list', {}, { client });
      expect(configs).toBe(expectedFetches);
      expect((await getProfile())!.serverConfig!.version).toBe(expectedFetches ? 'biz13.5' : 'biz13.0');
      if (!expectedFetches) expect((await getProfile())!.serverConfigFetchedAt).toBe(fetchedAt);
    } finally { clock.mockRestore(); server.stop(true); }
  });

  test('missing config refreshes despite a recent timestamp', async () => {
    let configs = 0;
    const server = createMockServer(() => { configs++; return Response.json(savedConfig('22.5')); });
    try {
      await addProfile({ server: server.url.toString(), account: 'admin', token: 'token',
        serverConfigFetchedAt: new Date().toISOString() });
      const client = await ZentaoClient.fromProfile();
      await expect(client.getZentaoConfig()).resolves.toMatchObject({ version: '22.5' });
      expect(configs).toBe(1);
    } finally { server.stop(true); }
  });

  test('updates only the bound profile, respects persistence and does not recreate deleted profiles', async () => {
    let version = 'biz13.5';
    const server = createMockServer(() => Response.json(savedConfig(version)));
    try {
      const first = await addProfile({ server: server.url.toString(), account: 'admin', token: 'first',
        serverConfig: savedConfig('biz13.0'), serverConfigFetchedAt: '2020-01-01T00:00:00.000Z',
        config: { lang: 'zh-cn' }, custom: { keep: true }, user: { id: 1 } });
      const second = await addProfile({ server: server.url.toString(), account: 'dev', token: 'second',
        serverConfig: savedConfig('biz13.0'), serverConfigFetchedAt: '2020-01-02T00:00:00.000Z' });
      const client = await ZentaoClient.fromProfile(first.key);
      await switchProfile(second.key);
      const beforeFirst = (await getProfile(first.key))!;
      const beforeSecond = (await getProfile(second.key))!;
      setGlobalOptions({ persistProfiles: true });
      await Promise.all([client.getZentaoConfig(), client.getZentaoConfig()]);
      expect(await getProfile()).toEqual(beforeSecond);
      expect(await getProfile(first.key)).toEqual({ ...beforeFirst,
        serverConfig: savedConfig('biz13.5'), serverConfigFetchedAt: expect.any(String) });
      const refreshed = await getProfile(first.key);
      setGlobalOptions({ persistProfiles: false });
      version = 'biz13.6';
      expect((await client.getZentaoConfig({ forceRefresh: true })).version).toBe('biz13.6');
      expect(await getProfile(first.key)).toEqual(refreshed);
      setGlobalOptions({ persistProfiles: true });
      await deleteProfile(first.key);
      await client.getZentaoConfig({ forceRefresh: true });
      expect(await getProfile(first.key)).toBeUndefined();
      expect(await getProfile()).toEqual(beforeSecond);
    } finally { server.stop(true); }
  });

  test('leaves an expired timestamp unchanged on discovery failure and retries successfully', async () => {
    let unavailable = true;
    let configs = 0;
    const server = createMockServer(req => {
      if (new URL(req.url).searchParams.has('mode')) {
        configs++;
        return unavailable ? new Response('Unavailable', { status: 503 }) : Response.json(savedConfig('22.5'));
      }
      return Response.json({ status: 'success', products: [] });
    });
    try {
      setGlobalOptions({ persistProfiles: true });
      const profile = await addProfile({ server: server.url.toString(), account: 'admin', token: 'token',
        serverConfig: savedConfig('22.0'), serverConfigFetchedAt: '2020-01-01T00:00:00.000Z' });
      const client = await ZentaoClient.fromProfile();
      await request('product/list', {}, { client, skipVersionCheckOnConfigError: true });
      expect((await getProfile())!.serverConfigFetchedAt).toBe(profile.serverConfigFetchedAt);
      unavailable = false;
      await request('product/list', {}, { client });
      expect(configs).toBe(2);
      expect((await getProfile())!.serverConfig!.version).toBe('22.5');
    } finally { server.stop(true); }
  });

  test('does not swallow profile storage errors when discovery failures may be skipped', async () => {
    let businessCalls = 0;
    const server = createMockServer(req => {
      if (!new URL(req.url).searchParams.has('mode')) businessCalls++;
      return Response.json(savedConfig('22.5'));
    });
    try {
      setGlobalOptions({ persistProfiles: true, skipVersionCheckOnConfigError: true });
      await addProfile({ server: server.url.toString(), account: 'admin', token: 'token' });
      const client = await ZentaoClient.fromProfile();
      writeFileSync(join(tempHome, '.config/zentao/zentao.json'), '{invalid');
      await expect(request('product/list', {}, { client })).rejects.toMatchObject({ code: 'E_PROFILE_STORAGE_INVALID' });
      expect(businessCalls).toBe(0);
    } finally { server.stop(true); }
  });

  test('does not save failed logins or update a previously bound account during another login', async () => {
    let unavailable = true;
    const server = createMockServer(req => {
      if (new URL(req.url).pathname.endsWith('/users/login')) return Response.json({ status: 'success', token: 'new-token' });
      return unavailable ? new Response('Unavailable', { status: 503 }) : Response.json(savedConfig('max8.5'));
    });
    try {
      setGlobalOptions({ persistProfiles: true, version: '22.5' });
      const first = await addProfile({ server: server.url.toString(), account: 'first', token: 'old-token',
        serverConfig: savedConfig('max8.0'), serverConfigFetchedAt: '2020-01-01T00:00:00.000Z' });
      const client = await ZentaoClient.fromProfile(first.key);
      const before = await getProfile(first.key);
      await expect(client.login('second', 'password')).rejects.toMatchObject({ code: 'E_HTTP_ERROR' });
      expect(await getAllProfiles()).toHaveLength(1);
      expect(await getProfile(first.key)).toEqual(before);
      unavailable = false;
      await client.login('second', 'password');
      expect(await getProfile(first.key)).toEqual(before);
      expect(await getProfile()).toMatchObject({ account: 'second', token: 'new-token',
        serverConfig: savedConfig('max8.5'), serverConfigFetchedAt: expect.any(String) });
    } finally { server.stop(true); }
  });
});
