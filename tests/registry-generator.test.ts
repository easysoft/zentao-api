import { describe, expect, test } from 'bun:test';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { addHtmlPropertyDescriptions, parseDescriptionOptions, requireMatchingScopedListValue } from '../scripts/update-registry';
import { BUILTIN_MODULES } from '../src/modules/generated';
import type { ModuleDefinition } from '../src/types';

test('finds options after informational parentheses and keeps nested labels', () => {
  expect(parseDescriptionOptions('状态，默认是assignedTo，字段名（区分大小写）。(assignedTo 指派给我 | openedBy 我创建的（含草稿）)'))
    .toMatchObject({
      defaultValue: 'assignedTo',
      options: [
        { value: 'assignedTo', label: '指派给我' },
        { value: 'openedBy', label: '我创建的（含草稿）' },
      ],
    });
  expect(parseDescriptionOptions('内容（纯说明）')).toEqual({
    description: '内容（纯说明）', defaultValue: undefined, options: undefined,
  });
});

test('does not invent a default from a reference to the server default', () => {
  expect(parseDescriptionOptions('贡献筛选类型，不传时使用禅道页面默认值。').defaultValue).toBeUndefined();
  expect(parseDescriptionOptions('状态，默认值为openedBy。').defaultValue).toBe('openedBy');
});

describe('registry generator scoped-list merge', () => {
  test('keeps matching response extractors', () => {
    expect(requireMatchingScopedListValue(['items', 'items'], 'widget', 'resultGetter'))
      .toBe('items');
    expect(requireMatchingScopedListValue([undefined, undefined], 'widget', 'pagerGetter'))
      .toBeUndefined();
  });

  test('rejects conflicting response extractors', () => {
    expect(() => requireMatchingScopedListValue(
      ['items', 'data'],
      'widget',
      'resultGetter',
    )).toThrow('Conflicting resultGetter for merged widget/list action.');
  });
});

