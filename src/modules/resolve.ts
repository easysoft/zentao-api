import { ZentaoError } from '../misc/errors.js';
import type { ListPagerInfo, ModuleAction, ModuleActionRequest, ModuleDefinition } from '../types/index.js';
import { getNestedValue, isBlank, isRecord } from '../utils/index.js';
import { getModuleAction } from './registry.js';

const SCOPE_MAP: Record<string, string> = {
  product: 'products',
  project: 'projects',
  execution: 'executions',
};

const SCOPE_KEY_ORDER = ['execution', 'project', 'product'] as const;

/** 从调用参数中推断作用域列表路径，优先级为执行 > 项目 > 产品。 */
function pickScope(params: Record<string, unknown>): { scope: string; scopeID: number } | undefined {
  for (const key of SCOPE_KEY_ORDER) {
    const value = params[key] ?? params[`${key}ID`];
    if (isBlank(value)) continue;
    const numberValue = Number(value);
    if (!Number.isNaN(numberValue)) {
      return { scope: SCOPE_MAP[key], scopeID: numberValue };
    }
  }
  return undefined;
}

/** 替换动作路径模板中的 `{param}` 占位符。 */
function resolvePath(action: ModuleAction, values: Record<string, string | number>): string {
  return action.path.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = values[key];
    if (isBlank(value)) {
      throw new ZentaoError('E_MISSING_PARAM', { param: key });
    }
    return String(value);
  });
}

/** 支持用户通过 `params.data` 传入 JSON 字符串或对象作为请求体基础值。 */
function parseData(value: unknown): Record<string, unknown> | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'string') {
    try {
      const parsed: unknown = JSON.parse(value);
      return isRecord(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }
  return isRecord(value) ? value : undefined;
}

const TRUTHY_STRINGS = new Set(['true', '1', 'yes', 'on']);
const FALSY_STRINGS = new Set(['false', '0', 'no', 'off']);

/**
 * 按 OpenAPI schema 的基础类型对参数做轻量转换。
 * @param fromData 值是否来自 `params.data`（影响数组字段是否包装对象）。
 */
function coerceValue(value: unknown, type: string | undefined, paramName: string, fromData = false): unknown {
  if (value === undefined || value === null) return value;
  if (type === 'number' || type === 'integer') {
    const numberValue = Number(value);
    return Number.isNaN(numberValue) ? value : numberValue;
  }
  if (type === 'boolean') {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') {
      if (value === 1) return true;
      if (value === 0) return false;
      throw new ZentaoError('E_INVALID_PARAM', { param: paramName, value: String(value) });
    }
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (TRUTHY_STRINGS.has(normalized)) return true;
      if (FALSY_STRINGS.has(normalized)) return false;
      throw new ZentaoError('E_INVALID_PARAM', { param: paramName, value });
    }
    throw new ZentaoError('E_INVALID_PARAM', { param: paramName, value: String(value) });
  }
  if (type === 'array') {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',');
    // 来自 params.data 的对象按原样保留，不强行包成单元素数组。
    if (fromData && isRecord(value)) return value;
    return [value];
  }
  return value;
}

/** 解析路径占位符的取值：scope 列表前缀、对象 ID，以及默认值补齐。 */
function resolvePathValues(
  module: ModuleDefinition,
  action: ModuleAction,
  params: Record<string, unknown>,
): { values: Record<string, string | number>; id?: number } {
  const values: Record<string, string | number> = {};
  const pathParamNames = Object.keys(action.pathParams ?? {});

  // 生成定义中的 scope 列表接口会统一成 /{scope}/{scopeID}/xxx。
  if (pathParamNames.includes('scope')) {
    const scope = pickScope(params);
    if (!scope) throw new ZentaoError('E_MISSING_PARAM', { param: 'product/project/execution' });
    values.scope = scope.scope;
    values.scopeID = scope.scopeID;
  }

  // 对象 ID 可来自 `id`、`{module}ID` 或路径中的 `xxxID` 占位符。
  const idParamName = pathParamNames.find((key) => key.endsWith('ID') && key !== 'scopeID');
  const idValue = params.id ?? params[`${module.name}ID`] ?? (idParamName ? params[idParamName] : undefined);
  const idNumber = idValue === undefined ? Number.NaN : Number(idValue);
  const id = Number.isNaN(idNumber) ? undefined : idNumber;
  if (idParamName && id !== undefined) {
    values[idParamName] = id;
  }

  // pathParams 中未显式传值的参数，可从定义里的默认值或第一个可选项补齐。
  for (const key of pathParamNames) {
    if (key === 'scope' || key === 'scopeID' || values[key] !== undefined) continue;
    const definition = action.pathParams?.[key];
    const value = params[key];
    if (value !== undefined) {
      values[key] = value as string | number;
      continue;
    }
    if (typeof definition === 'object') {
      if (definition.defaultValue !== undefined) {
        values[key] = definition.defaultValue as string | number;
      } else if (definition.options?.[0]?.value !== undefined) {
        values[key] = definition.options[0].value as string | number;
      }
    }
    if (values[key] === undefined) {
      throw new ZentaoError('E_MISSING_PARAM', { param: key });
    }
  }

  return { values, id };
}

