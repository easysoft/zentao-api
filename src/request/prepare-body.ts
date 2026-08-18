import { ZentaoError } from '../misc/errors.js';
import { isNodeRuntime } from '../misc/environment.js';
import type {
  ClientRequestBodyType,
  FileUploadDataInput,
  FileUploadPathInput,
  ModuleActionRequest,
} from '../types/index.js';
import { isRecord } from '../utils/index.js';

/** 本地路径上传的默认大小上限（50 MiB）。 */
export const DEFAULT_MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export interface PrepareActionBodyOptions {
  maxUploadBytes?: number;
}

export interface PreparedActionBody {
  body: unknown;
  bodyType?: ClientRequestBodyType;
}

interface PreparedFile {
  blob: Blob;
  filename: string;
}

interface BunFileRuntime {
  file(path: string): Blob;
}

const MIME_TYPES: Readonly<Record<string, string>> = {
  '.avif': 'image/avif',
  '.csv': 'text/csv',
  '.gif': 'image/gif',
  '.htm': 'text/html',
  '.html': 'text/html',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.json': 'application/json',
  '.md': 'text/markdown',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
  '.webp': 'image/webp',
  '.zip': 'application/zip',
};

// 与 environment.ts 相同：通过变量形式的动态 import 避免浏览器 bundle 静态拉入 node:*。
function importNodeModule<T>(specifier: string): Promise<T> {
  return import(specifier) as Promise<T>;
}

function isBlob(value: unknown): value is Blob {
  return typeof Blob !== 'undefined' && value instanceof Blob;
}

function isFileUploadPathInput(value: unknown): value is FileUploadPathInput {
  return isRecord(value) && typeof value.path === 'string';
}

function isFileUploadDataInput(value: unknown): value is FileUploadDataInput {
  return isRecord(value) && Object.prototype.hasOwnProperty.call(value, 'data') && typeof value.filename === 'string';
}

function inferContentType(filename: string): string {
  const normalized = filename.toLowerCase();
  const dotIndex = normalized.lastIndexOf('.');
  return dotIndex >= 0 ? MIME_TYPES[normalized.slice(dotIndex)] ?? 'application/octet-stream' : 'application/octet-stream';
}

function inferExtension(contentType: string): string {
  const normalized = contentType.split(';', 1)[0]?.trim().toLowerCase();
  const entry = Object.entries(MIME_TYPES).find(([, type]) => type === normalized);
  return entry?.[0] ?? '.bin';
}

function resolveMaxUploadBytes(value: number | undefined): number {
  if (value === undefined) return DEFAULT_MAX_UPLOAD_BYTES;
  if (!Number.isFinite(value) || value < 1) {
    throw new ZentaoError('E_INVALID_PARAM', { param: 'maxUploadBytes', value: String(value) });
  }
  return Math.floor(value);
}

function assertUploadSize(size: number, limit: number): void {
  if (size > limit) {
    throw new ZentaoError('E_UPLOAD_FILE_TOO_LARGE', { size, limit });
  }
}

function normalizeFilename(value: string | undefined, fallback: string, field: string): string {
  const requested = value?.trim() || fallback.trim();
  const filename = requested.split(/[\\/]/).at(-1)?.trim() ?? '';
  if (!filename) {
    throw new ZentaoError('E_INVALID_UPLOAD_SOURCE', { field });
  }
  return filename;
}

function errorCode(error: unknown): string | undefined {
  return isRecord(error) && typeof error.code === 'string' ? error.code : undefined;
}

function copyView(view: ArrayBufferView): Uint8Array<ArrayBuffer> {
  const source = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
  const copy = new Uint8Array(source.byteLength);
  copy.set(source);
  return copy;
}

function blobFromData(data: FileUploadDataInput['data'], contentType: string, field: string): Blob {
  if (isBlob(data)) {
    return data.type === contentType ? data : new Blob([data], { type: contentType });
  }
  if (data instanceof ArrayBuffer) {
    return new Blob([data], { type: contentType });
  }
  if (ArrayBuffer.isView(data)) {
    return new Blob([copyView(data)], { type: contentType });
  }
  throw new ZentaoError('E_INVALID_UPLOAD_SOURCE', { field });
}

