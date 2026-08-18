import type {
  ModuleAction,
  ModuleActionParam,
  ModuleActionRequestMediaType,
  ModuleDefinition,
} from '../types/index.js';
import { getModuleActionParams } from './query.js';
import { getModuleMapState } from './registry-store.js';

function removeFunctions<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .filter((item) => typeof item !== 'function')
      .map((item) => removeFunctions(item)) as T;
  }
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      if (typeof item !== 'function') {
        result[key] = removeFunctions(item);
      }
    }
    return result as T;
  }
  return value;
}

/** 导出的模块动作定义。 */
export type ExportedModuleAction = Omit<ModuleAction, 'requestBody'> & {
  bodyParams: ModuleActionParam[];
  /** 请求体媒体类型；省略时为 `application/json`。 */
  bodyMediaType?: ModuleActionRequestMediaType;
};

/** 导出的模块定义。 */
export type ExportedModuleDefinition = Omit<ModuleDefinition, 'actions'> & {
  actions: ExportedModuleAction[];
};

/** {@link exportRegistry} 的选项。 */
export interface ExportRegistryOptions {
  /** 是否保留注册表中的原始模块定义。 */
  raw?: boolean;
  /** 是否递归移除值为函数的属性；默认为 `true`。 */
  jsonSafe?: boolean;
}

/**
 * 导出注册表。
 *
 * 默认会把动作的 `requestBody` 转换成扁平的 `bodyParams`；传入 `raw: true`
 * 时则保留原始模块结构。默认还会递归移除函数属性，以便安全地序列化为 JSON；
 * 如需保留函数，可传入 `jsonSafe: false`。
 *
 * @param options - 导出选项。
 * @returns 以模块名为键的模块定义。
 */
export function exportRegistry(options: ExportRegistryOptions & { raw: true }): Record<string, ModuleDefinition>;
export function exportRegistry(options?: ExportRegistryOptions & { raw?: false }): Record<string, ExportedModuleDefinition>;
export function exportRegistry(options: ExportRegistryOptions): Record<string, ModuleDefinition | ExportedModuleDefinition>;
export function exportRegistry(options: ExportRegistryOptions = {}): Record<string, ModuleDefinition | ExportedModuleDefinition> {
  const raw = options.raw ?? false;
  const jsonSafe = options.jsonSafe ?? true;
  const registry = {} as Record<string, ModuleDefinition | ExportedModuleDefinition>;

  getModuleMapState().forEach((module) => {
    const definition: ModuleDefinition | ExportedModuleDefinition = raw
      ? module
      : {
          ...module,
          actions: module.actions.map((action) => {
            const { requestBody, ...exportedAction } = action;
            return {
              ...exportedAction,
              ...(requestBody?.mediaType ? { bodyMediaType: requestBody.mediaType } : {}),
              bodyParams: requestBody
                ? getModuleActionParams(module.name, action.name, { roles: ['body'] })
                : [],
            };
          }),
        };

    registry[module.name] = jsonSafe ? removeFunctions(definition) : definition;
  });

  return registry;
}
