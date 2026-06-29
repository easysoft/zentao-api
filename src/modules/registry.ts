// 模块注册表的统一出入口（barrel）。
// 实际实现按职责拆分：
// - ./registry-store —— 共享运行时状态与 克隆/冻结/合并/校验 等底层原语（内部使用）。
// - ./define         —— 定义/写入模块（defineModules / defineModuleActions / resetModuleDefinitions）。
// - ./override       —— 内置覆盖/扩展（基于 define，随 SDK 发布并在加载/重置时自动应用）。
// - ./query          —— 获取模块信息（getModule / getModuleAction / getModuleNames / isModuleName）。
import { BUILTIN_MODULES } from './generated.js';
import { applyBuiltinOverrides } from './override.js';
import { setPostResetHook } from './registry-store.js';

export { BUILTIN_MODULES };
export const MODULES = BUILTIN_MODULES;

export {
  type DefineModulesOptions,
  defineModules,
  defineModuleActions,
  resetModuleDefinitions,
} from './define.js';

export { applyBuiltinOverrides };

// 内置覆盖接线：避免 define ↔ override 之间的循环依赖。
// - 加载时应用一次；
// - 注册为 store 的「重置后钩子」，使 resetModuleDefinitions 还原内置基线后自动重新应用。
setPostResetHook(applyBuiltinOverrides);
applyBuiltinOverrides();

export {
  getModule,
  getModuleAction,
  getModuleNames,
  isModuleName,
} from './query.js';
