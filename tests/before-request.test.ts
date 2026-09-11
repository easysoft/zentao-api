import { afterEach, describe, expect, mock, spyOn, test } from 'bun:test';
import {
  ZentaoClient,
  defineModuleActions,
  defineModules,
  extendModuleAction,
  getModuleAction,
  request,
  setGlobalOptions,
  type ModuleActionBeforeRequestCallback,
  type ModuleActionRequestCallback,
  type RequestOptions,
} from '../src/index';
import { resetModuleDefinitions } from '../src/modules/registry';

afterEach(() => {
  mock.restore();
  resetModuleDefinitions();
  setGlobalOptions({
    version: undefined,
    client: undefined,
    recPerPage: undefined,
    limit: undefined,
    timeout: undefined,
    insecure: undefined,
    throwOnFail: undefined,
    autoFill: undefined,
  });
});

describe('ModuleAction.beforeRequest', () => {
  test.each([null, 'beforeRequest', {}, false])('rejects a non-function callback at registry write entries: %p', (value) => {
    const action = {
      name: 'list', type: 'list' as const, path: '/hooked', minVersion: ['22.0'],
      beforeRequest: value as unknown as ModuleActionBeforeRequestCallback,
    };
    const error = expect.objectContaining({ code: 'E_INVALID_ACTION_DEFINITION' });
    expect(() => defineModules({ name: 'hooked', actions: [action] })).toThrow(error);
    expect(() => defineModuleActions('product', action)).toThrow(error);
    expect(() => extendModuleAction('product', 'list', { beforeRequest: action.beforeRequest })).toThrow(error);
  });

  test.each([false, true])('awaits the hook and shallow-merges the returned request patch (custom request=%p)', async (custom) => {
    const client = new ZentaoClient('http://zentao.test');
    const defaultClient = new ZentaoClient('http://default.test');
    const defaultTransport = spyOn(defaultClient, 'request').mockResolvedValue({ status: 'fail' });
    const raw = { data: { id: 8, name: 'updated', count: 3 } };
    const events: string[] = [];
    const transport = spyOn(client, 'request').mockResolvedValue(raw);
    const customRequest = mock<ModuleActionRequestCallback>(async () => {
      events.push('request');
      return raw;
    });
    const patch = {
      path: '/hooked/8/save', query: { language: 'en' }, data: { count: 3 },
      params: { id: 8, source: 'hook' }, id: 8,
    };
    const beforeRequest = mock<ModuleActionBeforeRequestCallback>(async command => {
      events.push('before');
      expect(command).toMatchObject({
        module: 'hooked', path: '/hooked/7', id: 7,
        params: { id: 7, name: 'new', count: '2' },
        query: { language: 'zh-cn' }, data: { name: 'new', count: 2 },
      });
      await Promise.resolve();
      command.path = '/hooked/mutated';
      events.push('ready');
      return patch;
    });
    defineModules({
      name: 'hooked',
      actions: [{
        minVersion: ['22.0'], name: 'update', type: 'update', path: '/hooked/{hookedID}',
        pathParams: { hookedID: 'ID' },
        params: [{ name: 'language', defaultValue: 'zh-cn' }],
        requestBody: {
          schema: {
            type: 'object',
            properties: { name: { type: 'string' }, count: { type: 'integer' } },
          },
        },
        beforeRequest,
        request: custom ? customRequest : undefined,
      }],
    });
    setGlobalOptions({ version: '22.5', client: defaultClient, timeout: 8000, insecure: true });
    const options = Object.freeze({
      client, timeout: 0, insecure: false, pick: ['name'], raw: false,
      convertSingle: record => ({ ...record, name: `${record.name}!` }),
    } satisfies RequestOptions);

    await expect(request('hooked/update', { id: 7, name: 'new', count: '2' }, options)).resolves.toMatchObject({
      status: 'success', data: { name: 'updated!' },
    });
    expect(events).toEqual(custom ? ['before', 'ready', 'request'] : ['before', 'ready']);
    expect(beforeRequest).toHaveBeenCalledTimes(1);
    const action = getModuleAction('hooked', 'update')!;
    expect(action.beforeRequest).toBe(beforeRequest);
    expect(beforeRequest.mock.calls[0][0]).toEqual({ ...patch, module: 'hooked', action });
    expect(defaultTransport).not.toHaveBeenCalled();
    if (custom) {
      const info = customRequest.mock.calls[0][0];
      expect(info.request).toBe(beforeRequest.mock.calls[0][0]);
      expect(info.body).toEqual({ count: 3 });
      expect(info.client).toBe(client);
      expect(info.timeout).toBe(0);
      expect(info.insecure).toBe(false);
      expect(info.options).toBe(options);
      expect(transport).not.toHaveBeenCalled();
    } else {
      expect(transport).toHaveBeenCalledWith('/hooked/8/save', {
        method: 'PUT', query: { language: 'en' }, body: { count: 3 }, timeout: 0, insecure: false,
      });
      expect(customRequest).not.toHaveBeenCalled();
    }
    expect(options).toMatchObject({ client, timeout: 0, insecure: false, pick: ['name'], raw: false });
  });

  test('keeps direct request changes when the hook returns an empty patch', async () => {
    const client = new ZentaoClient('http://zentao.test');
    const transport = spyOn(client, 'request').mockResolvedValue({ products: [] });
    extendModuleAction('product', 'list', {
      beforeRequest: async command => {
        command.path = '/custom-products';
        command.query = { recPerPage: 50 };
        return {};
      },
    });
    setGlobalOptions({ version: '22.5', client });

    await request('product');
    expect(transport).toHaveBeenCalledWith('/custom-products', expect.objectContaining({ query: { recPerPage: 50 } }));
  });

  test('prepares multipart data and validates upload size after applying the hook', async () => {
    const client = new ZentaoClient('http://zentao.test');
    const transport = spyOn(client, 'request').mockResolvedValue({ data: { id: 42 } });
    const beforeRequest = mock<ModuleActionBeforeRequestCallback>(async command => ({
      data: { ...command.data, file: new Blob(['changed'], { type: 'text/plain' }) },
    }));
    extendModuleAction('file', 'create', { beforeRequest });
    setGlobalOptions({ version: '22.5', client });
    const params = { file: new Blob(['old']), objectType: 'story', objectID: 7 };

    await expect(request('file/create', params, { maxUploadBytes: 7 })).resolves.toMatchObject({ data: { id: 42 } });
    const sent = transport.mock.calls[0][1]!;
    expect(sent.bodyType).toBe('raw');
    expect(sent.body).toBeInstanceOf(FormData);
    const body = sent.body as FormData;
    expect(await (body.get('file') as File).text()).toBe('changed');
    expect(body.get('objectID')).toBe('7');

    await expect(request('file/create', params, { maxUploadBytes: 6 })).rejects.toMatchObject({ code: 'E_UPLOAD_FILE_TOO_LARGE' });
    expect(beforeRequest).toHaveBeenCalledTimes(2);
    expect(transport).toHaveBeenCalledTimes(1);
    expect(await params.file.text()).toBe('old');
  });

  test('passes patched params to getters and keeps the caller response options', async () => {
    const client = new ZentaoClient('http://zentao.test');
    const raw = { payload: { items: [{ id: 1, name: 'first' }, { id: 2, name: 'second' }] } };
    const transport = spyOn(client, 'request').mockResolvedValue(raw);
    const beforeRequest = mock<ModuleActionBeforeRequestCallback>(async () => ({ params: { page: 3, source: 'hook' } }));
    const resultGetter = mock((data: unknown, params: Record<string, unknown>, options?: RequestOptions) => {
      expect(params).toEqual({ page: 3, source: 'hook' });
      expect(options).toMatchObject({ sort: 'id:desc', limit: '1', pick: ['id'] });
      return (data as typeof raw).payload.items;
    });
    const pagerGetter = mock((_data: unknown, params: Record<string, unknown>) => {
      expect(params).toEqual({ page: 3, source: 'hook' });
      return { pageID: Number(params.page), recPerPage: 2, recTotal: 5 };
    });
    extendModuleAction('product', 'list', { beforeRequest, resultGetter, pagerGetter });
    setGlobalOptions({ version: '22.5', client, limit: '2', throwOnFail: true });

    const params = Object.freeze({ page: 1 });
    await expect(request('product', params, { sort: 'id:desc', limit: '1', pick: ['id'] })).resolves.toMatchObject({
      data: [{ id: 2 }], pager: { total: 5, page: 3, recPerPage: 2 },
    });
    expect(transport.mock.calls[0][1]!.query).toMatchObject({ pageID: 1 });
    expect(params).toEqual({ page: 1 });
    expect(await request('product', {}, { raw: true })).toBe(raw);
    expect(resultGetter).toHaveBeenCalledTimes(1);
    expect(pagerGetter).toHaveBeenCalledTimes(1);

    const failure = { status: 'fail', message: 'denied' };
    transport.mockResolvedValue(failure);
    extendModuleAction('product', 'list', { resultGetter: 'data' });
    await expect(request('product', {}, { throwOnFail: true })).rejects.toMatchObject({ code: 'E_API_FAILED' });
    await expect(request('product', {}, { throwOnFail: false })).resolves.toMatchObject({ status: 'fail', message: 'denied' });
  });

  test.each([false, true])('propagates hook errors before preparing uploads or sending requests (async=%p)', async (asynchronous) => {
    const client = new ZentaoClient('http://zentao.test');
    const transport = spyOn(client, 'request').mockResolvedValue({ status: 'success' });
    const customRequest = mock<ModuleActionRequestCallback>(async () => ({ status: 'success' }));
    const error = new Error('beforeRequest failed');
    const beforeRequest = mock<ModuleActionBeforeRequestCallback>(() => {
      if (asynchronous) return Promise.reject(error);
      throw error;
    });
    extendModuleAction('file', 'create', { beforeRequest, request: customRequest });
    setGlobalOptions({ version: '22.5', client });

    await expect(request('file/create', {
      file: new Blob(['too large']), objectType: 'story', objectID: 7,
    }, { maxUploadBytes: 1 })).rejects.toBe(error);
    expect(beforeRequest).toHaveBeenCalledTimes(1);
    expect(customRequest).not.toHaveBeenCalled();
    expect(transport).not.toHaveBeenCalled();
  });

  test('runs after version checks and required parameter validation', async () => {
    const client = new ZentaoClient('http://zentao.test');
    const transport = spyOn(client, 'request').mockResolvedValue({ status: 'success' });
    const beforeRequest = mock<ModuleActionBeforeRequestCallback>(async () => ({}));
    extendModuleAction('product', 'update', { beforeRequest });
    setGlobalOptions({ version: '21.0', client });

    await expect(request('product/update', { id: 7, name: 'new' })).rejects.toMatchObject({ code: 'E_UNSUPPORTED_ZENTAO_VERSION' });
    setGlobalOptions({ version: '22.5' });
    await expect(request('product/update', { name: 'new' })).rejects.toMatchObject({ code: 'E_MISSING_PARAM' });
    expect(beforeRequest).not.toHaveBeenCalled();
    expect(transport).not.toHaveBeenCalled();
  });

  test('runs once for each autoFill request and sees the filled update body', async () => {
    const client = new ZentaoClient('http://zentao.test');
    const events: string[] = [];
    const transport = spyOn(client, 'request').mockResolvedValue({
      data: { id: 7, name: 'old', PO: 'admin', acl: 'private' },
    });
    extendModuleAction('product', 'get', {
      resultGetter: 'data',
      beforeRequest: async () => {
        events.push('before get');
        return {};
      },
    });
    const beforeUpdate = mock<ModuleActionBeforeRequestCallback>(async command => {
      events.push('before update');
      expect(transport).toHaveBeenCalledTimes(1);
      expect(transport.mock.calls[0][1]!.method).toBe('GET');
      expect(command.data).toMatchObject({ name: 'new', PO: 'admin', acl: 'private' });
      return { data: { ...command.data, name: 'hooked' } };
    });
    extendModuleAction('product', 'update', { beforeRequest: beforeUpdate });
    setGlobalOptions({ version: '22.5', client });

    await request('product/update', { id: 7, name: 'new' }, { autoFill: true });
    expect(events).toEqual(['before get', 'before update']);
    expect(beforeUpdate).toHaveBeenCalledTimes(1);
    expect(transport).toHaveBeenCalledTimes(2);
    expect(transport.mock.calls[1][1]).toMatchObject({ method: 'PUT', body: { name: 'hooked', PO: 'admin' } });
  });
});
