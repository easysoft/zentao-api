import { ZentaoError } from '../misc/errors.js';
import { parseFileRoute, tryNormalizeSiteUrl } from './file-url.js';

export { extractFileIdFromUrl } from '../url.js';

/** 将用户传入的站点根地址规范化，兼容误传入 `/api.php/v2` 的场景。 */
export function normalizeSiteUrl(baseUrl: string): string {
  const url = tryNormalizeSiteUrl(baseUrl);
  if (!url) throw new ZentaoError('E_INVALID_BASE_URL');
  return url;
}

/** @internal An HTML image src is already entity-decoded and identifies only a read route. */
export function parseFileIdFromUrl(url: string, siteUrl: string | undefined, source: 'fileUrl' | 'imageSrc'): number | undefined {
  return parseFileRoute(url, siteUrl, source)?.fileID;
}
