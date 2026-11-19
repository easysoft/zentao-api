import { afterEach, beforeEach, expect, mock, spyOn, test } from 'bun:test';
import { ZentaoClient, exportRegistry, getGlobalOptions, getModuleActionParams, parseFileUrl, readImageFile, request, setGlobalOptions } from '../src/index';
import { resetModuleDefinitions } from '../src/modules/registry';

const servers: ReturnType<typeof Bun.serve>[] = [];
function createClient(fetch: (req: Request) => Response | Promise<Response>): ZentaoClient {
  const server = Bun.serve({ port: 0, fetch });
  servers.push(server);
  return new ZentaoClient({ baseUrl: server.url.href, token: 'file-token' });
}

beforeEach(() => {
  resetModuleDefinitions();
  setGlobalOptions({ version: '23.0' });
});
afterEach(() => {
  for (const server of servers.splice(0)) server.stop(true);
  resetModuleDefinitions();
  setGlobalOptions({ version: undefined, timeout: undefined, insecure: undefined, actionAssistant: undefined, autoFill: undefined });
});

const file = { id: 42, title: 'example.png', extension: 'png', size: 1024, realPath: '/uploads/example.png', gid: '', addedBy: 'admin', addedDate: '2026-11-17 00:00:00', objectType: 'task', objectID: 1 };

test('readImageFile uses a path image extension in a single binary request', async () => {
  const paths: string[] = [];
  const bytes = Uint8Array.of(0, 255, 128, 10);
  const client = createClient(req => {
    expect(req.method).toBe('GET');
    expect(req.headers.get('Token')).toBe('file-token');
    expect(req.headers.get('ZenTao-Action-Assistant')).toBe('AI <read>');
    const url = new URL(req.url);
    paths.push(url.pathname + url.search);
    return new Response(bytes);
  });
  const image = await readImageFile(client.siteUrl + '/file-read-42.JPEG?size=large', {
    client, actionAssistant: { name: 'AI', info: 'read' },
  });
  expect(paths).toEqual(['/api.php/v2/files/42/read?stream=0']);
  expect(image).toEqual({ fileID: 42, filename: '42.jpeg', contentType: 'image/jpeg', data: bytes.buffer });
});

test('readImageFile accepts a parsed route with its method and extension intact', async () => {
  const paths: string[] = [];
  const client = createClient(req => {
    const url = new URL(req.url);
    paths.push(url.pathname + url.search);
    return new Response(Uint8Array.of(0, 255));
  });
  expect(await readImageFile(parseFileUrl('/file-download-42.html')!, { client })).toBeUndefined();
  const image = await readImageFile(parseFileUrl('/file-read-42.PNG')!, { client });
  expect(image?.data).toBeInstanceOf(ArrayBuffer);
  expect(new Uint8Array(image!.data)).toEqual(Uint8Array.of(0, 255));
  expect(paths).toEqual(['/api.php/v2/files/42/read?stream=0']);
});

test('readImageFile resolves query links from metadata even when the view parameter says png', async () => {
  const paths: string[] = [];
  const bytes = Uint8Array.of(82, 73, 70, 70);
  const previous = getGlobalOptions().client;
  const client = createClient(req => {
    expect(req.headers.get('ZenTao-Action-Assistant')).toBe('AI');
    const url = new URL(req.url);
    paths.push(url.pathname + url.search);
    if (url.pathname.endsWith('/42/read')) return new Response(bytes);
    // Both requests must stay on the client selected at the start of the read.
    setGlobalOptions({ client: undefined });
    return Response.json({ status: 'success', file: { title: 'preview.jpg', extension: 'WEBP' } });
  });
  setGlobalOptions({ client });
  try {
    const image = await readImageFile(client.siteUrl + '/index.php?m=file&amp;f=read&amp;fileID=42&amp;t=png', { actionAssistant: 'AI' });
    expect(paths).toEqual(['/api.php/v2/files/42', '/api.php/v2/files/42/read?stream=0']);
    expect(image).toEqual({ fileID: 42, filename: '42.webp', contentType: 'image/webp', data: bytes.buffer });
  } finally {
    setGlobalOptions({ client: previous });
  }
});

