import { afterEach, describe, expect, test } from 'bun:test';
import {
  ZentaoClient, defineModules, defineModuleActions, extendModuleAction, exportRegistry,
  getModule, getModuleAction, getModuleActionParams, getModuleNames, isModuleName,
  request, setGlobalOptions, getGlobalOptions, type ModuleAction,
} from '../src/index';
import { resetModuleDefinitions } from '../src/modules/registry';
import { parseZentaoVersion, supportsZentaoVersion, validateMinVersion } from '../src/misc/zentao-version';

const oldVersions = ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'];
const newVersions = ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'];

afterEach(() => {
  resetModuleDefinitions();
  setGlobalOptions({ client: undefined, version: undefined, skipVersionCheckOnConfigError: undefined,
    persistProfiles: undefined, timeout: undefined, insecure: undefined, autoFill: undefined });
});

describe('ZenTao versions and registry filtering', () => {
  test.each([
    ['22.4', false], ['22.5', true], ['22.5.0', true], ['22.5.1', true], ['22.10', true],
    ['biz13.4', false], ['biz13.5', true], ['biz13.10', true],
    ['max8.4', false], ['max8.5', true], ['max9.0', true],
    ['ipd5.4', false], ['ipd5.5', true], ['ipd6.0', true], [' BIZ13.5 ', true],
  ])('compares %s within its edition', (version, supported) => {
    expect(supportsZentaoVersion(parseZentaoVersion(version), newVersions)).toBe(supported);
  });

  test('rejects unsupported edition and malformed versions', () => {
    expect(supportsZentaoVersion(parseZentaoVersion('biz99'), ['22.0'])).toBe(false);
    for (const version of ['', 'pro13.5', '22.5-beta1', '22.5rc1', '22..5', '-22.5', '22.5x', 'Infinity', '9007199254740992']) {
      expect(() => getModule('missing', { version })).toThrow(expect.objectContaining({ code: 'E_INVALID_ZENTAO_VERSION' }));
      expect(() => getModuleNames({ version })).toThrow(expect.objectContaining({ code: 'E_INVALID_ZENTAO_VERSION' }));
    }
  });

  test('requires valid non-empty minima at every registry write entry', () => {
    const action: ModuleAction = { name: 'sample', type: 'get', path: '/sample', minVersion: ['22.0'] };
    for (const minVersion of [undefined, [], Array(1), ['22.0', '22.5'], ['biz13.0', 'BIZ13.5'], ['unknown1'], [22]]) {
      const invalid = { ...action, minVersion } as unknown as ModuleAction;
      expect(() => validateMinVersion(minVersion)).toThrow(expect.objectContaining({ code: 'E_INVALID_ACTION_DEFINITION' }));
      expect(() => defineModules({ name: 'invalid', actions: [invalid] })).toThrow('Invalid module action');
      expect(() => defineModuleActions('product', invalid)).toThrow('Invalid module action');
      expect(() => extendModuleAction('product', 'get', () => invalid)).toThrow('Invalid module action');
    }
    expect(() => extendModuleAction('product', 'get', { minVersion: [] })).toThrow('Invalid module action');
    expect(getModule('invalid')).toBeUndefined();
  });

  test('assigns the two historical cohorts including builtin overrides', () => {
    const actions = getModuleNames().flatMap(name => getModule(name)!.actions);
    expect(actions).toHaveLength(229);
    expect(actions.filter(action => JSON.stringify(action.minVersion) === JSON.stringify(oldVersions))).toHaveLength(106);
    expect(actions.filter(action => JSON.stringify(action.minVersion) === JSON.stringify(newVersions))).toHaveLength(123);
    for (const name of ['productplan', 'epic', 'requirement', 'testcase', 'release']) {
      expect(getModuleAction(name, 'update')!.minVersion).toEqual(oldVersions);
    }
    expect(getModuleAction('file', 'create')!.minVersion).toEqual(oldVersions);
    expect(getModuleAction('story', 'getGrades')!.minVersion).toEqual(newVersions);
    expect(exportRegistry().story.actions.find(action => action.name === 'getGrades')!.minVersion).toEqual(newVersions);
  });

  test('filters all query helpers without consulting globals or modifying registry references', () => {
    setGlobalOptions({ version: '21.0' });
    const original = getModule('story')!;
    const filtered = getModule('STORY', { version: 'biz13.0' })!;
    expect(getModule('story')).toBe(original);
    expect(filtered).not.toBe(original);
    expect(Object.isFrozen(filtered)).toBe(true);
    expect(Object.isFrozen(filtered.actions)).toBe(true);
    expect(filtered.actions.every(action => Object.isFrozen(action))).toBe(true);
    expect(filtered.actions.some(action => action.name === 'getGrades')).toBe(false);
    expect(getModuleAction('story', 'getGrades')).toBeDefined();
    expect(getModuleAction('story', 'getGrades', { version: 'biz13.0' })).toBeUndefined();
    expect(getModuleAction('story', 'ls', { version: '22.0' })?.name).toBe('list');
    expect(getModuleActionParams('doc', 'createMyDoc', { version: '22.0', roles: ['body'] })).toEqual([]);
    expect(getModuleActionParams('doc', 'createMyDoc', { version: '22.5', roles: ['body'] }).length).toBeGreaterThan(0);
    expect(getModuleNames()).toHaveLength(26);
    expect(getModuleNames({ version: '22.0' })).toHaveLength(19);
    expect(getModuleNames({ version: '21.9' })).toEqual([]);
    expect(getModule('doc', { version: '22.0' })).toBeUndefined();
    expect(isModuleName('DOC')).toBe(true);
    expect(isModuleName('DOC', { version: '22.0' })).toBe(false);
  });
});

