#!/usr/bin/env bun

import { existsSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
type JsonObject = { [key: string]: JsonValue };

interface OperationEntry {
  key: string;
  summary?: string;
  operation: JsonObject;
}

interface ChangedOperation {
  operation: string;
  summary?: string;
  roots: string[];
}

interface ComponentChanges {
  addedSchemas: string[];
  removedSchemas: string[];
  changedSchemas: string[];
  exampleOnlySchemas: string[];
  otherRootsChanged: string[];
  otherExampleOnlyRoots: string[];
}

interface Report {
  base: string;
  spec: string;
  baselineOperations: number;
  currentOperations: number;
  added: ChangedOperation[];
  removed: ChangedOperation[];
  contractOrMetadataChanged: ChangedOperation[];
  exampleOnlyChanged: ChangedOperation[];
  components: ComponentChanges;
}

const HTTP_METHODS = new Set(['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace']);

function usage(): never {
  console.log(`Usage: bun run report-openapi-changes.ts [options]

Options:
  --base <git-ref>   Compare the working spec with this Git ref (default: HEAD)
  --spec <path>      Repository-relative OpenAPI file (default: data/zentao-openapi.json)
  --json             Print JSON instead of Markdown
  --help             Show this help`);
  process.exit(0);
}

function fail(message: string): never {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function parseArgs(args: string[]): { base: string; spec: string; json: boolean } {
  let base = 'HEAD';
  let spec = 'data/zentao-openapi.json';
  let json = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--help') usage();
    if (arg === '--json') {
      json = true;
      continue;
    }
    if (arg === '--base' || arg === '--spec') {
      const value = args[index + 1];
      if (!value || value.startsWith('--')) fail(`${arg} requires a value`);
      if (arg === '--base') base = value;
      if (arg === '--spec') spec = value;
      index += 1;
      continue;
    }
    fail(`unknown argument: ${arg}`);
  }

  return { base, spec, json };
}

function runGit(args: string[], cwd: string): string {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error) fail(result.error.message);
  if (result.status !== 0) {
    const detail = result.stderr.trim() || result.stdout.trim() || `git exited with ${result.status}`;
    fail(detail);
  }
  return result.stdout;
}

function parseJson(source: string, label: string): JsonObject {
  try {
    const parsed: unknown = JSON.parse(source);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      fail(`${label} must contain a JSON object`);
    }
    return parsed as JsonObject;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    fail(`cannot parse ${label}: ${detail}`);
  }
}

function collectOperations(document: JsonObject): Map<string, OperationEntry> {
  const result = new Map<string, OperationEntry>();
  const paths = document.paths;
  if (!paths || typeof paths !== 'object' || Array.isArray(paths)) fail('OpenAPI document has no paths object');

  for (const [path, pathItem] of Object.entries(paths)) {
    if (!pathItem || typeof pathItem !== 'object' || Array.isArray(pathItem)) continue;
    for (const [method, value] of Object.entries(pathItem)) {
      const normalizedMethod = method.toLowerCase();
      if (!HTTP_METHODS.has(normalizedMethod) || !value || typeof value !== 'object' || Array.isArray(value)) continue;
      const operation = value as JsonObject;
      const key = `${normalizedMethod.toUpperCase()} ${path}`;
      result.set(key, {
        key,
        summary: typeof operation.summary === 'string' ? operation.summary : undefined,
        operation,
      });
    }
  }

  return result;
}

function normalize(value: JsonValue, stripExamples = false, containerKey?: string): JsonValue {
  if (Array.isArray(value)) return value.map(item => normalize(item, stripExamples, containerKey));
  if (!value || typeof value !== 'object') return value;

  const entries = Object.entries(value)
    .filter(([key]) => !stripExamples || containerKey === 'properties' || (key !== 'example' && key !== 'examples'))
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, child]) => [key, normalize(child, stripExamples, key)] as const);
  return Object.fromEntries(entries);
}

function same(left: JsonValue | undefined, right: JsonValue | undefined, stripExamples = false): boolean {
  return JSON.stringify(normalize(left ?? null, stripExamples)) === JSON.stringify(normalize(right ?? null, stripExamples));
}

function changedRoots(left: JsonObject, right: JsonObject, stripExamples = false): string[] {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  return [...keys]
    .filter(key => !same(left[key], right[key], stripExamples))
    .sort();
}

function describe(entry: OperationEntry, roots: string[] = []): ChangedOperation {
  return {
    operation: entry.key,
    ...(entry.summary ? { summary: entry.summary } : {}),
    roots,
  };
}

