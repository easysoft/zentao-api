import { extendModuleAction } from './define.js';

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
 * - 复用 {@link defineModuleActions} / {@link extendModuleAction} 的语义。
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

  // 修复 story/create、bug/create 等产品级创建接口的 productID 传递问题：
  // 服务端要求 productID 放在 URL 查询参数里，而不是请求体里，
  // 但 OpenAPI 定义将 productID 放在了 requestBody 中，且 action.params 为空。
  // 修复动作：
  //   1. 在 action.params 中补充 productID，让 buildQuery 把它拼到 URL query 上；
  //   2. 从 requestBody.schema 中移除 productID，避免 buildRequestBody 因缺少该字段而抛错。
  [
    ['story', 'create'],
    ['bug', 'create'],
  ].forEach(([moduleName, actionName]) => {
    extendModuleAction(moduleName, actionName, (action) => {
      const existing = action.params ?? [];
      const hasProductID = existing.some((p) => p.name === 'productID');
      if (!hasProductID) {
        const params = [{
          name: 'productID',
          required: true,
          type: 'number' as const,
          description: '产品ID（查询参数）',
        }, ...existing];
        action.params = params;
      }
      // 将 productID 从 requestBody 移到 query，避免 buildRequestBody 校验失败
      const schema = action.requestBody?.schema as {
        required?: string[];
        properties?: Record<string, unknown>;
      } | undefined;
      if (schema?.properties && 'productID' in schema.properties) {
        if (Array.isArray(schema.required)) {
          schema.required = schema.required.filter((key) => key !== 'productID');
        }
        delete schema.properties.productID;
      }
      return action;
    });
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

  // story/bug create 的 spec/steps 字段支持图片标记语法 ![alt](path)
  // 这些字段在 schema 中声明为 string 类型，CLI 会在上传图片后将路径替换为禅道图片标记
  [
    ['story', 'create'],
    ['bug', 'create'],
  ].forEach(([moduleName, actionName]) => {
    extendModuleAction(moduleName, actionName, (action) => {
      const properties = action.requestBody!.schema?.properties as Record<string, Record<string, unknown>> | undefined;
      if (!properties) return action;

      const contentFields = moduleName === 'story'
        ? ['spec', 'verify']
        : ['steps'];

      for (const field of contentFields) {
        const prop = properties[field];
        if (prop && typeof prop === 'object') {
          prop.description = `${prop.description ?? ''}（支持图片标记：![描述](本地路径)）`;
        }
      }
      return action;
    });
  });
}
