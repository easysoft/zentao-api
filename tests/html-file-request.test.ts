import { afterEach, describe, expect, mock, spyOn, test } from 'bun:test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  ZentaoClient, ZentaoError, defineModules, extendModuleAction, request, setGlobalOptions,
  type ClientRequestOptions, type FileWarning, type ServerConfig,
} from '../src/index';
import { resetModuleDefinitions } from '../src/modules/registry';

const config: ServerConfig = {
  version: '23.0', systemMode: 'ALM', sprintConcept: 'sprint', requestType: 'PATH_INFO',
  requestFix: '-', moduleVar: 'm', methodVar: 'f', viewVar: 't', sessionVar: 'sid',
};
const bodySchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    content: { type: 'string', description: '正文 (HTML)' },
    spec: { type: 'string', textType: 'html' },
    plain: { type: 'string' },
  },
};
type Call = { path: string; options: ClientRequestOptions };
type Handler = (call: Call) => unknown | Promise<unknown>;

function setup(handler?: Handler, mainResult: unknown = { status: 'success', data: { id: 77, title: 'Created' } }) {
  defineModules({
    name: 'article',
    actions: [
      { name: 'create', type: 'create', path: '/articles', minVersion: ['23.0'], requestBody: { schema: bodySchema } },
      {
        name: 'update', type: 'update', path: '/articles/{articleID}', minVersion: ['23.0'],
        pathParams: { articleID: 'ID' }, requestBody: { schema: bodySchema },
      },
    ],
  });
  const client = new ZentaoClient('https://zentao.test');
  const calls: Call[] = [];
  let nextFileID = 100;
  const getConfig = spyOn(client, 'getZentaoConfig').mockResolvedValue(config);
  const implementation = async (path: string, options: ClientRequestOptions = {}): Promise<unknown> => {
    const call = { path, options };
    calls.push(call);
    const custom = await handler?.(call);
    if (custom !== undefined) return custom;
    if (path === '/files') return { status: 'success', data: { id: nextFileID++ } };
    if (/^\/files\/\d+\/link$/.test(path) && options.method === 'PUT') {
      return { status: 'success', id: Number(path.split('/')[2]), ...options.body as Record<string, unknown> };
    }
    if (/^\/files\/\d+$/.test(path) && options.method === 'DELETE') return { status: 'success' };
    if (path.startsWith('/files/')) throw new Error(`Unexpected file request: ${options.method} ${path}`);
    return mainResult;
  };
  const transport = spyOn(client, 'request').mockImplementation(implementation as ZentaoClient['request']);
  setGlobalOptions({ version: '23.0', client });
  return {
    client, calls, getConfig, transport,
    uploads: () => calls.filter(call => call.path === '/files'),
    associations: () => calls.filter(call => /^\/files\/\d+\/link$/.test(call.path) && call.options.method === 'PUT'),
    removals: () => calls.filter(call => /^\/files\/\d+$/.test(call.path) && call.options.method === 'DELETE'),
    objects: () => calls.filter(call => !call.path.startsWith('/files')),
  };
}

function multipart(call: Call): FormData {
  expect(call.options.body).toBeInstanceOf(FormData);
  return call.options.body as FormData;
}

function data(call: Call): Record<string, unknown> {
  return call.options.body as Record<string, unknown>;
}

const blob = () => new Blob(['image bytes'], { type: 'image/png' });

afterEach(() => {
  mock.restore();
  resetModuleDefinitions();
  setGlobalOptions({
    version: undefined, client: undefined, fileResolver: undefined,
    continueOnFileUploadError: undefined, onFileError: undefined,
    autoFill: undefined, throwOnFail: undefined, relative: undefined,
    timeout: undefined, insecure: undefined, actionAssistant: undefined, limit: undefined,
  });
});

