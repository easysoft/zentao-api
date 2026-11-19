import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function readPackageJson(): {
  exports: Record<string, unknown>;
  main: string;
  name: string;
  types: string;
  version: string;
} {
  return JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
}

const packageJson = readPackageJson();
const browserExport = packageJson.exports['./browser'];
const browserGlobalExport = packageJson.exports['./browser/global'];
assert(typeof browserGlobalExport === 'string', 'package.json must define a string ./browser/global export.');

function resolveExportTargets(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
  return Object.values(value).filter((item): item is string => typeof item === 'string');
}

function toPackedPath(file: string): string {
  return file.replace(/^\.\//, '');
}

const browserExportTargets = resolveExportTargets(browserExport);
assert(browserExportTargets.includes('./dist/browser.js'), 'package.json ./browser import target must be dist/browser.js.');
assert(browserExportTargets.includes('./dist/browser.d.ts'), 'package.json ./browser types target must be dist/browser.d.ts.');
const urlExportTargets = resolveExportTargets(packageJson.exports['./url']);
assert(urlExportTargets.includes('./dist/url.d.ts'), 'Package ./url must include its type declarations.');

const requiredFiles = [
  packageJson.main,
  packageJson.types,
  browserGlobalExport,
  ...browserExportTargets,
  ...urlExportTargets,
];

for (const file of requiredFiles) {
  assert(existsSync(join(root, file)), `Missing package artifact: ${file}`);
}

const api = await import(pathToFileURL(join(root, packageJson.main)).href);
assert(typeof api.ZentaoClient === 'function', 'Package main does not export ZentaoClient.');
assert(typeof api.request === 'function', 'Package main does not export request.');
assert(api.VERSION === packageJson.version, 'Package main VERSION does not match package.json.');
assert(
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(api.BUILD),
  'Package main BUILD is not an ISO timestamp.',
);

const client = new api.ZentaoClient('https://zentao.example.com/api.php/v2');
assert(client.baseUrl === 'https://zentao.example.com/api.php/v2', 'Package main client normalizes baseUrl incorrectly.');

const browserApi = await import(pathToFileURL(join(root, 'dist/browser.js')).href);
assert(typeof browserApi.ZentaoClient === 'function', 'Browser module entry does not export ZentaoClient.');
assert(browserApi.VERSION === api.VERSION, 'Browser module VERSION does not match package main.');
assert(browserApi.BUILD === api.BUILD, 'Browser module BUILD does not match package main.');

// Keep this runtime smoke independent of pre-existing dist declarations: a
// clean `bun run check` type-checks scripts before it builds the package.
const browserSubpathApi = await import(`${packageJson.name}/browser`);
assert(typeof browserSubpathApi.ZentaoClient === 'function', 'Package ./browser subpath does not export ZentaoClient.');
assert(browserSubpathApi.VERSION === api.VERSION, 'Package ./browser VERSION does not match package main.');

const packDir = mkdtempSync(join(tmpdir(), 'zentao-api-package-smoke-'));
let packedFiles: Set<string>;
try {
  const archive = join(packDir, 'package.tgz');
  const pack = Bun.spawnSync({
    cmd: ['bun', 'pm', 'pack', '--filename', archive, '--ignore-scripts', '--quiet'],
    cwd: root,
  });
  assert(pack.exitCode === 0, `Bun package creation failed: ${new TextDecoder().decode(pack.stderr)}`);
  const listing = Bun.spawnSync(['tar', '-tzf', archive]);
  assert(listing.exitCode === 0, `Cannot inspect package: ${new TextDecoder().decode(listing.stderr)}`);
  packedFiles = new Set(new TextDecoder().decode(listing.stdout).trim().split('\n')
    .filter(file => !file.endsWith('/')).map(file => file.replace(/^package\//, '')));

  // Self-import the packed subpath outside the repo, with no installed HTML parser or SDK dependencies.
  const unpack = Bun.spawnSync(['tar', '-xzf', archive, '-C', packDir]);
  assert(unpack.exitCode === 0, `Cannot extract package: ${new TextDecoder().decode(unpack.stderr)}`);
  const entry = join(packDir, 'package', 'url-smoke.mjs');
  writeFileSync(entry, [
    "import { extractFileIdFromUrl, parseFileUrl } from 'zentao-api/url';",
    "if (extractFileIdFromUrl('/file-download-42.html') !== 42) throw new Error('Missing download ID');",
    "if (parseFileUrl('/file-read-42.PNG')?.extension !== 'png') throw new Error('Missing image extension');",
  ].join('\n'));
  const run = Bun.spawnSync(['node', entry]);
  assert(run.exitCode === 0, `Standalone URL import failed: ${new TextDecoder().decode(run.stderr)}`);
  const bundle = await Bun.build({ entrypoints: [entry], target: 'browser', format: 'iife' });
  assert(bundle.success, `Standalone URL browser bundle failed: ${bundle.logs.join('\n')}`);
  runInNewContext(await bundle.outputs[0].text(), { URL, URLSearchParams });
} finally {
  rmSync(packDir, { recursive: true, force: true });
}

for (const file of [
  ...requiredFiles.map(toPackedPath),
  'README.md',
  'LICENSE',
]) {
  assert(packedFiles.has(file), `Packed tarball is missing ${file}.`);
}

for (const file of packedFiles) {
  assert(!file.startsWith('src/'), `Packed tarball should not include source file ${file}.`);
  assert(!file.startsWith('tests/'), `Packed tarball should not include test file ${file}.`);
}

console.log('✅ Package smoke test passed.');
