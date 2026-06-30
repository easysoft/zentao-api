import { ZentaoError } from '../misc/errors.js';
import { getGlobalOptions } from '../misc/global-options.js';
import type { DataRecord, HttpMethod, ProcessListOptions, RequestOptions, ResponseData } from '../types/index.js';
import { getModule } from '../modules/registry.js';
import type { BUILTIN_MODULES } from '../modules/generated.js';
import { extractPager, extractResult, resolveModuleCommand } from '../modules/resolve.js';
import { isRecord, processData } from '../utils/index.js';

type BuiltinModuleDefinition = (typeof BUILTIN_MODULES)[number];
type BuiltinModuleName = BuiltinModuleDefinition['name'];
type BuiltinAction<M extends BuiltinModuleName> = Extract<BuiltinModuleDefinition, { name: M }>['actions'][number];
type BuiltinActionName<M extends BuiltinModuleName> = BuiltinAction<M>['name'] & string;
type BuiltinListRequestName = BuiltinModuleName;
type BuiltinNamedRequestName = {
  [M in BuiltinModuleName]: `${M}/${BuiltinActionName<M>}`;
}[BuiltinModuleName];
type BuiltinIdRequestName = `${BuiltinModuleName}/${number}`;
/** 内置模块支持的请求名：`module`、`module/action` 或 `module/123`。 */
export type BuiltinRequestName = BuiltinListRequestName | BuiltinNamedRequestName | BuiltinIdRequestName;
type ModuleNameOf<Name extends BuiltinRequestName> = Name extends `${infer M}/${string}`
  ? Extract<M, BuiltinModuleName>
  : Extract<Name, BuiltinModuleName>;
type ActionNameOf<Name extends BuiltinRequestName> = Name extends `${string}/${infer A}`
  ? A extends `${number}` ? 'get' : A
  : 'list';
type ActionOfRequest<Name extends BuiltinRequestName> = Extract<
  BuiltinAction<ModuleNameOf<Name>>,
  { name: ActionNameOf<Name> }
>;

type UnionToIntersection<T> = (T extends unknown ? (value: T) => void : never) extends (value: infer R) => void ? R : never;
type NumericInput = number | `${number}`;
type BooleanInput = boolean | 0 | 1 | 'true' | 'false' | '1' | '0' | 'yes' | 'no' | 'on' | 'off';
type OptionValue<T> = T extends readonly (infer Option)[] ? Option extends { value: infer Value } ? Value : never : never;
type ParamInput<T> =
  (T extends { options: infer Options } ? OptionValue<Options> : never) |
  (T extends { type: 'number' | 'integer' } ? NumericInput :
    T extends { type: 'boolean' } ? BooleanInput :
      string);
type QueryParams<A> = A extends { params: readonly (infer Param)[] }
  ? UnionToIntersection<Param extends { name: infer Name extends string } ? { [K in Name]?: ParamInput<Param> } : unknown>
  : {};

type SchemaProperties<S> = S extends { properties: infer Properties } ? Properties : {};
type SchemaRequiredKeys<S> = S extends { required: readonly (infer Key)[] }
  ? Extract<Key, keyof SchemaProperties<S> & string>
  : never;
type SchemaValue<S> = S extends { type: 'integer' | 'number' }
  ? NumericInput
  : S extends { type: 'boolean' }
    ? BooleanInput
    : S extends { type: 'array'; items?: infer Items }
      ? Array<SchemaValue<Items>> | readonly SchemaValue<Items>[] | string | Record<string, unknown>
      : S extends { type: 'object' }
        ? Record<string, unknown>
        : string;
type BodyParams<A> = A extends { requestBody: { schema: infer Schema } }
  ? {
    [K in SchemaRequiredKeys<Schema>]: SchemaValue<SchemaProperties<Schema>[K]>;
  } & {
    [K in Exclude<keyof SchemaProperties<Schema> & string, SchemaRequiredKeys<Schema>>]?: SchemaValue<SchemaProperties<Schema>[K]>;
  } & {
    data?: string | Partial<{ [K in keyof SchemaProperties<Schema> & string]: SchemaValue<SchemaProperties<Schema>[K]> }>;
  }
  : { data?: string | Record<string, unknown> };
