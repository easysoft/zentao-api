import type { ZentaoClient } from '../client/index.js';

/** 创建 {@link ZentaoClient} 时使用的配置。 */
export interface ZentaoClientOptions {
  /** 禅道站点根地址，例如 `https://zentao.example.com`；SDK 会自动拼接 `/api.php/v2`。 */
  baseUrl: string;
  /** 禅道 API Token；未提供时可稍后通过 {@link ZentaoClient.login} 获取并写入实例。 */
  token?: string;
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
  /** 响应体解析方式。默认 `auto`，会优先尝试 JSON，失败后回落为文本。 */
  responseType?: ClientResponseType;
  /** 额外请求头；会与 SDK 自动注入的 `Token` / `Content-Type` 合并。 */
  headers?: HeadersInit;
  /** URL 查询参数；`undefined` 值会被跳过。 */
  query?: Record<string, string | number | boolean | undefined>;
  /** 外部取消信号；会与 SDK 自身的超时控制合并。 */
  signal?: AbortSignal;
  /** 单次请求超时时间，优先级高于全局和客户端默认值。 */
  timeout?: number;
  /** 单次请求 TLS 跳过证书验证选项；仅 Node.js 运行时支持。 */
  insecure?: boolean;
}
