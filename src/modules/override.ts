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
  extendModuleAction('task', 'list', (action) => {
    action.path = '/executions/{executionID}/tasks';
    action.pathParams = {
      executionID: '执行ID',
    };
    return action;
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

  // execution-create 支持创建阶段
  extendModuleAction('execution', 'create', (action) => {
    const properties = action.requestBody!.schema?.properties as Record<string, unknown>;
    if(properties) {
      if (!properties.type) {
        properties.type = {
          type: 'string',
          description: '类型(sprint 迭代，敏捷项目用 | stage 阶段，瀑布/IPD 用 | kanban 看板)',
        };
      }
      if (!properties.attribute) {
        properties.attribute = {
          type: 'string',
          description: [
            '阶段属性：mix - 综合（父阶段可挂不同类型子阶段）',
            'request - 需求（不关联需求、不测、不构建、不导入 Bug）',
            'design - 设计（不测、不构建、不 DevOps）',
            'dev - 开发（功能完整，可需求、任务、测试、构建）',
            'qa - 测试（同上，偏测试）',
            'release - 发布（同上，偏发布）',
            'review - 总结评审（最严：不关联需求、不测、不构建）',
            'other - 其他（无上述专项限制）'
          ].join(' | '),
        };
      }
      if (!properties.milestone) {
        properties.milestone = {
          type: 'integer',
          description: '是否里程碑(0 否| 1 是)',
          format: 'int32'
        };
      }
      if (!properties.parent) {
        properties.parent = {
          type: 'integer',
          description: '父级项目',
          format: 'int32'
        };
      }
    }
    return action;
  });

  // 为 task/create|update 补充 parent 字段（创建子任务）
  ['create', 'update'].forEach((actionName) => {
    extendModuleAction('task', actionName, (action) => {
      const properties = action.requestBody?.schema?.properties as Record<string, Record<string, unknown>>;
      if (properties && !properties.parent) {
        properties.parent = {
          type: 'integer',
          description: '父任务',
          format: 'int32',
        };
      }
      return action;
    });
  });

  // OpenAPI 使用 JSON 描述 SDK 的本地文件路径入参，但实际请求仍需转换为 multipart/form-data
  extendModuleAction('file', 'create', (action) => {
    if (action.requestBody) {
      action.requestBody.mediaType = 'multipart/form-data';
      const properties = action.requestBody.schema?.properties as Record<string, Record<string, unknown>>;
      if (properties?.file) properties.file.format = 'binary';
    }
    return action;
  });

  // 修改 BUG 列表选项
  extendModuleAction('bug', 'list', (action) => {
    const params = action.params;
    const browseTypeParam = params?.find((param) => param.name === 'browseType');
    if (browseTypeParam && browseTypeParam.options?.length) {
      const options = browseTypeParam.options;
      const assignedtomeOption = options.find(x => x.value === 'assignedtome');
      if (assignedtomeOption) {
        browseTypeParam.options = [
          ...options.filter(x => x !== assignedtomeOption),
          {
            ...assignedtomeOption,
            value: 'assigntome',
          }
        ];
      }
      if (!browseTypeParam.options.some(x => x.value === 'resolvedbyme')) {
        browseTypeParam.options = [
          ...browseTypeParam.options,
          {
            value: 'resolvedbyme',
            label: '由我解决',
          }
        ];
      }
    }
    return action;
  });
}
