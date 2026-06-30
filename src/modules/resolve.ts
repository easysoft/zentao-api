import { ZentaoError } from '../misc/errors.js';
import type { ListPagerInfo, ModuleAction, ModuleDefinition, ResolvedModuleCommand } from '../types/index.js';
import { getNestedValue, isRecord } from '../utils/index.js';
import { getModuleAction } from './registry.js';

const SCOPE_MAP: Record<string, string> = {
  product: 'products',
  project: 'projects',
  execution: 'executions',
};

const SCOPE_KEY_ORDER = ['execution', 'project', 'product'] as const;
type ScopeKey = (typeof SCOPE_KEY_ORDER)[number];

/** 从调用参数中推断作用域列表路径，优先级为执行 > 项目 > 产品。 */
function pickScope(params: Record<string, unknown>): { scope: string; scopeID: number } | undefined {
  for (const key of SCOPE_KEY_ORDER) {
    const value = params[key] ?? params[`${key}ID`];
    if (value === undefined || value === null || value === '') continue;
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
    if (value === undefined || value === '') {
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
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : undefined;
    } catch {
      return undefined;
    }
  }
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

const TRUTHY_STRINGS = new Set(['true', '1', 'yes', 'on']);
const FALSY_STRINGS = new Set(['false', '0', 'no', 'off']);

/** 按 OpenAPI schema 的基础类型对参数做轻量转换。 */
function coerceValue(value: unknown, type: string | undefined, paramName: string): unknown {
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
  return value;
}

/** 将模块名、动作名和调用参数解析为实际 API 请求路径、查询参数和请求体。 */
export function resolveModuleCommand(
  module: ModuleDefinition,
  actionName: string,
  params: Record<string, unknown> = {},
): ResolvedModuleCommand {
  const action = getModuleAction(module.name, actionName);
  const pathValues: Record<string, string | number> = {};
  const pathParamNames = Object.keys(action.pathParams ?? {});

  // 生成定义中的 scope 列表接口会统一成 /{scope}/{scopeID}/xxx。
  if (pathParamNames.includes('scope')) {
    const scope = pickScope(params);
    if (!scope) throw new ZentaoError('E_MISSING_PARAM', { param: 'product/project/execution' });
    pathValues.scope = scope.scope;
    pathValues.scopeID = scope.scopeID;
  }

  const idParamName = pathParamNames.find((key) => key.endsWith('ID') && key !== 'scopeID');
  const idValue = params.id ?? params[`${module.name}ID`] ?? (idParamName ? params[idParamName] : undefined);
  const id = idValue === undefined ? undefined : Number(idValue);
  if (idParamName && id !== undefined && !Number.isNaN(id)) {
    pathValues[idParamName] = id;
  }

  // pathParams 中未显式传值的参数，可从定义里的默认值或第一个可选项补齐。
  for (const key of pathParamNames) {
    if (key === 'scope' || key === 'scopeID' || pathValues[key] !== undefined) continue;
    const definition = action.pathParams?.[key];
    const value = params[key];
    if (value !== undefined) {
      pathValues[key] = value as string | number;
      continue;
    }
    if (typeof definition === 'object') {
      if (definition.defaultValue !== undefined) {
        pathValues[key] = definition.defaultValue as string | number;
      } else if (definition.options?.[0]?.value !== undefined) {
        pathValues[key] = definition.options[0].value as string | number;
      }
    }
    if (pathValues[key] === undefined) {
      throw new ZentaoError('E_MISSING_PARAM', { param: key });
    }
  }

  // 查询参数只从 action.params 中声明过的字段生成，避免把 body 字段误放到 URL 上。
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

  let data = parseData(params.data);
  if (action.requestBody?.schema?.type === 'object') {
    data = data ? { ...data } : {};
    const schema = action.requestBody.schema as {
      required?: string[];
      properties?: Record<string, { defaultValue?: unknown; required?: boolean; type?: string; items?: { type?: string } }>;
    };
    const required = new Set(schema.required ?? []);
    for (const [key, property] of Object.entries(schema.properties ?? {})) {
      // body 字段优先级：params.data 中的字段 > 平铺 params 字段 > schema 默认值。
      const hasDataValue = Object.prototype.hasOwnProperty.call(data, key);
      const hasParamValue = Object.prototype.hasOwnProperty.call(params, key);
      let value = hasDataValue ? data[key] : hasParamValue ? params[key] : property.defaultValue;
      if (value === undefined && (property.required || required.has(key))) {
        throw new ZentaoError('E_MISSING_PARAM', { param: key });
      }
      value = coerceValue(value, property.type, key);
      if (property.type === 'array' && value !== undefined && value !== null && !Array.isArray(value)) {
        if (typeof value === 'string') {
          value = value.split(',');
        } else if (!hasDataValue || !isRecord(value)) {
          value = [value];
        }
      }
      if (value !== undefined) {
        data[key] = value;
      }
    }
  }

  return {
    module: module.name,
    action,
    params,
    path: resolvePath(action, pathValues),
    query,
    data,
    id: id === undefined || Number.isNaN(id) ? undefined : id,
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
