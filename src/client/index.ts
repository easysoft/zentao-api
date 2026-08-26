import { ZentaoError } from '../misc/errors.js';
import { assertInsecureSupported, fetchWithInsecureTls } from '../misc/environment.js';
import { getGlobalOptions, setGlobalOptions } from '../misc/global-options.js';
import { addProfile, switchProfile } from '../profiles/index.js';
import { isRecord, normalizeSiteUrl } from '../utils/index.js';
import type {
  ClientRequestOptions,
  ClientResponseType,
  HttpMethod,
  LoginResponse,
  ServerConfig,
  ZentaoClientOptions,
  ZentaoProfileConfig,
} from '../types/index.js';

const DEFAULT_TIMEOUT = 10000;

function appendQueryValue(search: URLSearchParams, key: string, value: unknown): void {
  if (value === undefined) return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => appendQueryValue(search, `${key}[${index}]`, item));
    return;
  }
  if (isPlainObject(value)) {
    for (const [childKey, childValue] of Object.entries(value)) {
      appendQueryValue(search, `${key}[${childKey}]`, childValue);
    }
    return;
  }
  search.append(key, value === null ? '' : String(value));
}

/** 拼接 API 路径与查询参数；结构化值使用 deepObject 风格的方括号键。 */
function buildUrl(baseUrl: string, path: string, query?: ClientRequestOptions['query']): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${baseUrl}${normalizedPath}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    appendQueryValue(url.searchParams, key, value);
  }

  return url.toString();
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isInstanceOfGlobal(value: unknown, name: 'FormData' | 'URLSearchParams' | 'Blob' | 'ReadableStream'): boolean {
  const ctor = globalThis[name];
  return typeof ctor === 'function' && value instanceof ctor;
}

function isArrayBufferBody(value: unknown): value is ArrayBuffer | ArrayBufferView {
  return value instanceof ArrayBuffer || ArrayBuffer.isView(value);
}

function appendFormValue(form: URLSearchParams, key: string, value: unknown): void {
  if (value === undefined) return;
  if (Array.isArray(value)) {
    for (const item of value) appendFormValue(form, key, item);
    return;
  }
  form.append(key, value === null ? '' : String(value));
}

function serializeBody(body: unknown, bodyType: ClientRequestOptions['bodyType'], headers: Headers): BodyInit | undefined {
  if (body === undefined || body === null) return undefined;

  if (isInstanceOfGlobal(body, 'ReadableStream')) {
    throw new ZentaoError('E_INVALID_PARAM', { param: 'body', value: 'ReadableStream' });
  }

  if (bodyType === 'form') {
    const form = body instanceof URLSearchParams ? body : new URLSearchParams();
    if (!(body instanceof URLSearchParams) && isPlainObject(body)) {
      for (const [key, value] of Object.entries(body)) appendFormValue(form, key, value);
    } else if (!(body instanceof URLSearchParams)) {
      throw new ZentaoError('E_INVALID_PARAM', { param: 'body', value: String(body) });
    }
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
    }
    return form;
  }

  if (
    bodyType === 'raw' ||
    typeof body === 'string' ||
    isArrayBufferBody(body) ||
    isInstanceOfGlobal(body, 'FormData') ||
    isInstanceOfGlobal(body, 'URLSearchParams') ||
    isInstanceOfGlobal(body, 'Blob')
  ) {
    return body as BodyInit;
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return JSON.stringify(body);
}

function createRequestSignal(timeout: number, externalSignal?: AbortSignal): {
  signal: AbortSignal;
  cleanup: () => void;
  didTimeout: () => boolean;
} {
  const controller = new AbortController();
  let timedOut = false;
  let cleaned = false;
  let timer: ReturnType<typeof setTimeout>;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    clearTimeout(timer);
    externalSignal?.removeEventListener('abort', abortFromExternal);
  };
  const abortFromExternal = () => {
    controller.abort(externalSignal?.reason);
    cleanup();
  };
  timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
    cleanup();
  }, timeout);
  timer.unref?.();

  if (externalSignal?.aborted) {
    abortFromExternal();
  } else {
    externalSignal?.addEventListener('abort', abortFromExternal, { once: true });
  }

  return {
    signal: controller.signal,
    cleanup,
    didTimeout: () => timedOut,
  };
}

interface ResponseCleanupState {
  readonly branches: Set<symbol>;
  readonly cleanup: () => void;
  complete: boolean;
}

