import { ZentaoError } from '../misc/errors.js';

/** 将用户传入的站点根地址规范化，兼容误传入 `/api.php/v2` 的场景。 */
export function normalizeSiteUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, '');
  if (!trimmed) throw new ZentaoError('E_INVALID_BASE_URL');

  const siteUrl = trimmed.replace(/\/api\.php\/v[12]$/i, '');
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
