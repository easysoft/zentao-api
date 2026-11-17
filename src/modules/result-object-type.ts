import type { ModuleActionResultObjectType, ModuleActionResultType } from '../types/module.js';

function isNonblankString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/** 生成器和运行时注册共用的定义校验。 */
export function isResultObjectType(value: unknown): value is ModuleActionResultObjectType {
  if (value === null || isNonblankString(value)) return true;
  if (!isPlainRecord(value) || !Object.hasOwn(value, 'param') || !isNonblankString(value.param)) return false;
  if (Object.keys(value).some(key => key !== 'param' && key !== 'map')) return false;
  return value.map === undefined || (isPlainRecord(value.map)
    && Object.entries(value.map).every(([key, type]) => isNonblankString(key) && isNonblankString(type)));
}

/** 仅对象和列表默认采用所属模块名；显式 null 由调用方保留。 */
export function defaultResultObjectType(moduleName: string, resultType: ModuleActionResultType): string | null {
  return resultType === 'object' || resultType === 'list' ? moduleName : null;
}

/** 根据声明解析结果类型，不遍历或复制业务数据。 */
export function resolveResultObjectType(
  definition: ModuleActionResultObjectType | undefined,
  params: Record<string, unknown>,
  data: unknown,
): string | undefined {
  if (definition == null || (!Array.isArray(data) && !isPlainRecord(data))) return undefined;
  if (typeof definition === 'string') return definition;
  const value = Object.hasOwn(params, definition.param) ? params[definition.param] : undefined;
  if (!isNonblankString(value)) return undefined;
  return definition.map && Object.hasOwn(definition.map, value) ? definition.map[value] : value;
}
