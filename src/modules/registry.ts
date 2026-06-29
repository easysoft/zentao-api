// 模块注册表的统一出入口（barrel）。
// 实际实现按职责拆分：
// - ./registry-store —— 共享运行时状态与 克隆/冻结/合并/校验 等底层原语（内部使用）。
// - ./define         —— 定义/写入模块（defineModules / defineModuleActions / resetModuleDefinitions）。
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

export {
  getModule,
  getModuleAction,
  getModuleNames,
  isModuleName,
} from './query.js';
