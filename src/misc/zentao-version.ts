import { ZentaoError } from './errors.js';

interface ZentaoVersion {
  edition: string;
  parts: number[];
}

/** 只接受开源版、biz、max、ipd 系列的点分数字正式版本。 */
export function parseZentaoVersion(version: string): ZentaoVersion {
  const match = typeof version === 'string' ? version.trim().match(/^(biz|max|ipd)?(\d+(?:\.\d+)*)$/i) : null;
  const parts = match?.[2].split('.').map(Number);
  if (!match || !parts?.every(Number.isSafeInteger)) {
    throw new ZentaoError('E_INVALID_ZENTAO_VERSION', { version: String(version) });
  }
  return { edition: (match[1] ?? '').toLowerCase(), parts };
}

/** 注册和生成时共用，缺少版本、格式非法或同系列重复均拒绝。 */
export function validateMinVersion(value: unknown): asserts value is readonly string[] {
  try {
    if (!Array.isArray(value) || value.length === 0) throw new Error('minVersion must be a non-empty array.');
    const editions = Array.from(value, version => parseZentaoVersion(version).edition);
    if (new Set(editions).size !== editions.length) throw new Error('Duplicate editions in minVersion.');
  } catch (error) {
    throw new ZentaoError('E_INVALID_ACTION_DEFINITION', undefined, error);
  }
}

/** 同系列逐段比较，缺少的数字段视为零；未列出的系列不支持。 */
export function supportsZentaoVersion(version: ZentaoVersion, minimums: readonly string[]): boolean {
  const minimum = minimums.map(parseZentaoVersion).find(item => item.edition === version.edition);
  if (!minimum) return false;
  for (let index = 0; index < Math.max(version.parts.length, minimum.parts.length); index++) {
    const difference = (version.parts[index] ?? 0) - (minimum.parts[index] ?? 0);
    if (difference !== 0) return difference > 0;
  }
  return true;
}