test('readImageFile uses the title suffix only when metadata has no extension', async () => {
  const paths: string[] = [];
  const client = createClient(req => {
    const url = new URL(req.url);
    paths.push(url.pathname + url.search);
    if (url.pathname.endsWith('/read')) return new Response('tiff bytes');
    const metadata = url.pathname.endsWith('/42') ? { title: 'screen.TIFF' } : { title: 'screen.png', extension: 'pdf' };
    return Response.json({ status: 'success', file: metadata });
  });
  expect(await readImageFile(42, { client })).toMatchObject({ filename: '42.tiff', contentType: 'image/tiff' });
  expect(await readImageFile('/file-read-42', { client })).toMatchObject({ filename: '42.tiff', contentType: 'image/tiff' });
  expect(await readImageFile('/?module=file&method=read&fileID=43', { client })).toBeUndefined();
  expect(paths).toEqual([
    '/api.php/v2/files/42', '/api.php/v2/files/42/read?stream=0',
    '/api.php/v2/files/42', '/api.php/v2/files/42/read?stream=0', '/api.php/v2/files/43',
  ]);
});

test('readImageFile skips downloads, non-image paths and invalid references before any HTTP request', async () => {
  let calls = 0;
  const client = createClient(() => { calls++; return new Response(); });
  setGlobalOptions({ version: undefined });
  for (const source of [
    '/file-download-42-left.html', '/?m=file&f=download&fileID=42&t=png', '/file-read-42.pdf',
    '/?m=file&f=read&fileID=42&fileID=43', '/?m=file&f=read&method=download&fileID=42',
    '/file-read-42.png?m=file&f=download&fileID=43',
    'https://other.example/file-read-42.png', '/assets/photo.png', 0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1,
  ]) {
    expect(await readImageFile(source, { client })).toBeUndefined();
  }
  expect(calls).toBe(0);
});

test('readImageFile propagates failed requests and skips empty image content', async () => {
  const paths: string[] = [];
  const client = createClient(req => {
    const url = new URL(req.url);
    paths.push(url.pathname);
    if (url.pathname.endsWith('/42')) return Response.json({ status: 'fail', message: 'Access denied' });
    if (url.pathname.endsWith('/43/read')) return new Response('Not found', { status: 404 });
    return new Response();
  });
  await expect(readImageFile(42, { client })).rejects.toMatchObject({ code: 'E_API_FAILED' });
  await expect(readImageFile('/file-read-43.png', { client })).rejects.toMatchObject({ code: 'E_HTTP_ERROR' });
  expect(await readImageFile('/file-read-44.png', { client })).toBeUndefined();
  expect(paths).toEqual(['/api.php/v2/files/42', '/api.php/v2/files/43/read', '/api.php/v2/files/44/read']);
});

test('file/get supports IDs, shorthand and encoded gids after reset', async () => {
  const paths: string[] = [];
  const client = createClient(req => {
    expect(req.method).toBe('GET');
    expect(req.headers.get('Token')).toBe('file-token');
    expect(req.headers.get('ZenTao-Action-Assistant')).toBe('AI <metadata>');
    const url = new URL(req.url);
    paths.push(url.pathname);
    expect(url.search).toBe('');
    return Response.json({ status: 'success', file });
  });
  setGlobalOptions({ version: '22.5' });
  const options = { client, actionAssistant: { name: 'AI', info: 'metadata' } };
  const gid = 'Zy0+Pz8/eA==';
  for (const [name, params] of [
    ['file/get', { id: 42 }], ['file/get', { fileID: '42' }],
    ['file/42', { fileID: 99 }], ['file/get', { fileID: gid }],
  ] as const) {
    const response = await request(name, params, options);
    expect(response.data).toEqual(file);
    expect(response.pager).toBeUndefined();
  }
  expect(await request('file/get', { fileID: 42 }, { ...options, raw: true })).toEqual({ status: 'success', file });
  expect(paths).toEqual(['/api.php/v2/files/42', '/api.php/v2/files/42', '/api.php/v2/files/42', `/api.php/v2/files/${encodeURIComponent(gid)}`, '/api.php/v2/files/42']);
  await expect(request('file/get', {}, options)).rejects.toMatchObject({ code: 'E_MISSING_PARAM' });
  expect(paths).toHaveLength(5);
  expect(exportRegistry().file.actions.find(action => action.name === 'get')?.resultGetter).toBe('file');
});

