import { ZentaoError } from '../misc/errors.js';
import { explicitBodyFieldSource, parseRequestData } from '../modules/resolve.js';
import type { GlobalOptions, ListPage, ModuleAction, ResponseData } from '../types/index.js';
import { isRecord } from '../utils/object.js';

/** Private to one iterator. rowCount is captured before local conversion or filtering. */
export interface PageCursor {
  globals: GlobalOptions;
  version?: string | null;
  pageID?: number;
  rowCount?: number;
}

export function pagerNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  return typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN;
}

/** Set the page on the request's private params. Some workflow lists return a pager but omit its query fields from the schema. */
export function setIterationPage(
  action: ModuleAction, params: Record<string, unknown>, cursor: PageCursor,
): Record<string, unknown> | undefined {
  const method = action.method?.toUpperCase();
  if (action.resultType !== 'list' || (method !== 'GET' && !(method === 'POST' && action.type === 'list'))) {
    throw new ZentaoError('E_INVALID_PARAM', { param: 'list action', value: action.name });
  }
  const query = action.params?.find(param => param.name === 'pageID' || param.name === 'page');
  const properties = action.requestBody?.schema.properties;
  const bodyField = !query && isRecord(properties) ? ['pageID', 'page'].find(key => Object.hasOwn(properties, key)) : undefined;
  const field = query?.name ?? bodyField ?? 'pageID';
  const data = bodyField ? parseRequestData(params.data) : undefined;
  const source = explicitBodyFieldSource(params, data, field);
  const alias = field === 'pageID' ? params.page : params.pageID;
  const start = source?.[field] === undefined ? alias ?? 1 : source[field];
  const page = cursor.pageID ?? pagerNumber(start);
  if (!Number.isSafeInteger(page) || page < 1) {
    throw new ZentaoError('E_INVALID_PARAM', { param: field, value: String(start) });
  }
  cursor.pageID = page;
  if (data && source === data) {
    const updated = { ...data, [field]: page };
    params.data = typeof params.data === 'string' ? JSON.stringify(updated) : updated;
  } else {
    params[field] = page;
  }
  if (method === 'GET' && action.pagerGetter && !query && !bodyField) {
    return { pageID: page, ...(params.recPerPage !== undefined ? { recPerPage: params.recPerPage } : {}) };
  }
}

export function assertListPage<Row>(
  name: string, cursor: PageCursor, response: ResponseData<Row[]>,
): asserts response is ListPage<Row> {
  const { pager } = response;
  const invalid = (reason: string) => new ZentaoError('E_PAGINATION_INCOMPLETE', {
    action: name, page: cursor.pageID ?? 1, reason,
  }, pager);
  if (!pager) throw invalid('missing pager');
  if (pager.page !== cursor.pageID) throw invalid(`received page ${pager.page}`);
  if (!Number.isSafeInteger(pager.recPerPage) || pager.recPerPage < 1 || !Number.isSafeInteger(pager.total) || pager.total < 0) {
    throw invalid('invalid page size or total');
  }
  if (cursor.rowCount === undefined || !Array.isArray(response.data)) throw invalid('expected a list of records');
  if (cursor.rowCount === 0 && pager.page * pager.recPerPage < pager.total) {
    throw invalid('the server returned an empty list while the pager indicates more pages');
  }
}
