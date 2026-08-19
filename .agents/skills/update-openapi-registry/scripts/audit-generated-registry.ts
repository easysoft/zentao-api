#!/usr/bin/env bun

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BUILTIN_MODULES } from '../../../../src/modules/generated.ts';

type JsonObject = Record<string, unknown>;

interface ActionMapping extends JsonObject {
  module?: string;
  name?: string;
}

interface ScopedListInfo {
  parentResource: string;
  childResource: string;
}

interface OpenAPIOperationRecord {
  key: string;
  method: string;
  path: string;
  tag?: string;
  moduleName: string;
  actionName: string;
  actionType: string;
  expectedMethod: string;
  expectedPath: string;
  mapping?: ActionMapping;
  scopedList: ScopedListInfo | null;
}

interface RegistryActionRecord {
  moduleName: string;
  name: string;
  method: string;
  path: string;
  pathParams?: Readonly<Record<string, unknown>>;
}

const HTTP_METHODS = new Set(['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace']);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const OPENAPI_PATH = resolve(ROOT, 'data/zentao-openapi.json');
const ACTION_MAP_PATH = resolve(ROOT, 'scripts/zentao-api-map.json');

function isObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readJsonObject(path: string): JsonObject {
  const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'));
  if (!isObject(parsed)) throw new Error(`${path} must contain a JSON object.`);
  return parsed;
}

function normalizePath(path: string): string {
  return path.replace(/:(\w+)/g, '{$1}');
}

function operationKey(method: string, path: string): string {
  return `${method.toLowerCase()} ${normalizePath(path)}`;
}

function loadActionMap(): Map<string, ActionMapping> {
  const result = new Map<string, ActionMapping>();
  for (const [rawKey, value] of Object.entries(readJsonObject(ACTION_MAP_PATH))) {
    if (!isObject(value)) throw new Error(`Invalid action mapping for "${rawKey}".`);
    const separator = rawKey.indexOf(' ');
    if (separator <= 0 || separator === rawKey.length - 1) {
      throw new Error(`Invalid action mapping key "${rawKey}"; expected "method /path".`);
    }
    const method = rawKey.slice(0, separator).trim();
    const path = rawKey.slice(separator + 1).trim();
    result.set(operationKey(method, path), value as ActionMapping);
  }
  return result;
}

function isPathParam(segment: string): boolean {
  return /^\{\w+\}$/.test(segment);
}

function classifyOperation(method: string, path: string): { name: string; type: string } {
  const segments = normalizePath(path).split('/').filter(Boolean);
  const lastSegment = segments.at(-1) ?? '';
  const secondLastSegment = segments.at(-2) ?? '';

  if (method === 'put' && !isPathParam(lastSegment) && isPathParam(secondLastSegment)) {
    return { name: lastSegment, type: 'action' };
  }
  if (method === 'delete') return { name: 'delete', type: 'delete' };
  if (method === 'post') return { name: 'create', type: 'create' };
  if (method === 'get' && isPathParam(lastSegment)) return { name: 'get', type: 'get' };
  if (method === 'get') return { name: 'list', type: 'list' };
  if (method === 'put') return { name: 'update', type: 'update' };
  return { name: lastSegment, type: 'action' };
}

function parseScopedListPath(path: string): ScopedListInfo | null {
  const segments = normalizePath(path).split('/').filter(Boolean);
  if (segments.length !== 3 || isPathParam(segments[0]) || !isPathParam(segments[1]) || isPathParam(segments[2])) {
    return null;
  }
  return { parentResource: segments[0], childResource: segments[2] };
}

