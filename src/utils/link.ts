import { ZentaoError } from '../misc/errors.js';
import type { CreateLinkOptions, LinkProfile, LinkRequestType, ParseLinkOptions, ServerConfig, ZentaoLink } from '../types/index.js';
import { normalizeSiteUrl } from './url.js';

function requiredString(value: unknown, param: string): string {
  if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
    throw new ZentaoError('E_MISSING_PARAM', { param });
  }
  if (typeof value !== 'string') throw new ZentaoError('E_INVALID_PARAM', { param, value: String(value) });
  return value;
}

function configString(config: ServerConfig | undefined, name: string, fallback?: string): string {
  const value = config?.[name];
  if (value === undefined && fallback !== undefined) return fallback;
  // defaultView 可以为空，表示路径链接不添加视图扩展名。
  if (value === '' && (name === 'defaultView' || name === 'instCode')) return value;
  return requiredString(value, `profile.serverConfig.${name}`);
}

function requestType(value: unknown, param: string, allowAuto = false): LinkRequestType | 'auto' {
  const type = requiredString(value, param);
  if (type === 'GET' || type === 'PATH_INFO' || type === 'PATH_INFO2' || (allowAuto && type === 'auto')) return type;
  throw new ZentaoError('E_INVALID_PARAM', { param, value: type });
}

function sitePath(value: string, base: URL, param: string): URL {
  let url: URL;
  try {
    url = new URL(value, base);
  } catch {
    throw new ZentaoError('E_INVALID_PARAM', { param, value });
  }
  if (url.protocol !== base.protocol || url.origin !== base.origin || url.search || url.hash || url.username || url.password) {
    throw new ZentaoError('E_INVALID_PARAM', { param, value });
  }
  return url;
}

function linkContext(profile: LinkProfile) {
  const site = new URL(`${normalizeSiteUrl(requiredString(profile.server, 'profile.server'))}/`);
  const config = profile.serverConfig;
  const root = sitePath(configString(config, 'webRoot', site.pathname), site, 'profile.serverConfig.webRoot');
  root.pathname = `${root.pathname.replace(/\/+$/, '')}/`;
  const instCode = configString(config, 'instCode', '').replace(/^\/+|\/+$/g, '');
  if (instCode) {
    const instancePath = sitePath(`/${instCode}/`, root, 'profile.serverConfig.instCode').pathname;
    if (!root.pathname.endsWith(instancePath)) root.pathname += instancePath.slice(1);
  }
  const router = sitePath(configString(config, 'router', 'index.php'), root, 'profile.serverConfig.router').pathname;
  return { config, root, router, defaultView: configString(config, 'defaultView', 'html') };
}

function normalizeVars(vars: CreateLinkOptions['vars']): [string, string][] {
  if (!vars) return [];
  return (typeof vars === 'string' ? vars.split('&') : vars).map((item) => {
    if (typeof item !== 'string') return [item[0], item[1]];
    const equals = item.indexOf('=');
    return equals < 0 ? [item, ''] : [item.slice(0, equals), item.slice(equals + 1)];
  });
}

function parseParams(search: URLSearchParams): Record<string, string> {
  const values = new Map<string, string[]>();
  search.forEach((value, name) => {
    const group = values.get(name);
    if (group) group.push(value);
    else values.set(name, [value]);
  });
  // 单次聚合保持线性成本；无原型字典避免自定义路由参数名命中继承属性。
  const params: Record<string, string> = Object.create(null);
  for (const [name, group] of values) params[name] = group.join(',');
  return params;
}

/**
 * 根据 profile 的服务器配置创建禅道页面链接，同步执行且不访问存储或网络。
 *
 * 支持 GET、PATH_INFO、PATH_INFO2。默认生成完整网址，`relative: true` 返回站内路径。
 * `vars` 和 `params` 沿用页面 helper 的约定：调用方按需编码，SDK 不二次编码；不修改输入。
 *
 * @param profile - 使用 server 与 serverConfig，无需账号或 Token。
 * @param options - 页面模块、方法、参数与输出选项。
 * @returns 完整网址或站内路径。
 * @throws {ZentaoError} `E_MISSING_PARAM`（缺少必要路由配置或页面参数）、
 *   `E_INVALID_PARAM`（不支持的路由模式或非法配置路径）、`E_INVALID_BASE_URL`。
 */
export function createLink(profile: LinkProfile, options: CreateLinkOptions): string {
  const { config, root, router, defaultView } = linkContext(profile);
  const type = requestType(config?.requestType, 'profile.serverConfig.requestType');
  const moduleName = requiredString(options.moduleName, 'moduleName');
  const methodName = requiredString(options.methodName, 'methodName');
  const vars = normalizeVars(options.vars);
  const viewType = options.viewType || defaultView;
  const parts: string[] = [];
  let hasQuery = type === 'GET';
  if (type === 'GET') {
    const moduleVar = configString(config, 'moduleVar');
    const methodVar = configString(config, 'methodVar');
    const viewVar = configString(config, 'viewVar');
    parts.push(router, '?', moduleVar, '=', moduleName, '&', methodVar, '=', methodName);
    for (const [name, value] of vars) parts.push('&', name, '=', value);
    if (viewType && viewType !== defaultView) parts.push('&', viewVar, '=', viewType);
  } else {
    const fix = configString(config, 'requestFix');
    parts.push(type === 'PATH_INFO2' ? `${router.replace(/\/+$/, '')}/` : root.pathname, moduleName, fix, methodName);
    for (const [, value] of vars) parts.push(fix, value);
    if (viewType) parts.push('.', viewType);
  }
  for (const [name, value] of Object.entries(options.params ?? {})) {
    if (name.startsWith('$')) continue;
    parts.push(hasQuery ? '&' : '?', name, '=', value == null ? '' : String(value));
    hasQuery = true;
  }
  if (typeof options.hash === 'string') parts.push(options.hash.startsWith('#') ? '' : '#', options.hash);
  return (options.relative ? '' : root.origin) + parts.join('');
}