async function preparePathFile(
  source: string | FileUploadPathInput,
  field: string,
  maxUploadBytes: number,
): Promise<PreparedFile> {
  if (!isNodeRuntime()) {
    throw new ZentaoError('E_UPLOAD_PATH_UNSUPPORTED');
  }

  const path = typeof source === 'string' ? source : source.path;
  const explicitFilename = typeof source === 'string' ? undefined : source.filename;
  const explicitContentType = typeof source === 'string' ? undefined : source.contentType;
  const [fs, pathModule] = await Promise.all([
    importNodeModule<typeof import('node:fs/promises')>('node:fs/promises'),
    importNodeModule<typeof import('node:path')>('node:path'),
  ]);

  let stats;
  try {
    stats = await fs.stat(path);
  } catch (error) {
    if (errorCode(error) === 'ENOENT') {
      throw new ZentaoError('E_UPLOAD_FILE_NOT_FOUND', { path }, error);
    }
    throw new ZentaoError('E_UPLOAD_FILE_READ_FAILED', { path }, error);
  }

  if (!stats.isFile()) {
    throw new ZentaoError('E_INVALID_UPLOAD_SOURCE', { field }, { path });
  }
  assertUploadSize(stats.size, maxUploadBytes);

  const filename = normalizeFilename(explicitFilename, pathModule.basename(path), field);
  const contentType = explicitContentType?.trim() || inferContentType(filename);
  const bun = (globalThis as typeof globalThis & { Bun?: BunFileRuntime }).Bun;
  if (bun?.file) {
    const file = bun.file(path);
    assertUploadSize(file.size, maxUploadBytes);
    const shouldApplyContentType = Boolean(explicitContentType?.trim()) || !file.type;
    return {
      blob: shouldApplyContentType && file.type !== contentType
        ? new Blob([file], { type: contentType })
        : file,
      filename,
    };
  }

  try {
    const bytes = await fs.readFile(path);
    assertUploadSize(bytes.byteLength, maxUploadBytes);
    return {
      blob: new Blob([copyView(bytes)], { type: contentType }),
      filename,
    };
  } catch (error) {
    throw new ZentaoError('E_UPLOAD_FILE_READ_FAILED', { path }, error);
  }
}

async function prepareFile(
  value: unknown,
  field: string,
  maxUploadBytes: number,
): Promise<PreparedFile> {
  if (typeof value === 'string' || isFileUploadPathInput(value)) {
    return preparePathFile(value, field, maxUploadBytes);
  }

  if (isBlob(value)) {
    assertUploadSize(value.size, maxUploadBytes);
    const contentType = value.type || 'application/octet-stream';
    const name = typeof (value as Blob & { name?: unknown }).name === 'string'
      ? (value as Blob & { name: string }).name
      : `${field}${inferExtension(contentType)}`;
    const filename = normalizeFilename(name, `${field}.bin`, field);
    return {
      blob: value.type === contentType ? value : new Blob([value], { type: contentType }),
      filename,
    };
  }

  if (isFileUploadDataInput(value)) {
    const filename = normalizeFilename(value.filename, field, field);
    const contentType = value.contentType?.trim()
      || (isBlob(value.data) ? value.data.type : '')
      || inferContentType(filename);
    const blob = blobFromData(value.data, contentType, field);
    assertUploadSize(blob.size, maxUploadBytes);
    return { blob, filename };
  }

  throw new ZentaoError('E_INVALID_UPLOAD_SOURCE', { field });
}

function isBinarySchema(schema: unknown): boolean {
  if (!isRecord(schema)) return false;
  if (schema.format === 'binary') return true;
  return schema.type === 'array' && isRecord(schema.items) && schema.items.format === 'binary';
}

function appendTextValue(form: FormData, field: string, value: unknown): void {
  if (value === undefined) return;
  if (Array.isArray(value)) {
    for (const item of value) appendTextValue(form, field, item);
    return;
  }
  if (value === null) {
    form.append(field, '');
    return;
  }
  form.append(field, typeof value === 'object' ? JSON.stringify(value) : String(value));
}

async function createMultipartBody(
  command: ModuleActionRequest,
  maxUploadBytes: number,
): Promise<FormData> {
  const form = new FormData();
  const properties = isRecord(command.action.requestBody?.schema.properties)
    ? command.action.requestBody.schema.properties
    : {};

  for (const [field, value] of Object.entries(command.data ?? {})) {
    if (!isBinarySchema(properties[field])) {
      appendTextValue(form, field, value);
      continue;
    }

    const values = Array.isArray(value) ? value : [value];
    if (values.length === 0) {
      throw new ZentaoError('E_INVALID_UPLOAD_SOURCE', { field });
    }
    for (const item of values) {
      const prepared = await prepareFile(item, field, maxUploadBytes);
      form.append(field, prepared.blob, prepared.filename);
    }
  }
  return form;
}

/** 根据模块动作的媒体类型，把解析后的普通请求体转换为底层客户端可发送的请求体。 */
export async function prepareActionBody(
  command: ModuleActionRequest,
  options: PrepareActionBodyOptions = {},
): Promise<PreparedActionBody> {
  const mediaType = command.action.requestBody?.mediaType ?? 'application/json';
  if (mediaType === 'multipart/form-data') {
    return {
      body: await createMultipartBody(command, resolveMaxUploadBytes(options.maxUploadBytes)),
      bodyType: 'raw',
    };
  }
  if (mediaType === 'application/x-www-form-urlencoded') {
    return { body: command.data, bodyType: 'form' };
  }
  return { body: command.data };
}
