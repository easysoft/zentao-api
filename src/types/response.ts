/** 高阶 `request()` 归一化后的返回数据。 */
export interface ResponseData<T = unknown> {
  /** 禅道服务端状态；非标准响应会按成功响应包装到 `data`。 */
  status: 'success' | 'fail';
  /** 禅道服务端返回的消息。 */
  message?: string;
  /** 原始消息字段；当服务端返回对象/数组等非字符串消息时保留在这里。 */
  rawMessage?: unknown;
  /** 服务端返回的业务错误码或状态码字段。 */
  apiCode?: string | number;
  /** 失败响应的原始对象，便于上层展示服务端返回的完整上下文。 */
  raw?: Record<string, unknown>;
  /** 根据模块动作 `resultGetter` 提取后的业务数据。 */
  data?: T;
  /** 统一分页信息。 */
  pager?: {
    /** 总记录数。 */
    total: number;
    /** 当前页码。 */
    page: number;
    /** 每页记录数。 */
    recPerPage: number;
  };
}

/** 禅道 API 原始分页结构。 */
export interface Pager {
  /** 总记录数。 */
  recTotal: number;
  /** 每页记录数。 */
  recPerPage: number;
  /** 总页数，部分接口不返回。 */
  pageTotal?: number;
  /** 当前页码。 */
  pageID: number;
}

/** 禅道 API 通用响应结构，允许携带任意业务字段。 */
export interface ApiResponse {
  /** 服务端返回状态。 */
  status: 'success' | 'fail';
  /** 服务端消息，可能是字符串、对象或数组。 */
  message?: unknown;
  /** 其他业务字段。 */
  [key: string]: unknown;
}

/** 禅道 API 列表响应结构。 */
export interface ApiListResponse extends ApiResponse {
  /** 原始分页信息。 */
  pager?: Pager;
}

/** 登录接口响应结构。 */
export interface LoginResponse extends ApiResponse {
  /** 登录成功后返回的 API Token。 */
  token?: string;
  /** 部分禅道环境会随登录响应返回用户信息。 */
  user?: Record<string, unknown>;
  /** 部分禅道环境会随登录响应返回服务端配置。 */
  serverConfig?: ServerConfig;
}

/** 禅道 `?mode=getconfig` 返回的服务端配置。 */
export interface ServerConfig {
  version: string;
  systemMode: string;
  sprintConcept: string;
  requestType: string;
  requestFix: string;
  moduleVar: string;
  methodVar: string;
  viewVar: string;
  sessionVar: string;
}
