import { ZentaoError } from '../misc/errors.js';
import { assertSupportedVersion } from '../misc/zentao-version.js';
import { getGlobalOptions } from '../misc/global-options.js';
import type {
  DataRecord,
  FileCreateParams,
  FileCreateResult,
  HttpMethod,
  ListPage,
  ModuleAction,
  ModuleDefinition,
  ProcessListOptions,
  RequestOptions,
  RequestProcessOptions,
  ResponseData,
  WorkHourSettings,
} from '../types/index.js';
import { getModule, getModuleAction } from '../modules/registry.js';
import type { BuiltinActionMeta, BuiltinModuleName } from '../modules/generated.js';
import { explicitBodyFieldSource, extractPager, extractResult, parseRequestData, resolveActionRequest } from '../modules/resolve.js';
import { isRecord, processData } from '../utils/index.js';
import { prepareActionBody } from './prepare-body.js';
import { resolveResultObjectType } from '../modules/result-object-type.js';
import { HtmlFileRequest, setFileUid } from './html-file-request.js';
import { renderExplicitMarkdown } from './markdown.js';
import { assertListPage, pagerNumber, setIterationPage, type PageCursor } from './pagination.js';
import { resolveRequestVersion } from './version.js';
import { classifyWriteError, classifyWriteReceipt, readFileReceipt, trackWrite, type FileReceipt, type WriteAttempt } from './write-outcome.js';

type BuiltinActionName<M extends BuiltinModuleName> = Extract<keyof BuiltinActionMeta[M], string>;
type BuiltinListRequestName = BuiltinModuleName;
type BuiltinNamedRequestName = {
  [M in BuiltinModuleName]: `${M}/${BuiltinActionName<M>}`;
}[BuiltinModuleName] | 'my/profile' | 'file/get' | 'file/read' | 'setting/workHours';
type BuiltinIdRequestName = `${BuiltinModuleName}/${number}`;
/** 内置模块支持的请求名：`module`、`module/action` 或 `module/123`。 */
export type BuiltinRequestName = BuiltinListRequestName | BuiltinNamedRequestName | BuiltinIdRequestName;
type ModuleNameOf<Name extends BuiltinRequestName> = Name extends `${infer M}/${string}`
  ? Extract<M, BuiltinModuleName>
  : Extract<Name, BuiltinModuleName>;
type ActionNameOf<Name extends BuiltinRequestName> = Name extends `${string}/${infer A}`
  ? A extends `${number}` ? 'get' : A
  : 'list';
type ActionMetaOf<Name extends BuiltinRequestName> =
  ModuleNameOf<Name> extends infer M extends BuiltinModuleName
    ? ActionNameOf<Name> extends infer A
      ? A extends keyof BuiltinActionMeta[M]
        ? BuiltinActionMeta[M][A]
        : { resultType: 'object' }
      : never
    : never;

/** 根据内置请求名推导出的参数类型。字段细节以运行时 registry 为准，这里保持可扩展。 */
export type RequestParamsFor<Name extends BuiltinRequestName> = Name extends 'file/create'
  ? FileCreateParams
  : Record<string, unknown>;
/** 根据内置请求名推导出的 `ResponseData.data` 类型。 */
export type RequestResultFor<Name extends BuiltinRequestName> = Name extends 'setting/workHours'
  ? WorkHourSettings
  : ActionMetaOf<Name> extends { resultType: 'list' }
    ? DataRecord[]
    : Name extends 'file/create'
      ? FileCreateResult
      : Name extends 'file/read'
        ? ArrayBuffer | string
        : ActionMetaOf<Name> extends { resultType: 'object' }
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

/**
 * 在执行 `update` 动作前，用当前对象的现值填充用户未显式传入的 body 字段。
 *
 * 仅当模块存在与 update 路径相同的 `type: 'get'` 动作，且 update 动作声明了对象类型 body schema 时生效；
 * 否则原样返回参数。GET 返回失败状态时会抛出 `E_API_FAILED`，避免继续发送未补齐的 PUT；
 * GET 成功但返回非对象时跳过填充，交由后续 PUT 正常处理。
 *
 * 字段归属判断同时覆盖平铺 `params` 字段与 `params.data` 中的字段；只有 schema 中声明、
 * 用户未传且当前对象存在的字段才会被补齐，避免覆盖用户本次想修改的字段。
 */
