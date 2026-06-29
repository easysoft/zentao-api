import type { HttpMethod } from './client.js';
import type { Pager } from './response.js';

/** 模块动作类型：基础 CRUD 或自定义动作。 */
export type ModuleActionType = 'list' | 'get' | 'create' | 'update' | 'delete' | 'action';
/** 模块动作使用的 HTTP 方法；兼容生成定义中的小写方法。 */
export type ModuleActionMethod = HttpMethod | Lowercase<HttpMethod>;
/** 模块动作名称，允许除基础动作外的自定义名称。 */
export type ModuleActionName = ModuleActionType | (string & {});
/** 模块动作参数可选项。 */
export type ModuleActionParamOption = { readonly value: unknown; readonly label: string };

/** 模块动作的查询参数定义。 */
export interface ModuleActionParam {
  /** 参数名称。 */
  name: string;
  /** 参数说明。 */
  description?: string;
  /** 是否必填。 */
  required?: boolean;
  /** 未显式传入时使用的默认值。 */
  defaultValue?: unknown;
  /** 参数值类型，用于基础类型转换。 */
  type?: 'string' | 'number' | 'boolean';
  /** 参数可选值。 */
  options?: readonly ModuleActionParamOption[];
}

/** 模块动作结果形态。 */
export type ModuleActionResultType = 'text' | 'object' | 'list';
/** 列表分页信息别名。 */
export type ListPagerInfo = Pager;

/** 模块动作请求体定义。 */
export interface ModuleActionRequestBody {
  /** 请求体类型。 */
  type?: 'object' | 'string';
  /** 请求体是否必填。 */
  required?: boolean;
  /** OpenAPI 风格 schema，用于从 params 组装 body。 */
  schema: Readonly<Record<string, unknown>>;
  /** 请求体示例。 */
  example?: unknown;
}

/** 模块动作响应定义。 */
export interface ModuleActionResponse {
  /** 响应说明。 */
  description?: string;
  /** 响应 schema。 */
  schema: Readonly<Record<string, unknown>>;
  /** 响应示例。 */
  example?: unknown;
}

/** 从原始响应中提取分页字段时使用的字段映射。 */
export interface ModuleActionPagerGetterMap {
  /** 当前页码字段名。 */
  pageID: string;
  /** 每页记录数字段名。 */
  recPerPage: string;
  /** 总记录数字段名。 */
  recTotal: string;
}

/** 禅道模块中的单个 API 动作定义。 */
export interface ModuleAction {
  /** 动作名称，例如 `list`、`get`、`close`。 */
  name: ModuleActionName;
  /** 动作类型，决定高阶 request 的路径/参数解析策略，并在 `method`、`resultType` 省略时作为推导依据。 */
  type: ModuleActionType;
  /** 面向用户展示的动作名称。 */
  display?: string;
  /** 动作说明。 */
  description?: string;
  /**
   * HTTP 方法；省略时按 {@link type} 自动推导：
   * `list`/`get` → `GET`、`create`/`action` → `POST`、`update` → `PUT`、`delete` → `DELETE`。
   * 当 `type` 无法推导出方法时抛出 `E_INDETERMINATE_ACTION_METHOD`。
   */
  method?: ModuleActionMethod;
  /** API 路径模板，可包含 `{productID}` 等路径参数。 */
  path: string;
  /** 路径参数定义；字符串为说明，对象可携带默认值和可选项。 */
  pathParams?: Readonly<Record<string, string | Omit<ModuleActionParam, 'name'>>>;
  /** 查询参数定义。 */
  params?: readonly ModuleActionParam[];
  /** 请求体定义。 */
  requestBody?: ModuleActionRequestBody;
  /**
   * 结果形态；省略时按 {@link type} 自动推导：
   * `list` → `list`、`get`/`create`/`update` → `object`、`delete`/`action` → `text`。
   * 当 `type` 无法推导出结果形态时抛出 `E_INDETERMINATE_ACTION_RESULT_TYPE`。
   */
  resultType?: ModuleActionResultType;
  /** 从原始响应中提取分页信息的位置或函数。 */
  pagerGetter?: string | ModuleActionPagerGetterMap | ((data: unknown, params: Record<string, unknown>) => ListPagerInfo);
  /** 从原始响应中提取业务数据的位置或函数。 */
  resultGetter?: string | Record<string, string> | ((data: unknown, params: Record<string, unknown>) => unknown);
}

/** 内置模块名称，同时允许用户扩展自定义模块名。 */
export type ModuleName =
  | 'user'
  | 'program'
  | 'product'
  | 'project'
  | 'execution'
  | 'productplan'
  | 'story'
  | 'epic'
  | 'requirement'
  | 'bug'
  | 'testcase'
  | 'task'
  | 'feedback'
  | 'ticket'
  | 'system'
  | 'build'
  | 'testtask'
  | 'release'
  | 'file'
  | (string & {});

/** 禅道模块定义，由多个动作组成。 */
export interface ModuleDefinition {
  /** 模块名称，例如 `product`、`bug`。 */
  name: ModuleName;
  /** 面向用户展示的模块名称。 */
  display?: string;
  /** 模块说明。 */
  description?: string;
  /** 模块支持的动作集合。 */
  actions: readonly ModuleAction[];
}

/** 将模块动作和参数解析后的可执行请求描述。 */
export interface ResolvedModuleCommand {
  /** 模块名称。 */
  module: string;
  /** 匹配到的动作定义。 */
  action: ModuleAction;
  /** 原始调用参数。 */
  params: Record<string, unknown>;
  /** 已替换路径参数后的 API 路径。 */
  path: string;
  /** 已组装的查询参数。 */
  query?: Record<string, string | number>;
  /** 已组装的请求体。 */
  data?: Record<string, unknown>;
  /** 从 `id` 或 `{module}ID` 推断出的对象 ID。 */
  id?: number;
}