function objectValue(value: JsonValue | undefined): JsonObject {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function compareComponents(baseline: JsonObject, current: JsonObject): ComponentChanges {
  const oldComponents = objectValue(baseline.components);
  const newComponents = objectValue(current.components);
  const oldSchemas = objectValue(oldComponents.schemas);
  const newSchemas = objectValue(newComponents.schemas);
  const addedSchemas = Object.keys(newSchemas).filter(name => !(name in oldSchemas)).sort();
  const removedSchemas = Object.keys(oldSchemas).filter(name => !(name in newSchemas)).sort();
  const changedSchemas = Object.keys(newSchemas)
    .filter(name => name in oldSchemas && !same(oldSchemas[name], newSchemas[name], true))
    .sort();
  const exampleOnlySchemas = Object.keys(newSchemas)
    .filter(name => name in oldSchemas
      && !same(oldSchemas[name], newSchemas[name])
      && same(oldSchemas[name], newSchemas[name], true))
    .sort();
  const componentRoots = new Set([...Object.keys(oldComponents), ...Object.keys(newComponents)]);
  const otherRootsChanged = [...componentRoots]
    .filter(name => name !== 'schemas' && !same(oldComponents[name], newComponents[name], true))
    .sort();
  const otherExampleOnlyRoots = [...componentRoots]
    .filter(name => name !== 'schemas'
      && !same(oldComponents[name], newComponents[name])
      && same(oldComponents[name], newComponents[name], true))
    .sort();

  return {
    addedSchemas,
    removedSchemas,
    changedSchemas,
    exampleOnlySchemas,
    otherRootsChanged,
    otherExampleOnlyRoots,
  };
}

function buildReport(base: string, spec: string, baseline: JsonObject, current: JsonObject): Report {
  const oldOperations = collectOperations(baseline);
  const newOperations = collectOperations(current);
  const added: ChangedOperation[] = [];
  const removed: ChangedOperation[] = [];
  const contractOrMetadataChanged: ChangedOperation[] = [];
  const exampleOnlyChanged: ChangedOperation[] = [];

  for (const key of [...newOperations.keys()].sort()) {
    const currentEntry = newOperations.get(key)!;
    const baselineEntry = oldOperations.get(key);
    if (!baselineEntry) {
      added.push(describe(currentEntry));
      continue;
    }
    if (same(baselineEntry.operation, currentEntry.operation)) continue;

    if (same(baselineEntry.operation, currentEntry.operation, true)) {
      exampleOnlyChanged.push(describe(currentEntry, changedRoots(baselineEntry.operation, currentEntry.operation)));
    } else {
      contractOrMetadataChanged.push(describe(
        currentEntry,
        changedRoots(baselineEntry.operation, currentEntry.operation, true),
      ));
    }
  }

  for (const key of [...oldOperations.keys()].sort()) {
    if (!newOperations.has(key)) removed.push(describe(oldOperations.get(key)!));
  }

  return {
    base,
    spec,
    baselineOperations: oldOperations.size,
    currentOperations: newOperations.size,
    added,
    removed,
    contractOrMetadataChanged,
    exampleOnlyChanged,
    components: compareComponents(baseline, current),
  };
}

function renderEntries(entries: ChangedOperation[]): string[] {
  if (entries.length === 0) return ['- None'];
  return entries.map(entry => {
    const roots = entry.roots.length > 0 ? ` — ${entry.roots.join(', ')}` : '';
    const summary = entry.summary ? ` — ${entry.summary.replaceAll('\n', ' ')}` : '';
    return `- \`${entry.operation}\`${roots}${summary}`;
  });
}

function renderMarkdown(report: Report): string {
  const componentLines = [
    ...report.components.addedSchemas.map(name => `- Added schema: \`${name}\``),
    ...report.components.removedSchemas.map(name => `- Removed schema: \`${name}\``),
    ...report.components.changedSchemas.map(name => `- Changed schema: \`${name}\``),
    ...report.components.exampleOnlySchemas.map(name => `- Example-only schema change: \`${name}\``),
    ...report.components.otherRootsChanged.map(name => `- Changed component group: \`${name}\``),
    ...report.components.otherExampleOnlyRoots.map(name => `- Example-only component group change: \`${name}\``),
  ];

  return [
    '# OpenAPI change report',
    '',
    `- Baseline: \`${report.base}\``,
    `- Spec: \`${report.spec}\``,
    `- Operations: ${report.baselineOperations} -> ${report.currentOperations}`,
    `- Added: ${report.added.length}`,
    `- Removed: ${report.removed.length}`,
    `- Contract or metadata changed: ${report.contractOrMetadataChanged.length}`,
    `- Example-only changed: ${report.exampleOnlyChanged.length}`,
    `- Component schemas: +${report.components.addedSchemas.length} -${report.components.removedSchemas.length} ~${report.components.changedSchemas.length}, example-only ${report.components.exampleOnlySchemas.length}`,
    '',
    '## Added',
    '',
    ...renderEntries(report.added),
    '',
    '## Removed',
    '',
    ...renderEntries(report.removed),
    '',
    '## Contract or metadata changed',
    '',
    ...renderEntries(report.contractOrMetadataChanged),
    '',
    '## Example-only changed',
    '',
    ...renderEntries(report.exampleOnlyChanged),
    '',
    '## Shared components',
    '',
    ...(componentLines.length > 0 ? componentLines : ['- None']),
  ].join('\n');
}

const options = parseArgs(process.argv.slice(2));
const root = runGit(['rev-parse', '--show-toplevel'], process.cwd()).trim();
const absoluteSpec = resolve(root, options.spec);
const repositoryPath = relative(root, absoluteSpec).replaceAll('\\', '/');

if (repositoryPath.startsWith('../') || repositoryPath === '..') fail('--spec must be inside the repository');
if (!existsSync(absoluteSpec)) fail(`working spec does not exist: ${repositoryPath}`);

const baselineSource = runGit(['show', `${options.base}:${repositoryPath}`], root);
const baseline = parseJson(baselineSource, `${options.base}:${repositoryPath}`);
const current = parseJson(readFileSync(absoluteSpec, 'utf8'), repositoryPath);
const report = buildReport(options.base, repositoryPath, baseline, current);

console.log(options.json ? JSON.stringify(report, null, 2) : renderMarkdown(report));