/** 仅从 action.params 中声明过的字段生成查询参数，避免把 body 字段误放到 URL 上。 */
function buildQuery(action: ModuleAction, params: Record<string, unknown>): Record<string, string | number> {
  const query: Record<string, string | number> = {};
  for (const param of action.params ?? []) {
    let value = params[param.name];
    if (value === undefined && param.name === 'pageID') {
      value = params.page;
    }
    if (value === undefined) {
      value = param.defaultValue ?? param.options?.[0]?.value;
    }
    if (value === undefined && param.required) {
      throw new ZentaoError('E_MISSING_PARAM', { param: param.name });
    }
    if (value !== undefined) {
      query[param.name] = value as string | number;
    }
  }
  return query;
}

/** 按 requestBody schema 组装请求体，并对各字段做取值优先级解析与类型转换。 */
function buildRequestBody(action: ModuleAction, params: Record<string, unknown>): Record<string, unknown> | undefined {
  const base = parseData(params.data);
  if (action.requestBody?.schema?.type !== 'object') return base;

  const data: Record<string, unknown> = base ? { ...base } : {};
  const schema = action.requestBody.schema as {
    required?: string[];
    properties?: Record<string, { defaultValue?: unknown; required?: boolean; type?: string; items?: { type?: string } }>;
  };
  const required = new Set(schema.required ?? []);
  for (const [key, property] of Object.entries(schema.properties ?? {})) {
    // body 字段优先级：params.data 中的字段 > 平铺 params 字段 > schema 默认值。
    const hasDataValue = Object.prototype.hasOwnProperty.call(data, key);
    const hasParamValue = Object.prototype.hasOwnProperty.call(params, key);
    const raw = hasDataValue ? data[key] : hasParamValue ? params[key] : property.defaultValue;
    if (raw === undefined && (property.required || required.has(key))) {
      throw new ZentaoError('E_MISSING_PARAM', { param: key });
    }
    const value = coerceValue(raw, property.type, key, hasDataValue);
    if (value !== undefined) {
      data[key] = value;
    }
  }
  return data;
}

/** 将模块名、动作名和调用参数解析为实际 API 请求路径、查询参数和请求体。 */
export function resolveActionRequest(
  module: ModuleDefinition,
  actionName: string,
  params: Record<string, unknown> = {},
): ModuleActionRequest {
  const action = getModuleAction(module.name, actionName);
  const { values, id } = resolvePathValues(module, action, params);
  return {
    module: module.name,
    action,
    params,
    path: resolvePath(action, values),
    query: buildQuery(action, params),
    data: buildRequestBody(action, params),
    id,
  };
}

/** 根据动作定义中的 resultGetter，从原始响应里提取业务数据。 */
export function extractResult(
  action: ModuleAction,
  response: Record<string, unknown>,
  params: Record<string, unknown> = {},
): unknown {
  const getter = action.resultGetter;
  if (!getter) return response.data ?? response;
  if (typeof getter === 'function') return getter(response, params);
  if (typeof getter === 'string') return getNestedValue(response, getter);

  const result: Record<string, unknown> = {};
  for (const [targetKey, sourceKey] of Object.entries(getter)) {
    result[targetKey] = getNestedValue(response, sourceKey);
  }
  return result;
}

/** 根据动作定义中的 pagerGetter，从原始响应里提取分页信息。 */
export function extractPager(
  action: ModuleAction,
  response: Record<string, unknown>,
  params: Record<string, unknown> = {},
): ListPagerInfo | undefined {
  const getter = action.pagerGetter;
  if (!getter) return response.pager as ListPagerInfo | undefined;
  if (typeof getter === 'function') return getter(response, params);
  if (typeof getter === 'string') return getNestedValue(response, getter) as ListPagerInfo | undefined;

  const page = getNestedValue(response, getter.pageID);
  const recPerPage = getNestedValue(response, getter.recPerPage);
  const recTotal = getNestedValue(response, getter.recTotal);
  if (page === undefined || recPerPage === undefined || recTotal === undefined) return undefined;
  return {
    pageID: Number(page),
    recPerPage: Number(recPerPage),
    recTotal: Number(recTotal),
  };
}