describe('HTML file references in high-level requests', () => {
  test('uploads once across HTML fields, creates, then associates using the created object ID', async () => {
    const h = setup();
    const source = blob();
    const params = Object.freeze({
      title: 'Created', content: '<p><img src="image-1" alt="photo.png"></p>',
      spec: '<a href="image-1" title="photo.png">Download</a>', plain: '<img src="ignore">',
    });
    const before = JSON.stringify(params);
    const response = await request('article/create', params, { fileResolver: { 'image-1': { blob: source } } });

    expect(response.status).toBe('success');
    expect(h.calls.map(call => [call.path, call.options.method])).toEqual([
      ['/files', 'POST'], ['/articles', 'POST'], ['/files/100/link', 'PUT'],
    ]);
    const form = multipart(h.uploads()[0]);
    expect(form.get('objectType')).toBeNull();
    expect(form.get('objectID')).toBeNull();
    expect((form.get('file') as File).name).toBe('photo.png');
    expect(data(h.objects()[0])).toMatchObject({
      content: '<p><img src="/file-read-100.png" alt="photo.png"></p>',
      spec: '<a href="/file-read-100.png" title="photo.png" download="photo.png">Download</a>',
      plain: '<img src="ignore">',
    });
    expect(data(h.associations()[0])).toEqual({ objectType: 'article', objectID: 77 });
    expect(h.getConfig).toHaveBeenCalledTimes(1);
    expect(response).not.toHaveProperty('fileWarnings');
    expect(JSON.stringify(params)).toBe(before);
  });

  test('uploads a real local file URL directly to the existing object', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'zentao-html-file-'));
    const file = join(dir, 'file with spaces.pdf');
    writeFileSync(file, 'PDF contents');
    try {
      const h = setup();
      await request('article/update', {
        id: 9, content: `<a href="${pathToFileURL(file).href}">report.pdf</a>`,
      });
      // Bun.file retains its source name in FormData.get; inspect the serialized upload name.
      const form = await new Response(multipart(h.uploads()[0])).formData();
      expect(form.get('objectType')).toBe('article');
      expect(form.get('objectID')).toBe('9');
      expect((form.get('file') as File).name).toBe('report.pdf');
      expect(await (form.get('file') as File).text()).toBe('PDF contents');
      expect(data(h.objects()[0]).content).toBe('<a href="/file-read-100.pdf" download="report.pdf">report.pdf</a>');
      expect(h.associations()).toHaveLength(0);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  test('creates a project story without mistaking its project ID for the new story ID', async () => {
    const h = setup();
    await request('project/createStory', {
      projectID: 12, title: 'Story', spec: '<img src="source" alt="story.png">',
    }, { fileResolver: { source: { blob: blob() } } });
    expect(multipart(h.uploads()[0]).get('objectID')).toBeNull();
    expect(h.objects()[0].path).toBe('/projects/12/stories');
    expect(data(h.associations()[0])).toEqual({ objectType: 'story', objectID: 77 });
  });

  test.each([
    ['story/change', 'story', { id: 8, title: 'Changed', spec: '<img src="source">' }],
    ['meeting/minutes', 'meeting', { meetingID: 8, minutes: '<img src="source">' }],
  ] as const)('processes the existing-object action %s', async (name, objectType, params) => {
    const h = setup();
    await request(name, params, { fileResolver: { source: { blob: blob(), name: 'note.png' } } });
    const form = multipart(h.uploads()[0]);
    expect(form.get('objectType')).toBe(objectType);
    expect(form.get('objectID')).toBe('8');
    expect(h.associations()).toHaveLength(0);
  });

  test('gets the ID before pick and convertSingle change the public response', async () => {
    const h = setup();
    const response = await request('article/create', { content: '<img src="source">' }, {
      fileResolver: { source: { blob: blob() } }, pick: ['title'],
      convertSingle: value => ({ ...value, id: 999, title: 'Converted' }),
    });
    expect(response.data).toEqual({ title: 'Converted' });
    expect(data(h.associations()[0])).toEqual({ objectType: 'article', objectID: 77 });
  });

  test('raw returns the identical object after association and provides warnings through the callback', async () => {
    const raw = { status: 'success', id: 77 };
    const h = setup(call => call.path === '/files/100/link' ? { status: 'fail', message: 'Cannot associate' } : undefined, raw);
    const warnings: FileWarning[] = [];
    const result = await request('article/create', { content: '<img src="source">' }, {
      raw: true, fileResolver: { source: { blob: blob() } },
      onFileError: async warning => { warnings.push(warning); },
    });
    expect(result).toBe(raw);
    expect(raw).not.toHaveProperty('fileWarnings');
    expect(h.associations()).toHaveLength(1);
    expect(warnings).toContainEqual(expect.objectContaining({ stage: 'associate', fileID: 100, objectID: 77 }));
    expect(h.removals()).toHaveLength(0);
  });

  test.each([
    { objectType: 'article', objectID: 77, warning: false },
    { objectType: 'article', objectID: '77', warning: false },
    { objectType: 'article', objectID: 78, warning: true },
    { objectType: 'story', objectID: 77, warning: true },
    { objectType: '', objectID: 0, warning: true },
  ])('verifies a conflicting association against its exact target: %p', async ({ objectType, objectID, warning }) => {
    const h = setup(call => {
      if (call.path === '/files/100/link') {
        throw new ZentaoError('E_HTTP_ERROR', { status: 409, statusText: 'Conflict' }, { status: 409 });
      }
      if (call.path === '/files/100' && call.options.method === 'GET') {
        return Response.json({ status: 'success', file: { id: 100, objectType, objectID } });
      }
    });
    const onFileError = mock();
    const response = await request('article/create', { content: '<img src="source" alt="image.png">' }, {
      fileResolver: { source: { blob: blob() } }, onFileError,
    });
    expect(response.status).toBe('success');
    expect(response.fileWarnings?.length ?? 0).toBe(warning ? 1 : 0);
    expect(onFileError).toHaveBeenCalledTimes(warning ? 1 : 0);
    expect(h.associations()).toHaveLength(1);
    expect(h.calls.filter(call => call.path === '/files/100' && call.options.method === 'GET')).toHaveLength(1);
    expect(h.removals()).toHaveLength(0);
  });

  test('awaits the resolver once per reference and preserves names when the result omits one', async () => {
    const h = setup();
    const resolver = mock(async ({ path, name }: { path: string; name?: string }) => {
      await Promise.resolve();
      expect(path).toBe('asset');
      expect(name).toBe('picture.png');
      return { blob: blob() };
    });
    await request('article/update', { id: 9, content: '<img src="asset" alt="picture.png">' }, { fileResolver: resolver });
    expect(resolver).toHaveBeenCalledTimes(1);
    expect((multipart(h.uploads()[0]).get('file') as File).name).toBe('picture.png');
  });

  test('mapping uses path before name, falls back to names, and uses a string entry key as the filename', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'zentao-html-map-'));
    const file = join(dir, 'stored.bin');
    writeFileSync(file, 'source');
    try {
      const h = setup();
      await request('article/update', {
        id: 9, content: '<img src="path-key" alt="label.png"><a href="unknown-key">report.pdf</a>',
      }, { fileResolver: {
        'path-key': { blob: blob(), name: 'preferred.png' },
        'label.png': { url: 'https://wrong.test/image.png' },
        'report.pdf': file,
      } });
      expect(h.uploads()).toHaveLength(2);
      expect((multipart(h.uploads()[0]).get('file') as File).name).toBe('preferred.png');
      const secondForm = await new Response(multipart(h.uploads()[1])).formData();
      expect((secondForm.get('file') as File).name).toBe('report.pdf');
      expect(data(h.objects()[0]).content).toContain('/file-read-101.pdf');
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  test('network links and non-file protocols bypass even a strict resolver', async () => {
    const h = setup();
    const html = '<img src="https://example.test/photo.png"><img src="//example.test/p.png">'
      + '<a href="http://example.test/file.pdf">Download</a><a href="#part">Jump</a><a href="mailto:a@b.test">Mail</a>';
    const resolver = mock(() => { throw new Error('Should not resolve'); });
    await request('article/update', { id: 9, content: html }, { fileResolver: resolver });
    expect(data(h.objects()[0]).content).toBe(html);
    expect(resolver).not.toHaveBeenCalled();
    expect(h.uploads()).toHaveLength(0);
    expect(h.getConfig).not.toHaveBeenCalled();
  });

  test('a resolver URL rewrites the reference without uploading or loading route config', async () => {
    const h = setup();
    await request('article/update', { id: 9, content: '<a href="report.pdf">Report</a>' }, {
      fileResolver: { 'report.pdf': { url: 'https://cdn.test/report.pdf?a=1&b=2', name: 'report.pdf' } },
    });
    expect(data(h.objects()[0]).content).toBe('<a href="https://cdn.test/report.pdf?a=1&amp;b=2" download="report.pdf">Report</a>');
    expect(h.uploads()).toHaveLength(0);
    expect(h.getConfig).not.toHaveBeenCalled();
  });

  test('existing file IDs use fixed relative links without uploading or associating', async () => {
    const h = setup();
    setGlobalOptions({ relative: false });
    await request('article/create', { content: '<img src="file:7" alt="image.png"><a href="file:8">report.pdf</a>' });
    expect(data(h.objects()[0]).content).toBe('<img src="/file-read-7.png" alt="image.png"><a href="/file-read-8.pdf" download="report.pdf">report.pdf</a>');
    expect(h.uploads()).toHaveLength(0);
    expect(h.associations()).toHaveLength(0);
  });

  test('existing relative ZenTao file links bypass the resolver', async () => {
    const h = setup();
    const html = '<img src="/file-read-7.png"><a href="file-read-8.pdf">Download</a>';
    const resolver = mock(() => { throw new Error('Existing links do not need resolution'); });
    await request('article/update', { id: 9, content: html }, { fileResolver: resolver });
    expect(data(h.objects()[0]).content).toBe(html);
    expect(resolver).not.toHaveBeenCalled();
    expect(h.uploads()).toHaveLength(0);
    expect(h.getConfig).toHaveBeenCalledTimes(1);
  });

  test('does no additional work for unmarked fields, plain text, and unresolved relative references', async () => {
    const h = setup();
    const params = {
      id: 9, plain: '<img src="file:///does-not-exist.png">', spec: 'No attachments',
      content: '<img src="image-1"><img src="images/a.png"><img src="/uploads/a.png">',
    };
    await request('article/update', params);
    expect(h.calls).toHaveLength(1);
    expect(h.getConfig).not.toHaveBeenCalled();
    expect(data(h.objects()[0]).content).toBe(params.content);
    expect(data(h.objects()[0]).plain).toBe(params.plain);
  });

  test('uses final hook data and preserves params.data precedence without modifying caller data', async () => {
    const h = setup();
    const input = Object.freeze({ content: '<img src="data" alt="data.png">' });
    extendModuleAction('article', 'update', {
      beforeRequest: async command => {
        expect(command.data?.content).toBe(input.content);
        return { data: { ...command.data, content: '<img src="hook" alt="hook.png">' } };
      },
    });
    const resolver = mock(({ path }: { path: string }) => {
      expect(path).toBe('hook');
      return { blob: blob() };
    });
    await request('article/update', { id: 9, content: '<img src="flat">', data: input }, { fileResolver: resolver });
    expect((multipart(h.uploads()[0]).get('file') as File).name).toBe('hook.png');
    expect(input.content).toBe('<img src="data" alt="data.png">');
    expect(resolver).toHaveBeenCalledTimes(1);
  });

  test('single-request settings override global resolver and notification defaults', async () => {
    const h = setup(call => call.path === '/files' ? { status: 'fail', message: 'Upload rejected' } : undefined);
    const globalWarning = mock(() => {});
    const localWarning = mock(() => {});
    const globalResolver = mock(() => { throw new Error('Wrong resolver'); });
    setGlobalOptions({ fileResolver: globalResolver, continueOnFileUploadError: false, onFileError: globalWarning });
    const response = await request('article/update', { id: 9, content: '<img src="source">' }, {
      fileResolver: { source: { blob: blob() } }, continueOnFileUploadError: true, onFileError: localWarning,
    });
    expect(response.status).toBe('success');
    expect(globalResolver).not.toHaveBeenCalled();
    expect(globalWarning).not.toHaveBeenCalled();
    expect(localWarning).toHaveBeenCalledTimes(1);
    expect(h.objects()).toHaveLength(1);
  });

  test('forwards transport options to internal requests without applying result transformations', async () => {
    const h = setup();
    const assistant = { name: 'Tests', info: 'HTML upload' };
    await request('article/create', { content: '<img src="source">' }, {
      fileResolver: { source: { blob: blob() } }, timeout: 1250, insecure: false,
      actionAssistant: assistant, pick: ['title'], autoFill: true,
    });
    for (const call of h.calls) {
      expect(call.options).toMatchObject({ timeout: 1250, insecure: false, actionAssistant: assistant });
    }
    expect(h.calls.every(call => call.options.method !== 'GET')).toBe(true);
    expect(h.associations()).toHaveLength(1);
  });
});

