import { ZentaoError } from '../misc/errors.js';

/** 将用户传入的站点根地址规范化，兼容误传入 `/api.php/v2` 的场景。 */
export function normalizeSiteUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, '');
  if (!trimmed) throw new ZentaoError('E_INVALID_BASE_URL');

  const siteUrl = trimmed.replace(/\/api\.php\/v2$/i, '');
  let parsed: URL;
  try {
    parsed = new URL(siteUrl);
  } catch {
    throw new ZentaoError('E_INVALID_BASE_URL');
  }

  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.search || parsed.hash) {
    throw new ZentaoError('E_INVALID_BASE_URL');
  }

  return parsed.toString().replace(/\/+$/, '');
}

/**
 * 从禅道富文本图片的 `src` 提取文件 ID，支持路径路由和 GET 查询路由。
 *
 * @param url - 图片的相对路径或 HTTP(S) 地址。查询参数可使用 `&amp;` 分隔。
 * @param siteUrl - 禅道站点根地址，含安装目录。解析带域名的地址时必填。
 * @returns 正的安全整数 ID。地址无效、站点或路由不匹配时返回 `undefined`。
 */
export function extractFileIdFromUrl(url: string, siteUrl?: string): number | undefined {
  const src = typeof url === 'string' ? url.trim() : '';
  if (!src || /[\\\u0000-\u001f]/.test(src)) return undefined;

  let parsed: URL;
  try {
    let base = 'https://zentao.invalid/';
    if (/^(?:https?:)?\/\//i.test(src)) {
      if (!siteUrl) return undefined;
      base = `${normalizeSiteUrl(siteUrl)}/`;
    } else if (/^[a-z][a-z\d+.-]*:/i.test(src)) {
      return undefined;
    }
    parsed = new URL(src, base);
    if (!parsed.href.startsWith(base)) return undefined;
  } catch {
    return undefined;
  }

  let digits = /\/file-read-(\d+)\.[A-Za-z0-9]+$/.exec(parsed.pathname)?.[1];
  if (!digits) {
    if (!parsed.pathname.endsWith('/') && !parsed.pathname.endsWith('/index.php')) return undefined;
    const params = new URLSearchParams(parsed.search.replaceAll('&amp;', '&'));
    const isFileRead = (params.get('module') === 'file' && params.get('method') === 'read')
      || (params.get('m') === 'file' && params.get('f') === 'read');
    if (!isFileRead) return undefined;
    digits = params.get('fileID') ?? '';
    if (!/^\d+$/.test(digits)) return undefined;
  }
  const id = Number(digits);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
}
