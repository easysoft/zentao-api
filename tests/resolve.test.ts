import { afterEach, describe, expect, test } from 'bun:test';
import {
  defineModules,
  getModule,
  type ModuleAction,
  type ModuleDefinition,
} from '../src/index';
import { resetModuleDefinitions } from '../src/modules/registry';
import { extractPager, extractResult, resolveModuleCommand } from '../src/modules/resolve';

afterEach(() => {
  resetModuleDefinitions();
});

describe('resolveModuleCommand', () => {
  test('resolves scoped list paths by execution, project, then product priority', () => {
    defineModules({
      name: 'workitem',
      actions: [
        {
          name: 'list',
          type: 'list',
          method: 'get',
          path: '/{scope}/{scopeID}/workitems',
          pathParams: {
            scope: {
              description: 'Scope',
              options: [
                { value: 'products', label: 'Product' },
                { value: 'projects', label: 'Project' },
                { value: 'executions', label: 'Execution' },
              ],
            },
            scopeID: 'Scope ID',
          },
          params: [
            {
              name: 'pageID',
              required: false,
              type: 'number',
              description: 'Page',
            },
            {
              name: 'status',
              required: false,
              type: 'string',
              description: 'Status',
              options: [{ value: 'open', label: 'Open' }],
            },
          ],
          resultType: 'list',
        },
      ],
    });

    const command = resolveModuleCommand(getModule('workitem'), 'list', {
      productID: 1,
      projectID: '2',
      executionID: '3',
      page: '4',
    });

    expect(command.path).toBe('/executions/3/workitems');
    expect(command.query).toEqual({
      pageID: '4',
      status: 'open',
    });
  });

  test('uses path param defaults and id aliases when building paths', () => {
    defineModules({
      name: 'widget',
      actions: [
        {
          name: 'transition',
          type: 'action',
          method: 'put',
          path: '/widgets/{mode}/{widgetID}',
          pathParams: {
            mode: {
              description: 'Mode',
              defaultValue: 'archive',
            },
            widgetID: 'Widget ID',
          },
          resultType: 'text',
        },
      ],
    });

    const command = resolveModuleCommand(getModule('widget'), 'transition', { id: '42' });

    expect(command.path).toBe('/widgets/archive/42');
    expect(command.id).toBe(42);
  });

  test('builds request body from data, flat params, defaults, and schema types', () => {
    const formModule: ModuleDefinition = {
      name: 'form',
      actions: [
        {
          name: 'create',
          type: 'create',
          method: 'post',
          path: '/forms',
          resultType: 'object',
          requestBody: {
            type: 'object',
            schema: {
              type: 'object',
              required: ['name'],
              properties: {
                name: { type: 'string' },
                estimate: { type: 'integer' },
                enabled: { type: 'boolean' },
                tags: { type: 'array', items: { type: 'string' } },
                priority: { type: 'number', defaultValue: '2' },
              },
            },
          },
        },
      ],
    };
    defineModules(formModule);

    const command = resolveModuleCommand(getModule('form'), 'create', {
      data: '{"name":"from data","estimate":"8"}',
      enabled: 'false',
      tags: 'api,sdk',
    });

    expect(command.data).toEqual({
      name: 'from data',
      estimate: 8,
      enabled: false,
      tags: ['api', 'sdk'],
      priority: 2,
    });
  });

  test('coerces common boolean string values without treating every non-empty string as true', () => {
    defineModules({
      name: 'flagform',
      actions: [
        {
          name: 'create',
          type: 'create',
          method: 'post',
          path: '/flag-forms',
          resultType: 'object',
          requestBody: {
            type: 'object',
            schema: {
              type: 'object',
              properties: {
                enabled: { type: 'boolean' },
                archived: { type: 'boolean' },
                visible: { type: 'boolean' },
              },
            },
          },
        },
      ],
    });

    const command = resolveModuleCommand(getModule('flagform'), 'create', {
      enabled: '0',
      archived: 'off',
      visible: '1',
    });

    expect(command.data).toEqual({
      enabled: false,
      archived: false,
      visible: true,
    });
  });

  test('preserves explicit object values from data for array schema fields', () => {
    defineModules({
      name: 'iteration',
      actions: [
        {
          name: 'create',
          type: 'create',
          method: 'post',
          path: '/iterations',
          resultType: 'object',
          requestBody: {
            type: 'object',
            schema: {
              type: 'object',
              required: ['name'],
              properties: {
                name: { type: 'string' },
                plans: { type: 'array', items: { type: 'string' } },
              },
            },
          },
        },
      ],
    });

    const command = resolveModuleCommand(getModule('iteration'), 'create', {
      data: {
        name: 'iteration 1',
        plans: { '1': [2] },
      },
    });

    expect(command.data).toEqual({
      name: 'iteration 1',
      plans: { '1': [2] },
    });
  });

  test('throws when required request body fields are missing', () => {
    defineModules({
      name: 'requiredform',
      actions: [
        {
          name: 'create',
          type: 'create',
          method: 'post',
          path: '/required-forms',
          resultType: 'object',
          requestBody: {
            type: 'object',
            schema: {
              type: 'object',
              required: ['name'],
              properties: {
                name: { type: 'string' },
              },
            },
          },
        },
      ],
    });

    expect(() => resolveModuleCommand(getModule('requiredform'), 'create', {})).toThrow('name');
  });
});

describe('result and pager extraction', () => {
  test('extracts mapped result fields and mapped pager fields', () => {
    const action: ModuleAction = {
      name: 'summary',
      type: 'get',
      method: 'get',
      path: '/summary',
      resultType: 'object',
      resultGetter: {
        count: 'total',
        rows: 'items',
      },
      pagerGetter: {
        pageID: 'page',
        recPerPage: 'size',
        recTotal: 'total',
      },
    };
    const response = {
      total: 2,
      page: 3,
      size: 20,
      items: [{ id: 1 }, { id: 2 }],
    };

    expect(extractResult(action, response)).toEqual({
      count: 2,
      rows: [{ id: 1 }, { id: 2 }],
    });
    expect(extractPager(action, response)).toEqual({
      pageID: 3,
      recPerPage: 20,
      recTotal: 2,
    });
  });

  test('supports function result and pager getters', () => {
    const action: ModuleAction = {
      name: 'computed',
      type: 'get',
      method: 'get',
      path: '/computed',
      resultType: 'object',
      resultGetter: (data) => ({ title: (data as { title: string }).title.toUpperCase() }),
      pagerGetter: () => ({
        pageID: 1,
        recPerPage: 10,
        recTotal: 1,
      }),
    };

    expect(extractResult(action, { title: 'zentao' })).toEqual({ title: 'ZENTAO' });
    expect(extractPager(action, {})).toEqual({
      pageID: 1,
      recPerPage: 10,
      recTotal: 1,
    });
  });
});
