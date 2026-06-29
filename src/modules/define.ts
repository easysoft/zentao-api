import { ZentaoError } from '../misc/errors.js';
import type { ModuleAction, ModuleDefinition } from '../types/index.js';
import { asArray } from '../utils/index.js';
import {
  deepClone,
  deepMerge,
  findActionIndex,
  freezeAction,
  freezeModule,
  getModuleMapState,
  getModulesState,
  mergeModule,
  rebuildModuleMap,
  resetState,
  validateAction,
  validateModule,
} from './registry-store.js';

/** {@link defineModules} 的选项。 */
export interface DefineModulesOptions {
  /**
   * 同名模块的写入策略。
   *
   * - `false`（默认）：合并模块的元数据，并按动作名对动作做"同名替换、未知追加"。
   * - `true`：整体替换已存在的模块定义，原有动作会被丢弃。
   */
  replace?: boolean;
}

/**
 * 注册或扩展模块定义。
 *
 * 行为细节：
 * - 模块名匹配大小写不敏感。
 * - 未知模块直接追加到注册表末尾。
 * - 已存在的模块默认按 `mergeModule` 合并：模块元数据浅合并、动作按名同名替换/未知追加；
 *   `options.replace` 为 `true` 时整体替换。
 * - 所有写入都会做深克隆 + 深冻结：调用方后续修改自己的对象不会污染注册表，注册表也不可被外部改写。
 *
 * @param input - 单个或一组模块定义。
 * @param options - 写入策略，参见 {@link DefineModulesOptions}。
 * @throws {ZentaoError} `E_INVALID_MODULE_DEFINITION` —— 缺少 `name` 或 `actions` 字段。
 */
export function defineModules(input: ModuleDefinition | ModuleDefinition[], options: DefineModulesOptions = {}): void {
  const modules = getModulesState();
  for (const module of asArray(input)) {
    validateModule(module);
    const key = module.name.toLowerCase();
    const index = modules.findIndex((item) => item.name.toLowerCase() === key);
    if (index >= 0) {
      modules[index] = options.replace
        ? freezeModule(deepClone(module))
        : mergeModule(modules[index], module);
    } else {
      modules.push(freezeModule(deepClone(module)));
    }
  }
  rebuildModuleMap();
}

/**
 * 为已存在的模块追加或覆盖动作。
 *
 * 不做深度合并：同名动作整体替换，未知动作追加。这避免在 schema、参数数组等字段上出现隐式合并规则。
 *
 * `method` / `resultType` 可省略：写入时按动作 `type` 自动推导（见 {@link ModuleAction}）。
 *
 * @param moduleName - 目标模块名（大小写不敏感）。
 * @param input - 单个或一组动作定义。
 * @throws {ZentaoError} `E_INVALID_MODULE`（模块未注册）、`E_INVALID_ACTION_DEFINITION`
 *   （动作缺少 `name` / `path`，或 `method` / `resultType` 类型非法），或
 *   `E_INDETERMINATE_ACTION_METHOD` / `E_INDETERMINATE_ACTION_RESULT_TYPE`（省略字段且无法按 `type` 推导）。
 */
export function defineModuleActions(moduleName: string, input: ModuleAction | ModuleAction[]): void {
  const key = moduleName.toLowerCase();
  const module = getModuleMapState().get(key);
  if (!module) {
    throw new ZentaoError('E_INVALID_MODULE', { module: moduleName });
  }

  const actions: ModuleAction[] = module.actions.slice();
  for (const action of asArray(input)) {
    validateAction(action);
    const index = findActionIndex(actions, String(action.name));
    const frozen = freezeAction(deepClone(action));
    // 同名动作替换，未知动作追加；不做深度合并，避免 schema/数组字段出现隐式规则。
    if (index >= 0) {
      actions[index] = frozen;
    } else {
      actions.push(frozen);
    }
  }

  const nextModule = freezeModule({ ...module, actions });
  const modules = getModulesState();
  const index = modules.findIndex((item) => item.name.toLowerCase() === key);
  modules[index] = nextModule;
  rebuildModuleMap();
}

/**
 * 扩展已存在的模块动作。
 *
 * 与 {@link defineModuleActions} 的「整体替换」不同，这里对单个动作做**深度合并**：
 * 只需给出待修改的字段，其余字段沿用原动作定义。普通对象递归合并，
 * 数组及其他值由补丁整体替换，值为 `undefined` 的键会被忽略。
 *
 * 当 `action` 为函数时**不做合并**：会以当前动作的深克隆为入参调用它，
 * 其返回值作为完整的动作定义直接取代原动作定义。
 *
 * @param moduleName - 目标模块名（大小写不敏感）。
 * @param actionName - 目标动作名（大小写不敏感）。
 * @param action - 深度合并的补丁对象，或接收当前动作深克隆并返回完整动作定义的函数。
 * @throws {ZentaoError} `E_INVALID_MODULE`（模块未注册）、`E_INVALID_ACTION`（动作不存在）、
 *   `E_INVALID_ACTION_DEFINITION`（合并结果缺少 `name` / `path`，或 `method` / `resultType` 类型非法），
 *   或 `E_INDETERMINATE_ACTION_METHOD` / `E_INDETERMINATE_ACTION_RESULT_TYPE`（省略字段且无法按 `type` 推导）。
 */
export function extendModuleAction(
  moduleName: string,
  actionName: string,
  action: Partial<ModuleAction> | ((action: ModuleAction) => ModuleAction),
): void {
  const key = moduleName.toLowerCase();
  const module = getModuleMapState().get(key);
  if (!module) {
    throw new ZentaoError('E_INVALID_MODULE', { module: moduleName });
  }

  const actions: ModuleAction[] = module.actions.slice();
  const actionIndex = findActionIndex(actions, actionName);
  if (actionIndex < 0) {
    throw new ZentaoError('E_INVALID_ACTION', { module: moduleName, action: actionName });
  }

  const current = actions[actionIndex];
  // 函数：以当前动作的深克隆为入参，返回值作为完整动作定义直接取代原定义，不做合并。
  // 对象：作为补丁与原动作深度合并。
  const next = typeof action === 'function' ? action(deepClone(current)) : deepMerge(current, action);
  validateAction(next);
  actions[actionIndex] = freezeAction(next);

  const nextModule = freezeModule({ ...module, actions });
  const modules = getModulesState();
  const index = modules.findIndex((item) => item.name.toLowerCase() === key);
  modules[index] = nextModule;
  rebuildModuleMap();
}

/**
 * 将注册表重置为内置基线。
 *
 * 重置会触发 store 的「重置后钩子」，由 barrel（`./registry.ts`）在其中重新应用内置覆盖
 * （见 `./override.ts`），因此重置后内置扩展依旧生效。
 *
 * @internal
 */
export function resetModuleDefinitions(): void {
  resetState();
}
