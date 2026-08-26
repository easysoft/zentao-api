import type { ModuleAction, ModuleActionParam, ModuleActionParamRole, ModuleDefinition } from '../types/index.js';
import { objectProps } from './object-props.js';
import { getModuleMapState, getModulesState } from './registry-store.js';

/**
 * 获取模块定义。
 *
 * 模块名匹配大小写不敏感。返回值是注册表内部的已深冻结引用（O(1) 查询、零拷贝），
 * 任何写入尝试在严格模式下会抛 `TypeError`；如需修改请使用 {@link defineModules}。
 *
 * @param moduleName - 模块名。
 * @returns 已注册的模块定义；模块未注册时返回 `undefined`。
 */
export function getModule(moduleName: string): ModuleDefinition | undefined {
  return getModuleMapState().get(moduleName.toLowerCase());
}

/**
 * 获取指定模块下的某个动作。
 *
 * 解析顺序：
 * 1. `actionName === 'ls'` 时映射为 `list`（仅作为别名，不会修改注册表）。
 * 2. 在该模块的动作中按名称大小写不敏感匹配。
 *
 * 返回值同样是已深冻结的引用，请勿尝试修改。
 *
 * @param moduleName - 模块名（大小写不敏感）。
 * @param actionName - 动作名（大小写不敏感）；支持 `ls` 作为 `list` 的别名。
 * @returns 匹配到的动作定义；模块未注册或动作不存在时返回 `undefined`。
 */
export function getModuleAction(moduleName: string, actionName: string): ModuleAction | undefined {
  const module = getModule(moduleName);
  if (!module) return undefined;
  const normalized = actionName === 'ls' ? 'list' : actionName;
  return module.actions.find((action) => String(action.name).toLowerCase() === normalized.toLowerCase());
}

/**
 * 获取指定模块下的某个动作的参数。
 *
 * @param moduleName - 模块名（大小写不敏感）。
 * @param actionName - 动作名（大小写不敏感）；支持 `ls` 作为 `list` 的别名。
 * @param options - 选项。
 * @param options.roles - 角色，可选 `path`、`query`、`body`。
 * @returns 动作参数。
 */
export function getModuleActionParams(moduleName: string, actionName: string, options?: { roles?: ModuleActionParamRole[] }): ModuleActionParam[] {
  const { roles } = options ?? {};
  const params = [] as ModuleActionParam[];
  const action = getModuleAction(moduleName, actionName);
  if (!action) {
    return [];
  }
  if (action.pathParams && (!roles || roles.includes('path'))) {
    Object.entries(action.pathParams).forEach(([name, param]) => {
      if (typeof param === 'string') {
        param = {
          description: param,
        };
      }
      params.push({
        name,
        role: 'path',
        required: true,
        ...param,
      });
    });
  }
  if (action.params && (!roles || roles.includes('query'))) {
    params.push(...action.params.map(x => ({...x, role: 'query' as const})));
  }
  const schema = action.requestBody?.schema;
  if (schema && (!roles || roles.includes('body'))) {
    if (schema.type === 'object') {
      const requiredSet = new Set(schema.required ? (schema.required as string[]).map(x => x.toLowerCase()) : []);
      Object.entries(schema.properties as Record<string, Partial<ModuleActionParam>>).forEach(([name, property]) => {
        const propertyType = property.type as ModuleActionParam['type'] | 'integer' | undefined;
        params.push({
          ...property,
          name,
          role: 'body',
          required: property.required ?? requiredSet.has(name.toLowerCase()),
          type: propertyType === 'integer' ? 'number' : propertyType ?? 'string',
        });
      });
    } else {
      params.push({
        name: 'data',
        role: 'body',
        required: true,
        type: schema.type as 'string' | 'number' | 'boolean',
      });
    }
  }
  return params;
}

/**
 * 返回当前运行时注册表中的所有模块名。
 *
 * 顺序与模块写入注册表的顺序一致；包括内置模块和通过 {@link defineModules} 追加的用户模块。
 *
 * @returns 模块名数组（保留原始大小写）。
 */
export function getModuleNames(): string[] {
  return getModulesState().map((module) => module.name);
}

/**
 * 判断模块名是否已注册。
 *
 * @param moduleName - 模块名；匹配大小写不敏感。
 * @returns 已注册返回 `true`，否则 `false`。
 */
export function isModuleName(moduleName: string): boolean {
  return getModuleMapState().has(moduleName.toLowerCase());
}

/**
 * 获取对象属性。
 *
 * @param objectType - 对象类型。
 * @returns 对象属性。
 */
export function getObjectProps(objectType: string): Record<string, string> {
  return objectProps[objectType] ?? {};
}
