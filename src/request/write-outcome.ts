import { ZentaoError } from '../misc/errors.js';
import type { WriteOutcome } from '../types/response.js';
import { isRecord } from '../utils/object.js';

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

export function isWriteFailure(raw: Record<string, unknown>): boolean {
  return failed(raw.status) || failed(raw.result);
}

export function classifyWriteReceipt(raw: unknown): Exclude<WriteOutcome, 'not-sent'> {
  if (isRecord(raw)) {
    // The strict JSON adapter builds this diagnostic when it cannot read a valid receipt.
    if (raw.status === 'fail' && typeof raw.httpStatus === 'number' && typeof raw.responseText === 'string') return 'unknown';
    if (isWriteFailure(raw)) return 'rejected';
    if (raw.status === 'success' || raw.result === 'success' || positiveID(raw.id)) return 'confirmed';
    if (isRecord(raw.data) && positiveID(raw.data.id)) return 'confirmed';
  }
  return positiveID(raw) ? 'confirmed' : 'unknown';
}

export function classifyWriteError(phase: WriteAttempt['phase'], error: unknown): WriteOutcome {
  if (phase === 'preparing' || phase === 'before-hook') return 'not-sent';
  if (phase === 'dispatching' && error instanceof ZentaoError) {
    if (error.code === 'E_API_FAILED') return 'rejected';
    if (error.code === 'E_HTTP_ERROR' && isRecord(error.details) && rejectionStatuses.has(Number(error.details.status))) return 'rejected';
  }
  return 'unknown';
}
