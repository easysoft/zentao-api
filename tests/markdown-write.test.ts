import { afterEach, expect, mock, test } from 'bun:test';
import {
  ZentaoClient, extendModuleAction, request, setGlobalOptions, type MarkdownRenderer,
} from '../src/index';
import { resetModuleDefinitions } from '../src/modules/registry';

let server: ReturnType<typeof Bun.serve> | undefined;

function setup(current: Record<string, unknown> = {}) {
  const events: string[] = [];
  const bodies: Record<string, unknown>[] = [];
  server = Bun.serve({
    hostname: '127.0.0.1', port: 0,
    async fetch(req) {
      events.push(req.method);
      if (req.method === 'GET') return Response.json(current);
      bodies.push(await req.json() as Record<string, unknown>);
      return Response.json({ status: 'success', id: 7 });
    },
  });
  setGlobalOptions({ client: new ZentaoClient(server.url.toString()), version: '23.0' });
  return { events, bodies };
}

afterEach(() => {
  server?.stop(true);
  resetModuleDefinitions();
  setGlobalOptions({ client: undefined, version: undefined, renderMarkdown: undefined });
});

test.each(['object', 'JSON'])('renders the winning explicit fields before autoFill with %s data', async format => {
  const { events, bodies } = setup({ risk: { name: 'old', remedy: '**from GET**' } });
  const data = Object.freeze({ prevention: '  **nested**\n', extra: '# undeclared' });
  const params = Object.freeze({
    id: 7, name: '# plain', prevention: 'shadowed', resolution: '# flat',
    data: format === 'JSON' ? JSON.stringify(data) : data,
  });
  extendModuleAction('risk', 'update', {
    requestBody: { schema: { properties: {
      defaultField: { textType: 'html', defaultValue: '**schema default**' },
      resolution: { textType: 'html', description: 'Resolution' },
    } } },
    async beforeRequest(command) {
      events.push('hook');
      expect(typeof command.params.data).toBe(typeof params.data);
      expect(command.data?.remedy).toBe('**from GET**');
      return { data: { ...command.data, fromHook: '**hook value**' } };
    },
  });
  const render: MarkdownRenderer = async (source, { module, action, field }) => {
    await Promise.resolve();
    events.push(`${module}/${action}.${field}`);
    return `<p>${source}</p>`;
  };
  await request('RISK/upDATE', params, { autoFill: true, renderMarkdown: render });
  expect(events).toEqual(['risk/update.prevention', 'risk/update.resolution', 'GET', 'hook', 'PUT']);
  expect(bodies).toEqual([{
    name: '# plain', prevention: '<p>  **nested**\n</p>', resolution: '<p># flat</p>',
    remedy: '**from GET**', extra: '# undeclared', defaultField: '**schema default**', fromHook: '**hook value**',
  }]);
  expect(data.prevention).toBe('  **nested**\n');
  expect(params.resolution).toBe('# flat');
});

test('preserves explicit clears, non-strings and existing HTML byte for byte', async () => {
  const { bodies } = setup({ product: { name: 'product', desc: 'old' } });
  const render = mock(() => '<p>unexpected</p>');
  for (const value of ['', ' \n\t', null, undefined, '<p class="old">**literal**</p>\n',
    '前 <em>**保留** ![字面](file:example)</em> 后', '<!-- editor --> <img src="https://example.test/a.png">',
    '&gt; <b>lower</b> - upper', '<body>existing document</body>']) {
    await request('product/update', { id: 3, desc: '**shadowed**', data: { desc: value } }, {
      autoFill: true, renderMarkdown: render,
    });
    expect(bodies.at(-1)?.desc).toBe(value);
  }
  expect(render).not.toHaveBeenCalled();
});

test('falls back to flat fields when params.data has no corresponding request body value', async () => {
  const { bodies } = setup();
  const data = Object.create({ spec: 'inherited' });
  Object.defineProperty(data, 'verify', { value: 'hidden' });
  const render = mock((source: string) => `<p>${source}</p>`);
  for (const base of [data, 'invalid JSON', '[]']) {
    await request('story/change', { id: 3, spec: 'flat spec', verify: 'flat verify', data: base }, { renderMarkdown: render });
    expect(bodies.at(-1)).toMatchObject({ spec: '<p>flat spec</p>', verify: '<p>flat verify</p>' });
  }
  expect(render).toHaveBeenCalledTimes(6);
});