test('file/get preserves numeric error messages and rejects non-JSON responses', async () => {
  let result = Response.json({ status: 'fail', message: 404 }, { status: 404 });
  const client = createClient(() => result.clone());
  await expect(request('file/get', { id: 42 }, { client })).rejects.toMatchObject({
    code: 'E_HTTP_ERROR', details: { status: 404, body: '{"status":"fail","message":404}' },
  });
  result = Response.json({ status: 'fail', message: 404 });
  await expect(request('file/get', { id: 42 }, { client })).resolves.toMatchObject({ status: 'fail', message: '404', rawMessage: 404 });
  await expect(request('file/get', { id: 42 }, { client, throwOnFail: true })).rejects.toMatchObject({ code: 'E_API_FAILED' });
  result = new Response('PHP error');
  await expect(request('file/get', { id: 42 }, { client })).resolves.toMatchObject({ status: 'fail', raw: { responseText: 'PHP error' } });
});

test('file/update keeps explicit names and only prefetches metadata with autoFill enabled', async () => {
  const calls: { method: string; path: string; body?: unknown }[] = [];
  const client = createClient(async req => {
    const call = { method: req.method, path: new URL(req.url).pathname, body: req.method === 'PUT' ? await req.json() : undefined };
    calls.push(call);
    return Response.json(req.method === 'GET' ? { status: 'success', file } : { status: 'success' });
  });
  setGlobalOptions({ version: '22.5' });
  await request('file/update', { id: 42, fileName: 'first.png', extra: 'editor' }, { client });
  await request('file/update', { id: 42, fileName: 'flat.png', data: { fileName: 'second.png' } }, { client, autoFill: true });
  expect(calls).toEqual([
    { method: 'PUT', path: '/api.php/v2/files/42', body: { fileName: 'first.png' } },
    { method: 'GET', path: '/api.php/v2/files/42', body: undefined },
    { method: 'PUT', path: '/api.php/v2/files/42', body: { fileName: 'second.png' } },
  ]);
});

test('file/read keeps binary and empty bodies intact in default, explicit and raw modes', async () => {
  let bytes = new Uint8Array([0, 255, 195, 40, 128, 13, 10]);
  let calls = 0;
  const client = createClient(req => {
    calls++;
    expect(req.method).toBe('GET');
    expect(new URL(req.url).pathname).toBe('/api.php/v2/files/42/read');
    expect(new URL(req.url).search).toBe('?stream=0');
    return new Response(bytes, { headers: { 'Content-Type': 'application/octet-stream' } });
  });
  expect(getModuleActionParams('file', 'read', { roles: ['query'] })).toContainEqual(expect.objectContaining({ name: 'stream', type: 'number', defaultValue: 0 }));
  expect(exportRegistry().file.actions.find(action => action.name === 'read')?.params?.[0].options?.map(option => option.value)).toEqual([0, 1]);
  for (const content of [bytes, new Uint8Array(), new TextEncoder().encode('{"status":"fail"}')]) {
    bytes = content;
    for (const params of [{ id: 42 }, { fileID: 42, stream: 0 }, { fileID: 42, stream: '0' }]) {
      const response = await request('file/read', params, { client });
      expect(response.status).toBe('success');
      expect(response.data).toBeInstanceOf(ArrayBuffer);
      expect(new Uint8Array(response.data as ArrayBuffer)).toEqual(bytes);
    }
    const raw = await request('file/read', { fileID: 42 }, { client, raw: true });
    expect(raw).toBeInstanceOf(ArrayBuffer);
    expect(new Uint8Array(raw as ArrayBuffer)).toEqual(bytes);
  }
  expect(calls).toBe(12);
});

