import { afterEach, describe, expect, test } from 'bun:test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  ZentaoClient,
  defineModules,
  getModuleAction,
  request,
  setGlobalOptions,
  type FileCreateResult,
} from '../src/index';
import { resetModuleDefinitions } from '../src/modules/registry';

function createMockServer(handler: (req: Request) => Response | Promise<Response>) {
  return Bun.serve({ port: 0, fetch: req => new URL(req.url).searchParams.get('mode') === 'getconfig'
    ? Response.json({ version: '22.5' }) : handler(req) });
}

afterEach(() => {
  resetModuleDefinitions();
  setGlobalOptions({ version: undefined });
});

describe('high-level file uploads', () => {
  test('generates multipart metadata for file/create', () => {
    const action = getModuleAction('file', 'create');
    const properties = action?.requestBody?.schema.properties as Record<string, Record<string, unknown>>;

    expect(action?.requestBody?.mediaType).toBe('multipart/form-data');
    expect(properties.file.format).toBe('binary');
  });

  test('uploads a local path as multipart and normalizes the response', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'zentao-api-upload-'));
    const path = join(dir, 'upload-note.txt');
    const content = 'zentao-api multipart upload';
    writeFileSync(path, content);

    let receivedContentType = '';
    let receivedToken = '';
    let receivedObjectType: FormDataEntryValue | null = null;
    let receivedObjectID: FormDataEntryValue | null = null;
    let receivedFilename = '';
    let receivedFileType = '';
    let receivedContent = '';
    const server = createMockServer(async (req) => {
      receivedContentType = req.headers.get('Content-Type') ?? '';
      receivedToken = req.headers.get('Token') ?? '';
      const form = await req.formData();
      receivedObjectType = form.get('objectType');
      receivedObjectID = form.get('objectID');
      const file = form.get('file');
      if (file && typeof file !== 'string') {
        receivedFilename = file.name;
        receivedFileType = file.type;
        receivedContent = await file.text();
      }
      return Response.json({
        status: 'success',
        id: 42,
        url: '/file-read-42.txt',
        data: { id: 42, url: '/file-read-42.txt' },
      });
    });

    try {
      const client = new ZentaoClient({ baseUrl: server.url.toString(), token: 'upload-token' });
      const response = await request('file/create', {
        file: path,
        objectType: 'story',
        objectID: 7,
      }, { client });
      const data: FileCreateResult | undefined = response.data;

      expect(response.status).toBe('success');
      expect(data).toEqual({ id: 42, url: '/file-read-42.txt' });
      expect(receivedContentType).toContain('multipart/form-data; boundary=');
      expect(receivedToken).toBe('upload-token');
      expect(String(receivedObjectType)).toBe('story');
      expect(String(receivedObjectID)).toBe('7');
      expect(receivedFilename).toBe('upload-note.txt');
      expect(receivedFileType).toStartWith('text/plain');
      expect(receivedContent).toBe(content);
    } finally {
      server.stop();
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('accepts in-memory data with an explicit filename and content type', async () => {
    let receivedFilename = '';
    let receivedFileType = '';
    let receivedContent = '';
    let receivedRawBody = '';
    const server = createMockServer(async (req) => {
      receivedRawBody = await req.clone().text();
      const form = await req.formData();
      const file = form.get('file');
      if (file && typeof file !== 'string') {
        receivedFilename = file.name;
        receivedFileType = file.type;
        receivedContent = await file.text();
      }
      return Response.json({ status: 'success', data: { id: 43 } });
    });

    try {
      const client = new ZentaoClient(server.url.toString());
      await request('file/create', {
        file: {
          data: new TextEncoder().encode('memory upload'),
          filename: 'memory.data',
          contentType: 'application/x-zentao-test',
        },
        objectType: 'bug',
        objectID: 8,
      }, { client });

      expect(receivedFilename).toBe('memory.data');
      // Bun 的 multipart 解析器会清空未知 MIME 的 File.type；原始 part header 才是发送事实。
      expect(receivedFileType).toBe('');
      expect(receivedRawBody).toContain('Content-Type: application/x-zentao-test');
      expect(receivedContent).toBe('memory upload');
    } finally {
      server.stop();
    }
  });

  test('uses multipart metadata for runtime-defined modules without action-name special cases', async () => {
    defineModules({
      name: 'artifact',
      actions: [{
        minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
        name: 'publish',
        type: 'action',
        method: 'post',
        path: '/artifacts',
        resultType: 'object',
        requestBody: {
          type: 'object',
          mediaType: 'multipart/form-data',
          schema: {
            type: 'object',
            required: ['payload', 'label'],
            properties: {
              payload: { type: 'string', format: 'binary' },
              label: { type: 'string' },
            },
          },
        },
      }],
    });

    let receivedLabel: FormDataEntryValue | null = null;
    let receivedContent = '';
    const server = createMockServer(async (req) => {
      const form = await req.formData();
      receivedLabel = form.get('label');
      const file = form.get('payload');
      if (file && typeof file !== 'string') receivedContent = await file.text();
      return Response.json({ status: 'success', data: { id: 44 } });
    });

    try {
      const client = new ZentaoClient(server.url.toString());
      await request('artifact/publish', {
        payload: {
          data: new TextEncoder().encode('generic multipart'),
          filename: 'artifact.txt',
        },
        label: 'release',
      }, { client });

      expect(String(receivedLabel)).toBe('release');
      expect(receivedContent).toBe('generic multipart');
    } finally {
      server.stop();
    }
  });

  test('normalizes missing files and size-limit failures', async () => {
    setGlobalOptions({ version: '22.5' });
    const dir = mkdtempSync(join(tmpdir(), 'zentao-api-upload-errors-'));
    const path = join(dir, 'too-large.txt');
    writeFileSync(path, '1234');
    const client = new ZentaoClient('http://127.0.0.1:1');

    try {
      await expect(request('file/create', {
        file: join(dir, 'missing.txt'),
        objectType: 'story',
        objectID: 1,
      }, { client })).rejects.toMatchObject({ code: 'E_UPLOAD_FILE_NOT_FOUND' });

      await expect(request('file/create', {
        file: path,
        objectType: 'story',
        objectID: 1,
      }, { client, maxUploadBytes: 3 })).rejects.toMatchObject({ code: 'E_UPLOAD_FILE_TOO_LARGE' });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
