import type { ZentaoClient } from '../client/index.js';

/**
 * 操作辅助工具标记，对应 `ZenTao-Action-Assistant` 请求头。
 * 字符串直接作为头值；对象去除字段首尾空白后序列化为 `name <info>`，没有详情时只发送名称。
 * 对象名称不能为空，名称和详情不能包含尖括号或控制字符；最终头值仍须符合原生 Headers 的限制。
 * 空字符串表示关闭标记；配置仅运行时有效，不保存到 profile。
 */
export type ActionAssistant = string | { name: string; info?: string };

/** 从本地 profile 恢复客户端时的选项。 */
export interface FromProfileOptions {
  /** 是否切换为当前 profile 并更新使用时间，默认 true；false 时恢复过程只读存储。 */
  activate?: boolean;
}

/** 创建 {@link ZentaoClient} 时使用的配置。 */
export interface ZentaoClientOptions {
  /** 禅道站点根地址，例如 `https://zentao.example.com`；SDK 会自动拼接 `/api.php/v2`。 */
  baseUrl: string;
  /** 禅道 API Token；未提供时可稍后通过 {@link ZentaoClient.login} 获取并写入实例。 */
  token?: string;
  /** 默认操作辅助工具标记；优先级低于全局和单次请求配置，默认不发送。 */
  actionAssistant?: ActionAssistant;
  /** 默认请求超时时间，单位毫秒。 */
  timeout?: number;
  /** 是否跳过 TLS 证书验证；仅 Node.js 运行时支持，浏览器中会抛错。 */
  insecure?: boolean;
}

/** SDK 支持的 HTTP 方法。 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/** 请求体序列化方式。 */
export type ClientRequestBodyType = 'json' | 'form' | 'raw';

/** 响应体解析方式。 */
export type ClientResponseType = 'auto' | 'json' | 'text' | 'arrayBuffer' | 'blob' | 'response';

/** `ZentaoClient.request()` 的单次请求选项。 */
export interface ClientRequestOptions {
  /** HTTP 方法，默认 `GET`。 */
  method?: HttpMethod;
  /** 请求体；`GET` 请求会忽略该字段。普通对象默认按 JSON 发送，`FormData` / `Blob` / `ArrayBuffer` 等会原样发送。 */
  body?: unknown;
  /** 请求体序列化方式。默认 `json`；传入 `FormData` 等原生 body 时会自动按 `raw` 处理。 */
  bodyType?: ClientRequestBodyType;
  /** 响应体解析方式。默认 `auto`，会优先尝试 JSON，失败后回落为文本；`response` 会让 signal 和 timeout 继续控制响应体。 */
  responseType?: ClientResponseType;
  /** 额外请求头；会与 SDK 自动注入的 `Token` / `Content-Type` 合并，同名助手头优先于全局和客户端默认值。 */
  headers?: HeadersInit;
  /** 本次操作辅助工具标记；优先于 headers 中的同名头、全局和客户端默认值。undefined 表示继承，空字符串表示关闭。 */
  actionAssistant?: ActionAssistant;
  /** URL 查询参数；对象和数组使用 deepObject 风格序列化，`undefined` 值会被跳过。 */
  query?: Record<string, unknown>;
  /** 外部取消信号；会与 SDK 自身的超时控制合并。 */
  signal?: AbortSignal;
  /** 单次请求超时时间，优先级高于全局和客户端默认值。 */
  timeout?: number;
  /** 单次请求 TLS 跳过证书验证选项；仅 Node.js 运行时支持。 */
  insecure?: boolean;
}

/** {@link ZentaoClient.getZentaoConfig} 的选项。 */
export interface GetZentaoConfigOptions extends Pick<ClientRequestOptions, 'timeout' | 'insecure' | 'signal'> {
  /** 忽略已有缓存并重新获取配置，默认 false；同一客户端的并发获取会合并。 */
  forceRefresh?: boolean;
}