async function autoFillUpdateParams(
  module: ModuleDefinition,
  action: ModuleAction,
  params: Record<string, unknown>,
  options: RequestOptions,
  version: string | null,
): Promise<Record<string, unknown>> {
  const properties = (action.requestBody?.schema as { properties?: Record<string, unknown> } | undefined)?.properties;
  const getAction = module.actions.find(
    (candidate) => candidate.type === 'get' && candidate.path === action.path,
  );
  if (!properties || !getAction) return params;

  const current = (await requestInternal(`${module.name}/${getAction.name}`, params, {
    client: options.client,
    timeout: options.timeout,
    insecure: options.insecure,
    actionAssistant: options.actionAssistant,
    throwOnFail: true,
  }, { version }) as ResponseData).data;
  if (!isRecord(current)) return params;

  const data = parseRequestData(params.data);
  const filled: Record<string, unknown> = { ...params };
  for (const key of Object.keys(properties)) {
    // An upload uid identifies this save and must never be copied from a previous edit.
    if (key === 'uid') continue;
    if (!explicitBodyFieldSource(params, data, key) && Object.hasOwn(current, key)) {
      filled[key] = current[key];
    }
  }
  return filled;
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
    options.convert ||
    (options.filter && options.filter.length > 0) ||
    (options.search && options.search.length > 0) ||
    options.sort ||
    options.limit ||
    (options.pick && options.pick.length > 0),
  );
}

/**
 * 对归一化后的业务数据应用本地处理（转换 → 过滤 → 搜索 → 排序 → 限制数量 → 摘取）。
 *
 * - 对象列表：交由 {@link processData} 完整处理。
 * - 基本类型数组：仅 `limit` 生效（按数量截断），避免破坏原始元素。
 * - 单条对象：应用 `convertSingle`，再应用 `pick`。
 * - 其他形态原样返回。
 */