describe('registry generator HTML descriptions', () => {
  test('copies changed nodes while preserving input, nested properties and schema constraints', () => {
    const schema = Object.freeze({
      type: 'object', required: ['desc'], additionalProperties: false,
      properties: Object.freeze({
        desc: Object.freeze({ type: 'string', description: '任务描述', maxLength: 100, default: '' }),
        name: Object.freeze({ type: 'string', description: '任务名称' }),
        nested: Object.freeze({ type: 'object', properties: { desc: { type: 'string', description: '嵌套描述' } } }),
      }),
    });
    const original = structuredClone(schema);
    const result = addHtmlPropertyDescriptions(schema, 'Task');
    expect(result).toEqual({
      ...schema, properties: { ...schema.properties, desc: { ...schema.properties.desc, description: '任务描述 (HTML)' } },
    });
    expect(schema).toEqual(original);
    expect(result).not.toBe(schema);
    expect(result.properties).not.toBe(schema.properties);
    expect(addHtmlPropertyDescriptions(result, 'Task')).toBe(result);
  });

  test.each([['content', undefined], ['html', ''], ['draft', '草稿 (HTML)']] as const)(
    'handles empty or already marked descriptions for doc.%s', (name, description) => {
      const property = { type: 'string', ...(description === undefined ? {} : { description }) };
      expect(addHtmlPropertyDescriptions({ properties: { [name]: property } }, 'Doc')).toEqual({
        properties: { [name]: { ...property, description: description || '(HTML)' } },
      });
    },
  );

  test('matches only known top-level object fields with an HTML suffix', () => {
    const schema = { properties: { desc: { description: '描述' }, Desc: { description: '大写字段' }, comment: { description: '备注' } } };
    for (const tag of ['System', 'Workflow', 'unknown', undefined]) {
      expect(addHtmlPropertyDescriptions(schema, tag)).toBe(schema);
    }
    expect(addHtmlPropertyDescriptions(schema, 'Task').properties).toEqual({
      ...schema.properties, desc: { description: '描述 (HTML)' },
    });
    expect(addHtmlPropertyDescriptions({ type: 'string' }, 'Task')).toEqual({ type: 'string' });
  });

  test.each([
    ['project', 'createStory', 'spec'],
    ['project', 'createBug', 'steps'],
    ['project', 'createRisk', 'prevention'],
    ['project', 'createRisk', 'remedy'],
    ['doc', 'update', 'content'],
  ])('generates the HTML marker for %s/%s.%s', (moduleName, actionName, property) => {
    const action = BUILTIN_MODULES.find(module => module.name === moduleName)!.actions.find(action => action.name === actionName)!;
    expect(action).toHaveProperty(`requestBody.schema.properties.${property}.description`, expect.stringMatching(/ \(HTML\)$/));
  });

  test('uses original tags for native and mapped bodies while preserving mapping precedence', async () => {
    const root = mkdtempSync(join(tmpdir(), 'zentao-registry-html-'));
    try {
      for (const path of ['scripts/update-registry.ts', 'src/modules/object-props.ts', 'src/misc/zentao-version.ts', 'src/misc/errors.ts']) {
        mkdirSync(dirname(join(root, path)), { recursive: true });
        copyFileSync(new URL(`../${path}`, import.meta.url), join(root, path));
      }
      mkdirSync(join(root, 'data'));
      const mappedBody = {
        type: 'object', required: false, mediaType: 'application/x-www-form-urlencoded',
        schema: { type: 'object', required: ['spec'], properties: { spec: { type: 'string', description: '映射描述', maxLength: 100 } } },
        example: { spec: '<p>示例</p>' },
      } as const;
      const nativeBody = {
        required: true,
        content: { 'application/json': { schema: { type: 'object', properties: { spec: { type: 'string', description: '原始描述' } } } } },
      };
      const openapi = JSON.stringify({
        tags: [{ name: 'Story', description: '需求' }],
        paths: {
          '/stories': { post: { tags: ['Story'], requestBody: nativeBody } },
          '/projects/{projectID}/stories': {
            post: { tags: ['StOrY', 'Project'], requestBody: nativeBody },
            get: { tags: ['Story'] },
          },
          '/executions/{executionID}/stories': { get: { tags: ['Story'] } },
        },
      });
      const mapping = JSON.stringify({
        'post /stories': { minVersion: ['22.0'] },
        'post /projects/{projectID}/stories': { minVersion: ['22.0'], module: 'project', name: 'createStory', requestBody: mappedBody },
        'get /projects/{projectID}/stories': { minVersion: ['22.0'], requestBody: mappedBody },
        'get /executions/{executionID}/stories': { minVersion: ['22.0'], requestBody: mappedBody },
      });
      writeFileSync(join(root, 'data/zentao-openapi.json'), openapi);
      writeFileSync(join(root, 'scripts/zentao-api-map.json'), mapping);
      for (const args of [[], ['--check']]) {
        const result = spawnSync(process.execPath, [join(root, 'scripts/update-registry.ts'), ...args], { encoding: 'utf8' });
        expect(result.status, result.stdout + result.stderr).toBe(0);
      }
      const { BUILTIN_MODULES: modules }: { BUILTIN_MODULES: ModuleDefinition[] } = await import(pathToFileURL(join(root, 'src/modules/generated.ts')).href);
      const expectedMappedBody = {
        ...mappedBody,
        schema: { ...mappedBody.schema, properties: { spec: { ...mappedBody.schema.properties.spec, description: '映射描述 (HTML)' } } },
      };
      expect(modules.find(module => module.name === 'project')!.actions[0].requestBody).toEqual(expectedMappedBody);
      const story = modules.find(module => module.name === 'story')!;
      expect(story.actions.find(action => action.name === 'list')!.requestBody).toEqual(expectedMappedBody);
      expect(story.actions.find(action => action.name === 'create')!.requestBody).toEqual({
        type: 'object', required: true,
        schema: { type: 'object', properties: { spec: { type: 'string', description: '原始描述 (HTML)' } } },
      });
      expect(readFileSync(join(root, 'data/zentao-openapi.json'), 'utf8')).toBe(openapi);
      expect(readFileSync(join(root, 'scripts/zentao-api-map.json'), 'utf8')).toBe(mapping);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
