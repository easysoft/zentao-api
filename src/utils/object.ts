/** 判断值是否为普通对象（非数组、非 null）。 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/** 判断值是否为“空”（undefined、null 或空字符串）。 */
export function isBlank(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}

export function getNestedValue(obj: unknown, path: string): unknown {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}