describe('HTML file failure lifecycle', () => {
  test('finishes resolving all references before any upload, even in continue mode', async () => {
    const h = setup();
    await expect(request('article/create', { content: '<img src="first"><img src="missing">' }, {
      fileResolver: { first: { blob: blob() } }, continueOnFileUploadError: true,
    })).rejects.toMatchObject({ code: 'E_FILE_RESOLVE_FAILED' });
    expect(h.calls).toHaveLength(0);
  });

  test('ignores inherited mapping entries and stops when a resolver rejects', async () => {
    const h = setup();
    const inherited = Object.create({ source: { blob: blob() } }) as Record<string, { blob: Blob }>;
    await expect(request('article/create', { content: '<img src="source">' }, { fileResolver: inherited }))
      .rejects.toMatchObject({ code: 'E_FILE_RESOLVE_FAILED' });
    await expect(request('article/create', { content: '<img src="source">' }, {
      fileResolver: async () => { throw new Error('Resolver rejected'); },
    })).rejects.toMatchObject({ code: 'E_FILE_RESOLVE_FAILED' });
    expect(h.calls).toHaveLength(0);
  });

  test('default upload failure keeps the source and annotates img alt or a title', async () => {
    const h = setup(call => call.path === '/files' ? { status: 'fail', message: 'File "too large" <limit>' } : undefined);
    const warnings: FileWarning[] = [];
    const response = await request('article/create', { content: '<img src="one" alt="photo.png"><a href="two">report.pdf</a>' }, {
      fileResolver: { one: { blob: blob() }, two: { blob: blob() } }, onFileError: warning => { warnings.push(warning); },
    });
    expect(response.status).toBe('success');
    expect(response.fileWarnings).toHaveLength(2);
    expect(warnings).toHaveLength(2);
    expect(warnings.every(warning => warning.stage === 'upload')).toBe(true);
    const html = String(data(h.objects()[0]).content);
    expect(html).toContain('src="one"');
    expect(html).toContain('href="two"');
    expect(html).toContain('&quot;too large&quot; &lt;limit&gt;');
    expect(html).toContain('title="');
    expect(h.associations()).toHaveLength(0);
  });

  test('local read and upload-size failures follow the configured upload failure policy', async () => {
    const h = setup();
    const response = await request('article/update', { id: 9, content: '<img src="file:///__zentao_missing__/image.png">' });
    expect(response.status).toBe('success');
    expect(response.fileWarnings).toContainEqual(expect.objectContaining({ stage: 'upload', code: 'E_UPLOAD_FILE_NOT_FOUND' }));
    expect(h.uploads()).toHaveLength(0);
    await expect(request('article/create', { content: '<img src="source">' }, {
      fileResolver: { source: { blob: blob() } }, maxUploadBytes: 1, continueOnFileUploadError: false,
    })).rejects.toMatchObject({ code: 'E_UPLOAD_FILE_TOO_LARGE' });
    expect(h.objects()).toHaveLength(1);
  });

  test('an upload callback rejecting with undefined records a warning and keeps the original reference', async () => {
    const h = setup();
    extendModuleAction('file', 'create', { request: async () => { throw undefined; } });
    const warning = mock(() => {});
    const response = await request('article/create', { content: '<img src="source" alt="image.png">' }, {
      fileResolver: { source: { blob: blob() } }, onFileError: warning,
    });
    expect(response.status).toBe('success');
    expect(response.fileWarnings).toContainEqual(expect.objectContaining({ stage: 'upload', path: 'source' }));
    expect(warning).toHaveBeenCalledTimes(1);
    expect(data(h.objects()[0]).content).toContain('src="source"');
    expect(data(h.objects()[0]).content).not.toContain('/file-read-undefined');
    expect(h.associations()).toHaveLength(0);
  });

  test('strict upload failure cleans previously uploaded files and never sends the main request', async () => {
    let uploads = 0;
    const h = setup(call => call.path === '/files' && ++uploads === 2 ? { status: 'fail', message: 'Upload failed' } : undefined);
    await expect(request('article/create', { content: '<img src="one"><img src="two">' }, {
      fileResolver: { one: { blob: blob() }, two: { blob: blob() } }, continueOnFileUploadError: false,
    })).rejects.toMatchObject({ code: 'E_API_FAILED' });
    expect(h.objects()).toHaveLength(0);
    expect(h.removals().map(call => call.path)).toEqual(['/files/100']);
  });

  test.each([false, true])('creation failure cleans only newly uploaded files (throwOnFail=%p)', async throwOnFail => {
    const h = setup(undefined, { status: 'fail', message: 'Cannot create' });
    const pending = request('article/create', { content: '<img src="source"><img src="file:7">' }, {
      fileResolver: { source: { blob: blob() } }, throwOnFail,
    });
    if (throwOnFail) await expect(pending).rejects.toMatchObject({ code: 'E_API_FAILED' });
    else await expect(pending).resolves.toMatchObject({ status: 'fail', message: 'Cannot create' });
    expect(h.removals().map(call => call.path)).toEqual(['/files/100']);
    expect(h.associations()).toHaveLength(0);
  });

  test('a timed-out creation retains files and reports their IDs for reconciliation', async () => {
    const h = setup(call => {
      if (call.path === '/articles') throw new ZentaoError('E_TIMEOUT');
    });
    await expect(request('article/create', { content: '<img src="source">' }, {
      fileResolver: { source: { blob: blob() } },
    })).rejects.toMatchObject({ code: 'E_TIMEOUT', details: expect.objectContaining({ fileIDs: [100] }) });
    expect(h.removals()).toHaveLength(0);
    expect(h.associations()).toHaveLength(0);
  });

  test.each(['E_NETWORK_ERROR', 'E_TIMEOUT'] as const)('%s preserves its native cause when file context is attached', async code => {
    const native = new Error('Socket was closed');
    const original = new ZentaoError(code, { message: native.message }, native);
    const h = setup(call => {
      if (call.path === '/articles') throw original;
    });
    const thrown = await request('article/create', { content: '<img src="source">' }, {
      fileResolver: { source: { blob: blob() } },
    }).then(() => undefined, error => error as ZentaoError);
    expect(thrown).toBeInstanceOf(ZentaoError);
    expect(thrown?.code).toBe(code);
    expect(thrown?.details).toMatchObject({ fileIDs: [100] });
    expect((thrown?.details as { cause?: unknown }).cause).toBe(native);
    expect(h.removals()).toHaveLength(0);
  });

  test('a custom error with non-configurable details is not masked while attaching file context', async () => {
    const original = new Error('Custom transport failed');
    const originalDetails = { traceID: 'trace-123' };
    Object.defineProperty(original, 'details', { value: originalDetails, configurable: false });
    const h = setup(call => {
      if (call.path === '/articles') throw original;
    });
    const thrown = await request('article/create', { content: '<img src="source">' }, {
      fileResolver: { source: { blob: blob() } },
    }).then(() => undefined, error => error as Error & { details?: unknown });
    expect(thrown).toBeInstanceOf(Error);
    expect(thrown).not.toBeInstanceOf(TypeError);
    expect(thrown?.message).toBe(original.message);
    expect(thrown?.details).toMatchObject({ fileIDs: [100] });
    expect((original as Error & { details?: unknown }).details).toBe(originalDetails);
    expect(h.removals()).toHaveLength(0);
  });

  test('association failures return success with warnings and do not prevent remaining associations', async () => {
    const h = setup(call => call.path === '/files/100/link' && call.options.method === 'PUT'
      ? { status: 'fail', message: 'Cannot associate first file' } : undefined);
    const response = await request('article/create', { content: '<img src="one"><img src="two">' }, {
      fileResolver: { one: { blob: blob() }, two: { blob: blob() } },
      onFileError: async () => { throw new Error('Notification must not change success'); },
    });
    expect(response.status).toBe('success');
    expect(response.data).toMatchObject({ id: 77 });
    expect(response.fileWarnings).toContainEqual(expect.objectContaining({ stage: 'associate', fileID: 100, objectType: 'article', objectID: 77 }));
    expect(h.associations().map(call => call.path)).toEqual(['/files/100/link', '/files/101/link']);
    expect(h.removals()).toHaveLength(0);
  });

  test('file/link conflict preserves the created object and files without retrying or falling back to rename', async () => {
    const h = setup(call => {
      if (call.path === '/files/100/link' && call.options.method === 'PUT') {
        throw new ZentaoError('E_HTTP_ERROR', { status: 409, statusText: 'Conflict' }, {
          status: 409, body: { status: 'fail', message: 'File already belongs to an object' },
        });
      }
    });
    const response = await request('article/create', { content: '<img src="source" alt="image.png">' }, {
      fileResolver: { source: { blob: blob() } },
    });
    expect(response).toMatchObject({ status: 'success', data: { id: 77, title: 'Created' } });
    expect(response.fileWarnings).toContainEqual(expect.objectContaining({
      stage: 'associate', code: 'E_HTTP_ERROR', fileID: 100, objectType: 'article', objectID: 77,
      message: expect.stringContaining('409'),
    }));
    expect(h.calls.map(call => [call.path, call.options.method])).toEqual([
      ['/files', 'POST'], ['/articles', 'POST'], ['/files/100/link', 'PUT'], ['/files/100', 'GET'],
    ]);
    expect(data(h.objects()[0]).content).toBe('<img src="/file-read-100.png" alt="image.png">');
    expect(h.removals()).toHaveLength(0);
  });

  test('creation success without an ID retains files and exposes association warnings', async () => {
    const h = setup(undefined, { status: 'success' });
    const response = await request('article/create', { content: '<img src="source">' }, {
      fileResolver: { source: { blob: blob() } },
    });
    expect(response.status).toBe('success');
    expect(response.fileWarnings).toContainEqual(expect.objectContaining({
      stage: 'associate', code: 'E_FILE_OBJECT_ID_MISSING', fileID: 100,
    }));
    expect(h.associations()).toHaveLength(0);
    expect(h.removals()).toHaveLength(0);
  });

  test('cleanup failure preserves the original creation failure and identifies the orphaned file', async () => {
    const h = setup(call => call.options.method === 'DELETE' ? { status: 'fail', message: 'Delete denied' } : undefined,
      { status: 'fail', message: 'Creation denied' });
    const warnings: FileWarning[] = [];
    const response = await request('article/create', { content: '<img src="source">' }, {
      fileResolver: { source: { blob: blob() } }, onFileError: warning => { warnings.push(warning); },
    });
    expect(response).toMatchObject({ status: 'fail', message: 'Creation denied' });
    expect(response.fileWarnings).toContainEqual(expect.objectContaining({ stage: 'cleanup', fileID: 100 }));
    expect(warnings).toContainEqual(expect.objectContaining({ stage: 'cleanup', fileID: 100 }));
    expect(h.removals()).toHaveLength(1);
  });

  test.each([
    '<html>Fatal error: undefined method</html>',
    { result: 'fail', message: 'Association denied' },
    { status: 'success', result: 'fail', message: 'Association denied' },
  ])('malformed or explicitly failed file association response becomes a warning: %p', async fileResult => {
    const h = setup(call => call.path === '/files/100/link' && call.options.method === 'PUT' ? fileResult : undefined);
    const response = await request('article/create', { content: '<img src="source">' }, {
      fileResolver: { source: { blob: blob() } },
    });
    expect(response.status).toBe('success');
    expect(response.fileWarnings).toContainEqual(expect.objectContaining({ stage: 'associate', fileID: 100 }));
    expect(h.associations()).toHaveLength(1);
    expect(h.removals()).toHaveLength(0);
  });

  test.each([
    'PHP Fatal error: cleanup did not finish',
    { result: 'fail', message: 'Cleanup denied' },
    { status: 'success', result: 'fail', message: 'Cleanup denied' },
  ])('malformed or explicitly failed file cleanup response preserves the main failure: %p', async fileResult => {
    const h = setup(call => call.options.method === 'DELETE' ? fileResult : undefined,
      { status: 'fail', message: 'Creation denied' });
    const response = await request('article/create', { content: '<img src="source">' }, {
      fileResolver: { source: { blob: blob() } },
    });
    expect(response).toMatchObject({ status: 'fail', message: 'Creation denied' });
    expect(response.fileWarnings).toContainEqual(expect.objectContaining({ stage: 'cleanup', fileID: 100 }));
    expect(h.removals()).toHaveLength(1);
  });

  test('rejects an indeterminate target before upload and validates routing before side effects', async () => {
    const h = setup();
    extendModuleAction('article', 'create', { resultObjectType: null });
    await expect(request('article/create', { content: '<img src="source">' }, {
      fileResolver: { source: { blob: blob() } },
    })).rejects.toMatchObject({ code: 'E_FILE_TARGET_UNKNOWN' });
    expect(h.calls).toHaveLength(0);
    extendModuleAction('article', 'create', { resultObjectType: 'article' });
    h.getConfig.mockResolvedValue({ ...config, requestType: 'INVALID' });
    await expect(request('article/create', { content: '<img src="source">' }, {
      fileResolver: { source: { blob: blob() } },
    })).rejects.toMatchObject({ code: 'E_INVALID_PARAM' });
    expect(h.calls).toHaveLength(0);
  });

  test('rejects unsupported post-creation association before uploading or creating the object', async () => {
    const h = setup();
    extendModuleAction('article', 'create', { minVersion: ['22.5'] });
    setGlobalOptions({ version: '22.5' });
    h.getConfig.mockResolvedValue({ ...config, version: '22.5' });
    await expect(request('article/create', { content: '<img src="source">' }, {
      fileResolver: { source: { blob: blob() } },
    })).rejects.toMatchObject({ code: 'E_UNSUPPORTED_ZENTAO_VERSION', params: { action: 'file/link' } });
    expect(h.calls).toHaveLength(0);
  });
});
