import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function readPackageJson(): {
  exports: Record<string, unknown>;
  main: string;
  types: string;
  version: string;
} {
  return JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
}

const packageJson = readPackageJson();
const browserExport = packageJson.exports['./browser'];
assert(typeof browserExport === 'string', 'package.json must define a string ./browser export.');

function toPackedPath(file: string): string {
  return file.replace(/^\.\//, '');
}

const requiredFiles = [
  packageJson.main,
  packageJson.types,
  browserExport,
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

const packOutput = execFileSync('npm', ['pack', '--dry-run', '--json'], {
  cwd: root,
  encoding: 'utf8',
});
const [pack] = JSON.parse(packOutput) as Array<{ files: Array<{ path: string }> }>;
const packedFiles = new Set(pack.files.map((file) => file.path));

for (const file of [
  toPackedPath(packageJson.main),
  toPackedPath(packageJson.types),
  toPackedPath(browserExport),
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
