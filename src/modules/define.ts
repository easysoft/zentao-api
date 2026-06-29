import { ZentaoError } from '../misc/errors.js';
import type { ModuleAction, ModuleDefinition } from '../types/index.js';
import { asArray } from '../utils/index.js';
import {
  deepClone,
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
 * @param moduleName - 目标模块名（大小写不敏感）。
 * @param input - 单个或一组动作定义。
 * @throws {ZentaoError} `E_INVALID_MODULE`（模块未注册）或 `E_INVALID_ACTION_DEFINITION`
 *   （动作缺少 `name` / `path` / `method` 等必填字段）。
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
