import { ZentaoError } from '../misc/errors.js';
import { assertInsecureSupported, fetchWithInsecureTls } from '../misc/environment.js';
import { getGlobalOptions, setGlobalOptions } from '../misc/global-options.js';
import { addProfile, switchProfile } from '../profiles/index.js';
import { isRecord, normalizeSiteUrl } from '../utils/index.js';
import type {
  ClientRequestOptions,
  HttpMethod,
  LoginResponse,
  ServerConfig,
  ZentaoClientOptions,
  ZentaoProfileConfig,
} from '../types/index.js';

const DEFAULT_TIMEOUT = 10000;

/** 拼接 API 路径与查询参数，跳过值为 `undefined` 的查询项。 */
function buildUrl(baseUrl: string, path: string, query?: ClientRequestOptions['query']): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${baseUrl}${normalizedPath}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined) continue;
    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

/** 优先解析 JSON；非 JSON 响应保留为原始文本。 */
async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text === '') return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}


/** 禅道 API 客户端，负责 Token 注入、请求超时、TLS 选项和响应解析。 */
export class ZentaoClient {
  /** 禅道站点根地址，不包含 `/api.php/v2`。 */
  readonly siteUrl: string;
  /** 禅道 API v2 根地址。 */
  readonly baseUrl: string;
  private token?: string;
  private readonly timeout?: number;
  private readonly insecure?: boolean;

  /** 使用完整配置创建客户端。 */
  constructor(options: ZentaoClientOptions);
  /** 使用站点根地址创建客户端。 */
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
   * 默认使用 GET；当服务端返回 `{ status: "fail" }` 时仍按原始内容返回，
   * 只有 HTTP/网络/超时等传输层错误会抛出 {@link ZentaoError}。
   */
  async request(path: string, options: ClientRequestOptions = {}): Promise<unknown> {
    const globals = getGlobalOptions();
    const method: HttpMethod = options.method ?? 'GET';
    const timeout = options.timeout ?? globals.timeout ?? this.timeout ?? DEFAULT_TIMEOUT;
    const insecure = options.insecure ?? globals.insecure ?? this.insecure;
    assertInsecureSupported(insecure);
    const url = buildUrl(this.baseUrl, path, options.query);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers.Token = this.token;
    }

    const init: RequestInit = {
      method,
      headers,
      signal: controller.signal,
    };
    // GET 请求不携带 body，避免浏览器和部分代理拒绝请求。
    if (options.body && method !== 'GET') {
      init.body = JSON.stringify(options.body);
    }

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
      return parseResponse(response);
    } catch (error) {
      if (error instanceof ZentaoError) throw error;
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ZentaoError('E_TIMEOUT');
      }
      throw new ZentaoError('E_NETWORK_ERROR', { message: (error as Error).message ?? String(error) }, error);
    } finally {
      clearTimeout(timer);
    }
  }

  /** 发起 GET 请求并按调用方指定类型返回。 */
  async get<T>(path: string): Promise<T> {
    return this.request(path, { method: 'GET' }) as Promise<T>;
  }

  /** 发起 POST 请求并发送 JSON body。 */
  async post<T>(path: string, body: any): Promise<T> {
    return this.request(path, { method: 'POST', body }) as Promise<T>;
  }

  /** 发起 PUT 请求并发送 JSON body。 */
  async put<T>(path: string, body: any): Promise<T> {
    return this.request(path, { method: 'PUT', body }) as Promise<T>;
  }

  /** 发起 DELETE 请求。 */
  async delete<T>(path: string): Promise<T> {
    return this.request(path, { method: 'DELETE' }) as Promise<T>;
  }

  /** 使用账号密码登录，成功后把返回 Token 写入当前客户端实例。 */
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

  /** 创建客户端实例，语义等同于 `new ZentaoClient(options)`。 */
  static create(options: ZentaoClientOptions): ZentaoClient {
    return new ZentaoClient(options);
  }

  /** 创建客户端并写入全局选项，供高阶 `request()` 默认使用。 */
  static init(options: ZentaoClientOptions): ZentaoClient {
    const client = new ZentaoClient(options);
    setGlobalOptions({ client });
    return client;
  }

  /** 根据本地持久化 profile 创建客户端；不传 key 时使用当前 profile。 */
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

export function createClient(options: ZentaoClientOptions): ZentaoClient {
  return ZentaoClient.create(options);
}
