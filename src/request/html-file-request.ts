import { captureFileSession, type ZentaoClient } from '../client/index.js';
import { ZentaoError } from '../misc/errors.js';
import { isNodeRuntime } from '../misc/environment.js';
import { assertSupportedVersion } from '../misc/zentao-version.js';
import { resolveResultObjectType } from '../modules/result-object-type.js';
import type { FileHandlingOptions, FileUploadSource, FileWarning, LinkProfile, ModuleActionRequest, ResolvedFile, WriteOutcome } from '../types/index.js';
import { isRecord } from '../utils/object.js';
import { createLink, parseLink } from '../utils/link.js';
import { parseHtmlFiles, rewriteHtmlFiles, type HtmlFileReference, type HtmlFileReplacement } from './html-files.js';
import { inferExtension, normalizeFilename } from './prepare-body.js';
import { FILE_BINDING_MINIMUMS } from './version.js';
import { positiveID } from './write-outcome.js';

type FileRequest = (action: 'create' | 'delete', params: Record<string, unknown>, checkSession?: () => void) => Promise<Record<string, unknown>>;
interface Context extends FileHandlingOptions {
  client: ZentaoClient;
  version: string | null;
  timeout?: number;
  insecure?: boolean;
  requestFile: FileRequest;
}
type Source =
  | { kind: 'url'; url: string; name?: string }
  | { kind: 'id'; id: number; name?: string }
  | { kind: 'upload'; path?: string; blob?: Blob; name: string; error?: unknown };
interface Upload {
  id?: number;
  url?: string;
  reference: HtmlFileReference;
}

