import type { ZentaoProfile } from './profile.js';

/** 链接处理只使用站点地址与服务器配置，无需账号或 Token。 */
export type LinkProfile = Pick<ZentaoProfile, 'server' | 'serverConfig'>;

/** 禅道页面路由模式。 */
export type LinkRequestType = 'GET' | 'PATH_INFO' | 'PATH_INFO2';

/** 创建禅道页面链接的参数。参数名和参数值由调用方按需 URL 编码，SDK 不二次编码。 */
export interface CreateLinkOptions {
  /** 页面模块名，例如 `bug`。 */
  moduleName: string;
  /** 页面方法名，例如 `view`。 */
  methodName: string;
  /** 方法参数，支持 `bugID=1&from=list`、字符串数组或键值对数组；路径模式按顺序使用值。 */
  vars?: string | readonly string[] | readonly (readonly [string, string])[];
  /** 视图类型；默认使用服务器的 `defaultView`，未配置时为 `html`。 */
  viewType?: string;
  /** 锚点，可带前导 `#`；空字符串会添加结尾的 `#`。 */
  hash?: string;
  /** 始终追加到查询字符串的参数；跳过 `$` 开头的键，null/undefined 转为空值。 */
  params?: Record<string, unknown>;
  /** 返回以 `/` 开头的站内路径；优先于全局 relative，均未设置时为 false（完整网址）。 */
  relative?: boolean;
}

/** 解析禅道页面链接的选项。 */
export interface ParseLinkOptions {
  /** 默认使用服务器配置；`auto` 优先识别入口和路径路由，仅在站点根路径用查询参数识别 GET。 */
  requestType?: LinkRequestType | 'auto';
}

/** 解析得到的禅道链接；空输入和外链仅返回 url 及必要的 external 标记。 */
export interface ZentaoLink {
  /** 相对链接保留输入；站内完整网址转换为站内路径；外链保留输入。 */
  url?: string;
  /** 页面模块名，缺省为 `index`。 */
  moduleName?: string;
  /** 页面方法名，缺省为 `index`。 */
  methodName?: string;
  /** 是否位于其他 origin，或当前安装目录和显式配置的入口路径之外。 */
  external?: boolean;
  /** 查询参数 `onlybody` 是否为 `yes`。 */
  isOnlyBody?: boolean;
  /** 方法参数；GET 值已解码，路径值保留编码且参数名为空字符串。 */
  vars?: [string, string][];
  /** 不含前导 `#` 的锚点，保留编码。 */
  hash?: string;
  /** 已解码的查询参数，同名值以逗号连接；路径参数另存为 `$1`、`$2` 等，保留编码。 */
  params?: Record<string, string>;
  /** 查询参数 `tid`，缺省为空字符串。 */
  tid?: string;
  /** 视图类型。 */
  viewType?: string;
  /** 实际采用的路由模式。 */
  requestType?: LinkRequestType;
}
