import { beforeAll, describe, expect, test } from 'bun:test';
import vm from 'node:vm';

let browserCode: string;

beforeAll(async () => {
  const result = await Bun.build({
    entrypoints: ['src/browser-global.ts'],
    target: 'browser',
    format: 'iife',
  });
  expect(result.success).toBe(true);
  browserCode = await result.outputs[0]!.text();
});

function createApi(localStorage: PropertyDescriptor): typeof import('../src/index.js') {
  const context = vm.createContext({ window: {}, URL, structuredClone });
  Object.defineProperty(context, 'localStorage', localStorage);
  vm.runInContext(browserCode, context);
  return context.ZentaoAPI;
}

describe('browser profile storage errors', () => {
  test('restores clients from read-only storage when activation is disabled', async () => {
    const key = 'admin@https://zentao.example.com';
    let writes = 0;
    const api = createApi({ value: {
      getItem: () => JSON.stringify({ currentProfile: key, profiles: [
        { server: 'https://zentao.example.com', account: 'admin', token: 'token' },
      ] }),
      setItem: () => { writes++; throw new DOMException('Read-only storage', 'QuotaExceededError'); },
    } });
    const client = await api.ZentaoClient.fromProfile(undefined, { activate: false });
    expect(client.siteUrl).toBe('https://zentao.example.com');
    expect(writes).toBe(0);
    await expect(api.ZentaoClient.fromProfile()).rejects.toMatchObject({ code: 'E_PROFILE_STORAGE_UNAVAILABLE' });
    const empty = createApi({ value: { getItem: () => null } });
    await expect(empty.ZentaoClient.fromProfile(undefined, { activate: false })).rejects.toMatchObject({ code: 'E_NO_PROFILE' });
  });

  test('distinguishes missing storage from a malformed empty value', async () => {
    const missing = createApi({ value: { getItem: () => null } });
    await expect(missing.getAllProfiles()).resolves.toEqual([]);
    const empty = createApi({ value: { getItem: () => '' } });
    await expect(empty.getAllProfiles()).rejects.toMatchObject({ code: 'E_PROFILE_STORAGE_INVALID' });
  });

  test('wraps getItem SecurityError and retains the original error', async () => {
    const cause = new DOMException('Storage access denied', 'SecurityError');
    const api = createApi({
      value: { getItem: () => { throw cause; } },
    });

    const error = await api.getAllProfiles().catch(error => error);
    expect(error).toBeInstanceOf(api.ZentaoError);
    expect(error.code).toBe('E_PROFILE_STORAGE_UNAVAILABLE');
    expect(error.details).toBe(cause);
  });

  test('wraps localStorage getter errors and retains the original error', async () => {
    const cause = new DOMException('Storage access denied', 'SecurityError');
    const api = createApi({ get: () => { throw cause; } });

    const error = await api.getAllProfiles().catch(error => error);
    expect(error).toBeInstanceOf(api.ZentaoError);
    expect(error.code).toBe('E_PROFILE_STORAGE_UNAVAILABLE');
    expect(error.details).toBe(cause);
  });

  test('wraps quota errors and allows queued writes to continue after failure', async () => {
    const cause = new DOMException('Storage quota exceeded', 'QuotaExceededError');
    const storage = new Map<string, string>();
    let failNextWrite = true;
    const api = createApi({
      value: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          if (failNextWrite) {
            failNextWrite = false;
            throw cause;
          }
          storage.set(key, value);
        },
      },
    });
    const profile = { server: 'https://zentao.example.com', account: 'admin', token: 'token' };
    const failedWrite = api.addProfile(profile).catch(error => error);
    const nextWrite = api.addProfile({ ...profile, account: 'other' });

    const error = await failedWrite;
    expect(error).toBeInstanceOf(api.ZentaoError);
    expect(error.code).toBe('E_PROFILE_STORAGE_UNAVAILABLE');
    expect(error.details).toBe(cause);
    await expect(nextWrite).resolves.toMatchObject({ account: 'other' });
    expect((await api.getAllProfiles()).map(item => item.account)).toEqual(['other']);
  });
});
