import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const entryBaseName = 'zentao-api-browser-smoke-entry';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function buildOrThrow(options: Parameters<typeof Bun.build>[0]): Promise<void> {
  const result = await Bun.build(options);
  if (!result.success) {
    for (const log of result.logs) console.error(log);
    throw new Error('Browser bundler smoke build failed.');
  }
}

const dir = mkdtempSync(join(tmpdir(), 'zentao-api-browser-smoke-'));
const packageEntry = join(root, `${entryBaseName}.ts`);

try {
  writeFileSync(packageEntry, [
    "export { ZentaoClient, VERSION, BUILD, request } from 'zentao-api/browser';",
    "export type { ClientRequestOptions, ResponseData } from 'zentao-api/browser';",
  ].join('\n'));

  await buildOrThrow({
    entrypoints: [packageEntry],
    outdir: join(dir, 'esm'),
    target: 'browser',
    format: 'esm',
    minify: false,
  });

  const esmBundle = readFileSync(join(dir, 'esm', `${entryBaseName}.js`), 'utf8');
  assert(!/\bfrom\s+['"]node:/.test(esmBundle), 'Browser ESM bundle contains a static node: import.');
  assert(!/\brequire\(\s*['"]node:/.test(esmBundle), 'Browser ESM bundle contains a static node: require.');
  assert(esmBundle.includes('ZentaoClient'), 'Browser ESM bundle does not include SDK exports.');

  await buildOrThrow({
    entrypoints: ['src/browser-global.ts'],
    outdir: join(dir, 'global'),
    target: 'browser',
    format: 'iife',
    globalName: 'ZentaoAPI',
    define: {
      __ZENTAO_API_BUILD__: JSON.stringify('2026-01-01T00:00:00.000Z'),
      __ZENTAO_API_VERSION__: JSON.stringify('0.0.0-smoke'),
    },
  } as Parameters<typeof Bun.build>[0]);

  let receivedBody: unknown;
  let receivedToken: string | undefined;
  const code = readFileSync(join(dir, 'global', 'browser-global.js'), 'utf8');
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
    fetch: (_url: string, init?: RequestInit) => {
      if (new URL(_url).searchParams.get('mode') === 'getconfig') {
        assert(!new Headers(init?.headers).has('Token'), 'Configuration request must not attach Token.');
        assert(init?.cache === 'no-store', 'Configuration request must bypass the HTTP cache.');
        return Promise.resolve(Response.json({ version: '22.5' }));
      }
      const headers = new Headers(init?.headers);
      receivedToken = headers.get('Token') ?? undefined;
      receivedBody = init?.body;
      return Promise.resolve(Response.json({ status: 'success' }));
    },
  });

  vm.runInContext(code, context);
  const api = (context as { ZentaoAPI?: typeof import('../src/index') }).ZentaoAPI;
  assert(api?.VERSION === '0.0.0-smoke', 'Browser global VERSION was not injected.');

  const client = new api.ZentaoClient({
    baseUrl: 'https://zentao.example.com',
    token: 'browser-token',
  });
  await api.request('file/create', {
    file: {
      data: new Blob(['hello'], { type: 'text/plain' }),
      filename: 'hello.txt',
    },
    objectType: 'story',
    objectID: 1,
  }, { client });

  assert(receivedBody instanceof FormData, 'Browser global high-level request did not build FormData.');
  assert(receivedToken === 'browser-token', 'Browser global request did not attach Token.');
} finally {
  rmSync(packageEntry, { force: true });
  rmSync(dir, { recursive: true, force: true });
}

console.log('✅ Browser bundler smoke test passed.');
