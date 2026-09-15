import { extendModuleAction, defineModules, defineModuleActions } from './define.js';
import { extractResult } from './resolve.js';
import { snapshotToMarkdown } from '../utils/doc-helper/markdown.js';
import { isRecord } from '../utils/index.js';
import { request } from '../request/index.js';
import { ZentaoError } from '../misc/errors.js';
import type { HttpMethod, ModuleActionRequestCallback } from '../types/index.js';

/** 这些内置写接口要求 JSON，不能把 HTTP 200 的 PHP/SQL 错误文本视为成功。 */
const requestJSON: ModuleActionRequestCallback = async ({ request: command, body, bodyType, client, timeout, insecure }) => {
  const response = await client.request(command.path, {
    method: command.action.method!.toUpperCase() as HttpMethod,
    query: command.query, body, bodyType, timeout, insecure, responseType: 'response',
  });
  const responseText = await response.text();
  try {
    return JSON.parse(responseText);
  } catch {
    return {
      status: 'fail',
      message: `Invalid JSON response from ${command.module}/${command.action.name}.`,
      httpStatus: response.status,
      responseText,
    };
  }
};

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
 *   minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
 *       minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
  for (const [moduleName, actionName] of [['product', 'create'], ['product', 'update'], ['feedback', 'close']]) {
    extendModuleAction(moduleName, actionName, { request: requestJSON });
  }

  // 产品描述是字符串；仅修正该字段，保留上游 OpenAPI 数据和其他请求体字段。
  for (const actionName of ['create', 'update']) {
    extendModuleAction('product', actionName, (action) => {
      const properties = action.requestBody!.schema.properties as Record<string, Record<string, unknown>>;
      properties.desc.type = 'string';
      delete properties.desc.items;
      return action;
    });
  }

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

  // 需求创建和变更时，根据评审人决定是否进入评审流程。
  ['story', 'requirement', 'epic'].forEach((moduleName) => {
    ['create', 'change'].forEach((actionName) => {
      extendModuleAction(moduleName, actionName, (action) => {
        const schema = action.requestBody!.schema as {
          properties: Record<string, unknown>;
          required?: string[];
        };
        // 补齐 requirement/change 的评审人字段，并允许未传评审人时执行回调。
        schema.properties.reviewer ??= {
          type: 'array',
          items: { type: 'string' },
        };
        (schema.properties.reviewer! as { description?: string }).description = '评审人员，如果无需评审则不传';
        if (schema.required) {
          schema.required = schema.required.filter(name => name !== 'reviewer');
        }
        action.beforeRequest = async ({ data = {} }) => {
          const hasReviewer = Array.isArray(data.reviewer)
            && data.reviewer.some(reviewer => typeof reviewer === 'string' && reviewer.trim() !== '');
          if (hasReviewer) {
            data.status = 'reviewing';
          } else {
            data.needNotReview = '1';
          }
          return { data };
        };
        return action;
      });
    });
  });

  // confirmClose 是控制器参数，留在 JSON body 中会被误当成反馈表字段。
  extendModuleAction('feedback', 'close', {
    beforeRequest: async (command) => {
      const data = { ...command.data };
      const query = { ...command.query };
      if (Object.hasOwn(data, 'confirmClose')) {
        query.confirmClose = data.confirmClose;
        delete data.confirmClose;
      }
      return { data, query };
    },
  });

  // 确认表单会重置缺省字段；仅补齐可写字段，不回传详情中的其他属性。
  extendModuleAction('bug', 'confirm', {
    request: async ({ request: command, body, bodyType, client, timeout, insecure, options }) => {
      const data = { ...(body as Record<string, unknown>) };
      const fields = ['status', 'assignedTo', 'type', 'pri', 'deadline', 'mailto'];
      const missing = fields.filter(field => data[field] === undefined);
      if (missing.length) {
        const response = await request('bug/get', { id: command.id }, {
          client, timeout, insecure, throwOnFail: true,
          forceRefreshConfig: options.forceRefreshConfig,
          skipVersionCheckOnConfigError: options.skipVersionCheckOnConfigError,
        });
        const current = response.data;
        if (!isRecord(current) || missing.some(field => current[field] === undefined)) {
          throw new ZentaoError('E_API_FAILED', { message: 'Bug details are incomplete; confirmation was not sent.' });
        }
        for (const field of missing) {
          data[field] = field === 'mailto' && typeof current[field] === 'string'
            ? current[field].split(',').filter(Boolean)
            : current[field];
        }
      }
      if (typeof data.status !== 'string' || !data.status.trim()) {
        throw new ZentaoError('E_INVALID_PARAM', { param: 'status', value: String(data.status) });
      }
      // 已关闭 Bug 的指派人是特殊标记，API 会把它当成账号校验，需调用方明确指定。
      if (data.assignedTo === 'closed') {
        throw new ZentaoError('E_INVALID_PARAM', { param: 'assignedTo', value: 'closed' });
      }
      return requestJSON({ request: command, body: data, bodyType, client, timeout, insecure, options });
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

  // execution/create 补充 OpenAPI 尚未声明的里程碑字段
  extendModuleAction('execution', 'create', (action) => {
    const properties = action.requestBody!.schema?.properties as Record<string, unknown>;
    if(properties) {
      if (!properties.milestone) {
        properties.milestone = {
          type: 'integer',
          description: '是否里程碑(0 否| 1 是)',
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

  // 获取文档详情时支持将文档原始 JSON 内容转换为 Markdown
  extendModuleAction('doc', 'get', (action) => {
    const oldGetter = action.resultGetter;
    action.resultGetter = (data, params, options = {}) => {
      const result = oldGetter
        ? extractResult({ ...action, resultGetter: oldGetter }, data as Record<string, unknown>, params, options)
        : ((data as Record<string, unknown>).doc ?? data);
      if (!isRecord(result)) return result;

      const pick = options.pick;
      const pickAll = !pick?.length;
      const wantsContent = pickAll || pick.includes('content');
      const wantsRawContent = pickAll || pick.includes('rawContent');
      if (!wantsContent && !wantsRawContent) return result;

      const originalContent = result.content;
      try {
        if (wantsRawContent && (result.rawContent === undefined || result.rawContent === '')) {
          result.rawContent = originalContent;
        }
        if (wantsContent && result.contentType === 'doc') {
          const markdown = snapshotToMarkdown(originalContent as string);
          result.content = markdown;
        }
      } catch {
        // HTML、纯文本和无法识别的快照保持服务端原始字段不变。
      }
      return result;
    };
    return action;
  });

  // 定义获取需求层级操作
  defineModuleActions('story', {
    name: 'getGrades',
    minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
    display: '获取需求层级选项',
    type: 'list',
    method: 'get',
    path: '/storygrades',
    resultType: 'list',
    resultGetter: 'grades',
  });

  // 需求创建时支持设置需求层级
  extendModuleAction('story', 'create', (action) => {
    const properties = action.requestBody!.schema?.properties as Record<string, unknown>;
    if(properties && !properties.grade) {
      properties.grade = {
        type: 'integer',
        description: '需求层级，可用的需求层级可以通过 story-getGrades 操作获取',
      };
    }
    return action;
  });

  // 创建和修改任务时，任务类型字段
  ['create', 'update'].forEach((actionName) => {
    extendModuleAction('task', actionName, (action) => {
      const properties = action.requestBody!.schema?.properties as Record<string, unknown>;
      if(properties && !properties.type) {
        properties.type = {
          type: 'string',
          description: '任务类型（枚举：design 设计 | devel 开发 | request 需求 | test 测试 | study 研究 | discuss 讨论 | ui 界面 | affair 事务 | misc 其他）',
        };
      }
      return action;
    });
  });
}
