import { defineModuleActions, defineModules } from './define.js';

/**
 * 内置覆盖 / 扩展定义。
 *
 * 这里集中存放对自动生成注册表（`./generated.ts`）的手工扩展：补充缺失的模块动作、
 * 修正个别动作的元数据，或登记 OpenAPI 尚未覆盖的自定义模块。
 *
 * 与「用户运行时调用 {@link defineModules}」不同，这里的定义会在模块加载时自动应用，
 * 并在 {@link resetModuleDefinitions} 重置后重新应用，因此它们等同于**内置定义**，
 * 会随 SDK 一起发布。
 *
 * 维护约定：
 * - 不要修改 `./generated.ts`（它由 `scripts/update-registry.ts` 自动生成）。
 *   能通过更新 OpenAPI 数据解决的，优先走生成流程；只有生成器无法表达的扩展才写在这里。
 * - 复用 {@link defineModules} / {@link defineModuleActions} 的语义：
 *   - {@link defineModuleActions}：为**已存在**的模块追加动作（同名替换、未知追加）。
 *   - {@link defineModules}：登记**新模块**，或对已存在模块做合并 / 整体替换（`replace`）。
 * - 写入会自动深克隆 + 深冻结，无需自己处理不可变性。
 *
 * @example 为已存在的 `bug` 模块补充一个自定义动作：
 * ```ts
 * defineModuleActions('bug', {
 *   name: 'assignTo',
 *   display: '指派 Bug',
 *   type: 'action',
 *   method: 'put',
 *   path: '/bugs/{bugID}/assignto',
 *   resultType: 'text',
 *   pathParams: { bugID: 'Bug ID' },
 *   requestBody: {
 *     required: true,
 *     schema: {
 *       assignedTo: { type: 'string', description: '指派给' },
 *       comment: { type: 'string', description: '备注' },
 *     },
 *   },
 * });
 * ```
 *
 * @example 登记一个 OpenAPI 未覆盖的新模块：
 * ```ts
 * defineModules({
 *   name: 'custom',
 *   display: '自定义模块',
 *   actions: [
 *     {
 *       name: 'list',
 *       type: 'list',
 *       method: 'get',
 *       path: '/customs',
 *       resultType: 'list',
 *       pagerGetter: 'pager',
 *       resultGetter: 'customs',
 *     },
 *   ],
 * });
 * ```
 *
 * @internal
 */
export function applyBuiltinOverrides(): void {
  // 在此处添加内置扩展。默认无任何覆盖；按上方示例填入 defineModuleActions / defineModules 调用即可。
}
