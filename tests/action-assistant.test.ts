import { afterEach, describe, expect, test } from 'bun:test';
import { ZentaoClient, getGlobalOptions, request, setGlobalOptions, type ActionAssistant } from '../src/index';

const header = 'ZenTao-Action-Assistant';
const servers: ReturnType<typeof Bun.serve>[] = [];

function serve(fetch: (req: Request) => Response | Promise<Response> = req => Response.json({ assistant: req.headers.get(header) })) {
  const server = Bun.serve({ port: 0, fetch });
  servers.push(server);
  return server.url.href;
}

afterEach(() => {
  for (const server of servers.splice(0)) server.stop(true);
  setGlobalOptions({ actionAssistant: undefined, client: undefined, version: undefined });
});

describe('action assistant headers', () => {
  test.each([
    ['AI <zentao ipd_5.0>', 'AI <zentao ipd_5.0>'],
    [{ name: 'AI', info: 'zentao ipd_5.0' }, 'AI <zentao ipd_5.0>'],
    [{ name: ' AI ', info: ' zentao ipd_5.0 ' }, 'AI <zentao ipd_5.0>'],
    [{ name: 'AI' }, 'AI'],
    [{ name: 'AI', info: '' }, 'AI'],
    [{ name: 'AI', info: '   ' }, 'AI'],
    [{ name: '0', info: '0' }, '0 <0>'],
    ['', null],
    [undefined, null],
  ] satisfies Array<[ActionAssistant | undefined, string | null]>)('serializes %p as %p', async (actionAssistant, expected) => {
    if (typeof actionAssistant === 'object') Object.freeze(actionAssistant);
    const client = new ZentaoClient({ baseUrl: serve(), actionAssistant });
    await expect(client.get('/products')).resolves.toEqual({ assistant: expected });
  });

  test('rejects invalid objects before sending a request', async () => {
    let calls = 0;
    const client = new ZentaoClient(serve(() => { calls++; return Response.json({}); }));
    for (const value of [
      null, false, 1, [], {}, { name: 1 }, { name: '' }, { name: ' ' },
      { name: 'AI', info: null }, { name: 'AI', info: 1 },
      { name: '<AI>' }, { name: 'AI', info: 'version>1' },
      { name: 'AI\r\n' }, { name: 'AI', info: 'version\t1' },
      { name: 'AI\0' }, { name: 'AI', info: '\u007f' }, { name: 'AI\u0085' },
    ]) {
      await expect(client.get('/products', { actionAssistant: value as ActionAssistant })).rejects.toMatchObject({
        code: 'E_INVALID_PARAM', params: { param: 'actionAssistant' },
      });
    }
    expect(calls).toBe(0);
  });

  test('keeps native header validation for strings and serialized objects', async () => {
    let calls = 0;
    const client = new ZentaoClient(serve(() => { calls++; return Response.json({}); }));
    for (const actionAssistant of ['AI\r\nX-Test: injected', '禅道 AI', { name: '禅道 AI' }]) {
      await expect(client.get('/products', { actionAssistant })).rejects.toBeInstanceOf(TypeError);
    }
    expect(calls).toBe(0);
  });

  test('resolves precedence, replaces whole objects and disables without changing inputs or defaults', async () => {
    const instanceAssistant = Object.freeze({ name: 'Client', info: '1' });
    const globalAssistant = Object.freeze({ name: 'Global', info: '2' });
    const client = ZentaoClient.init({ baseUrl: serve(), actionAssistant: instanceAssistant });
    await expect(client.get('/products')).resolves.toEqual({ assistant: 'Client <1>' });
    setGlobalOptions({ actionAssistant: globalAssistant });
    await expect(client.get('/products')).resolves.toEqual({ assistant: 'Global <2>' });

    const headers = new Headers({ 'zentao-action-assistant': 'Header' });
    for (const input of [headers, { 'ZENTAO-ACTION-ASSISTANT': 'Header' }, [[header, 'Header']]] satisfies HeadersInit[]) {
      await expect(client.get('/products', { headers: input })).resolves.toEqual({ assistant: 'Header' });
    }
    const options = Object.freeze({ headers, actionAssistant: Object.freeze({ name: 'Request' }) });
    await expect(client.get('/products', options)).resolves.toEqual({ assistant: 'Request' });
    await expect(client.get('/products', { headers, actionAssistant: '' })).resolves.toEqual({ assistant: null });
    await expect(client.get('/products', { headers: { [header]: '' } })).resolves.toEqual({ assistant: null });
    expect(headers.get(header)).toBe('Header');
    expect(options.actionAssistant).toEqual({ name: 'Request' });
    expect(getGlobalOptions().actionAssistant).toEqual(globalAssistant);
    await expect(client.get('/products')).resolves.toEqual({ assistant: 'Global <2>' });

    setGlobalOptions({ actionAssistant: '' });
    await expect(client.get('/products')).resolves.toEqual({ assistant: null });
    setGlobalOptions({ actionAssistant: undefined });
    await expect(client.get('/products', { actionAssistant: undefined })).resolves.toEqual({ assistant: 'Client <1>' });
    expect(instanceAssistant).toEqual({ name: 'Client', info: '1' });
  });

  test('does not leak per-request overrides between concurrent requests', async () => {
    const client = new ZentaoClient(serve(async req => {
      await Bun.sleep(5);
      return Response.json({ assistant: req.headers.get(header) });
    }));
    setGlobalOptions({ actionAssistant: { name: 'Global' } });
    const responses = await Promise.all([
      client.get('/products', { actionAssistant: { name: 'First', info: '1' } }),
      client.get('/products', { actionAssistant: '' }),
      client.get('/products'),
      client.get('/products', { actionAssistant: 'Last' }),
    ]);
    expect(responses).toEqual([
      { assistant: 'First <1>' }, { assistant: null }, { assistant: 'Global' }, { assistant: 'Last' },
    ]);
    await expect(client.get('/products')).resolves.toEqual({ assistant: 'Global' });
  });

  test.each(['product/list', 'knowledgelib/list', 'space/list'])('passes defaults and overrides through %s', async name => {
    const client = new ZentaoClient({ baseUrl: serve(), actionAssistant: { name: 'Client' } });
    setGlobalOptions({ client, version: '22.7' });
    await expect(request(name, {}, { raw: true })).resolves.toEqual({ assistant: 'Client' });
    setGlobalOptions({ actionAssistant: 'Global' });
    await expect(request(name, {}, { raw: true })).resolves.toEqual({ assistant: 'Global' });
    await expect(request(name, {}, { raw: true, actionAssistant: { name: 'AI', info: '1' } }))
      .resolves.toEqual({ assistant: 'AI <1>' });
    await expect(request(name, {}, { raw: true, actionAssistant: '' })).resolves.toEqual({ assistant: null });
    await expect(request(name, {}, { actionAssistant: null as unknown as ActionAssistant }))
      .rejects.toMatchObject({ code: 'E_INVALID_PARAM' });
  });

  test('covers HTTP helpers, direct fetch and login while keeping config discovery anonymous', async () => {
    const received: Array<{ method: string; path: string; assistant: string | null; token: string | null; body: unknown }> = [];
    const baseUrl = serve(async req => {
      const url = new URL(req.url);
      received.push({ method: req.method, path: url.pathname + url.search, assistant: req.headers.get(header),
        token: req.headers.get('Token'), body: req.method === 'POST' || req.method === 'PUT' ? await req.json() : undefined });
      if (url.searchParams.get('mode') === 'getconfig') return Response.json({ version: '22.5' });
      if (url.pathname.endsWith('/users/login')) return Response.json({ status: 'success', token: 'new-token' });
      return Response.json({ status: 'success' });
    });
    const client = ZentaoClient.create({ baseUrl, actionAssistant: 'Client', token: 'token' });
    setGlobalOptions({ actionAssistant: { name: 'Global', info: '1' } });
    await client.get('/products');
    await client.post('/products', { name: 'created' });
    await client.put('/products/1', { name: 'updated' });
    await client.delete('/products/1');
    await client.fetch(`${baseUrl}custom`, { actionAssistant: { name: 'Direct' } });
    await client.login('admin', 'secret');
    await client.getZentaoConfig();
    await client.get('/products');
    expect(received.map(({ assistant }) => assistant)).toEqual([
      'Global <1>', 'Global <1>', 'Global <1>', 'Global <1>', 'Direct', 'Global <1>', null, 'Global <1>',
    ]);
    expect(received.map(({ method }) => method)).toEqual(['GET', 'POST', 'PUT', 'DELETE', 'GET', 'POST', 'GET', 'GET']);
    expect(received[1].body).toEqual({ name: 'created' });
    expect(received[2].body).toEqual({ name: 'updated' });
    expect(received[5].body).toEqual({ account: 'admin', password: 'secret' });
    expect(received[6]).toMatchObject({ path: '/?mode=getconfig', token: null });
    expect(received.map(({ token }) => token)).toEqual(['token', 'token', 'token', 'token', null, 'token', null, 'new-token']);
  });
});
