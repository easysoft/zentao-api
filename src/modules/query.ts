import { ZentaoError } from '../misc/errors.js';
import type { ModuleAction, ModuleDefinition } from '../types/index.js';
import { getModuleMapState, getModulesState } from './registry-store.js';

/**
 * 获取模块定义。
 *
 * 模块名匹配大小写不敏感。返回值是注册表内部的已深冻结引用（O(1) 查询、零拷贝），
 * 任何写入尝试在严格模式下会抛 `TypeError`；如需修改请使用 {@link defineModules}。
 *
 * @param moduleName - 模块名。
 * @returns 已注册的模块定义。
 * @throws {ZentaoError} `E_INVALID_MODULE` —— 模块未注册。
 */
export function getModule(moduleName: string): ModuleDefinition {
  const module = getModuleMapState().get(moduleName.toLowerCase());
  if (!module) {
    throw new ZentaoError('E_INVALID_MODULE', { module: moduleName });
  }
  return module;
}

/**
 * 获取指定模块下的某个动作。
 *
 * 解析顺序：
 * 1. `actionName === 'ls'` 时映射为 `list`（仅作为别名，不会修改注册表）。
 * 2. 在该模块的动作中按名称大小写不敏感匹配。
 * 3. 当请求的动作不是基础 CRUD（`list`/`get`/`create`/`update`/`delete`）时，
 *    额外允许命中 `type === 'action'` 的自定义动作（即使名字不在基础 CRUD 中）。
 *
 * 返回值同样是已深冻结的引用，请勿尝试修改。
 *
 * @param moduleName - 模块名（大小写不敏感）。
 * @param actionName - 动作名（大小写不敏感）；支持 `ls` 作为 `list` 的别名。
 * @returns 匹配到的动作定义。
 * @throws {ZentaoError} `E_INVALID_MODULE`（模块未注册）或 `E_INVALID_ACTION`（动作不存在）。
 */
export function getModuleAction(moduleName: string, actionName: string): ModuleAction {
  const module = getModule(moduleName);
  const normalized = actionName === 'ls' ? 'list' : actionName;
  const direct = module.actions.find((action) => String(action.name).toLowerCase() === normalized.toLowerCase());
  if (direct) return direct;

  const crud = new Set(['list', 'get', 'create', 'update', 'delete']);
  if (!crud.has(normalized)) {
    const custom = module.actions.find((action) => action.type === 'action' && String(action.name).toLowerCase() === normalized.toLowerCase());
    if (custom) return custom;
  }

  throw new ZentaoError('E_INVALID_ACTION', { module: moduleName, action: actionName });
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
