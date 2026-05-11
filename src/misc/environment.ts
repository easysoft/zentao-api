import { ZentaoError } from './errors.js';

type NodeHttp = typeof import('node:http');
type NodeHttps = typeof import('node:https');

/** 判断当前运行时是否为 Node.js。 */
export function isNodeRuntime(): boolean {
  return typeof process !== 'undefined' && Boolean(process.versions?.node);
}

async function importNodeModule<T>(specifier: string): Promise<T> {
  const dynamicImport = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<T>;
  return dynamicImport(specifier);
}

function toNodeRequestHeaders(headers: RequestInit['headers']): Record<string, string> {
  const result: Record<string, string> = {};
  new Headers(headers).forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

function toResponseHeaders(headers: NodeJS.Dict<string | string[] | number>): Headers {
  const result = new Headers();
  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined) continue;
    result.set(key, Array.isArray(value) ? value.join(', ') : String(value));
  }
  return result;
}

async function toNodeBody(body: BodyInit | null | undefined): Promise<string | Uint8Array | undefined> {
  if (body === undefined || body === null) return undefined;
  if (typeof body === 'string') return body;
  if (body instanceof Uint8Array) return body;
  if (body instanceof ArrayBuffer) return new Uint8Array(body);
  if (ArrayBuffer.isView(body)) {
    return new Uint8Array(body.buffer, body.byteOffset, body.byteLength);
  }
  if (body instanceof Blob) {
    return new Uint8Array(await body.arrayBuffer());
  }
  return String(body);
}

function abortError(): DOMException {
  return new DOMException('The operation was aborted.', 'AbortError');
}

function concatenateChunks(chunks: Uint8Array[]): ArrayBuffer {
  const totalLength = chunks.reduce((total, chunk) => total + chunk.byteLength, 0);
  const result: Uint8Array<ArrayBuffer> = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result.buffer;
}

async function nodeFetchWithTlsOptions(url: string, init: RequestInit, rejectUnauthorized: boolean): Promise<Response> {
  const parsed = new URL(url);
  const transport = parsed.protocol === 'https:'
    ? await importNodeModule<NodeHttps>('node:https')
    : await importNodeModule<NodeHttp>('node:http');
  const body = await toNodeBody(init.body);

  return new Promise<Response>((resolve, reject) => {
    if (init.signal?.aborted) {
      reject(abortError());
      return;
    }

    const request = transport.request(parsed, {
      method: init.method ?? 'GET',
      headers: toNodeRequestHeaders(init.headers),
      rejectUnauthorized,
    }, (response) => {
      const chunks: Uint8Array[] = [];

      response.on('data', (chunk: Uint8Array | string) => {
        chunks.push(typeof chunk === 'string' ? new TextEncoder().encode(chunk) : chunk);
      });

      response.on('end', () => {
        cleanup();
        const responseBody = chunks.length > 0 ? concatenateChunks(chunks) : undefined;
        const fetchResponse = new Response(responseBody, {
          status: response.statusCode ?? 200,
          statusText: response.statusMessage ?? '',
          headers: toResponseHeaders(response.headers),
        });
        Object.defineProperty(fetchResponse, 'url', { value: url });
        resolve(fetchResponse);
      });
    });

    const cleanup = () => {
      init.signal?.removeEventListener('abort', abortHandler);
    };
    const abortHandler = () => {
      cleanup();
      request.destroy(abortError());
    };

    request.on('error', (error) => {
      cleanup();
      reject(error);
    });

    init.signal?.addEventListener('abort', abortHandler, { once: true });
    if (body !== undefined) request.write(body);
    request.end();
  });
}

/** 浏览器无法跳过 TLS 校验，因此在发起请求前提前失败。 */
export function assertInsecureSupported(enabled: boolean | undefined): void {
  if (enabled && !isNodeRuntime()) {
    throw new ZentaoError('E_INSECURE_BROWSER');
  }
}

/** 发起 fetch 请求；Node.js 下的 `insecure` 只作用于当前 HTTPS 请求。 */
export async function fetchWithInsecureTls(
  enabled: boolean | undefined,
  url: string,
  init: RequestInit,
): Promise<Response> {
  if (!enabled) return fetch(url, init);
  assertInsecureSupported(enabled);
  return nodeFetchWithTlsOptions(url, init, false);
}

/** 保留给内部测试和兼容调用：校验 TLS 选项，但不再改写进程级环境变量。 */
export async function withInsecureTls<T>(enabled: boolean | undefined, fn: () => Promise<T>): Promise<T> {
  if (!enabled) return fn();
  assertInsecureSupported(enabled);
  return fn();
}