function directURL(path: string): boolean {
  return /^(?:https?:\/\/|\/\/|#)/i.test(path)
    || (/^[a-z][a-z\d+.-]*:/i.test(path) && !/^file:/i.test(path));
}

function mayBeFileLink(path: string): boolean {
  let decoded = path;
  try { decoded = decodeURIComponent(path); } catch { /* use the original path */ }
  return /file.*read|read.*file/i.test(decoded);
}

function plainRecord(value: unknown): value is Record<string, unknown> {
  return isRecord(value) && [null, Object.prototype].includes(Object.getPrototypeOf(value));
}

async function importNode<T>(specifier: string): Promise<T> {
  return import(specifier) as Promise<T>;
}

async function newFileUid(): Promise<string> {
  if (!globalThis.crypto && isNodeRuntime()) return (await importNode<typeof import('node:crypto')>('node:crypto')).randomUUID();
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

/** Put the batch identifier in the upload query or the object's JSON body. */
export function setFileUid(command: ModuleActionRequest, value: unknown, version: string | null): string {
  // PHP treats "0" as empty. "used" is an album key; "1" and "apiv2" are shared server defaults.
  if (typeof value !== 'string' || !value || /[^A-Za-z0-9_-]/.test(value) || ['0', '1', 'used', 'apiv2'].includes(value)) {
    throw new ZentaoError('E_INVALID_PARAM', { param: 'uid', value: typeof value === 'string' ? value : typeof value });
  }
  assertSupportedVersion(version, FILE_BINDING_MINIMUMS, `${command.module}/${command.action.name}`);
  if (command.module === 'file' && command.action.name === 'create') {
    const { uid: _uid, extra, ...form } = command.data ?? {};
    command.data = form;
    command.query = { ...command.query, uid: value, extra };
  } else {
    command.data = { ...command.data, uid: value };
  }
  return value;
}

async function localPath(path: string): Promise<string> {
  if (!isNodeRuntime()) return path;
  const nodePath = await importNode<typeof import('node:path')>('node:path');
  if (/^file:\/\//i.test(path)) {
    const tail = path.slice(7);
    if (tail.startsWith('/') || /^localhost(?:\/|$)/i.test(tail)) {
      const nodeURL = await importNode<typeof import('node:url')>('node:url');
      return nodeURL.fileURLToPath(path);
    }
    // Accept the documented file://path/to/file shorthand relative to cwd.
    return nodePath.resolve(decodeURIComponent(tail));
  }
  return nodePath.resolve(path);
}

function filename(path: string): string {
  const last = path.replace(/[?#].*$/, '').split(/[\\/]/).at(-1) || 'file';
  try { return decodeURIComponent(last); } catch { return last; }
}

async function sourceFor(value: ResolvedFile, fallbackName?: string): Promise<Source> {
  const record: unknown = typeof value === 'string' ? { path: value } : value;
  if (!isRecord(record)) throw new Error('Resolver must return a path, URL or Blob.');
  const keys = ['path', 'url', 'blob'].filter(key => Object.hasOwn(record, key));
  if (keys.length !== 1 || (record.name !== undefined && typeof record.name !== 'string')) {
    throw new Error('Resolver must return exactly one file source and an optional string name.');
  }
  const name = (typeof record.name === 'string' ? record.name.trim() : undefined) || fallbackName;
  if (keys[0] === 'blob') {
    if (typeof Blob === 'undefined' || !(record.blob instanceof Blob)) throw new Error('Invalid Blob.');
    const blob = record.blob;
    const blobName = (blob as Blob & { name?: string }).name;
    return { kind: 'upload', blob, name: normalizeFilename(name, blobName || `file${inferExtension(blob.type)}`, 'file') };
  }
  const path = keys[0] === 'url' ? record.url : record.path;
  if (typeof path !== 'string' || !path.trim()) throw new Error('Empty file source.');
  if (/^(?:https?:\/\/|\/\/)/i.test(path)) {
    const url = new URL(path, 'https://zentao.invalid');
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid file URL.');
    return { kind: 'url', url: path, name };
  }
  if (keys[0] === 'url') throw new Error('File URLs must use HTTP(S).');
  if (/^file:(?!\/\/)/i.test(path)) {
    const id = /^file:(\d+)$/i.exec(path)?.[1];
    if (!positiveID(id)) throw new Error('Invalid ZenTao file ID.');
    return { kind: 'id', id: positiveID(id)!, name };
  }
  if (/^[a-z][a-z\d+.-]*:/i.test(path) && !/^file:\/\//i.test(path) && !/^[a-z]:[\\/]/i.test(path)) {
    throw new Error('Unsupported file path scheme.');
  }
  let normalized = path;
  let error: unknown;
  try { normalized = await localPath(path); } catch (cause) { error = cause; }
  return { kind: 'upload', path: normalized, name: normalizeFilename(name, filename(path), 'file'), error };
}

function extension(source: Source, reference: HtmlFileReference): string {
  for (const name of [source.name, source.kind === 'upload' ? source.path : undefined, reference.path]) {
    const match = name && /\.([a-z\d]{1,16})$/i.exec(name.replace(/[?#].*$/, ''));
    if (match) return match[1].toLowerCase();
  }
  if (source.kind === 'upload' && source.blob?.type) {
    const ext = inferExtension(source.blob.type);
    if (ext !== '.bin') return ext.slice(1);
  }
  return 'png';
}

/** Owns only the images uploaded during this object save. */
export class HtmlFileRequest {
  readonly warnings: FileWarning[] = [];
  private readonly uploads: Upload[] = [];
  private linkProfile?: Promise<LinkProfile>;
  checkSession?: () => void;

  constructor(private readonly command: ModuleActionRequest, private readonly context: Context, private uid?: string) {
    if (uid) this.checkSession = context.client[captureFileSession]();
  }

  private profile(): Promise<LinkProfile> {
    return this.linkProfile ??= this.context.client.getZentaoConfig({
      timeout: this.context.timeout, insecure: this.context.insecure,
    }).then(serverConfig => ({ server: this.context.client.siteUrl, serverConfig }));
  }

  private async fileLink(path: string) {
    const profile = await this.profile();
    const auto = profile.serverConfig?.moduleVar && profile.serverConfig.methodVar;
    const link = parseLink(profile, path, auto ? { requestType: 'auto' } : {});
    return !link.external && link.moduleName === 'file' && link.methodName === 'read' ? link : undefined;
  }

  private async warn(stage: FileWarning['stage'], error: unknown, reference: HtmlFileReference, fileID?: number): Promise<void> {
    const creating = this.command.action.type === 'create';
    const objectType = creating ? resolveResultObjectType(this.command.action.resultObjectType, this.command.params, {}) : this.command.module;
    const warning: FileWarning = {
      stage,
      code: error instanceof ZentaoError ? error.code : 'E_FILE_OPERATION_FAILED',
      message: error instanceof Error ? error.message : String(error),
      field: reference.field, path: reference.path, name: reference.name,
      ...(fileID !== undefined ? { fileID } : {}),
      ...(this.uid ? { uid: this.uid } : {}),
      ...(objectType ? { objectType } : {}),
      ...(!creating && this.command.id ? { objectID: this.command.id } : {}),
    };
    if (stage === 'resolve' && error instanceof ZentaoError) {
      const reason = error.details instanceof Error ? error.details.message : error.details;
      if (typeof reason === 'string' && reason) warning.message += ` (${reason})`;
    }
    this.warnings.push(warning);
    // Notifications must not turn a completed write into a reported failure.
    try { await this.context.onFileError?.({ ...warning }); } catch { /* notification only */ }
  }

  async prepare(markdownField?: string): Promise<void> {
    const documents = parseHtmlFiles(this.command.data, this.command.action, markdownField);
    const references = documents.flatMap(document => document.references);
    if (!references.length) return;
    const sources = new Map<HtmlFileReference, Source>();
    const replacements = new Map<HtmlFileReference, HtmlFileReplacement>();
    const resolver = this.context.fileResolver;

    // Finish all user resolution before the first upload, including later fields.
    for (const reference of references) {
      if (!reference.path || directURL(reference.path)) continue;
      const intrinsic = /^file:/i.test(reference.path);
      if (!intrinsic && !resolver) continue;
      if (!intrinsic && mayBeFileLink(reference.path)) {
        try {
          if (await this.fileLink(reference.path)) continue;
        } catch {
          // A resolver can still supply a network URL without working page routing.
        }
      }
      try {
        let value: ResolvedFile = reference.path;
        let name = reference.name;
        if (resolver && !/^file:(?!\/\/)/i.test(reference.path)) {
          if (typeof resolver === 'function') value = await resolver({ path: reference.path, name });
          else {
            const key = Object.hasOwn(resolver, reference.path) ? reference.path
              : name && Object.hasOwn(resolver, name) ? name : undefined;
            if (key === undefined) throw new Error('No matching file resolver entry.');
            value = resolver[key];
            if (typeof value === 'string') name = key;
          }
        }
        sources.set(reference, await sourceFor(value, name));
      } catch (cause) {
        const error = new ZentaoError('E_FILE_RESOLVE_FAILED', { path: reference.path }, cause);
        await this.warn('resolve', error, reference);
        if (this.context.continueOnFileResolveError !== true) throw error;
        replacements.set(reference, { text: reference.alt?.trim() ? reference.alt : reference.path });
      }
    }
    if (!sources.size && !replacements.size) return;
    if (!this.uid && [...sources.values()].some(source => source.kind === 'upload')) {
      this.uid = setFileUid(this.command, await newFileUid(), this.context.version);
      this.checkSession = this.context.client[captureFileSession]();
    }

    const uploaded = new Map<string | Blob, Map<string, { id?: number; url?: string; error?: unknown }>>();
    for (const [reference, source] of sources) {
      if (source.kind === 'url') {
        replacements.set(reference, { url: source.url });
        continue;
      }
      let id: number;
      if (source.kind === 'id') id = source.id;
      else {
        const key = source.blob ?? source.path!;
        let names = uploaded.get(key);
        if (!names) uploaded.set(key, names = new Map());
        let outcome = names.get(source.name);
        if (!outcome) {
          outcome = {};
          names.set(source.name, outcome);
          try {
            if (source.error) throw source.error;
            const file: FileUploadSource = source.blob
              ? { data: source.blob, filename: source.name }
              : { path: source.path!, filename: source.name };
            const response = await this.context.requestFile('create', { file, uid: this.uid, extra: 'editor' }, this.checkSession);
            const data = isRecord(response.data) ? response.data : {};
            outcome.id = positiveID(response.id) ?? positiveID(data.id) ?? positiveID(response.data);
            const url = typeof response.url === 'string' && response.url.trim() ? response.url : data.url;
            if (typeof url === 'string' && url.trim()) outcome.url = url;
            if (!outcome.id && !outcome.url) throw new ZentaoError('E_FILE_UPLOAD_FAILED');
            this.uploads.push({ id: outcome.id, url: outcome.url, reference });
          } catch (error) { outcome.error = error; }
        }
        if (Object.hasOwn(outcome, 'error')) {
          await this.warn('upload', outcome.error, reference);
          if (this.context.continueOnFileUploadError === false) throw outcome.error;
          replacements.set(reference, { error: outcome.error instanceof Error ? outcome.error.message : String(outcome.error) });
          continue;
        }
        if (outcome.url) {
          replacements.set(reference, { url: outcome.url });
          continue;
        }
        id = outcome.id!;
      }
      const url = createLink(await this.profile(), {
        moduleName: 'file', methodName: 'read', vars: `fileID=${id}`, viewType: extension(source, reference), relative: true,
      });
      replacements.set(reference, { url });
    }
    const changes = rewriteHtmlFiles(documents, replacements);
    if (Object.keys(changes).length) this.command.data = { ...this.command.data, ...changes };
  }

  async cleanup(): Promise<void> {
    const pending = this.uploads.splice(0);
    for (const upload of pending) {
      try {
        if (upload.id === undefined && upload.url && mayBeFileLink(upload.url)) {
          const route = await this.fileLink(upload.url);
          upload.id = positiveID(route?.params?.fileID ?? route?.params?.$1);
        }
        if (upload.id === undefined) throw new ZentaoError('E_FILE_UPLOAD_FAILED');
        await this.context.requestFile('delete', { fileID: upload.id }, this.checkSession);
      } catch (error) {
        this.uploads.push(upload);
        await this.warn('cleanup', error, upload.reference, upload.id);
      }
    }
  }

  /** Preserve the primary error and attach enough context to reconcile uncertain writes. */
  errorWithFiles(error: unknown): unknown {
    if (!this.uid && !this.warnings.length) return error;
    const fileIDs = this.uploads.flatMap(upload => upload.id === undefined ? [] : [upload.id]);
    const extra = { uid: this.uid, fileIDs, fileWarnings: [...this.warnings] };
    if (error instanceof ZentaoError) {
      return new ZentaoError(error.code, error.params, {
        ...(plainRecord(error.details) ? error.details : { cause: error.details }), ...extra,
      });
    }
    if (error instanceof Error && Object.isExtensible(error)) {
      const descriptor = Object.getOwnPropertyDescriptor(error, 'details');
      if (!descriptor || descriptor.configurable) {
        Object.defineProperty(error, 'details', { value: { cause: descriptor?.value, ...extra }, configurable: true });
        return error;
      }
    }
    return Object.assign(new Error(error instanceof Error ? error.message : String(error), { cause: error }), { details: extra });
  }

  async saveError(error: unknown, outcome: WriteOutcome): Promise<unknown> {
    if (this.uploads.length && (outcome === 'rejected' || outcome === 'not-sent')) await this.cleanup();
    return this.errorWithFiles(error);
  }

  async complete(raw: unknown, outcome: WriteOutcome, rawMode: boolean): Promise<void> {
    if (!this.uid) return;
    if (outcome === 'rejected') return this.cleanup();
    if (outcome === 'unknown' && !rawMode) {
      throw this.errorWithFiles(new ZentaoError('E_FILE_SAVE_UNCONFIRMED', undefined, raw));
    }
  }
}