describe('high-level version checks', () => {
  test('uses globals directly, forces actual config when requested, and checks raw high-level responses', async () => {
    const paths: string[] = [];
    let actualVersion = 'biz13.0';
    const server = Bun.serve({ port: 0, fetch(req) {
      const url = new URL(req.url);
      paths.push(url.pathname + url.search);
      return Response.json(url.searchParams.has('mode') ? { version: actualVersion } : { status: 'success', grades: [] });
    } });
    try {
      const client = new ZentaoClient(server.url.toString());
      setGlobalOptions({ version: 'biz13.5' });
      await request('story/getGrades', {}, { client });
      expect(paths).toEqual(['/api.php/v2/storygrades']);
      paths.length = 0;
      await expect(request('story/getGrades', {}, { client, raw: true, forceRefreshConfig: true,
        skipVersionCheckOnConfigError: true })).rejects.toMatchObject({ code: 'E_UNSUPPORTED_ZENTAO_VERSION',
        details: { action: 'story/getGrades', version: 'biz13.0', minVersion: newVersions } });
      expect(paths).toEqual(['/?mode=getconfig']);
      expect(getGlobalOptions().version).toBe('biz13.5');
      setGlobalOptions({ version: undefined });
      await expect(request('story/getGrades', {}, { client })).rejects.toMatchObject({ code: 'E_UNSUPPORTED_ZENTAO_VERSION' });
      expect(paths).toHaveLength(1);
      actualVersion = 'biz13.5';
      await request('story/getGrades', {}, { client, forceRefreshConfig: true });
      expect(paths).toEqual(['/?mode=getconfig', '/?mode=getconfig', '/api.php/v2/storygrades']);
      setGlobalOptions({ version: 'bad-version' });
      await expect(request('product/list', {}, { client, skipVersionCheckOnConfigError: true }))
        .rejects.toMatchObject({ code: 'E_INVALID_ZENTAO_VERSION' });
      await client.get('/products');
      expect(paths.at(-1)).toBe('/api.php/v2/products');
    } finally { server.stop(true); }
  });

  test('blocks before uploads and autoFill, and enforces omitted editions', async () => {
    const paths: string[] = [];
    const server = Bun.serve({ port: 0, fetch(req) { paths.push(req.url); return Response.json({ status: 'success' }); } });
    try {
      const client = new ZentaoClient(server.url.toString());
      setGlobalOptions({ version: '21.9' });
      await expect(request('file/create', { file: '/does-not-exist', objectType: 'story', objectID: 1 }, { client }))
        .rejects.toMatchObject({ code: 'E_UNSUPPORTED_ZENTAO_VERSION' });
      await expect(request('product/update', { id: 1 }, { client, autoFill: true }))
        .rejects.toMatchObject({ code: 'E_UNSUPPORTED_ZENTAO_VERSION' });
      extendModuleAction('product', 'list', { minVersion: ['22.0'] });
      setGlobalOptions({ version: 'biz99' });
      await expect(request('product/list', {}, { client })).rejects.toMatchObject({ code: 'E_UNSUPPORTED_ZENTAO_VERSION' });
      expect(paths).toEqual([]);
    } finally { server.stop(true); }
  });

  test('fails config discovery by default, optionally skips it, and retries without caching failures', async () => {
    let mode = 'http';
    let configs = 0, calls = 0;
    const server = Bun.serve({ port: 0, fetch(req) {
      if (new URL(req.url).searchParams.has('mode')) {
        configs++;
        if (mode === 'http') return new Response('Unavailable', { status: 503 });
        if (mode === 'html') return new Response('<html>login</html>');
        return Response.json({ version: mode });
      }
      calls++;
      return Response.json({ status: 'success', products: [] });
    } });
    try {
      const client = new ZentaoClient(server.url.toString());
      await expect(request('product/list', {}, { client })).rejects.toMatchObject({ code: 'E_HTTP_ERROR' });
      expect(calls).toBe(0);
      setGlobalOptions({ skipVersionCheckOnConfigError: true });
      await request('product/list', {}, { client });
      expect(calls).toBe(1);
      await expect(request('product/list', {}, { client, skipVersionCheckOnConfigError: false }))
        .rejects.toMatchObject({ code: 'E_HTTP_ERROR' });
      mode = 'html';
      await request('product/list', {}, { client });
      mode = 'biz13.5-beta1';
      await expect(request('product/list', {}, { client })).rejects.toMatchObject({ code: 'E_INVALID_ZENTAO_VERSION' });
      mode = 'biz13.5';
      await request('product/list', {}, { client });
      await request('product/list', {}, { client });
      expect(configs).toBe(6);
      expect(calls).toBe(4);
    } finally { server.stop(true); }
  });

  test.each([false, true])('reuses the resolved version or skip state through autoFill (skip=%p)', async skip => {
    let configs = 0;
    const calls: string[] = [];
    let update: unknown;
    defineModules({ name: 'versioned', actions: [
      { name: 'get', type: 'get', path: '/versioned/{id}', pathParams: { id: 'ID' }, minVersion: newVersions, resultGetter: 'item' },
      { name: 'update', type: 'update', path: '/versioned/{id}', pathParams: { id: 'ID' }, minVersion: newVersions,
        requestBody: { schema: { type: 'object', properties: { name: { type: 'string' }, retained: { type: 'string' } } } } },
    ] });
    const server = Bun.serve({ port: 0, async fetch(req) {
      if (new URL(req.url).searchParams.has('mode')) {
        configs++;
        return skip ? new Response('Unavailable', { status: 503 }) : Response.json({ version: 'biz13.5' });
      }
      calls.push(req.method);
      if (req.method === 'PUT') update = await req.json();
      return Response.json({ status: 'success', item: { name: 'original', retained: 'keep' } });
    } });
    try {
      const client = new ZentaoClient(server.url.toString());
      setGlobalOptions({ version: 'biz13.0' });
      await request('versioned/update', { id: 1, name: 'new' }, { client, autoFill: true,
        forceRefreshConfig: true, skipVersionCheckOnConfigError: skip });
      expect(configs).toBe(1);
      expect(calls).toEqual(['GET', 'PUT']);
      expect(update).toEqual({ name: 'new', retained: 'keep' });
      expect(getGlobalOptions().version).toBe('biz13.0');
    } finally { server.stop(true); }
  });
});
