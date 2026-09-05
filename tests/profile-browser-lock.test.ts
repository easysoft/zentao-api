import { beforeAll, expect, test } from 'bun:test';
import vm from 'node:vm';

let browserCode: string;
beforeAll(async () => {
  const result = await Bun.build({ entrypoints: ['src/browser-global.ts'], target: 'browser', format: 'iife' });
  expect(result.success).toBe(true);
  browserCode = await result.outputs[0]!.text();
});

test('independent browser contexts coordinate profile writes with the same Web Lock', async () => {
  const storage = new Map<string, string>();
  const names = new Set<string>();
  let held = false;
  let queue: Promise<unknown> = Promise.resolve();
  const locks = {
    request: (name: string, _options: unknown, callback: () => Promise<unknown>) => {
      names.add(name);
      const next = queue.then(async () => {
        expect(held).toBe(false);
        held = true;
        try { return await callback(); } finally { held = false; }
      });
      queue = next.catch(() => undefined);
      return next;
    },
  };
  const createApi = (): typeof import('../src/index') => {
    const context = vm.createContext({ window: {}, URL, structuredClone, AbortController, setTimeout, clearTimeout,
      navigator: { locks }, localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => { expect(held).toBe(true); storage.set(key, value); },
      },
    });
    vm.runInContext(browserCode, context);
    return context.ZentaoAPI;
  };
  const first = createApi();
  const second = createApi();
  await Promise.all(Array.from({ length: 20 }, (_, index) => (index % 2 ? first : second)
    .addProfile({ server: 'https://zentao.example.com', account: `account-${index}`, token: 'test-token' })));
  expect(await first.getAllProfiles()).toHaveLength(20);
  expect(names.size).toBe(1);
  expect(held).toBe(false);
});

test('a failed Web Lock wait is reported without reading or writing storage', async () => {
  const cause = new DOMException('Lock wait aborted', 'AbortError');
  let storageCalls = 0;
  const context = vm.createContext({ window: {}, URL, structuredClone, AbortController, setTimeout, clearTimeout,
    navigator: { locks: { request: () => Promise.reject(cause) } },
    localStorage: {
      getItem: () => { storageCalls++; return null; },
      setItem: () => { storageCalls++; },
    },
  });
  vm.runInContext(browserCode, context);
  const api = context.ZentaoAPI as typeof import('../src/index');
  const error = await api.addProfile({ server: 'https://zentao.example.com', account: 'admin', token: 'test-token' })
    .catch(error => error);
  expect(error).toBeInstanceOf(api.ZentaoError);
  expect(error.code).toBe('E_PROFILE_STORAGE_UNAVAILABLE');
  expect(error.details).toBe(cause);
  expect(storageCalls).toBe(0);
});
