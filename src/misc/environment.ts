import { ZentaoError } from './errors.js';

/** 判断当前运行时是否为 Node.js。 */
export function isNodeRuntime(): boolean {
  return typeof process !== 'undefined' && Boolean(process.versions?.node);
}

// 通过函数参数间接化 `import(specifier)`，让打包器无法在静态分析阶段把
// `node:*` 拉进浏览器 bundle；同时不依赖 `new Function`/`eval`，
// 在严格 CSP 下也能正常加载。
function importNodeModule<T>(specifier: string): Promise<T> {
  return import(specifier) as Promise<T>;
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

function hasHeader(headers: Record<string, string>, name: string): boolean {
  const normalized = name.toLowerCase();
  return Object.keys(headers).some((key) => key.toLowerCase() === normalized);
}

async function toNodeBody(
  body: BodyInit | null | undefined,
  headers: Record<string, string>,
): Promise<string | Uint8Array | undefined> {
  if (body === undefined || body === null) return undefined;
  if (typeof body === 'string') return body;
  if (body instanceof Uint8Array) return body;
  if (body instanceof ArrayBuffer) return new Uint8Array(body);
  if (ArrayBuffer.isView(body)) {
    return new Uint8Array(body.buffer, body.byteOffset, body.byteLength);
  }
  if (body instanceof Blob) {
    if (body.type && !hasHeader(headers, 'content-type')) {
      headers['content-type'] = body.type;
    }
    return new Uint8Array(await body.arrayBuffer());
  }
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    const request = new Request('https://zentao-api.local/', { method: 'POST', body });
    const contentType = request.headers.get('content-type');
    if (contentType && !hasHeader(headers, 'content-type')) {
      headers['content-type'] = contentType;
    }
    return new Uint8Array(await request.arrayBuffer());
  }
  if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) {
    if (!hasHeader(headers, 'content-type')) {
      headers['content-type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
    }
    return body.toString();
  }
  if (typeof ReadableStream !== 'undefined' && body instanceof ReadableStream) {
    throw new ZentaoError('E_INVALID_PARAM', { param: 'body', value: 'ReadableStream' });
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
    ? await importNodeModule<typeof import('node:https')>('node:https')
    : await importNodeModule<typeof import('node:http')>('node:http');
  const headers = toNodeRequestHeaders(init.headers);
  if (!hasHeader(headers, 'accept-encoding')) {
    headers['accept-encoding'] = 'identity';
  }
  const body = await toNodeBody(init.body, headers);

  return new Promise<Response>((resolve, reject) => {
    if (init.signal?.aborted) {
      reject(abortError());
      return;
    }

    let settled = false;
    let activeResponse: { destroy(error?: Error): void } | undefined;

    const cleanup = () => {
      init.signal?.removeEventListener('abort', abortHandler);
    };
    const rejectOnce = (error: unknown) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };
    const resolveOnce = (response: Response) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(response);
    };

    const request = transport.request(parsed, {
      method: init.method ?? 'GET',
      headers,
      rejectUnauthorized,
    }, (response) => {
      activeResponse = response;
      const chunks: Uint8Array[] = [];
      let ended = false;

      response.on('data', (chunk: Uint8Array | string) => {
        chunks.push(typeof chunk === 'string' ? new TextEncoder().encode(chunk) : chunk);
      });

      response.once('aborted', () => {
        rejectOnce(new Error('HTTP response was aborted before completion.'));
      });
      response.once('error', rejectOnce);
      response.once('close', () => {
        if (!ended) rejectOnce(new Error('HTTP response closed before completion.'));
      });
      response.once('end', () => {
        ended = true;
        const responseBody = chunks.length > 0 ? concatenateChunks(chunks) : undefined;
        const fetchResponse = new Response(responseBody, {
          status: response.statusCode ?? 200,
          statusText: response.statusMessage ?? '',
          headers: toResponseHeaders(response.headers),
        });
        Object.defineProperty(fetchResponse, 'url', { value: url });
        resolveOnce(fetchResponse);
      });
    });

    const abortHandler = () => {
      const error = abortError();
      rejectOnce(error);
      activeResponse?.destroy(error);
      request.destroy(error);
    };

    request.once('error', rejectOnce);

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
