import { ZentaoError } from '../misc/errors.js';
import type { WriteOutcome } from '../types/response.js';
import { isBlank, isRecord } from '../utils/object.js';

export interface WriteAttempt {
  phase?: 'preparing' | 'before-hook' | 'custom' | 'dispatching' | 'received';
  outcome?: WriteOutcome;
  /** A strict JSON action consumes its Response after client.fetch has returned the headers. */
  responseBodyError?: (cause: unknown) => ZentaoError;
}

// Associate only the primary transport's fresh options with this write. A shared
// client, a prefetch or an attachment request can run concurrently with it.
export const writeAttempts = new WeakMap<object, WriteAttempt>();

// These HTTP responses explicitly reject the request. A 408 or 5xx can follow a successful save.
export const rejectionStatuses: ReadonlySet<number> = new Set([400, 401, 403, 404, 405, 409, 412, 413, 415, 422, 429]);

export function trackWrite<T extends object>(options: T, write: WriteAttempt | undefined): T {
  if (write) writeAttempts.set(options, write);
  return options;
}

export function positiveID(value: unknown): number | undefined {
  if (typeof value !== 'number' && typeof value !== 'string') return undefined;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
}

function failed(value: unknown): boolean {
  return value === 'fail' || value === 'error' || value === 'failed';
}

type ReceiptOutcome = Exclude<WriteOutcome, 'not-sent'>;

function explicitOutcome(record: Record<string, unknown>): ReceiptOutcome | undefined {
  // The strict JSON adapter builds this diagnostic when it cannot read a valid receipt.
  if (record.status === 'fail' && typeof record.httpStatus === 'number' && typeof record.responseText === 'string') return 'unknown';
  if (failed(record.status) || failed(record.result)) return 'rejected';
  if (record.status === 'success' || record.result === 'success') return 'confirmed';
}

export function classifyWriteReceipt(raw: unknown): ReceiptOutcome {
  if (isRecord(raw)) {
    const outcome = explicitOutcome(raw);
    if (outcome) return outcome;
    if (positiveID(raw.id)) return 'confirmed';
    if (isRecord(raw.data) && positiveID(raw.data.id)) return 'confirmed';
  }
  return positiveID(raw) ? 'confirmed' : 'unknown';
}

export interface FileReceipt {
  outcome: ReceiptOutcome;
  message?: unknown;
  id?: number;
  url?: string;
}

function fileURL(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

// Upload and deletion can wrap a second receipt in data. Other actions use data for business objects.
export function readFileReceipt(action: 'create' | 'delete', raw: unknown): FileReceipt {
  const record = isRecord(raw) ? raw : undefined;
  const data = record?.data;
  const nested = isRecord(data) ? data : undefined;
  const outcome = record && explicitOutcome(record);
  const message = record?.message;
  if (outcome === 'unknown') return { outcome, message };
  if (outcome === 'rejected') {
    const fallback = nested && explicitOutcome(nested) !== 'confirmed' ? nested.message : undefined;
    return { outcome, message: isBlank(message) ? fallback ?? message : message };
  }
  if (nested && (failed(nested.status) || failed(nested.result))) {
    const reason = nested.message;
    return { outcome: 'rejected', message: isBlank(reason) && !outcome ? message ?? reason : reason };
  }
  if (action === 'delete') return { outcome: outcome ?? 'unknown', message };

  const id = positiveID(record?.id) ?? positiveID(nested?.id) ?? positiveID(record ? data : raw);
  const url = fileURL(record?.url) ?? fileURL(nested?.url);
  return { outcome: outcome ?? (id ? 'confirmed' : 'unknown'), message, id, url };
}

export function classifyWriteError(phase: WriteAttempt['phase'], error: unknown): WriteOutcome {
  if (phase === 'preparing' || phase === 'before-hook') return 'not-sent';
  if (phase === 'dispatching' && error instanceof ZentaoError) {
    if (error.code === 'E_API_FAILED') return 'rejected';
    if (error.code === 'E_HTTP_ERROR' && isRecord(error.details) && rejectionStatuses.has(Number(error.details.status))) return 'rejected';
  }
  return 'unknown';
}