function keepResponseSignalUntilBodyEnds(
  response: Response,
  cleanup: () => void,
  state: ResponseCleanupState = { branches: new Set(), cleanup, complete: false },
): Response {
  const branch = Symbol();
  state.branches.add(branch);
  let branchFinished = false;
  const finishBranch = (bodyComplete: boolean) => {
    if (branchFinished) return;
    branchFinished = true;
    state.branches.delete(branch);
    if (!state.complete && (bodyComplete || state.branches.size === 0)) {
      state.complete = true;
      state.cleanup();
    }
  };

  let prototype: object | null = response;
  let nativeBodyGetter: (() => ReadableStream<Uint8Array> | null) | undefined;
  while (prototype && !nativeBodyGetter) {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, 'body');
    if (descriptor?.get) {
      nativeBodyGetter = descriptor.get.bind(response) as () => ReadableStream<Uint8Array> | null;
    }
    prototype = Object.getPrototypeOf(prototype);
  }
  if (!nativeBodyGetter) {
    finishBranch(true);
    return response;
  }
  if (!nativeBodyGetter()) {
    finishBranch(true);
    return response;
  }

  let wrappedBody: ReadableStream<Uint8Array> | null | undefined;
  Object.defineProperty(response, 'body', {
    configurable: true,
    get() {
      const nativeBody = nativeBodyGetter();
      if (!nativeBody) {
        wrappedBody = null;
        finishBranch(true);
        return null;
      }
      if (wrappedBody === undefined) {
        let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
        const getReader = () => reader ??= nativeBodyGetter!()!.getReader();
        wrappedBody = new ReadableStream<Uint8Array>({
          type: 'bytes',
          async pull(controller) {
            let activeReader: ReadableStreamDefaultReader<Uint8Array>;
            try {
              activeReader = getReader();
            } catch (error) {
              controller.error(error);
              return;
            }
            try {
              const chunk = await activeReader.read();
              if (chunk.done) {
                finishBranch(true);
                const byobRequest = 'byobRequest' in controller ? controller.byobRequest : null;
                controller.close();
                byobRequest?.respond(0);
              } else {
                const value = new Uint8Array(chunk.value.byteLength);
                value.set(chunk.value);
                controller.enqueue(value);
              }
            } catch (error) {
              finishBranch(true);
              controller.error(error);
            }
          },
          async cancel(reason) {
            const activeReader = getReader();
            try {
              await activeReader.cancel(reason);
            } finally {
              finishBranch(false);
            }
          },
        }, { highWaterMark: 0 });
      }
      return wrappedBody;
    },
  });

  for (const name of ['arrayBuffer', 'blob', 'formData', 'json', 'text', 'bytes']) {
    const original = Reflect.get(response, name) as unknown;
    if (typeof original !== 'function') continue;
    Object.defineProperty(response, name, {
      configurable: true,
      value: (...args: unknown[]) => {
        if (wrappedBody?.locked) {
          return Promise.reject(new TypeError('Response body is locked.'));
        }
        const nativeBody = nativeBodyGetter();
        const canConsume = !response.bodyUsed && !nativeBody?.locked;
        const wrapperReader = canConsume ? response.body?.getReader() : undefined;
        let result: Promise<unknown>;
        try {
          result = Reflect.apply(original, response, args) as Promise<unknown>;
        } catch (error) {
          wrapperReader?.releaseLock();
          throw error;
        }
        if (!canConsume) return result;
        return result.then(
          (value) => {
            wrapperReader?.releaseLock();
            finishBranch(true);
            return value;
          },
          (error) => {
            wrapperReader?.releaseLock();
            if (response.bodyUsed) finishBranch(true);
            throw error;
          },
        );
      },
    });
  }

  const clone = response.clone.bind(response);
  Object.defineProperty(response, 'clone', {
    configurable: true,
    value: () => {
      if (wrappedBody?.locked) throw new TypeError('Response body is locked.');
      return keepResponseSignalUntilBodyEnds(clone(), cleanup, state);
    },
  });
  return response;
}

/** 按指定策略解析响应；默认优先 JSON，失败后保留原始文本。 */
async function parseResponse(response: Response, responseType: ClientResponseType = 'auto'): Promise<unknown> {
  if (responseType === 'response') return response;
  if (responseType === 'arrayBuffer') return response.arrayBuffer();
  if (responseType === 'blob') return response.blob();
  if (responseType === 'text') return response.text();
  if (responseType === 'json') {
    const text = await response.text();
    return text === '' ? undefined : JSON.parse(text);
  }

  const text = await response.text();
  if (text === '') return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}


