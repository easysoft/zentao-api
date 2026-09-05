import { afterEach, describe, expect, test } from 'bun:test';
import {
  defineModules,
  exportRegistry,
  getModule,
  type ModuleDefinition,
} from '../src/index';
import { resetModuleDefinitions } from '../src/modules/registry';

afterEach(() => {
  resetModuleDefinitions();
});

function defineExportFixture(): void {
  defineModules({
    name: 'export-fixture',
    actions: [
      {
        minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
        name: 'create',
        type: 'create',
        path: '/export-fixtures',
        resultGetter: (data) => data,
        pagerGetter: () => ({
          pageID: 1,
          recPerPage: 20,
          recTotal: 1,
        }),
        requestBody: {
          mediaType: 'multipart/form-data',
          schema: {
            type: 'object',
            transform: () => 'transformed',
            required: ['name'],
            properties: {
              name: { type: 'string', description: 'Fixture name' },
              amount: { type: 'number' },
            },
          },
        },
      },
    ],
  });
}

describe('exportRegistry', () => {
  test('returns transformed actions with bodyParams and without requestBody', () => {
    defineExportFixture();

    const registry = exportRegistry();
    const [action] = registry['export-fixture'].actions;

    expect(action.bodyMediaType).toBe('multipart/form-data');
    expect(action.bodyParams).toEqual([
      {
        name: 'name',
        role: 'body',
        required: true,
        type: 'string',
        description: 'Fixture name',
      },
      {
        name: 'amount',
        role: 'body',
        required: false,
        type: 'number',
      },
    ]);
    expect(Object.hasOwn(action, 'requestBody')).toBe(false);
    expect(Object.hasOwn(action, 'resultGetter')).toBe(false);
    expect(Object.hasOwn(action, 'pagerGetter')).toBe(false);
  });

  test('keeps the raw module shape while removing functions by default', () => {
    defineExportFixture();

    const registry = exportRegistry({ raw: true });
    const module: ModuleDefinition = registry['export-fixture'];
    const schema = module.actions[0].requestBody!.schema;

    expect(module.actions[0].requestBody).toBeDefined();
    expect(Object.hasOwn(module.actions[0], 'bodyParams')).toBe(false);
    expect(Object.hasOwn(module.actions[0], 'resultGetter')).toBe(false);
    expect(Object.hasOwn(module.actions[0], 'pagerGetter')).toBe(false);
    expect(Object.hasOwn(schema, 'transform')).toBe(false);
  });

  test('preserves function properties when jsonSafe is disabled', () => {
    defineExportFixture();

    const registry = exportRegistry({ raw: true, jsonSafe: false });
    const module = registry['export-fixture'];
    const schema = module.actions[0].requestBody!.schema;

    expect(module).toBe(getModule('export-fixture')!);
    expect(module.actions[0].resultGetter).toBeFunction();
    expect(module.actions[0].pagerGetter).toBeFunction();
    expect(schema.transform).toBeFunction();
  });

  test('does not install the browser global when importing the main entry', () => {
    const entry = new URL('../src/index.ts', import.meta.url).href;
    const script = `delete globalThis.ZentaoAPI; await import(${JSON.stringify(entry)}); process.stdout.write(String(Object.hasOwn(globalThis, 'ZentaoAPI')));`;
    const result = Bun.spawnSync({
      cmd: [process.execPath, '-e', script],
      stdout: 'pipe',
      stderr: 'pipe',
    });

    expect(result.exitCode).toBe(0);
    expect(new TextDecoder().decode(result.stdout)).toBe('false');
  });
});
