import { extendModuleAction, defineModules } from './define.js';

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
  // 创建执行时，需要添加产品字段
  extendModuleAction('execution', 'create', (action) => {
    const required = action.requestBody!.schema?.required;
    if(Array.isArray(required) && !required.includes('products')) {
      required.push('products');
    }
    return action;
  });

  // 修改 story/update 字段定义
  extendModuleAction('story', 'update', (action) => {
    const properties = action.requestBody!.schema?.properties as Record<string, unknown>;

    // 为 story/update 增加 plan 字段
    if(properties && !properties.plan) {
      properties.plan = {
        type: 'integer',
        description: '所属计划',
        format: 'int32',
      };
    }

    // 修改 category 字段类型为 string
    if (properties && properties.category) {
      properties.category = {
        type: 'string',
        description: '类别',
      };
    }
    return action;
  });

  // 修改 task/list URL 定义
  extendModuleAction('task', 'list', {
    path: '/executions/{executionID}/tasks',
    pathParams: {
      executionID: '执行ID',
    },
  });

  // 修改 acl 字段默认值为 open
  [
    ['product', 'create'],
    ['product', 'update'],
    ['execution', 'create'],
    ['execution', 'update'],
  ].forEach(([moduleName, actionName]) => {
    extendModuleAction(moduleName, actionName, (action) => {
      const properties = action.requestBody!.schema?.properties as Record<string, Record<string, unknown>>;
      if(properties.acl && properties.acl.defaultValue === undefined) {
        properties.acl.defaultValue = 'open';
      }
      return action;
    });
  });
}
