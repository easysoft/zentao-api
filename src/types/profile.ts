import type { ServerConfig } from './response.js';

/**
 * 保存到本地 profile 中的客户端偏好配置。
 * SDK 自动恢复 `timeout` / `insecure`；其余字段仅供上层应用读取和解释。
 * 自定义值应使用 JSON 数据，不保留 Date、Map 等类型信息，不支持 BigInt 或循环对象。
 */
export interface ZentaoProfileConfig {
  /** 默认输出格式，供 CLI 等上层应用复用。 */
  defaultOutputFormat?: 'markdown' | 'json' | 'raw';
  /** 上层应用的界面语言，SDK 不自动应用。 */
  lang?: string;
  /** 上层应用的默认分页大小；SDK 请求分页使用 `recPerPage` 选项。 */
  defaultRecPerPage?: number;
  /** 是否跳过 TLS 证书验证；仅 Node.js 运行时支持。 */
  insecure?: boolean;
  /** 请求超时时间，单位毫秒。 */
  timeout?: number;
  /** 上层应用是否在批量操作出错时停止执行后续操作。 */
  batchFailFast?: boolean;
  /** 上层应用格式化 JSON 时是否添加缩进。 */
  jsonPretty?: boolean;
  /** 上层应用的模块级分页偏好，SDK 不自动应用。 */
  pagers?: Record<string, number>;
  /** 允许上层应用保存 JSON 格式的自定义配置。 */
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
  /** 成功从 `?mode=getconfig` 获取配置的本地 ISO 时间；缺失时缓存需要刷新。 */
  serverConfigFetchedAt?: string;
  /** 客户端自定义配置。 */
  config?: ZentaoProfileConfig;
  /** 允许上层应用保存 JSON 格式的额外字段，不保留 Date、Map 等类型信息，不支持 BigInt 或循环对象。 */
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