test('passes Markdown containing literal tags, autolinks and inline HTML to the callback', async () => {
  const { bodies } = setup();
  const values = ['`<img src="literal">`', '~~~html\n<p>example</p>\n~~~', '# Heading\n\n<span>HTML</span>',
    'See <https://example.test> or <a@example.test>', '<https://example.test> <b>link</b>', '\\<em>example'];
  const render = mock((source: string) => source === values[0] ? '' : '<p>rendered</p>');
  for (const steps of values) {
    await request('bug/create', { productID: 1, title: 'Bug', openedBuild: ['trunk'], steps }, { renderMarkdown: render });
  }
  expect(render.mock.calls.map(([value]) => value)).toEqual(values);
  expect(bodies.map(body => body.steps)).toEqual(['', ...values.slice(1).map(() => '<p>rendered</p>')]);
});

test('keeps collaborative content as Markdown until the caller explicitly selects HTML', async () => {
  const content = '# Document\n\n```html\n<img src="literal">\n```';
  const current = { title: 'Current', content, contentType: 'html' };
  const { bodies } = setup({ doc: current });
  const render = mock(() => '<p><img src="diagram"></p>');
  const resolve = mock(() => ({ url: 'https://example.test/diagram.png' }));
  const options = { renderMarkdown: render, fileResolver: resolve };
  for (const format of [{}, { contentType: 'doc' }, { contentType: 'html', data: { contentType: 'doc' } },
    { contentType: 'html', data: JSON.stringify({ content, contentType: null }) }]) {
    await request('doc/createMyDoc', { spaceID: 1, libID: 2, title: 'Doc', content, ...format }, options);
    expect(bodies.at(-1)?.content).toBe(content);
  }
  await request('doc/update', { id: 7, content }, { ...options, autoFill: true });
  expect(bodies.at(-1)).toMatchObject({ content, title: 'Current', contentType: 'html' });
  current.contentType = 'doc';
  await request('doc/update', { id: 7, title: 'Renamed' }, { ...options, autoFill: true });
  expect(bodies.at(-1)).toMatchObject({ content, title: 'Renamed', contentType: 'doc' });
  expect(render).not.toHaveBeenCalled();
  expect(resolve).not.toHaveBeenCalled();

  await request('DOC/update', {
    id: 7, title: 'Doc', content: 'shadowed', contentType: 'doc', data: JSON.stringify({ content, contentType: 'html' }),
  }, options);
  await request('doc/createMyDoc', { spaceID: 1, libID: 2, title: 'Doc', content, contentType: 'html' }, options);
  expect(render).toHaveBeenCalledTimes(2);
  expect(render).toHaveBeenCalledWith(content, { module: 'doc', action: 'update', field: 'content' });
  expect(render).toHaveBeenCalledWith(content, { module: 'doc', action: 'createMyDoc', field: 'content' });
  expect(resolve).toHaveBeenCalledTimes(2);
  for (const body of bodies.slice(-2)) {
    expect(body).toMatchObject({ content: '<p><img src="https://example.test/diagram.png"></p>', contentType: 'html' });
  }
});

test('supports opt-in per request or globally and skips GET and DELETE', async () => {
  const { bodies } = setup();
  const params = { id: 7, name: 'Product', desc: '**input**' };
  const globalRender = mock(() => '<p>global</p>');
  await request('product/update', params);
  setGlobalOptions({ renderMarkdown: globalRender });
  await request('product/update', params);
  await request('product/update', params, { renderMarkdown: () => '<p>local</p>' });
  await request('product/update', params, { renderMarkdown: false });
  for (const action of ['get', 'delete']) {
    extendModuleAction('product', action, {
      requestBody: { schema: { type: 'object', properties: { desc: { type: 'string', textType: 'html' } } } },
    });
    await request(`product/${action}`, params);
  }
  expect(bodies.map(body => body.desc)).toEqual(['**input**', '<p>global</p>', '<p>local</p>', '**input**', '**input**']);
  expect(globalRender).toHaveBeenCalledTimes(1);
});

test('a renderer failure stops before any prefetch, file resolution or write', async () => {
  const { events } = setup();
  const cause = new Error('Renderer failed');
  const data = Object.freeze({ prevention: 'first', resolution: 'second' });
  const render: MarkdownRenderer = async source => {
    if (source === 'second') throw cause;
    return '<img src="diagram">';
  };
  const fileResolver = mock(() => ({ url: 'https://example.test/diagram.png' }));
  const onWriteOutcome = mock(() => {});
  const params = { id: 7, data };
  await expect(request('risk/update', params, { autoFill: true, renderMarkdown: render, fileResolver, onWriteOutcome }))
    .rejects.toBe(cause);
  expect(onWriteOutcome).toHaveBeenCalledWith('not-sent');
  expect(fileResolver).not.toHaveBeenCalled();
  expect(data.prevention).toBe('first');
  await expect(request('risk/update', params, { autoFill: true, renderMarkdown: (() => null) as unknown as MarkdownRenderer }))
    .rejects.toMatchObject({ code: 'E_INVALID_PARAM', writeOutcome: 'not-sent' });
  expect(events).toEqual([]);
});
