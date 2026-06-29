// 模块注册表的统一出入口（barrel）。
// 实际实现按职责拆分：
// - ./registry-store —— 共享运行时状态与 克隆/冻结/合并/校验 等底层原语（内部使用）。
// - ./define         —— 定义/写入模块（defineModules / defineModuleActions / resetModuleDefinitions）。
// - ./override       —— 内置覆盖/扩展（基于 define，随 SDK 发布并在加载/重置时自动应用）。
// - ./query          —— 获取模块信息（getModule / getModuleAction / getModuleNames / isModuleName）。
import { BUILTIN_MODULES } from './generated.js';

export { BUILTIN_MODULES };
export const MODULES = BUILTIN_MODULES;

export {
  type DefineModulesOptions,
  defineModules,
  defineModuleActions,
  resetModuleDefinitions,
} from './define.js';

export { applyBuiltinOverrides } from './override.js';

export {
  getModule,
  getModuleAction,
  getModuleNames,
  isModuleName,
} from './query.js';