/**
 * 禅道 API 客户端，封装一次次原始 HTTP 调用。
 *
 * 主要职责：
 * - 站点根地址规范化与 `/api.php/v2` 拼接
 * - 自动注入 `Token` 头
 * - 请求超时控制（基于 {@link AbortController}）
 * - 可选的 TLS 跳过校验（仅 Node.js 运行时）
 * - 响应体的 JSON 解析与错误归一化
 *
 * 适合直接调用裸 API；若希望按模块/动作名调用并自动组装路径、参数、分页，
 * 请改用 {@link request}。
 */
export class ZentaoClient {
  /** 禅道站点根地址，不包含 `/api.php/v2`。 */
  readonly siteUrl: string;
  /** 禅道 API v2 根地址，等于 `siteUrl + '/api.php/v2'`。 */
  readonly baseUrl: string;
  private token?: string;
  private readonly timeout?: number;
  private readonly insecure?: boolean;

  /**
   * 使用完整配置创建客户端。
   *
   * @param options - 客户端配置，参见 {@link ZentaoClientOptions}。
   * @throws {ZentaoError} `E_INVALID_BASE_URL` —— `baseUrl` 无法解析为合法的 http(s) URL。
   */
  constructor(options: ZentaoClientOptions);
  /**
   * 使用站点根地址创建客户端。
   *
   * @param baseUrl - 禅道站点根地址，例如 `https://zentao.example.com`；
   *   若误传 `/api.php/v2` 后缀会自动剥离。
   * @throws {ZentaoError} `E_INVALID_BASE_URL` —— 地址不合法或协议非 http(s)。
   */
  constructor(baseUrl: string);
  constructor(input: ZentaoClientOptions | string) {
    const options = typeof input === 'string' ? { baseUrl: input } : input;
    this.siteUrl = normalizeSiteUrl(options.baseUrl);
    this.baseUrl = `${this.siteUrl}/api.php/v2`;
    this.token = options.token;
    this.timeout = options.timeout;
    this.insecure = options.insecure;
  }

