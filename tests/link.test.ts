import { afterEach, describe, expect, test } from 'bun:test';
import { createLink, getGlobalOptions, parseLink, setGlobalOptions, type CreateLinkOptions, type LinkProfile, type LinkRequestType, type ServerConfig } from '../src/index';
import { createLink as browserCreateLink, parseLink as browserParseLink } from '../src/browser';

afterEach(() => {
  setGlobalOptions({ relative: undefined });
});

function profile(requestType: LinkRequestType = 'PATH_INFO', overrides: Partial<ServerConfig> = {}): LinkProfile {
  return {
    server: 'https://zentao.example.com/zentao',
    serverConfig: {
      version: '23.0', systemMode: 'ALM', sprintConcept: '0', sessionVar: 'zentaosid',
      requestType, requestFix: '-', moduleVar: 'm', methodVar: 'f', viewVar: 't', ...overrides,
    },
  };
}

describe('page links', () => {
  test.each([
    ['GET', '/zentao/index.php?m=bug&f=view&bugID=7'],
    ['PATH_INFO', '/zentao/bug-view-7.html'],
    ['PATH_INFO2', '/zentao/index.php/bug-view-7.html'],
  ] as const)('creates and parses %s links with explicit profile context', (type, path) => {
    const current = profile(type);
    const options = { moduleName: 'bug', methodName: 'view', vars: 'bugID=7' };
    const url = createLink(current, options);
    expect(url).toBe(`https://zentao.example.com${path}`);
    expect(createLink(current, { ...options, relative: true })).toBe(path);
    expect(parseLink(current, url)).toMatchObject({
      url: path, moduleName: 'bug', methodName: 'view', viewType: 'html', requestType: type,
      vars: [[type === 'GET' ? 'bugID' : '', '7']], hash: '', tid: '', isOnlyBody: false,
    });
    expect(browserCreateLink).toBe(createLink);
    expect(browserParseLink).toBe(parseLink);
  });

  test.each(['GET', 'PATH_INFO', 'PATH_INFO2'] as const)('inherits and overrides the global relative default in %s', (type) => {
    const current = profile(type);
    const options = Object.freeze({ moduleName: 'bug', methodName: 'view', vars: 'id=7' });
    const absolute = createLink(current, options);
    const relative = createLink(current, { ...options, relative: true });

    setGlobalOptions({ relative: true });
    expect(createLink(current, options)).toBe(relative);
    expect(createLink(current, { ...options, relative: undefined })).toBe(relative);
    expect(createLink(current, { ...options, relative: false })).toBe(absolute);
    expect(getGlobalOptions().relative).toBe(true);

    setGlobalOptions({ relative: false });
    expect(createLink(current, options)).toBe(absolute);
    expect(createLink(current, { ...options, relative: true })).toBe(relative);
    expect(getGlobalOptions().relative).toBe(false);

    setGlobalOptions({ relative: undefined });
    expect(createLink(current, options)).toBe(absolute);
  });

  test.each(['GET', 'PATH_INFO', 'PATH_INFO2'] as const)('uses custom routing fields in %s', (type) => {
    const current = profile(type, {
      webRoot: '/custom/', router: 'route.php', requestFix: '~',
      moduleVar: 'module', methodVar: 'method', viewVar: 'view', defaultView: 'htm',
    });
    const url = createLink(current, {
      moduleName: 'task', methodName: 'view', vars: [['id', '2']], viewType: 'json', relative: true,
    });
    expect(url).toBe(type === 'GET'
      ? '/custom/route.php?module=task&method=view&id=2&view=json'
      : `/custom/${type === 'PATH_INFO2' ? 'route.php/' : ''}task~view~2.json`);
    expect(parseLink(current, url, { requestType: 'auto' })).toMatchObject({
      moduleName: 'task', methodName: 'view', viewType: 'json', requestType: type,
    });
    expect(createLink(current, { moduleName: 'task', methodName: 'view', relative: true })).toBe(type === 'GET'
      ? '/custom/route.php?module=task&method=view'
      : `/custom/${type === 'PATH_INFO2' ? 'route.php/' : ''}task~view.htm`);
  });

  test.each(['GET', 'PATH_INFO', 'PATH_INFO2'] as const)('does not duplicate instance paths in %s', (type) => {
    const current = profile(type, { instCode: 'tenant' });
    const options = { moduleName: 'bug', methodName: 'view' };
    const url = createLink(current, options);
    expect(url).toStartWith('https://zentao.example.com/zentao/tenant/');
    current.server += '/tenant/';
    expect(createLink(current, options)).toBe(url);
    current.serverConfig!.webRoot = '/zentao/tenant/';
    expect(createLink(current, options)).toBe(url);
    current.serverConfig!.webRoot = '/zentao/';
    expect(createLink(current, options)).toBe(url);
    expect(parseLink(current, url)).toMatchObject({ moduleName: 'bug', methodName: 'view' });
    expect(parseLink(current, '/zentao/tenant2/bug-view.html')).toEqual({
      external: true, url: '/zentao/tenant2/bug-view.html',
    });
  });

  test('normalizes the site URL and uses explicit root and router paths', () => {
    const current = profile('GET');
    current.server = 'https://zentao.example.com:8443/zentao/api.php/v2/';
    expect(createLink(current, { moduleName: 'bug', methodName: 'view' }))
      .toBe('https://zentao.example.com:8443/zentao/index.php?m=bug&f=view');
    current.serverConfig!.webRoot = '/another';
    current.serverConfig!.router = '/another/start.php';
    expect(createLink(current, { moduleName: 'bug', methodName: 'view' }))
      .toBe('https://zentao.example.com:8443/another/start.php?m=bug&f=view');
    current.server = 'https://zentao.example.com';
    delete current.serverConfig!.webRoot;
    delete current.serverConfig!.router;
    expect(createLink(current, { moduleName: 'bug', methodName: 'view', relative: true }))
      .toBe('/index.php?m=bug&f=view');
  });

  test('compares instance paths using URL encoding', () => {
    const current = profile('PATH_INFO', { instCode: '租户' });
    const options = { moduleName: 'bug', methodName: 'view' };
    const url = createLink(current, options);
    expect(url).toBe('https://zentao.example.com/zentao/%E7%A7%9F%E6%88%B7/bug-view.html');
    current.server += '/租户/';
    expect(createLink(current, options)).toBe(url);
  });

  test('accepts variable representations and preserves empty values', () => {
    const representations: CreateLinkOptions['vars'][] = [
      'id=1&empty=&eq=a=b',
      ['id=1', 'empty=', 'eq=a=b'],
      [['id', '1'], ['empty', ''], ['eq', 'a=b']],
    ];
    for (const vars of representations) {
      expect(createLink(profile('GET'), { moduleName: 'bug', methodName: 'view', vars, relative: true }))
        .toBe('/zentao/index.php?m=bug&f=view&id=1&empty=&eq=a=b');
      expect(createLink(profile(), { moduleName: 'bug', methodName: 'view', vars, relative: true }))
        .toBe('/zentao/bug-view-1--a=b.html');
    }
  });

  test('handles blank variable strings, nameless values, bare names and an empty default view', () => {
    expect(createLink(profile(), { moduleName: 'index', methodName: 'index', vars: '', relative: true }))
      .toBe('/zentao/index-index.html');
    const current = profile('PATH_INFO', { defaultView: '' });
    const path = createLink(current, { moduleName: 'bug', methodName: 'view', vars: ['id', '=7'], relative: true });
    expect(path).toBe('/zentao/bug-view--7');
    expect(parseLink(current, path)).toMatchObject({ vars: [['', ''], ['', '7']], viewType: '' });
  });

  test('appends query values and hashes without serializing positional aliases', () => {
    const options = {
      moduleName: 'bug', methodName: 'view', vars: 'id=1', viewType: 'json', hash: '#details#notes', relative: true,
      params: { $1: 'ignored', onlybody: 'yes', tid: 'tab%2B1', empty: undefined, nil: null, enabled: false, count: 0 },
    };
    for (const type of ['GET', 'PATH_INFO', 'PATH_INFO2'] as const) {
      const current = profile(type);
      const url = createLink(current, options);
      expect(url).toEndWith('onlybody=yes&tid=tab%2B1&empty=&nil=&enabled=false&count=0#details#notes');
      expect(url).not.toContain('$1');
      expect(url.match(/\?/g)).toHaveLength(1);
      const parsed = parseLink(current, url);
      expect(parsed).toMatchObject({ isOnlyBody: true, tid: 'tab+1', viewType: 'json', hash: 'details#notes' });
      expect(parsed.vars!.some(([key]) => key === 'tid' || key === 'onlybody')).toBe(false);
    }
    expect(createLink(profile(), { moduleName: 'bug', methodName: 'view', hash: 'part' })).toEndWith('#part');
    expect(createLink(profile(), { moduleName: 'bug', methodName: 'view', hash: '' })).toEndWith('#');
  });

  test('preserves percent encoding on creation and decodes only query parameters on parsing', () => {
    const value = '%E4%B8%AD%2F%26%2B%25%2D';
    for (const type of ['GET', 'PATH_INFO', 'PATH_INFO2'] as const) {
      const current = profile(type);
      const url = createLink(current, {
        moduleName: 'search', methodName: 'index', vars: [['word', value]], params: { query: value }, hash: value,
      });
      expect(url).toContain(value);
      expect(url).not.toContain('%25E4');
      const parsed = parseLink(current, url);
      expect(parsed.vars![0][1]).toBe(type === 'GET' ? '中/&+%-' : value);
      expect(parsed.params!.query).toBe('中/&+%-');
      expect(parsed.hash).toBe(value);
    }
    expect(parseLink(profile('GET'), '?m=bug&f=view&q=a+b&plus=a%2Bb').params)
      .toMatchObject({ q: 'a b', plus: 'a+b' });
  });

  test('parses duplicate and special query keys as data', () => {
    const parsed = parseLink(profile('GET'), '?f=view&m=bug&tag=a&tag=b&__proto__=safe&constructor=value&empty');
    expect(parsed).toMatchObject({ moduleName: 'bug', methodName: 'view' });
    expect(parsed.params!.tag).toBe('a,b');
    expect(parsed.params!.__proto__).toBe('safe');
    expect(parsed.params).toMatchObject({ constructor: 'value' });
    expect(parsed.params!.empty).toBe('');
    const custom = profile('GET', { moduleVar: 'toString', methodVar: '__proto__', viewVar: 'constructor' });
    expect(parseLink(custom, 'index.php')).toMatchObject({ moduleName: 'index', methodName: 'index', viewType: 'html' });
  });

  test.each([
    ['index.php?tid=x&f=view&id=1&m=bug', 'GET'],
    ['?f=view&m=bug&id=1', 'GET'],
    ['index.php', 'GET'],
    ['bug-view-1.html?tid=x', 'PATH_INFO'],
    ['index.php/bug-view-1.html?tid=x', 'PATH_INFO2'],
  ] as const)('detects routing independently of configured mode and parameter order (%s)', (url, type) => {
    const current = profile('PATH_INFO2');
    expect(parseLink(current, url, { requestType: 'auto' }).requestType).toBe(type);
  });

  test.each(['PATH_INFO', 'PATH_INFO2'] as const)('keeps path routing when query keys collide in %s', (type) => {
    const current = profile(type);
    const url = createLink(current, {
      moduleName: 'bug', methodName: 'view', vars: 'id=7', params: { m: 'search', f: 'index' },
    });
    expect(parseLink(current, url, { requestType: 'auto' })).toMatchObject({
      requestType: type, moduleName: 'bug', methodName: 'view', vars: [['', '7']],
      params: { m: 'search', f: 'index', $1: '7' },
    });
  });

  test.each(['GET', 'PATH_INFO2'] as const)('recognizes an explicitly configured router outside webRoot in %s', (type) => {
    const current = profile(type, { router: '/entry.php' });
    const url = createLink(current, { moduleName: 'bug', methodName: 'view', vars: 'id=7' });
    for (const options of [{}, { requestType: 'auto' as const }]) {
      expect(parseLink(current, url, options)).toMatchObject({
        moduleName: 'bug', methodName: 'view', requestType: type, vars: [[type === 'GET' ? 'id' : '', '7']],
      });
    }
    for (const outside of ['/entry.php2/bug-view-7.html', '/elsewhere/bug-view-7.html', 'https://other.example.com/entry.php']) {
      expect(parseLink(current, outside)).toEqual({ external: true, url: outside });
    }
  });

  test.each(['PATH_INFO', 'PATH_INFO2'] as const)('parses slash-separated routes and preserves empty slots in %s', (type) => {
    const current = profile(type, { requestFix: '/' });
    const url = createLink(current, { moduleName: 'bug', methodName: 'view', vars: 'id=7&empty=&next=%2Ftarget' });
    for (const options of [{}, { requestType: 'auto' as const }]) {
      expect(parseLink(current, url, options)).toMatchObject({
        requestType: type, moduleName: 'bug', methodName: 'view', viewType: 'html',
        vars: [['', '7'], ['', ''], ['', '%2Ftarget']], params: { $1: '7', $2: '', $3: '%2Ftarget' },
      });
    }
    current.serverConfig!.defaultView = '';
    const trailingEmpty = createLink(current, { moduleName: 'bug', methodName: 'view', vars: 'id=7&empty=' });
    expect(parseLink(current, trailingEmpty)).toMatchObject({
      moduleName: 'bug', methodName: 'view', viewType: '', vars: [['', '7'], ['', '']],
    });
  });

  test('permits an explicit parse mode when the saved mode is missing or different', () => {
    const current = profile('GET', { requestType: undefined });
    expect(parseLink(current, 'bug-view-2.html', { requestType: 'PATH_INFO' }))
      .toMatchObject({ moduleName: 'bug', methodName: 'view', requestType: 'PATH_INFO', params: { $1: '2' } });
  });

  test.each(['bug-view-1.html', './bug-view-1.html', '/zentao/bug-view-1.html', '//zentao.example.com/zentao/bug-view-1.html'])
    ('resolves relative and protocol-relative internal links (%s)', (url) => {
      expect(parseLink(profile(), url)).toMatchObject({ moduleName: 'bug', methodName: 'view', vars: [['', '1']] });
    });

  test.each([
    'https://other.example.com/zentao/bug-view-1.html',
    'http://zentao.example.com/zentao/bug-view-1.html',
    'https://zentao.example.com:8443/zentao/bug-view-1.html',
    '//other.example.com/zentao/bug-view-1.html',
    '/zentao-other/bug-view-1.html', '/elsewhere/bug-view-1.html', '../bug-view-1.html',
    '/zentao/%2e%2e/elsewhere/bug-view-1.html',
    'mailto:user@example.com', 'javascript:alert(1)', 'data:text/plain,hello',
  ])('marks external links by origin and directory boundary (%s)', (url) => {
    expect(parseLink(profile(), url)).toEqual({ external: true, url });
  });

  test('handles empty input without reading configuration and defaults directory links to index', () => {
    const emptyProfile: LinkProfile = { server: '' };
    expect(parseLink(emptyProfile)).toEqual({ url: undefined });
    expect(parseLink(emptyProfile, '')).toEqual({ url: '' });
    for (const url of ['/zentao', '/zentao/', '/zentao/index.php', '/zentao/index.php/', '#part']) {
      expect(parseLink(profile(), url)).toMatchObject({ moduleName: 'index', methodName: 'index', viewType: 'html', vars: [] });
    }
    expect(parseLink(profile(), 'bug-view-1.html/')).toMatchObject({ moduleName: 'bug', methodName: 'view' });
  });

  test.each([
    ['GET', 'requestType'], ['GET', 'moduleVar'], ['GET', 'methodVar'], ['GET', 'viewVar'], ['PATH_INFO', 'requestFix'],
  ] as const)('reports a missing %s configuration field: %s', (type, field) => {
    const current = profile(type, { [field]: undefined });
    const error = { code: 'E_MISSING_PARAM', params: { param: `profile.serverConfig.${field}` } };
    expect(() => createLink(current, { moduleName: 'bug', methodName: 'view' })).toThrow(expect.objectContaining(error));
    expect(() => parseLink(current, '/zentao/bug-view-1.html')).toThrow(expect.objectContaining(error));
  });

  test('rejects unsupported routing, invalid addresses and missing page arguments', () => {
    const current = profile('GET', { requestType: 'unknown' });
    expect(() => createLink(current, { moduleName: 'bug', methodName: 'view' }))
      .toThrow(expect.objectContaining({ code: 'E_INVALID_PARAM', params: { param: 'profile.serverConfig.requestType', value: 'unknown' } }));
    expect(() => parseLink(current, '/zentao/')).toThrow(expect.objectContaining({ code: 'E_INVALID_PARAM' }));
    expect(() => parseLink(profile(), 'http://[')).toThrow(expect.objectContaining({ code: 'E_INVALID_PARAM' }));
    expect(() => createLink({ server: 'invalid' }, { moduleName: 'bug', methodName: 'view' }))
      .toThrow(expect.objectContaining({ code: 'E_INVALID_BASE_URL' }));
    expect(() => createLink({ server: 'https://zentao.example.com' }, { moduleName: 'bug', methodName: 'view' }))
      .toThrow(expect.objectContaining({ code: 'E_MISSING_PARAM', params: { param: 'profile.serverConfig.requestType' } }));
    expect(() => createLink(profile(), { moduleName: '', methodName: 'view' }))
      .toThrow(expect.objectContaining({ code: 'E_MISSING_PARAM', params: { param: 'moduleName' } }));
    for (const overrides of [
      { router: 'https://external.example.com/index.php' }, { webRoot: '/zentao/?mode=bad' },
      { webRoot: 'blob:https://zentao.example.com/id' },
    ]) {
      expect(() => createLink(profile('GET', overrides), { moduleName: 'bug', methodName: 'view' }))
        .toThrow(expect.objectContaining({ code: 'E_INVALID_PARAM' }));
    }
  });

  test('does not mutate or serialize profile data or input arrays', () => {
    const current = profile();
    Object.freeze(current.serverConfig);
    Object.freeze(current);
    for (const vars of [Object.freeze(['id=1']), Object.freeze([Object.freeze(['id', '1'] as const)])]) {
      const options = Object.freeze({ moduleName: 'bug', methodName: 'view', vars, params: Object.freeze({ tid: 'tab' }) });
      const before = JSON.stringify(options);
      const url = createLink(current, options);
      expect(parseLink(current, url)).toMatchObject({ moduleName: 'bug', vars: [['', '1']], tid: 'tab' });
      expect(JSON.stringify(options)).toBe(before);
    }
    const fullProfile = { ...current, get token(): never { throw new Error('Must not access token'); } };
    expect(createLink(fullProfile, { moduleName: 'bug', methodName: 'view' })).toEndWith('bug-view.html');
  });

  test('aggregates large repeated query values in order', () => {
    const values = Array.from({ length: 10000 }, (_, index) => String(index));
    const url = `index.php?m=bug&f=view&${values.map((value) => `tag=${value}`).join('&')}`;
    expect(parseLink(profile('GET'), url).params!.tag).toBe(values.join(','));
  });
});
