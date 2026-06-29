import { ZentaoError } from '../misc/errors.js';
import type { ModuleAction, ModuleDefinition } from '../types/index.js';
import { BUILTIN_MODULES } from './generated.js';

// 运行时注册表存放「深克隆 + 深冻结」后的模块定义：
// - 深克隆：避免用户后续修改自己的输入对象时污染注册表；
// - 深冻结：让 getModule / getModuleAction 可以零拷贝返回引用，
//   外部尝试改写会在严格模式下抛 TypeError，开销也降到 O(1) 查询。
//
// 该模块是「定义」（define）与「查询」（query）两侧共享的底层存储：
// - define 侧通过 mutate* 系列函数维护状态，并复用 freeze/clone/merge/validate 原语；
// - query 侧只读访问 modules / moduleMap。
let modules = freezeModules(cloneBuiltinModules());
let moduleMap = buildModuleMap(modules);

export function deepClone<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item)) as T;
  }
  if (value && typeof value === 'object' && !(value instanceof Function)) {
    const result: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value)) {
      result[key] = deepClone(nestedValue);
    }
    return result as T;
  }
  return value;
}

export function cloneBuiltinModules(): ModuleDefinition[] {
  return deepClone(BUILTIN_MODULES) as unknown as ModuleDefinition[];
}

export function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value;
  if (Object.isFrozen(value)) return value;
  for (const key of Object.keys(value)) {
    deepFreeze((value as Record<string, unknown>)[key]);
  }
  return Object.freeze(value);
}

export function freezeAction(action: ModuleAction): ModuleAction {
  return deepFreeze(action);
}

export function freezeModule(module: ModuleDefinition): ModuleDefinition {
  module.actions.forEach(freezeAction);
  return deepFreeze(module);
}

export function freezeModules(source: ModuleDefinition[]): ModuleDefinition[] {
  source.forEach(freezeModule);
  return source;
}

export function findActionIndex(source: readonly ModuleAction[], actionName: string): number {
  const key = actionName.toLowerCase();
  return source.findIndex((action) => String(action.name).toLowerCase() === key);
}

export function mergeActions(base: readonly ModuleAction[], extension: readonly ModuleAction[]): ModuleAction[] {
  const next: ModuleAction[] = base.slice();
  for (const action of extension) {
    const index = findActionIndex(next, String(action.name));
    const frozen = freezeAction(deepClone(action));
    if (index >= 0) {
      next[index] = frozen;
    } else {
      next.push(frozen);
    }
  }
  return next;
}

export function mergeModule(base: ModuleDefinition, extension: ModuleDefinition): ModuleDefinition {
  return freezeModule({
    ...base,
    ...deepClone(extension),
    actions: mergeActions(base.actions, extension.actions),
  });
}

export function buildModuleMap(source: readonly ModuleDefinition[]): Map<string, ModuleDefinition> {
  return new Map(source.map((module) => [module.name.toLowerCase(), module]));
}

export function validateModule(module: ModuleDefinition): void {
  if (!module || typeof module.name !== 'string' || !Array.isArray(module.actions)) {
    throw new ZentaoError('E_INVALID_MODULE_DEFINITION');
  }
}

export function validateAction(action: ModuleAction): void {
  if (!action || typeof action.name !== 'string' || typeof action.path !== 'string' || typeof action.method !== 'string') {
    throw new ZentaoError('E_INVALID_ACTION_DEFINITION');
  }
}

/** 当前运行时注册表中的模块数组（define 侧原地修改，query 侧只读）。 */
export function getModulesState(): ModuleDefinition[] {
  return modules;
}

/** 当前模块名（小写）到模块定义的查找表（O(1) 查询）。 */
export function getModuleMapState(): Map<string, ModuleDefinition> {
  return moduleMap;
}

/** 依据当前 modules 重建 moduleMap。所有写入完成后调用以保持二者一致。 */
export function rebuildModuleMap(): void {
  moduleMap = buildModuleMap(modules);
}

/** 将注册表重置为内置模块（深克隆 + 深冻结），并重建查找表。 */
export function resetState(): void {
  modules = freezeModules(cloneBuiltinModules());
  rebuildModuleMap();
}
