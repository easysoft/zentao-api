import type { ZentaoClient } from '../client/index.js';
import { ZentaoError } from '../misc/errors.js';
import { isNodeRuntime } from '../misc/environment.js';
import { parseZentaoVersion, supportsZentaoVersion } from '../misc/zentao-version.js';
import { getModuleAction } from '../modules/query.js';
import { extractResult } from '../modules/resolve.js';
import { resolveResultObjectType } from '../modules/result-object-type.js';
import type { FileHandlingOptions, FileUploadSource, FileWarning, LinkProfile, ModuleActionRequest, ResolvedFile, ResponseData } from '../types/index.js';
import { isRecord } from '../utils/object.js';
import { createLink, parseLink } from '../utils/link.js';
import { parseHtmlFiles, rewriteHtmlFiles, type HtmlFileReference } from './html-files.js';
import { inferExtension, normalizeFilename } from './prepare-body.js';

type FileRequest = (action: 'create' | 'get' | 'link' | 'delete', params: Record<string, unknown>) => Promise<ResponseData>;
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
  id: number;
  reference: HtmlFileReference;
}

function positiveID(value: unknown): number | undefined {
  if (typeof value !== 'number' && typeof value !== 'string') return undefined;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
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

/** Owns only files uploaded by this request, through submission and association. */
export class HtmlFileRequest {
  readonly warnings: FileWarning[] = [];
  private readonly uploads: Upload[] = [];
  private objectType?: string;
  private objectID?: number;

  constructor(private readonly command: ModuleActionRequest, private readonly context: Context) {}

  private async warn(stage: FileWarning['stage'], error: unknown, reference?: HtmlFileReference, fileID?: number): Promise<void> {
    const warning: FileWarning = {
      stage,
      code: error instanceof ZentaoError ? error.code : 'E_FILE_OPERATION_FAILED',
      message: error instanceof Error ? error.message : String(error),
      ...(reference ? { field: reference.field, path: reference.path, name: reference.name } : {}),
      ...(fileID !== undefined ? { fileID } : {}),
      ...(this.objectType ? { objectType: this.objectType } : {}),
      ...(this.objectID !== undefined ? { objectID: this.objectID } : {}),
    };
    this.warnings.push(warning);
    // Notifications must not turn a completed write into a reported failure.
    try { await this.context.onFileError?.({ ...warning }); } catch { /* notification only */ }
  }

  private assertVersion(actionName: 'create' | 'link', version: string): void {
    const action = getModuleAction('file', actionName);
    if (!action) throw new ZentaoError('E_INVALID_ACTION', { module: 'file', action: actionName });
    if (!supportsZentaoVersion(parseZentaoVersion(version), action.minVersion)) {
      throw new ZentaoError('E_UNSUPPORTED_ZENTAO_VERSION', {
        action: `file/${actionName}`, version, minVersion: action.minVersion.join(', '),
      }, { action: `file/${actionName}`, version, minVersion: action.minVersion });
    }
  }

  async prepare(): Promise<void> {
    if (String(this.command.action.method).toUpperCase() === 'GET') return;
    const documents = parseHtmlFiles(this.command.data, this.command.action);
    const references = documents.flatMap(document => document.references);
    if (!references.length) return;
    let profilePromise: Promise<LinkProfile> | undefined;
    const profile = () => profilePromise ??= this.context.client.getZentaoConfig({
      timeout: this.context.timeout, insecure: this.context.insecure,
    }).then(serverConfig => ({ server: this.context.client.siteUrl, serverConfig }));
    const sources = new Map<HtmlFileReference, Source>();
    const resolver = this.context.fileResolver;

    // Finish all user resolution before the first upload, including later fields.
    for (const reference of references) {
      if (!reference.path || directURL(reference.path)) continue;
      const intrinsic = /^file:/i.test(reference.path);
      if (!intrinsic && !resolver) continue;
      if (!intrinsic && mayBeFileLink(reference.path)) {
        try {
          const link = parseLink(await profile(), reference.path);
          if (!link.external && link.moduleName === 'file' && link.methodName === 'read') continue;
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
        throw error;
      }
    }
    if (!sources.size) return;
    const needsUpload = [...sources.values()].some(source => source.kind === 'upload');
    const needsLink = [...sources.values()].some(source => source.kind !== 'url');
    let linkProfile: LinkProfile | undefined;
    if (needsLink) {
      linkProfile = await profile();
      createLink(linkProfile, { moduleName: 'file', methodName: 'read', vars: 'fileID=1', viewType: 'png', relative: true });
    }
    if (needsUpload) {
      this.objectType = this.command.action.type === 'create'
        ? resolveResultObjectType(this.command.action.resultObjectType, this.command.params, {})
        : this.command.module;
      this.objectID = this.command.action.type === 'create' ? undefined : positiveID(this.command.id);
      if (!this.objectType || (this.command.action.type !== 'create' && !this.objectID)) {
        throw new ZentaoError('E_FILE_TARGET_UNKNOWN');
      }
      const version = this.context.version ?? linkProfile!.serverConfig!.version;
      this.assertVersion('create', version);
      if (this.command.action.type === 'create') this.assertVersion('link', version);
    }

    const replacements = new Map<HtmlFileReference, { url?: string; name?: string; error?: string }>();
    const uploaded = new Map<string | Blob, Map<string, { id?: number; error?: unknown }>>();
    for (const [reference, source] of sources) {
      if (source.kind === 'url') {
        replacements.set(reference, { url: source.url, name: source.name });
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
            const response = await this.context.requestFile('create', {
              file,
              ...(this.objectID ? { objectType: this.objectType, objectID: this.objectID } : {}),
            });
            outcome.id = positiveID(isRecord(response.data) ? response.data.id : undefined);
            if (!outcome.id) throw new ZentaoError('E_FILE_UPLOAD_FAILED');
            this.uploads.push({ id: outcome.id, reference });
          } catch (error) { outcome.error = error; }
        }
        if (Object.hasOwn(outcome, 'error')) {
          await this.warn('upload', outcome.error, reference);
          if (this.context.continueOnFileUploadError === false) throw outcome.error;
          replacements.set(reference, { error: outcome.error instanceof Error ? outcome.error.message : String(outcome.error) });
          continue;
        }
        id = outcome.id!;
      }
      const url = createLink(linkProfile!, {
        moduleName: 'file', methodName: 'read', vars: `fileID=${id}`, viewType: extension(source, reference), relative: true,
      });
      replacements.set(reference, { url, name: source.name || `file-read-${id}.${extension(source, reference)}` });
    }
    const changes = rewriteHtmlFiles(documents, replacements);
    if (Object.keys(changes).length) this.command.data = { ...this.command.data, ...changes };
  }

  async cleanup(): Promise<void> {
    const pending = this.uploads.splice(0);
    for (const upload of pending) {
      try { await this.context.requestFile('delete', { fileID: upload.id }); }
      catch (error) {
        this.uploads.push(upload);
        await this.warn('cleanup', error, upload.reference, upload.id);
      }
    }
  }

  /** Preserve the primary error and attach enough context to reconcile uncertain writes. */
  errorWithFiles(error: unknown): unknown {
    if (!this.uploads.length && !this.warnings.length) return error;
    const extra = { fileIDs: this.uploads.map(upload => upload.id), fileWarnings: [...this.warnings] };
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

  async complete(raw: unknown): Promise<void> {
    if (!this.uploads.length || this.command.action.type !== 'create') return;
    if (isRecord(raw) && raw.status === 'fail') {
      await this.cleanup();
      return;
    }
    let result: unknown;
    try { result = isRecord(raw) ? extractResult(this.command.action, raw, this.command.params, {}) : raw; } catch { /* retained below */ }
    this.objectID = positiveID(isRecord(result) ? result.id : result);
    if (!this.objectID && isRecord(raw)) this.objectID = positiveID(raw.id);
    if (!this.objectID) {
      for (const upload of this.uploads) await this.warn('associate', new ZentaoError('E_FILE_OBJECT_ID_MISSING'), upload.reference, upload.id);
      return;
    }
    for (const upload of this.uploads) {
      try {
        await this.context.requestFile('link', { fileID: upload.id, objectType: this.objectType, objectID: this.objectID });
      } catch (error) {
        // Some servers associate editor uploads while creating the object, before file/link runs.
        if (error instanceof ZentaoError && error.code === 'E_HTTP_ERROR' && isRecord(error.details) && error.details.status === 409) {
          try {
            const current = (await this.context.requestFile('get', { fileID: upload.id })).data;
            if (isRecord(current) && current.objectType === this.objectType && positiveID(current.objectID) === this.objectID) continue;
          } catch { /* Preserve the original conflict when the current association cannot be verified. */ }
        }
        await this.warn('associate', error, upload.reference, upload.id);
      }
    }
  }
}