test('file/read preserves Base64 text, including numeric-looking and empty strings', async () => {
  let text = '';
  const client = createClient(req => {
    expect(new URL(req.url).search).toBe('?stream=1');
    return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=UTF-8' } });
  });
  for (const value of ['aGVsbG8=', '1234', '']) {
    text = value;
    for (const stream of [1, '1']) {
      expect((await request('file/read', { id: 42, stream }, { client })).data).toBe(value);
      expect(await request('file/read', { id: 42, stream }, { client, raw: true })).toBe(value);
    }
  }
});

test('file/read rejects unsupported stream values and missing IDs before transport', async () => {
  let calls = 0;
  const client = createClient(() => { calls++; return new Response(''); });
  for (const stream of [2, -1, true, false, null, '', '01', 'text', [1], {}, Number.NaN]) {
    await expect(request('file/read', { fileID: 42, stream }, { client })).rejects.toMatchObject({ code: 'E_INVALID_PARAM', params: { param: 'stream' } });
  }
  await expect(request('file/read', {}, { client })).rejects.toMatchObject({ code: 'E_MISSING_PARAM' });
  expect(calls).toBe(0);
});

test.each([0, 1])('file/read keeps JSON HTTP errors out of stream=%i file content', async stream => {
  let status = 404;
  const body = JSON.stringify({ status: 'fail', message: '文件不存在或无访问权限。' });
  const client = createClient(() => new Response(body, { status, headers: { 'Content-Type': 'application/json' } }));
  for (const code of [401, 403, 404]) {
    status = code;
    for (const raw of [false, true]) {
      await expect(request('file/read', { id: 42, stream }, { client, raw })).rejects.toMatchObject({ code: 'E_HTTP_ERROR', details: { status, body } });
    }
  }
});

test('file/read fetches 8 MiB once and passes the original buffer through processing options', async () => {
  const bytes = new Uint8Array(8 * 1024 * 1024);
  for (let index = 0; index < bytes.length; index++) bytes[index] = index % 251;
  let calls = 0;
  const client = createClient(req => {
    calls++;
    expect(req.headers.get('Token')).toBe('file-token');
    expect(req.headers.get('ZenTao-Action-Assistant')).toBe('AI <read>');
    return new Response(bytes);
  });
  const transport = spyOn(client, 'request');
  const convertSingle = mock(() => ({ replaced: true }));
  setGlobalOptions({ timeout: 1, insecure: true, actionAssistant: 'Global' });
  try {
    const response = await request('file/read', { fileID: 42 }, {
      client, timeout: 5000, insecure: false, actionAssistant: { name: 'AI', info: 'read' },
      pick: ['id'], convertSingle, limit: '1',
    });
    expect(response.data).toBeInstanceOf(ArrayBuffer);
    expect((response.data as ArrayBuffer).byteLength).toBe(bytes.byteLength);
    expect(Buffer.compare(Buffer.from(response.data as ArrayBuffer), Buffer.from(bytes.buffer))).toBe(0);
    expect(await transport.mock.results[0].value).toBe(response.data);
    expect(convertSingle).not.toHaveBeenCalled();
    expect(calls).toBe(1);
    expect(transport).toHaveBeenCalledTimes(1);
    expect(transport).toHaveBeenCalledWith('/files/42/read', {
      method: 'GET', query: { stream: 0 }, timeout: 5000, insecure: false,
      actionAssistant: { name: 'AI', info: 'read' }, responseType: 'arrayBuffer',
    });
  } finally { transport.mockRestore(); }
});