function applyProcessing(data: unknown, options: RequestProcessOptions): unknown {
  if (data instanceof ArrayBuffer) return data;
  if (Array.isArray(data)) {
    if (!hasListProcessing(options)) return data;
    if (data.every(isRecord)) {
      return processData(data as DataRecord[], {
        convert: options.convert,
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
  if (isRecord(data) && (options.convertSingle || (options.pick && options.pick.length > 0))) {
    return processData(data, { convert: options.convertSingle, pick: options.pick });
  }
  return data;
}

function attachResultObjectType<T>(response: ResponseData<T>, command: ReturnType<typeof resolveActionRequest>): ResponseData<T> {
  if (response.status === 'success') {
    const type = resolveResultObjectType(command.action.resultObjectType, command.params, response.data);
    if (type !== undefined) response.resultObjectType = type;
  }
  return response;
}

/** 将禅道原始响应归一化为稳定的 ResponseData 结构。 */
function normalizeResponse<T>(
  command: ReturnType<typeof resolveActionRequest>,
  raw: unknown,
  options: RequestProcessOptions,
  rejected: boolean,
  cursor?: PageCursor,
  fileReceipt?: FileReceipt,
): ResponseData<T> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return attachResultObjectType({ status: 'success', data: raw as T }, command);
  }

  const record = raw as Record<string, unknown>;
  const status = rejected || record.status === 'fail' ? 'fail' : 'success';
  const source = extractResult(command.action, record, command.params, options);
  if (cursor) cursor.rowCount = Array.isArray(source) ? source.length : undefined;
  const data = applyProcessing(source, options);
  const rawMessage = fileReceipt ? fileReceipt.message : record.message;

  const toNumber = cursor ? pagerNumber : Number;
  const pager = extractPager(command.action, record, command.params, options, toNumber);
  const response: ResponseData<T> = {
    status,
    message: stringifyMessage(rawMessage),
    data: data as T,
    pager: pager ? {
      total: toNumber(pager.recTotal),
      page: toNumber(pager.pageID),
      recPerPage: toNumber(pager.recPerPage),
    } : undefined,
  };
  if (rawMessage !== undefined && typeof rawMessage !== 'string') {
    response.rawMessage = rawMessage;
  }
  const apiCode = extractApiCode(record);
  if (apiCode !== undefined) response.apiCode = apiCode;
  if (status === 'fail') response.raw = record;
  return attachResultObjectType(response, command);
}

/**
 * 按模块名或模块动作名请求禅道 API。
 *
 * 选项优先级为：本次调用 options > 全局 options > 客户端默认值。
 * 动作的 beforeRequest 在参数解析后、请求体准备前执行，返回值浅合并到解析后的请求描述中。
 * 当响应 `status` 为 `"fail"` 时，默认按原样返回；若 `options.throwOnFail`
 * 或全局 `throwOnFail` 为真，则改为抛出 `E_API_FAILED`。
 * 请求前按 Action 的 `minVersion` 检查服务器版本；全局 `version` 可避免配置探测，
 * `forceRefreshConfig` 则强制使用实际版本。无法获取配置时默认抛错，
 * `skipVersionCheckOnConfigError` 可允许本次跳过检查，但不能忽略明确的版本不匹配。
 *
 * 对 `update` 动作，当 `options.autoFill` 或全局 `autoFill` 为真时，会先 GET 当前对象，
 * 用现值补齐用户未显式传入的 body 字段后再 PUT，避免禅道覆盖未提交字段。详见 {@link RequestOptions#autoFill}。
 * 若提供 {@link RequestOptions.renderMarkdown}，在预读前渲染本次显式提交的富文本字段。
 *
 * @typeParam T 归一化响应中期望的 `data` 字段类型；不传时为 `unknown`，调用方需要自行收窄。
 * @param name - 请求名，例如 `product`、`product/list` 或 `product/1`。
 * @param params - 请求参数。
 * @param options - 请求选项。
 * @returns 默认返回归一化后的禅道 API 响应；`options.raw` 为 true 时返回未经归一化的原始响应。
 * @throws {ZentaoError} 传输层错误、参数缺失或 `throwOnFail` 启用时的业务失败。
 */
export async function request(
  name: string,
  params: Record<string, unknown> | undefined,
  options: RequestOptions & { raw: true },
): Promise<unknown>;
export async function request<Name extends BuiltinRequestName>(
  name: Name,
  params?: RequestParamsFor<Name>,
  options?: RequestOptions & { raw?: false },
): Promise<ResponseData<RequestResultFor<Name>>>;
export async function request<T = unknown>(
  name: string,
  params?: Record<string, unknown>,
  options?: RequestOptions & { raw?: false },
): Promise<ResponseData<T>>;
// raw 被宽化为 boolean 时，运行时结果无法静态判定，必须由调用方自行收窄。
export async function request(
  name: string,
  params?: Record<string, unknown>,
  options?: RequestOptions,
): Promise<unknown>;
export async function request<T = unknown>(
  name: string,
  params: Record<string, unknown> = {},
  options: RequestOptions = {},
): Promise<unknown> {
  const attempt: WriteAttempt = {};
  try {
    return await requestInternal<T>(name, params, options, { attempt });
  } catch (error) {
    if (!attempt.phase) throw error;
    attempt.outcome ??= classifyWriteError(attempt.phase, error);
    if (!(error instanceof ZentaoError) || attempt.phase === 'before-hook' || attempt.phase === 'custom') throw error;
    // A config fetch can reject several concurrent requests with the same error.
    const failure = new ZentaoError(error.code, error.params, error.details);
    Object.defineProperty(failure, 'cause', { value: error, configurable: true });
    throw Object.assign(failure, { writeOutcome: attempt.outcome });
  } finally {
    if (attempt.outcome && options.onWriteOutcome) {
      try { await options.onWriteOutcome(attempt.outcome); } catch { /* notification only */ }
    }
  }
}

/**
 * 按需读取列表，从指定页码（默认 1）开始，每次迭代请求一页。退出循环即停止取页。
 * 每页沿用 {@link request} 的本地处理选项，筛选后为空的页也会交付。是否翻页依据服务端 pager。
 * @typeParam Row - 每条记录的类型。
 * @throws {ZentaoError} 业务失败时抛出 E_API_FAILED。分页信息缺失、页码不匹配或服务端空页仍有后页时抛出 E_PAGINATION_INCOMPLETE。
 */
export async function* iteratePages<Row = DataRecord>(
  name: string,
  params: Record<string, unknown> = {},
  options: Omit<RequestOptions, 'raw' | 'throwOnFail'> = {},
): AsyncGenerator<ListPage<Row>, void, void> {
  const cursor: PageCursor = { globals: getGlobalOptions() };
  const pageParams = { ...params };
  const pageOptions = { ...options, raw: false, throwOnFail: true };
  do {
    const response = await requestInternal<Row[]>(name, pageParams, pageOptions, { cursor, version: cursor.version }) as ResponseData<Row[]>;
    assertListPage(name, cursor, response);
    const { page, recPerPage, total } = response.pager;
    cursor.pageID = page * recPerPage < total ? page + 1 : undefined;
    yield response;
  } while (cursor.pageID !== undefined);
}

/** version 为 undefined 时解析一次，null 表示本次调用已选择跳过版本检查。 */
async function requestInternal<T = unknown>(
  name: string,
  params: Record<string, unknown>,
  options: RequestOptions,
  { version, prepareRichText = true, checkSession, attempt, cursor }: {
    version?: string | null;
    prepareRichText?: boolean;
    checkSession?: () => void;
    attempt?: WriteAttempt;
    cursor?: PageCursor;
  },
): Promise<unknown> {
  const globals = cursor?.globals ?? getGlobalOptions();
  const client = options.client ?? globals.client;
  const { moduleName, actionName, id } = splitRequestName(name);
  const module = getModule(moduleName);
  const action = getModuleAction(moduleName, actionName);
  const write = action && action.type !== 'get' && action.type !== 'list' && action.method?.toUpperCase() !== 'GET'
    ? attempt : undefined;
  if (write) write.phase = 'preparing';
  if (!client) throw new ZentaoError('E_NO_GLOBAL_CLIENT');
  if (!module) {
    throw new ZentaoError('E_INVALID_MODULE', { module: moduleName });
  }
  if (!action) {
    throw new ZentaoError('E_INVALID_ACTION', { module: moduleName, action: actionName });
  }
  // recPerPage 是最常用的列表参数，允许在全局或本次调用中统一覆盖。
  const recPerPage = params.recPerPage ?? options.recPerPage ?? globals.recPerPage;
  const mergedParams = {
    ...params,
    ...(id !== undefined ? { id } : {}),
    ...(recPerPage !== undefined ? { recPerPage } : {}),
  };
  const pageQuery = cursor && setIterationPage(action, mergedParams, cursor);

  if (version === undefined) {
    version = await resolveRequestVersion(options, globals);
    if (cursor) cursor.version = version;
  }
  assertSupportedVersion(version, action.minVersion, `${module.name}/${action.name}`);
  const renderMarkdown = prepareRichText && (options.renderMarkdown ?? globals.renderMarkdown);
  const markdownField = renderMarkdown
    ? await renderExplicitMarkdown(module.name, action, mergedParams, renderMarkdown)
    : undefined;
  // autoFill completes its GET before the target object's write can start.
  const finalParams = action.type === 'update' && (options.autoFill ?? globals.autoFill)
    ? await autoFillUpdateParams(module, action, mergedParams, { ...options, client }, version)
    : mergedParams;

  const command = resolveActionRequest(module, actionName, finalParams);
  if (pageQuery) Object.assign(command.query ??= {}, pageQuery);
  if (command.action.beforeRequest) {
    if (write) write.phase = 'before-hook';
    Object.assign(command, await command.action.beforeRequest(command));
    if (write) write.phase = 'preparing';
  }
  const transportOptions = {
    timeout: options.timeout ?? globals.timeout,
    insecure: options.insecure ?? globals.insecure,
    actionAssistant: options.actionAssistant !== undefined ? options.actionAssistant : globals.actionAssistant,
  };
  const method = String(command.action.method).toUpperCase() as HttpMethod;
  const isWrite = method === 'POST' || method === 'PUT';
  const fileAction: string | undefined = module.name === 'file' ? action.name : undefined;
  const isUpload = fileAction === 'create';
  const flatUid = isUpload && command.query?.uid !== undefined ? command.query.uid : command.params.uid;
  const explicitUid = command.data?.uid !== undefined ? command.data.uid : flatUid;
  const uid = isWrite && explicitUid !== undefined ? setFileUid(command, explicitUid, version) : undefined;
  const files = prepareRichText && isWrite && !isUpload ? new HtmlFileRequest(command, {
    client, version, ...transportOptions,
    fileResolver: options.fileResolver ?? globals.fileResolver,
    continueOnFileResolveError: options.continueOnFileResolveError ?? globals.continueOnFileResolveError,
    continueOnFileUploadError: options.continueOnFileUploadError ?? globals.continueOnFileUploadError,
    onFileError: options.onFileError ?? globals.onFileError,
    requestFile: async (action, params, fileSession) => {
      const raw = await requestInternal(`file/${action}`, params, {
        client, ...transportOptions, maxUploadBytes: options.maxUploadBytes,
        raw: true, autoFill: false,
      }, { version, prepareRichText: false, checkSession: fileSession });
      const receipt = readFileReceipt(action, raw);
      if (action === 'create' && (typeof raw === 'number' || typeof raw === 'string')) return receipt;
      if (action === 'create' && isRecord(raw) && raw.status !== 'fail' && receipt.outcome !== 'rejected') return receipt;
      if (receipt.outcome === 'confirmed') return receipt;
      throw new ZentaoError('E_API_FAILED', { message: stringifyMessage(receipt.message) ?? `Invalid file/${action} response.` }, raw);
    },
  }, uid) : undefined;
  let preparedBody;
  try {
    await files?.prepare(markdownField);
    preparedBody = await prepareActionBody(command, { maxUploadBytes: options.maxUploadBytes });
    (checkSession ?? files?.checkSession)?.();
  } catch (error) {
    await files?.cleanup();
    throw files?.errorWithFiles(error) ?? error;
  }
  const requestOptions = { ...preparedBody, ...transportOptions };
  let raw: unknown;
  try {
    // A custom transport may send a write even when it throws without a receipt.
    if (write) write.phase = command.action.request ? 'custom' : 'dispatching';
    raw = command.action.request
      ? await command.action.request(trackWrite({ request: command, ...requestOptions, client, options }, write))
      : await client.request(command.path, trackWrite({
        method,
        query: command.query,
        ...requestOptions,
      }, write));
  } catch (error) {
    const outcome = write?.outcome ?? classifyWriteError(write?.phase, error);
    if (write) write.outcome = outcome;
    throw files ? await files.saveError(error, outcome) : error;
  }
  const fileReceipt = write && (fileAction === 'create' || fileAction === 'delete') ? readFileReceipt(fileAction, raw) : undefined;
  const receipt = write || (files && command.data?.uid !== undefined)
    ? write?.outcome ?? fileReceipt?.outcome ?? classifyWriteReceipt(raw)
    : undefined;
  if (receipt) {
    if (write) {
      write.phase = 'received';
      write.outcome = receipt;
    }
    await files?.complete(raw, receipt, options.raw === true);
  }

  if (options.raw) {
    return raw;
  }

  // limit 现归入本地处理选项；本次调用优先，缺省回落到全局默认。
  const processOptions: RequestProcessOptions = { ...options, limit: options.limit ?? globals.limit };
  const response = normalizeResponse<T>(command, raw, processOptions, receipt === 'rejected', cursor, fileReceipt);
  if (write) response.writeOutcome = write.outcome;
  if (files?.warnings.length) response.fileWarnings = files.warnings;
  if (response.status === 'fail' && (options.throwOnFail ?? globals.throwOnFail)) {
    throw new ZentaoError('E_API_FAILED', { message: response.message ?? '' }, response);
  }
  return response;
}