  /**
   * 发起一次原始 API 请求。
   *
   * 选项优先级：本次调用 `options` > 全局选项（{@link getGlobalOptions}） > 客户端构造时默认值。
   *
   * 特殊处理：
   * - 默认 HTTP 方法为 `GET`，`GET` 请求即使提供了 `options.body` 也不会发送，避免被部分代理/浏览器拒绝。
   * - 不自动跟随重定向，避免把 `Token` 或请求体转发到另一个地址。
   * - 非空响应优先按 JSON 解析；解析失败时回落为字符串原文。
   * - 业务层失败（即响应体 `{ status: "fail" }`）不会抛出，仍按原样返回；只有 HTTP/网络/超时等传输层错误才会抛错。
   * - `insecure` 仅在 Node.js 下可用，浏览器中传入会抛 `E_INSECURE_BROWSER`。
   *
   * @param path - 相对 {@link baseUrl} 的路径，可省略前导 `/`。
   * @param options - 单次请求选项，参见 {@link ClientRequestOptions}。
   * @returns 解析后的响应体；当响应为空字符串时返回 `undefined`。
   * @throws {ZentaoError} 可能抛出 `E_HTTP_ERROR`（非 2xx 状态）、`E_NETWORK_ERROR`（底层 fetch 失败）、
   *   `E_TIMEOUT`（超过 `timeout`）、`E_ABORTED`（外部信号取消）或
   *   `E_INSECURE_BROWSER`（浏览器中开启了 `insecure`）；传入 `ReadableStream` 请求体时会抛
   *   `E_INVALID_PARAM`。
   */
  async request(path: string, options: ClientRequestOptions & { responseType: 'response' }): Promise<Response>;
  async request(path: string, options: ClientRequestOptions & { responseType: 'arrayBuffer' }): Promise<ArrayBuffer>;
  async request(path: string, options: ClientRequestOptions & { responseType: 'blob' }): Promise<Blob>;
  async request<T = unknown>(path: string, options?: ClientRequestOptions): Promise<T>;
  async request(path: string, options: ClientRequestOptions = {}): Promise<unknown> {
    const globals = getGlobalOptions();
    const method: HttpMethod = options.method ?? 'GET';
    const timeout = options.timeout ?? globals.timeout ?? this.timeout ?? DEFAULT_TIMEOUT;
    const insecure = options.insecure ?? globals.insecure ?? this.insecure;
    assertInsecureSupported(insecure);
    const url = buildUrl(this.baseUrl, path, options.query);

    const headers = new Headers(options.headers);
    if (this.token) {
      headers.set('Token', this.token);
    }
    const init: RequestInit = {
      method,
      headers,
      redirect: 'manual',
    };
    // GET 请求不携带 body，避免浏览器和部分代理拒绝请求。
    if (options.body !== undefined && method !== 'GET') {
      init.body = serializeBody(options.body, options.bodyType, headers);
    }

    // 先完成同步序列化，再启动计时器，避免序列化失败遗留活动 timer。
    const { signal, cleanup, didTimeout } = createRequestSignal(timeout, options.signal);
    init.signal = signal;

    let keepResponseSignal = false;
    try {
      const response = await fetchWithInsecureTls(insecure, url, init);
      if (!response.ok) {
        throw new ZentaoError('E_HTTP_ERROR', {
          status: response.status,
          statusText: response.statusText,
        }, {
          url: response.url,
          status: response.status,
          statusText: response.statusText,
          body: await response.text().catch(() => undefined),
        });
      }
      if (options.responseType === 'response') {
        keepResponseSignal = true;
        return keepResponseSignalUntilBodyEnds(response, cleanup);
      }
      return await parseResponse(response, options.responseType);
    } catch (error) {
      if (signal.aborted) {
        throw new ZentaoError(didTimeout() ? 'E_TIMEOUT' : 'E_ABORTED', undefined, error);
      }
      if (error instanceof ZentaoError) throw error;
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ZentaoError('E_ABORTED', undefined, error);
      }
      throw new ZentaoError('E_NETWORK_ERROR', { message: (error as Error).message ?? String(error) }, error);
    } finally {
      if (!keepResponseSignal) cleanup();
    }
  }

  /**
   * 发起 `GET` 请求。
   *
   * @typeParam T - 期望的响应体类型；调用方负责类型收窄，SDK 不做运行时校验。
   * @param path - 相对 {@link baseUrl} 的路径。
   * @returns 解析后的响应体（强转为 `T`）。
   * @throws {ZentaoError} 传输层失败时抛出，详见 {@link ZentaoClient.request}。
   */
  async get<T>(path: string, options: Omit<ClientRequestOptions, 'method' | 'body' | 'bodyType'> = {}): Promise<T> {
    return this.request(path, { ...options, method: 'GET' }) as Promise<T>;
  }

  /**
   * 发起 `POST` 请求，`body` 会被序列化为 JSON。
   *
   * @typeParam T - 期望的响应体类型。
   * @param path - 相对 {@link baseUrl} 的路径。
   * @param body - JSON 请求体，传入对象/数组将被 `JSON.stringify`。
   * @returns 解析后的响应体（强转为 `T`）。
   * @throws {ZentaoError} 传输层失败时抛出，详见 {@link ZentaoClient.request}。
   */
  async post<T>(path: string, body: unknown, options: Omit<ClientRequestOptions, 'method'> = {}): Promise<T> {
    return this.request(path, { ...options, method: 'POST', body }) as Promise<T>;
  }

  /**
   * 发起 `PUT` 请求，`body` 会被序列化为 JSON。
   *
   * @typeParam T - 期望的响应体类型。
   * @param path - 相对 {@link baseUrl} 的路径。
   * @param body - JSON 请求体。
   * @returns 解析后的响应体（强转为 `T`）。
   * @throws {ZentaoError} 传输层失败时抛出，详见 {@link ZentaoClient.request}。
   */
  async put<T>(path: string, body: unknown, options: Omit<ClientRequestOptions, 'method'> = {}): Promise<T> {
    return this.request(path, { ...options, method: 'PUT', body }) as Promise<T>;
  }

  /**
   * 发起 `DELETE` 请求。
   *
   * @typeParam T - 期望的响应体类型。
   * @param path - 相对 {@link baseUrl} 的路径。
   * @returns 解析后的响应体（强转为 `T`）。
   * @throws {ZentaoError} 传输层失败时抛出，详见 {@link ZentaoClient.request}。
   */
  async delete<T>(path: string, options: Omit<ClientRequestOptions, 'method' | 'body' | 'bodyType'> = {}): Promise<T> {
    return this.request(path, { ...options, method: 'DELETE' }) as Promise<T>;
  }

  /**
   * 使用账号密码登录禅道。
   *
   * 成功后会把返回的 Token 写入当前客户端实例（后续请求自动带上 `Token` 头）；
   * 当全局 `persistProfiles` 为真时，会同时把账号、Token、用户信息、服务端配置和
   * 客户端偏好（仅在显式设置过 `timeout` / `insecure` 时）持久化为本地 profile，
   * 并切换为当前 profile，方便下次通过 {@link ZentaoClient.fromProfile} 直接登录态恢复。
   *
   * @param account - 禅道用户账号。
   * @param password - 禅道用户密码（明文，仅在传输层 TLS 内使用）。
   * @returns 登录成功后返回的 API Token。
   * @throws {ZentaoError} `E_LOGIN_FAILED` —— 服务端返回 `status !== "success"` 或缺失 token；
   *   也可能因底层 {@link ZentaoClient.request} 而抛出 HTTP/网络/超时错误。
   */
  async login(account: string, password: string): Promise<string> {
    const response = await this.post<LoginResponse>('/users/login', { account, password });
    if (response.status !== 'success' || !response.token) {
      throw new ZentaoError('E_LOGIN_FAILED');
    }
    this.token = response.token;
    const globals = getGlobalOptions();
    if (globals.persistProfiles) {
      const config: ZentaoProfileConfig = {};
      const timeout = this.timeout ?? globals.timeout;
      const insecure = this.insecure ?? globals.insecure;
      if (timeout !== undefined) config.timeout = timeout;
      if (insecure !== undefined) config.insecure = insecure;

      await addProfile({
        server: this.siteUrl,
        account,
        token: response.token,
        user: isRecord(response.user) ? response.user : undefined,
        serverConfig: isRecord(response.serverConfig) ? response.serverConfig as ServerConfig : undefined,
        config: Object.keys(config).length > 0 ? config : undefined,
      });
    }
    return response.token;
  }

  /**
   * 创建客户端实例，语义等同于 `new ZentaoClient(options)`，便于链式调用。
   *
   * @param options - 客户端配置，参见 {@link ZentaoClientOptions}。
   * @returns 新建的客户端实例。
   * @throws {ZentaoError} 同 {@link ZentaoClient | 构造函数}：`E_INVALID_BASE_URL` 等。
   */
  static create(options: ZentaoClientOptions): ZentaoClient {
    return new ZentaoClient(options);
  }

  /**
   * 创建客户端并写入全局选项，作为 {@link request} 默认使用的实例。
   *
   * 适合应用入口处一次性完成初始化，后续 `request("module/action", params)` 可省略 `options.client`。
   * 多次调用会覆盖上一次的全局客户端。
   *
   * @param options - 客户端配置，参见 {@link ZentaoClientOptions}。
   * @returns 新建并已注册为全局默认的客户端实例。
   * @throws {ZentaoError} 同 {@link ZentaoClient | 构造函数}：`E_INVALID_BASE_URL` 等。
   */
  static init(options: ZentaoClientOptions): ZentaoClient {
    const client = new ZentaoClient(options);
    setGlobalOptions({ client });
    return client;
  }

  /**
   * 根据本地持久化 profile 创建客户端。
   *
   * 实际会调用 {@link switchProfile}：若 `profileKey` 存在则刷新其 `lastUsedTime` 并设为当前 profile；
   * 不传 `profileKey` 时使用当前 profile。Profile 中保存的 `timeout` / `insecure` 偏好也会被带回到客户端实例。
   *
   * @param profileKey - 可选的 profile key，格式为 `account@server`；不传时使用当前 profile。
   * @returns 用 profile 还原后的客户端实例。
   * @throws {ZentaoError} `E_NO_PROFILE`（无任何 profile 且未传 key）、`E_PROFILE_NOT_FOUND`（指定 key 不存在）、
   *   `E_PROFILE_STORAGE_UNAVAILABLE`（运行时无法访问持久化存储）。
   */
  static async fromProfile(profileKey?: string): Promise<ZentaoClient> {
    // switchProfile 会在内部读取存储、校验 key 并刷新 lastUsedTime 后写回，
    // 若 key 不存在会抛出 E_PROFILE_NOT_FOUND；不传 key 时由 switchCurrentProfile 处理。
    const activeProfile = await switchProfile(profileKey);
    return new ZentaoClient({
      baseUrl: activeProfile.server,
      token: activeProfile.token,
      timeout: typeof activeProfile.config?.timeout === 'number' ? activeProfile.config.timeout : undefined,
      insecure: typeof activeProfile.config?.insecure === 'boolean' ? activeProfile.config.insecure : undefined,
    });
  }
}
