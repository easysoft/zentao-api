import type { ServerConfig } from './response.js';

/** 保存到本地 profile 中的客户端偏好配置。 */
export interface ZentaoProfileConfig {
  /** 默认输出格式，供 CLI 等上层应用复用。 */
  defaultOutputFormat?: 'markdown' | 'json' | 'raw';
  /** 界面语言。 */
  lang?: string;
  /** 默认分页大小。 */
  defaultRecPerPage?: number;
  /** 是否跳过 TLS 证书验证；仅 Node.js 运行时支持。 */
  insecure?: boolean;
  /** 请求超时时间，单位毫秒。 */
  timeout?: number;
  /** 是否在批量操作出错时停止执行后续操作。 */
  batchFailFast?: boolean;
  /** JSON 格式化时是否添加缩进。 */
  jsonPretty?: boolean;
  /** 模块级分页偏好。 */
  pagers?: Record<string, number>;
  /** 允许上层应用保存自定义配置。 */
  [key: string]: unknown;
}

/** 本地持久化的禅道账号 profile。 */
export interface ZentaoProfile {
  /** 禅道站点根地址，不包含 `/api.php/v2`。 */
  server: string;
  /** 用户账号。 */
  account: string;
  /** 禅道 API Token。 */
  token: string;
  /** 登录验证通过后得到的用户信息。 */
  user?: Record<string, unknown>;
  /** 登录时间。 */
  loginTime?: string;
  /** 最后使用时间。 */
  lastUsedTime?: string;
  /** 禅道服务端配置。 */
  serverConfig?: ServerConfig;
  /** 客户端自定义配置。 */
  config?: ZentaoProfileConfig;
  /** 允许上层应用保存额外字段。 */
  [key: string]: unknown;
}

/** 运行时返回的 profile，会额外带上 `account@server` 形式的 key。 */
export interface ZentaoProfileRecord extends ZentaoProfile {
  key: string;
}

/** 本地 profile 存储文件或浏览器 localStorage 中的 JSON 结构。 */
export interface ZentaoProfilesStore {
  /** 当前使用的 profile key。 */
  currentProfile?: string;
  /** 保存的 profile 列表。 */
  profiles: ZentaoProfile[];
}