function stringProperty(object: JsonObject | undefined, property: string): string | undefined {
  const value = object?.[property];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function collectOpenAPIOperations(actionMap: Map<string, ActionMapping>): {
  operations: OpenAPIOperationRecord[];
  tokenOperationCount: number;
} {
  const document = readJsonObject(OPENAPI_PATH);
  if (!isObject(document.paths)) throw new Error(`${OPENAPI_PATH} must contain a paths object.`);

  const operations: OpenAPIOperationRecord[] = [];
  let tokenOperationCount = 0;

  for (const [rawPath, pathItem] of Object.entries(document.paths)) {
    if (!isObject(pathItem)) continue;
    const path = normalizePath(rawPath);
    for (const [rawMethod, value] of Object.entries(pathItem)) {
      const method = rawMethod.toLowerCase();
      if (!HTTP_METHODS.has(method) || !isObject(value)) continue;

      const tags = Array.isArray(value.tags) ? value.tags : [];
      const tag = typeof tags[0] === 'string' ? tags[0] : undefined;
      if (tag?.toLowerCase() === 'token') {
        tokenOperationCount += 1;
        continue;
      }

      const key = operationKey(method, path);
      const mapping = actionMap.get(key);
      const classification = classifyOperation(method, path);
      const actionType = stringProperty(mapping, 'type') ?? classification.type;
      const actionName = stringProperty(mapping, 'name') ?? classification.name;
      const moduleName = (stringProperty(mapping, 'module') ?? tag ?? '').toLowerCase();

      operations.push({
        key,
        method,
        path,
        ...(tag ? { tag } : {}),
        moduleName,
        actionName,
        actionType,
        expectedMethod: (stringProperty(mapping, 'method') ?? method).toLowerCase(),
        expectedPath: normalizePath(stringProperty(mapping, 'path') ?? path),
        ...(mapping ? { mapping } : {}),
        scopedList: actionType === 'list' ? parseScopedListPath(path) : null,
      });
    }
  }

  return { operations, tokenOperationCount };
}

function registryActionKey(moduleName: string, name: string, method: string, path: string): string {
  return [moduleName.toLowerCase(), name, method.toLowerCase(), normalizePath(path)].join('\u0000');
}

function collectRegistryActions(): RegistryActionRecord[] {
  return BUILTIN_MODULES.flatMap(module => module.actions.map(action => ({
    moduleName: module.name,
    name: action.name,
    method: action.method?.toLowerCase() ?? '',
    path: normalizePath(action.path),
    ...('pathParams' in action && action.pathParams ? { pathParams: action.pathParams } : {}),
  })));
}

function hasScopeOption(action: RegistryActionRecord, scope: string): boolean {
  const scopeParam = action.pathParams?.scope;
  if (!isObject(scopeParam) || !Array.isArray(scopeParam.options)) return false;
  return scopeParam.options.some(option => isObject(option) && option.value === scope);
}

function mappedGroupProperty(
  operations: OpenAPIOperationRecord[],
  property: 'method' | 'path',
): string | undefined {
  const values = operations
    .map(operation => stringProperty(operation.mapping, property))
    .filter((value): value is string => Boolean(value));
  if (values.length === 0) return undefined;
  return values[0];
}

const problems: string[] = [];
const moduleNames = new Set<string>();
const fullActionNames = new Set<string>();
let actionCount = 0;
let getActionCount = 0;

for (const module of BUILTIN_MODULES) {
  if (moduleNames.has(module.name)) problems.push(`duplicate module: ${module.name}`);
  moduleNames.add(module.name);
  if (!/^[a-z][A-Za-z0-9]*$/.test(module.name)) {
    problems.push(`invalid module name: ${module.name}; use a lower camelCase name without hyphens`);
  }

  const actionNames = new Set<string>();
  for (const action of module.actions) {
    actionCount += 1;
    const fullName = `${module.name}-${action.name}`;

    if (actionNames.has(action.name)) problems.push(`duplicate action: ${fullName}`);
    actionNames.add(action.name);
    if (fullActionNames.has(fullName)) problems.push(`duplicate full action name: ${fullName}`);
    fullActionNames.add(fullName);

    if (!/^[a-z][A-Za-z0-9]*$/.test(action.name)) {
      problems.push(`invalid action name: ${fullName}; use a lower camelCase action name without hyphens`);
    }

    if (action.method?.toLowerCase() !== 'get') continue;
    getActionCount += 1;
    if (!('resultGetter' in action)
      || typeof action.resultGetter !== 'string'
      || action.resultGetter.trim() === '') {
      problems.push(`missing resultGetter: ${fullName} (${action.path})`);
    }
  }
}

const actionMap = loadActionMap();
const { operations, tokenOperationCount } = collectOpenAPIOperations(actionMap);
const registryActions = collectRegistryActions();
const registryActionKeys = new Set(registryActions.map(action => registryActionKey(
  action.moduleName,
  action.name,
  action.method,
  action.path,
)));
const topLevelListModules = new Set(operations
  .filter(operation => operation.actionType === 'list'
    && !operation.scopedList
    && operation.actionName.toLowerCase() === 'list')
  .map(operation => operation.moduleName));
const autoMergeGroups = new Map<string, OpenAPIOperationRecord[]>();
const uncoveredOperationKeys = new Set<string>();
let directOperationCount = 0;
let mergedOperationCount = 0;

function addCoverageProblem(operation: OpenAPIOperationRecord, message: string): void {
  if (uncoveredOperationKeys.has(operation.key)) return;
  uncoveredOperationKeys.add(operation.key);
  problems.push(`${message}: ${operation.key}`);
}

for (const operation of operations) {
  const hasManualName = Boolean(stringProperty(operation.mapping, 'name'));
  if (operation.scopedList && !hasManualName && topLevelListModules.has(operation.moduleName)) {
    addCoverageProblem(
      operation,
      `unmapped scoped list in module "${operation.moduleName || '(missing tag)'}" with a top-level list; `
        + 'add a semantic "name" mapping to scripts/zentao-api-map.json and do not discard the operation',
    );
    continue;
  }

  const directKey = registryActionKey(
    operation.moduleName,
    operation.actionName,
    operation.expectedMethod,
    operation.expectedPath,
  );
  if (registryActionKeys.has(directKey)) {
    directOperationCount += 1;
    continue;
  }

  if (operation.scopedList && !hasManualName) {
    const group = autoMergeGroups.get(operation.moduleName) ?? [];
    group.push(operation);
    autoMergeGroups.set(operation.moduleName, group);
    continue;
  }

  addCoverageProblem(
    operation,
    `uncovered non-Token OpenAPI operation; expected ${operation.moduleName || '(missing module)'}-${operation.actionName}`,
  );
}

for (const [moduleName, group] of autoMergeGroups) {
  const childResources = new Set(group.map(operation => operation.scopedList!.childResource));
  if (childResources.size !== 1) {
    for (const operation of group) {
      addCoverageProblem(
        operation,
        `incompatible scoped lists would be merged in module "${moduleName || '(missing tag)'}"; `
          + 'add semantic "name" mappings to scripts/zentao-api-map.json',
      );
    }
    continue;
  }

  const childResource = group[0].scopedList!.childResource;
  const mappedMethod = mappedGroupProperty(group, 'method');
  const mappedPath = mappedGroupProperty(group, 'path');
  const expectedMethod = (mappedMethod ?? 'get').toLowerCase();
  const expectedPath = normalizePath(mappedPath ?? (group.length === 1
    ? group[0].path
    : `/{scope}/{scopeID}/${childResource}`));
  const mergedAction = registryActions.find(action => action.moduleName === moduleName
    && action.name === 'list'
    && action.method === expectedMethod
    && action.path === expectedPath);

  if (!mergedAction) {
    for (const operation of group) {
      addCoverageProblem(
        operation,
        `uncovered non-Token scoped-list operation; expected merged ${moduleName || '(missing module)'}-list`,
      );
    }
    continue;
  }

  for (const operation of group) {
    const scope = operation.scopedList!.parentResource;
    if (group.length > 1 && !hasScopeOption(mergedAction, scope)) {
      addCoverageProblem(
        operation,
        `merged ${moduleName}-list does not expose scope "${scope}" for non-Token operation`,
      );
      continue;
    }
    mergedOperationCount += 1;
  }
}

const coverageSummary = `${operations.length} non-Token OpenAPI operations: `
  + `${directOperationCount} direct, ${mergedOperationCount} merged, `
  + `${uncoveredOperationKeys.size} uncovered; ${tokenOperationCount} Token excluded`;

if (problems.length > 0) {
  console.error(`Registry audit failed with ${problems.length} problem(s):`);
  for (const problem of problems) console.error(`- ${problem}`);
  console.error(`Coverage: ${coverageSummary}.`);
  process.exit(1);
}

console.log(
  `Registry audit passed: ${moduleNames.size} modules, ${actionCount} actions, `
  + `${getActionCount} GET actions; <moduleName>-<actionName> values are unique, `
  + `every GET has resultGetter, and coverage is complete (${coverageSummary}).`,
);
