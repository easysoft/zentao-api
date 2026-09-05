import type { ZentaoClient } from '../client/index.js';
import type { ProcessListOptions, ProcessSingleOptions } from './data.js';

/** SDK 进程级全局默认选项，供高阶 {@link request} 调用复用。 */
export interface GlobalOptions {
  /** 当前禅道正式版本，例如 `biz13.5`；普通高阶请求直接使用，单次强制刷新时使用实际版本。不会自动写入 profile。 */
  version?: string;
  /** 配置网络或响应获取失败时，允许登录继续或高阶请求跳过版本检查，默认 false；不忽略版本不匹配、格式错误或存储错误。 */
  skipVersionCheckOnConfigError?: boolean;
  /** 默认客户端；通常由 `ZentaoClient.init()` 设置。 */
  client?: ZentaoClient;
  /** 默认每页记录数，会映射到模块动作的 `recPerPage` 参数。 */
  recPerPage?: string;
  /** 默认限制返回列表数量，只影响 SDK 归一化后的 `data`。 */
  limit?: string;
  /** 默认请求超时时间，优先级低于单次请求选项。 */
  timeout?: number;
  /** 默认 TLS 跳过证书验证选项；仅 Node.js 运行时支持。 */
  insecure?: boolean;
  /** 是否在登录成功后把账号、Token 和配置持久化为本地 profile。 */
  persistProfiles?: boolean;
  /** 当禅道服务端返回 `{ status: "fail" }` 时是否抛出 `E_API_FAILED`，默认 false。 */
  throwOnFail?: boolean;
  /**
   * 是否在执行 `update` 操作时自动填充未传入的字段，默认 false。
   *
   * 优先级低于单次请求选项；语义见 {@link RequestOptions.autoFill}。
   */
  autoFill?: boolean;
}

/** 高阶 `request("moduleName")` / `request("moduleName/methodName")` / `request("moduleName/<objectID>")` 的单次调用选项。 */
export interface RequestOptions extends ProcessListOptions {
  /** 强制刷新服务器配置并用实际版本校验本次请求，优先于全局 version；不会改写全局版本。 */
  forceRefreshConfig?: boolean;
  /** 配置网络或响应获取失败时跳过本次版本检查；优先于全局设置，默认 false，不忽略版本不匹配或格式错误。 */
  skipVersionCheckOnConfigError?: boolean;
  /** 本次调用使用的客户端；优先级高于全局客户端。 */
  client?: ZentaoClient;
  /** 本次调用使用的每页记录数，优先级高于全局 `recPerPage`。 */
  recPerPage?: string;
  /** 本次调用超时时间。 */
  timeout?: number;
  /** 本次调用 TLS 跳过证书验证选项；仅 Node.js 运行时支持。 */
  insecure?: boolean;
  /** 单个本地文件或 Blob 上传的最大字节数，默认 50 MiB。 */
  maxUploadBytes?: number;
  /** 单条对象转换函数，在字段摘取前执行；列表转换请使用 `convert`。 */
  convertSingle?: ProcessSingleOptions['convert'];
  /**
   * 当禅道服务端返回 `{ status: "fail" }` 时是否抛出 `E_API_FAILED`。
   * 不传时回落到全局 `throwOnFail`，默认 false（保留原始失败响应）。
   */
  throwOnFail?: boolean;

  /**
   * 是否在执行 `update` 操作时自动填充未传入的字段。
   *
   * 设为 `true` 后，会先 GET 当前对象，把用户未显式传入（含 `params.data`）且
   * 动作 body schema 中声明的字段用现值补齐，再发起 PUT，避免禅道用空值覆盖未提交字段。
   * 因此只需传想修改的字段即可。仅对 `type: 'update'` 且模块存在 `type: 'get'` 动作时生效。
   *
   * 只有模块中存在与 update 路径相同的 GET 动作时才会预取；否则直接发送更新请求。
   * 不传时回落到全局 `autoFill`，默认 false。
   */
  autoFill?: boolean;

  /** 是否返回原始响应体，默认 false。 */
  raw?: boolean;
}

export type RequestProcessOptions = ProcessListOptions & Pick<RequestOptions, 'convertSingle'>;