/**
 * 解析禅道页面链接，同步执行且不读取浏览器当前位置、存储或网络。
 *
 * 相对链接以 profile 的页面根路径为基准；同源页面目录和显式配置的入口路径属于内部链接。
 * 其他 origin、这些路径之外及非 HTTP(S) 链接标记为外链。
 * 默认使用 serverConfig.requestType，`requestType: 'auto'` 根据路由参数与入口路径识别。
 * GET 查询值会解码，同名值以逗号合并；路径变量保留编码并附加到 params 的 `$1`、`$2` 等键。
 *
 * @param profile - 使用 server 与 serverConfig，无需账号或 Token。
 * @param url - 完整网址或相对链接；空输入直接返回 `{ url }`。
 * @param options - 可覆盖路由模式或启用自动识别。
 * @returns 链接信息；外链仅包含原 url 和 external 标记。
 * @throws {ZentaoError} `E_MISSING_PARAM`（缺少必要路由配置）、`E_INVALID_PARAM`
 *   （不支持的路由模式或非法 URL/配置路径）、`E_INVALID_BASE_URL`。
 */
export function parseLink(profile: LinkProfile, url?: string, options: ParseLinkOptions = {}): ZentaoLink {
  if (!url) return { url };
  const { config, root, router, defaultView } = linkContext(profile);
  let resolved: URL;
  try {
    resolved = new URL(url, root);
  } catch {
    throw new ZentaoError('E_INVALID_PARAM', { param: 'url', value: url });
  }
  const routerPrefix = `${router.replace(/\/+$/, '')}/`;
  const atRoot = resolved.pathname === root.pathname || resolved.pathname === root.pathname.slice(0, -1);
  const atRouter = resolved.pathname === router || resolved.pathname === routerPrefix.slice(0, -1);
  const inRouter = atRouter || resolved.pathname.startsWith(routerPrefix);
  if (resolved.origin !== root.origin || !['http:', 'https:'].includes(resolved.protocol)
    || (!atRoot && !resolved.pathname.startsWith(root.pathname) && !inRouter)) {
    return { external: true, url };
  }
  let type = options.requestType === undefined
    ? requestType(config?.requestType, 'profile.serverConfig.requestType')
    : requestType(options.requestType, 'requestType', true);
  if (type === 'auto') {
    const moduleVar = configString(config, 'moduleVar');
    const methodVar = configString(config, 'methodVar');
    // 已有路径路由不受附加查询参数中的 m/f（或自定义名称）影响。
    if (atRouter) type = 'GET';
    else if (inRouter) type = 'PATH_INFO2';
    else if (atRoot && (resolved.searchParams.has(moduleVar) || resolved.searchParams.has(methodVar))) type = 'GET';
    else type = 'PATH_INFO';
  }
  const params = parseParams(resolved.searchParams);
  const vars: [string, string][] = [];
  const link: ZentaoLink = {
    url: /^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(url) ? resolved.href.replace(/^[^:]+:\/\/[^/]+/, '') : url,
    isOnlyBody: params.onlybody === 'yes',
    vars,
    hash: resolved.hash.slice(1),
    params,
    tid: params.tid || '',
    requestType: type,
  };
  if (type === 'GET') {
    const moduleVar = configString(config, 'moduleVar');
    const methodVar = configString(config, 'methodVar');
    const viewVar = configString(config, 'viewVar');
    link.moduleName = params[moduleVar] || 'index';
    link.methodName = params[methodVar] || 'index';
    link.viewType = params[viewVar] || defaultView;
    for (const [name, value] of Object.entries(params)) {
      if (name !== moduleVar && name !== methodVar && name !== viewVar && name !== 'onlybody' && name !== 'tid') {
        vars.push([name, value]);
      }
    }
  } else {
    const fix = configString(config, 'requestFix');
    let path = resolved.pathname;
    if (atRoot || atRouter || path === routerPrefix) path = '';
    else if (fix.includes('/')) path = path.slice((inRouter ? routerPrefix : root.pathname).length);
    else {
      path = path.replace(/\/+$/, '');
      path = path.slice(path.lastIndexOf('/') + 1);
    }
    const dot = path.lastIndexOf('.');
    link.viewType = dot < 0 ? defaultView : path.slice(dot + 1);
    const segments = (dot < 0 ? path : path.slice(0, dot)).split(fix);
    link.moduleName = segments[0] || 'index';
    link.methodName = segments[1] || 'index';
    for (let i = 2; i < segments.length; i++) {
      vars.push(['', segments[i]]);
      params[`$${i - 1}`] = segments[i];
    }
  }
  return link;
}