type ScopedParams<PathParams> = 'scope' extends keyof PathParams ? {
  product?: string | number;
  productID?: string | number;
  project?: string | number;
  projectID?: string | number;
  execution?: string | number;
  executionID?: string | number;
} : {};
type PathParams<A> = A extends { pathParams: infer Params }
  ? {
    [K in Exclude<keyof Params & string, 'scope' | 'scopeID'>]?: string | number;
  } & ScopedParams<Params> & { id?: string | number }
  : { id?: string | number };
/** 根据内置请求名推导出的参数类型。 */
export type RequestParamsFor<Name extends BuiltinRequestName> = PathParams<ActionOfRequest<Name>>
  & QueryParams<ActionOfRequest<Name>>
  & BodyParams<ActionOfRequest<Name>>
  & { page?: string | number; recPerPage?: string | number }
  & Record<string, unknown>;
/** 根据内置请求名推导出的 `ResponseData.data` 类型。 */
export type RequestResultFor<Name extends BuiltinRequestName> = ActionOfRequest<Name> extends { resultType: 'list' }
  ? DataRecord[]
  : ActionOfRequest<Name> extends { resultType: 'object' }
    ? DataRecord
    : unknown;

/** 将 `moduleName`、`moduleName/methodName` 或 `moduleName/<objectID>` 请求名拆成模块名、动作名和对象 ID。 */
function splitRequestName(name: string): { moduleName: string; actionName: string; id?: number } {
  const parts = name.split('/');
  if (parts.length > 2 || !parts[0]) {
    throw new ZentaoError('E_INVALID_REQUEST_NAME');
  }
  const [moduleName, actionName] = parts;

  // 如果没有指定 actionName，按列表动作处理。
  if (!actionName?.length) {
    return {
      moduleName,
      actionName: 'list',
    };
  }

  // 如果 actionName 为数值，按详情快捷写法处理。
  if (Number.isInteger(Number(actionName))) {
    return {
      moduleName,
      actionName: 'get',
      id: Number(actionName),
    };
  }
  return {
    moduleName,
    actionName,
  };
}

function stringifyMessage(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (value === undefined) return undefined;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function extractApiCode(record: Record<string, unknown>): string | number | undefined {
  for (const key of ['code', 'errorCode', 'errno']) {
    const value = record[key];
    if (typeof value === 'string' || typeof value === 'number') return value;
  }
  return undefined;
}

/** 判断本次调用是否携带了需要本地处理列表的选项。 */
function hasListProcessing(options: ProcessListOptions): boolean {
  return Boolean(
    (options.filter && options.filter.length > 0) ||
    (options.search && options.search.length > 0) ||
    options.sort ||
    options.limit ||
    (options.pick && options.pick.length > 0),
  );
}

/**
 * 对归一化后的业务数据应用本地处理（过滤 → 搜索 → 排序 → 限制数量 → 摘取）。
 *
 * - 对象列表：交由 {@link processData} 完整处理。
 * - 基本类型数组：仅 `limit` 生效（按数量截断），避免破坏原始元素。
 * - 单条对象：只有 `pick` 生效。
 * - 其他形态原样返回。
 */
function applyProcessing(data: unknown, options: ProcessListOptions): unknown {
  if (Array.isArray(data)) {
    if (!hasListProcessing(options)) return data;
    if (data.every(isRecord)) {
      return processData(data as DataRecord[], {
        filter: options.filter,
        search: options.search,
        searchFields: options.searchFields,
        sort: options.sort,
        limit: options.limit,
        pick: options.pick,
      });
    }
    // 非对象数组（如 ID 列表）只能按数量截断，其余处理不适用。
    const limit = Number(options.limit);
    return Number.isFinite(limit) && limit >= 0 ? data.slice(0, Math.floor(limit)) : data;
  }
  if (isRecord(data) && options.pick && options.pick.length > 0) {
    return processData(data, { pick: options.pick });
  }
  return data;
}

/** 将禅道原始响应归一化为稳定的 ResponseData 结构。 */
function normalizeResponse<T>(
  command: ReturnType<typeof resolveModuleCommand>,
  raw: unknown,
  options: ProcessListOptions,
): ResponseData<T> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { status: 'success', data: raw as T };
  }

  const record = raw as Record<string, unknown>;
  const status = record.status === 'fail' ? 'fail' : 'success';
  const data = applyProcessing(extractResult(command.action, record, command.params), options);
  const rawMessage = record.message;

  const pager = extractPager(command.action, record, command.params);
  const response: ResponseData<T> = {
    status,
    message: stringifyMessage(rawMessage),
    data: data as T,
    pager: pager ? {
      total: Number(pager.recTotal),
      page: Number(pager.pageID),
      recPerPage: Number(pager.recPerPage),
    } : undefined,
  };
  if (rawMessage !== undefined && typeof rawMessage !== 'string') {
    response.rawMessage = rawMessage;
  }
  const apiCode = extractApiCode(record);
  if (apiCode !== undefined) response.apiCode = apiCode;
  if (status === 'fail') response.raw = record;
  return response;
}

