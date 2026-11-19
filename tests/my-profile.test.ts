import { afterEach, expect, test } from 'bun:test';
import { ZentaoClient, exportRegistry, request, setGlobalOptions } from '../src/index';
import { resetModuleDefinitions } from '../src/modules/registry';

afterEach(() => {
  resetModuleDefinitions();
  setGlobalOptions({ version: undefined });
});

test('my/profile returns the authenticated user without sending caller-supplied identity or field filters', async () => {
  const user = { id: 2, dept: 1, account: 'developer', realname: '开发人员', nickname: '', avatar: null as string | null, role: 'dev', type: 'inside' };
  let calls = 0;
  const server = Bun.serve({ port: 0, fetch(req) {
    calls++;
    expect(req.method).toBe('GET');
    expect(new URL(req.url).pathname).toBe('/api.php/v2/my/profile');
    expect(new URL(req.url).search).toBe('');
    expect(req.headers.get('Token')).toBe('current-user-token');
    expect(req.headers.get('ZenTao-Action-Assistant')).toBe('AI <profile>');
    return Response.json({ status: 'success', user });
  } });
  try {
    resetModuleDefinitions();
    setGlobalOptions({ version: '23.0' });
    const action = exportRegistry().my.actions.find(action => action.name === 'profile');
    expect(action?.resultGetter).toBe('user');
    expect(action?.params).toBeUndefined();
    const client = new ZentaoClient({ baseUrl: server.url.href, token: 'current-user-token' });
    const options = { client, actionAssistant: { name: 'AI', info: 'profile' } };
    for (const avatar of [null, '']) {
      user.avatar = avatar;
      const response = await request('my/profile', { account: 'other', fields: '*', recPerPage: 20 }, options);
      expect(response.status).toBe('success');
      expect(response.data).toEqual(user);
      expect(response.pager).toBeUndefined();
      expect(await request('my/profile', {}, { ...options, raw: true })).toEqual({ status: 'success', user });
    }
    expect(calls).toBe(4);
  } finally { server.stop(true); }
});

test('my/profile preserves HTTP and business failures and rejects invalid JSON', async () => {
  let result = Response.json({ status: 'fail', message: 'Unauthorized.' }, { status: 401 });
  const server = Bun.serve({ port: 0, fetch: () => result.clone() });
  try {
    setGlobalOptions({ version: '23.0' });
    const client = new ZentaoClient(server.url.href);
    for (const status of [401, 403, 405]) {
      result = Response.json({ status: 'fail', message: 'Unauthorized.' }, { status });
      await expect(request('my/profile', {}, { client })).rejects.toMatchObject({
        code: 'E_HTTP_ERROR', details: { status, body: JSON.stringify({ status: 'fail', message: 'Unauthorized.' }) },
      });
    }
    result = Response.json({ status: 'fail', message: 'Unauthorized.' });
    await expect(request('my/profile', {}, { client })).resolves.toMatchObject({ status: 'fail', message: 'Unauthorized.' });
    await expect(request('my/profile', {}, { client, throwOnFail: true })).rejects.toMatchObject({ code: 'E_API_FAILED' });
    result = new Response('<html>login</html>');
    await expect(request('my/profile', {}, { client })).resolves.toMatchObject({ status: 'fail', raw: { httpStatus: 200, responseText: '<html>login</html>' } });
  } finally { server.stop(true); }
});
