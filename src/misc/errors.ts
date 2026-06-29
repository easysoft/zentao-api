/**
 * SDK 已知错误码到默认消息的映射表。
 *
 * 每条消息允许带 `{key}` 占位符，由 {@link ZentaoError} 构造时使用 `replacements`
 * 进行字面量替换。此对象使用 `as const`，可直接作为类型来源约束错误码。
 */
export const ERRORS = {
  E_INVALID_BASE_URL: 'Invalid ZenTao baseUrl.',
  E_NO_GLOBAL_CLIENT: 'No global client configured. Call ZentaoClient.init() or pass options.client.',
  E_HTTP_ERROR: 'HTTP request failed: {status} {statusText}',
  E_NETWORK_ERROR: 'Network request failed: {message}',
  E_TIMEOUT: 'Request timed out.',
  E_INSECURE_BROWSER: 'The insecure option is only supported in Node.js runtimes.',
  E_LOGIN_FAILED: 'ZenTao login failed.',
  E_INVALID_PROFILE: 'Invalid ZenTao profile.',
  E_NO_PROFILE: 'No ZenTao profile is configured.',
  E_PROFILE_NOT_FOUND: 'ZenTao profile not found: {profileKey}',
  E_PROFILE_STORAGE_INVALID: 'ZenTao profile storage is not valid JSON.',
  E_PROFILE_STORAGE_UNAVAILABLE: 'ZenTao profile storage is unavailable in this runtime.',
  E_INVALID_MODULE: 'Unknown module: {module}',
  E_INVALID_ACTION: 'Unknown action: {module}-{action}',
  E_INVALID_MODULE_DEFINITION: 'Invalid module definition.',
  E_INVALID_ACTION_DEFINITION: 'Invalid module action definition.',
  E_INDETERMINATE_ACTION_METHOD: 'Cannot infer HTTP method for action "{action}" from type "{type}"; specify "method" explicitly.',
  E_INDETERMINATE_ACTION_RESULT_TYPE: 'Cannot infer result type for action "{action}" from type "{type}"; specify "resultType" explicitly.',
  E_MISSING_PARAM: 'Missing required parameter: {param}',
  E_INVALID_PARAM: 'Invalid value for parameter {param}: {value}',
  E_INVALID_REQUEST_NAME: 'Request name must use the form "moduleName", "moduleName/methodName", or "moduleName/<objectID>".',
  E_API_FAILED: 'ZenTao API returned failure: {message}',
} as const;

/** SDK 已知错误码，对应 {@link ERRORS} 的 key。 */
export type ErrorCode = keyof typeof ERRORS;

/**
 * SDK 统一错误类型。
 *
 * 所有可预期错误（参数缺失、HTTP/网络/超时、登录失败、profile 异常等）都通过
 * `ZentaoError` 抛出并携带稳定 {@link ErrorCode}，方便调用方按 `code` 区分处理。
 * 错误消息默认来自 {@link ERRORS} 中的模板，并支持占位符替换。
 */
export class ZentaoError extends Error {
  /** 错误码，对应 {@link ERRORS} 的 key；用于稳定地区分错误类型。 */
  readonly code: ErrorCode;
  /** 附加上下文，例如 HTTP 响应详情、原始异常或失败的禅道响应原文。 */
  readonly details?: unknown;

  /**
   * 构造 SDK 错误实例。
   *
   * @param code - 错误码，必须是 {@link ERRORS} 中已声明的 key。
   * @param replacements - 可选的占位符替换值；遍历后会把 `{key}` 替换为字符串化的值。
   * @param details - 可选的附加上下文（HTTP 响应详情、原始异常等），保存到 {@link details}。
   */
  constructor(code: ErrorCode, replacements?: Record<string, string | number>, details?: unknown) {
    let message: string = ERRORS[code];
    if (replacements) {
      for (const [key, value] of Object.entries(replacements)) {
        message = message.replaceAll(`{${key}}`, String(value));
      }
    }
    super(message);
    this.name = 'ZentaoError';
    this.code = code;
    this.details = details;
  }
}