/**
 * 按模块名或模块动作名请求禅道 API。
 *
 * 选项优先级为：本次调用 options > 全局 options > 客户端默认值。
 * 当响应 `status` 为 `"fail"` 时，默认按原样返回；若 `options.throwOnFail`
 * 或全局 `throwOnFail` 为真，则改为抛出 `E_API_FAILED`。
 *
 * @typeParam T 期望的 `data` 字段类型；不传时为 `unknown`，调用方需要自行收窄。
 * @param name - 请求名，例如 `product`、`product/list` 或 `product/1`。
 * @param params - 请求参数。
 * @param options - 请求选项。
 * @returns 归一化后的禅道 API 响应。
 * @throws {ZentaoError} 传输层错误、参数缺失或 `throwOnFail` 启用时的业务失败。
 */
export async function request<Name extends BuiltinRequestName>(
  name: Name,
  params?: RequestParamsFor<Name>,
  options?: RequestOptions,
): Promise<ResponseData<RequestResultFor<Name>>>;
export async function request<T = unknown>(
  name: string,
  params?: Record<string, unknown>,
  options?: RequestOptions,
): Promise<ResponseData<T>>;
export async function request<T = unknown>(
  name: string,
  params: Record<string, unknown> = {},
  options: RequestOptions = {},
): Promise<ResponseData<T>> {
  const globals = getGlobalOptions();
  const client = options.client ?? globals.client;
  if (!client) {
    throw new ZentaoError('E_NO_GLOBAL_CLIENT');
  }

  const { moduleName, actionName, id } = splitRequestName(name);
  const module = getModule(moduleName);
  // recPerPage 是最常用的列表参数，允许在全局或本次调用中统一覆盖。
  const recPerPage = params.recPerPage ?? options.recPerPage ?? globals.recPerPage;
  const mergedParams = {
    ...params,
    ...(id !== undefined ? { id } : {}),
    ...(recPerPage !== undefined ? { recPerPage } : {}),
  };
  const command = resolveModuleCommand(module, actionName, mergedParams);
  const raw = await client.request(command.path, {
    method: String(command.action.method).toUpperCase() as HttpMethod,
    query: command.query,
    body: command.data,
    timeout: options.timeout ?? globals.timeout,
    insecure: options.insecure ?? globals.insecure,
  });

  // limit 现归入本地处理选项；本次调用优先，缺省回落到全局默认。
  const processOptions: ProcessListOptions = { ...options, limit: options.limit ?? globals.limit };
  const response = normalizeResponse<T>(command, raw, processOptions);
  if (response.status === 'fail' && (options.throwOnFail ?? globals.throwOnFail)) {
    throw new ZentaoError('E_API_FAILED', { message: response.message ?? '' }, response);
  }
  return response;
}
