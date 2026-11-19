/** @internal 解析带安装目录的站点地址，兼容 API v2 根地址。 */
export function tryNormalizeSiteUrl(baseUrl: string): string | undefined {
  const trimmed = baseUrl.trim().replace(/\/+$/, '');
  const siteUrl = trimmed.replace(/\/api\.php\/v2$/i, '');
  let parsed: URL;
  try {
    parsed = new URL(siteUrl);
  } catch {
    return undefined;
  }

  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.search || parsed.hash) {
    return undefined;
  }

  return parsed.toString().replace(/\/+$/, '');
}

/** 禅道附件页面路由。只有路径式 read 链接提供文件后缀。 */
export interface ParsedFileUrl {
  fileID: number;
  method: 'read' | 'download';
  /** 小写后缀，不含点。查询路由的视图参数不代表文件格式。 */
  extension?: string;
}

type FileUrlMode = 'fileUrl' | 'imageSrc' | 'strict';

function fileQueryParams(url: URL, mode: FileUrlMode): URLSearchParams {
  if (mode === 'imageSrc') return url.searchParams;
  const search = url.search.replace(mode === 'strict' ? /&amp;/gi : /&amp;/g, '&');
  return search === url.search ? url.searchParams : new URLSearchParams(search);
}

/** @internal HTML src values are already entity-decoded and only identify read routes. */
export function parseFileRoute(url: string, siteUrl: string | undefined, source: FileUrlMode): ParsedFileUrl | undefined {
  const src = typeof url === 'string' ? url.trim() : '';
  if (!src || /[\\\u0000-\u001f]/.test(src)) return undefined;

  let parsed: URL;
  try {
    let base = 'https://zentao.invalid/';
    if (/^(?:https?:)?\/\//i.test(src)) {
      const site = siteUrl && tryNormalizeSiteUrl(siteUrl);
      if (!site) return undefined;
      base = `${site}/`;
    } else if (/^[a-z][a-z\d+.-]*:/i.test(src)) {
      return undefined;
    }
    parsed = new URL(src, base);
    if (!parsed.href.startsWith(base)) return undefined;
  } catch {
    return undefined;
  }

  if (!parsed.pathname.endsWith('/') && !parsed.pathname.endsWith('/index.php')) {
    if (source === 'strict' && parsed.search) {
      const params = fileQueryParams(parsed, source);
      if (['module', 'method', 'm', 'f', 'fileID'].some(key => params.has(key))) return undefined;
    }
    const read = /\/file-read-(\d+)(?:\.([A-Za-z0-9]+))?$/.exec(parsed.pathname);
    if (read && (read[2] || source === 'strict')) return fileRoute(read[1], 'read', read[2]?.toLowerCase());
    if (source === 'imageSrc') return undefined;
    const download = /\/file-download-(\d+)(?:-left)?\.html$/.exec(parsed.pathname);
    return download ? fileRoute(download[1], 'download') : undefined;
  }

  const params = fileQueryParams(parsed, source);
  if (source === 'strict' && (params.getAll('fileID').length !== 1
    || params.getAll('module').length + params.getAll('m').length !== 1
    || params.getAll('method').length + params.getAll('f').length !== 1)) return undefined;

  for (const [moduleKey, methodKey] of [['module', 'method'], ['m', 'f']]) {
    const method = params.get(methodKey);
    if (params.get(moduleKey) === 'file' && (method === 'read' || (source !== 'imageSrc' && method === 'download'))) {
      const digits = params.get('fileID');
      if (digits && /^\d+$/.test(digits)) return fileRoute(digits, method);
    }
  }
}

function fileRoute(digits: string, method: ParsedFileUrl['method'], extension?: string): ParsedFileUrl | undefined {
  const fileID = Number(digits);
  if (Number.isSafeInteger(fileID) && fileID > 0) {
    return extension ? { fileID, method, extension } : { fileID, method };
  }
}
