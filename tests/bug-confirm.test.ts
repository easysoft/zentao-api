import { afterEach, expect, mock, spyOn, test } from 'bun:test';
import { ZentaoClient, ZentaoError, request, setGlobalOptions, type RequestOptions } from '../src/index';
import { resetModuleDefinitions } from '../src/modules/registry';

const current = {
  status: 'active', assignedTo: 'admin', type: 'codeerror', pri: 2,
  deadline: '2026-10-15', mailto: 'admin,qa',
};
afterEach(() => {
  mock.restore();
  resetModuleDefinitions();
  setGlobalOptions({ client: undefined, version: undefined });
});

test.each(['active', 'resolved', 'closed'])('confirm preserves omitted fields and %s state using the selected client', async status => {
  const before = { ...current, status, id: 7, confirmed: 0, title: 'Do not send this', openedBy: 'qa' };
  const writes: unknown[] = [];
  const server = Bun.serve({ port: 0, async fetch(req) {
    if (req.method === 'GET') return Response.json({ status: 'success', bug: before });
    writes.push(await req.json());
    return Response.json({ status: 'success', data: 7 });
  } });
  try {
    resetModuleDefinitions();
    const client = new ZentaoClient(server.url.href);
    const transport = spyOn(client, 'request');
    const wrongClient = new ZentaoClient('http://wrong-client.test');
    const wrongTransport = spyOn(wrongClient, 'request').mockRejectedValue(new Error('Wrong client'));
    setGlobalOptions({ client: wrongClient, version: 'ipd5.6' });
    const response = await request('bug/confirm', { bugID: 7, comment: 'Keep fields' }, {
      client, timeout: 4321, insecure: false, pick: ['id'], convertSingle: () => ({ id: 999 }),
    });
    expect(response.status).toBe('success');
    expect(writes).toEqual([{ ...current, status, mailto: ['admin', 'qa'], comment: 'Keep fields' }]);
    expect(wrongTransport).not.toHaveBeenCalled();
    expect(transport.mock.calls.map(([path, options]) => ({ path, method: options?.method, timeout: options?.timeout, insecure: options?.insecure })))
      .toEqual([
        { path: '/bugs/7', method: 'GET', timeout: 4321, insecure: false },
        { path: '/bugs/7/confirm', method: 'PUT', timeout: 4321, insecure: false },
      ]);
  } finally { server.stop(true); }
});

test.each([false, true])('explicit confirmation data takes precedence and skips detail fetching (JSON=%p)', async json => {
  const client = new ZentaoClient('http://zentao.test');
  const transport = spyOn(client, 'request').mockResolvedValue(Response.json({ status: 'success', data: 7 }));
  setGlobalOptions({ version: 'ipd5.6' });
  const data = Object.freeze({ ...current, status: 'resolved', assignedTo: '', type: 'config', pri: 1, deadline: '', mailto: [] });
  const raw = await request('bug/confirm', { id: 7, status: 'active', data: json ? JSON.stringify(data) : data }, { client, raw: true });
  expect(raw).toEqual({ status: 'success', data: 7 });
  expect(transport).toHaveBeenCalledTimes(1);
  expect(transport.mock.calls[0][1]?.body).toEqual(data);
  expect(data.status).toBe('resolved');
});

test.each([
  { status: 'fail', message: 'No access' },
  '<pre>PHP error</pre>',
  { status: 'success', bug: null },
  { status: 'success', bug: { status: 'active' } },
])('failed or incomplete Bug detail aborts confirmation: %p', async raw => {
  const client = new ZentaoClient('http://zentao.test');
  const transport = spyOn(client, 'request').mockResolvedValue(raw);
  setGlobalOptions({ version: 'ipd5.6' });
  await expect(request('bug/confirm', { id: 7 }, { client, raw: true, throwOnFail: false })).rejects.toMatchObject({ code: 'E_API_FAILED' });
  expect(transport).toHaveBeenCalledTimes(1);
  expect(transport.mock.calls[0][0]).toBe('/bugs/7');
});

test.each(['', null])('empty explicit status fails before writing: %p', async status => {
  const client = new ZentaoClient('http://zentao.test');
  const transport = spyOn(client, 'request').mockResolvedValue({ status: 'success' });
  setGlobalOptions({ version: 'ipd5.6' });
  await expect(request('bug/confirm', { id: 7, data: { ...current, status } }, { client }))
    .rejects.toMatchObject({ code: 'E_INVALID_PARAM', message: expect.stringContaining('status') });
  expect(transport).not.toHaveBeenCalled();
});

test('closed assignee is rejected unless the caller supplies a valid replacement', async () => {
  const client = new ZentaoClient('http://zentao.test');
  const closed = { status: 'success', bug: { ...current, status: 'closed', assignedTo: 'closed' } };
  const transport = spyOn(client, 'request')
    .mockResolvedValueOnce(closed)
    .mockResolvedValueOnce(closed)
    .mockResolvedValueOnce(Response.json({ status: 'success', data: 7 }));
  setGlobalOptions({ version: 'ipd5.6' });
  await expect(request('bug/confirm', { id: 7 }, { client })).rejects.toMatchObject({ code: 'E_INVALID_PARAM' });
  expect(transport).toHaveBeenCalledTimes(1);
  await request('bug/confirm', { id: 7, assignedTo: 'admin' }, { client });
  expect(transport.mock.calls.at(-1)?.[1]?.body).toMatchObject({ status: 'closed', assignedTo: 'admin' });
});

test('confirmation prefetch carries the per-request config error policy', async () => {
  const client = new ZentaoClient('http://zentao.test');
  spyOn(client, 'getZentaoConfig').mockRejectedValue(new ZentaoError('E_INVALID_ZENTAO_CONFIG'));
  const transport = spyOn(client, 'request')
    .mockResolvedValueOnce({ status: 'success', bug: current })
    .mockResolvedValueOnce(Response.json({ status: 'success', data: 7 }));
  const options: RequestOptions = { client, skipVersionCheckOnConfigError: true };
  await request('bug/confirm', { id: 7 }, options);
  expect(transport).toHaveBeenCalledTimes(2);
});
