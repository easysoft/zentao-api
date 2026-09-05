import { afterEach, describe, expect, test } from 'bun:test';
import {
  defineModules,
  getModule,
  getModuleAction,
  getModuleActionParams,
  getObjectProps,
  type ModuleAction,
  type ModuleDefinition,
} from '../src/index';
import { resetModuleDefinitions } from '../src/modules/registry';
import { extractPager, extractResult, resolveActionRequest } from '../src/modules/resolve';

afterEach(() => {
  resetModuleDefinitions();
});

describe('resolveActionRequest', () => {
  test('resolves scoped list paths by execution, project, then product priority', () => {
    defineModules({
      name: 'workitem',
      actions: [
        {
          minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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

    const command = resolveActionRequest(getModule('workitem')!, 'list', {
      productID: 1,
      projectID: '2',
      executionID: '3',
      page: '4',
    });

    expect(command.path).toBe('/executions/3/workitems');
    expect(command.query).toEqual({
      pageID: '4',
    });
  });

  test('does not treat the first query option as an implicit default', () => {
    defineModules({
      name: 'widget',
      actions: [{
        minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
        name: 'list',
        type: 'list',
        method: 'get',
        path: '/widgets',
        params: [{
          name: 'status',
          type: 'string',
          options: [{ value: 'open', label: 'Open' }],
        }],
      }],
    });

    expect(resolveActionRequest(getModule('widget')!, 'list').query).toEqual({});
  });

  test('omits a scoped-list default when source operations disagree', () => {
    const action = getModuleAction('story', 'list')!;
    const browseType = action.params?.find((param) => param.name === 'browseType');

    expect(browseType?.defaultValue).toBeUndefined();
    expect(browseType?.description).toBe('状态');
    expect(browseType?.options?.[0]?.value).toBe('allstory');
    expect(resolveActionRequest(getModule('story')!, 'list', { productID: 1 }).query)
      .not.toHaveProperty('browseType');
  });

  test('preserves structured query parameter metadata and values', () => {
    const action = getModuleAction('user', 'list')!;
    const filtersParam = action.params?.find((param) => param.name === 'filters');
    const filters = [{ field: 'account', operator: 'include', value: 'admin', join: 'and', group: 1 }];

    expect(filtersParam).toEqual(expect.objectContaining({
      type: 'array',
      style: 'deepObject',
      explode: true,
    }));
    expect(resolveActionRequest(getModule('user')!, 'list', { filters }).query).toEqual({ filters });
  });

  test('preserves generated request body examples', () => {
    expect(getModuleAction('user', 'create')?.requestBody?.example).toEqual(expect.objectContaining({
      account: 'productmanager',
      realname: '产品经理',
    }));
  });

  test('resolves scoped list paths from explicit scope and scopeID', () => {
    defineModules({
      name: 'workitem',
      actions: [
        {
          minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
          resultType: 'list',
        },
      ],
    });

    const command = resolveActionRequest(getModule('workitem')!, 'list', {
      scope: 'products',
      scopeID: 1,
    });

    expect(command.path).toBe('/products/1/workitems');
  });

  test('prefers explicit scope/scopeID over product/project/execution aliases', () => {
    defineModules({
      name: 'workitem',
      actions: [
        {
          minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
          resultType: 'list',
        },
      ],
    });

    const command = resolveActionRequest(getModule('workitem')!, 'list', {
      scope: 'products',
      scopeID: 1,
      executionID: 9,
    });

    expect(command.path).toBe('/products/1/workitems');
  });

  test('falls back to aliases when only one of scope/scopeID is provided', () => {
    defineModules({
      name: 'workitem',
      actions: [
        {
          minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
          resultType: 'list',
        },
      ],
    });

    const command = resolveActionRequest(getModule('workitem')!, 'list', {
      scope: 'products',
      productID: 7,
    });

    expect(command.path).toBe('/products/7/workitems');
  });

  test('throws E_INVALID_PARAM for an unrecognized scope value', () => {
    defineModules({
      name: 'workitem',
      actions: [
        {
          minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
          resultType: 'list',
        },
      ],
    });

    expect(() => resolveActionRequest(getModule('workitem')!, 'list', {
      scope: 'product',
      scopeID: 1,
    })).toThrowError(expect.objectContaining({ code: 'E_INVALID_PARAM' }));
  });

  test('uses path param defaults and id aliases when building paths', () => {
    defineModules({
      name: 'widget',
      actions: [
        {
          minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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

    const command = resolveActionRequest(getModule('widget')!, 'transition', { id: '42' });

    expect(command.path).toBe('/widgets/archive/42');
    expect(command.id).toBe(42);
  });

  test('builds request body from data, flat params, defaults, and schema types', () => {
    const formModule: ModuleDefinition = {
      name: 'form',
      actions: [
        {
          minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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

    const command = resolveActionRequest(getModule('form')!, 'create', {
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
    expect(getModuleActionParams('form', 'create', { roles: ['body'] })
      .find((param) => param.name === 'estimate')?.type).toBe('number');
  });

  test('coerces common boolean string values without treating every non-empty string as true', () => {
    defineModules({
      name: 'flagform',
      actions: [
        {
          minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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

    const command = resolveActionRequest(getModule('flagform')!, 'create', {
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

  test('throws E_INVALID_PARAM when a boolean field receives an unrecognized string', () => {
    defineModules({
      name: 'strictflagform',
      actions: [
        {
          minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
          name: 'create',
          type: 'create',
          method: 'post',
          path: '/strict-flag-forms',
          resultType: 'object',
          requestBody: {
            type: 'object',
            schema: {
              type: 'object',
              properties: {
                enabled: { type: 'boolean' },
              },
            },
          },
        },
      ],
    });

    expect(() => resolveActionRequest(getModule('strictflagform')!, 'create', {
      enabled: 'maybe',
    })).toThrowError(expect.objectContaining({ code: 'E_INVALID_PARAM' }));
  });

  test('preserves explicit object values from data for array schema fields', () => {
    defineModules({
      name: 'iteration',
      actions: [
        {
          minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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

    const command = resolveActionRequest(getModule('iteration')!, 'create', {
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

  test('preserves explicit null values from data and flat params', () => {
    defineModules({
      name: 'nullableform',
      actions: [
        {
          minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
          name: 'update',
          type: 'update',
          method: 'put',
          path: '/nullable-forms/{nullableformID}',
          pathParams: { nullableformID: 'Nullable form ID' },
          resultType: 'object',
          requestBody: {
            type: 'object',
            schema: {
              type: 'object',
              properties: {
                title: { type: 'string', defaultValue: 'default title' },
                estimate: { type: 'integer', defaultValue: 3 },
                reviewers: { type: 'array' },
              },
            },
          },
        },
      ],
    });

    const command = resolveActionRequest(getModule('nullableform')!, 'update', {
      id: 1,
      data: {
        title: null,
        reviewers: null,
      },
      estimate: null,
    });

    expect(command.data).toEqual({
      title: null,
      estimate: null,
      reviewers: null,
    });
  });

  test('throws when required request body fields are missing', () => {
    defineModules({
      name: 'requiredform',
      actions: [
        {
          minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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

    expect(() => resolveActionRequest(getModule('requiredform')!, 'create', {})).toThrow('name');
  });
});

describe('module queries', () => {
  test('returns an empty object for an unknown object type', () => {
    expect(getObjectProps('unknown')).toEqual({});
  });
});

describe('result and pager extraction', () => {
  test('extracts mapped result fields and mapped pager fields', () => {
    const action: ModuleAction = {
      minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
      minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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

  test('passes call params to function getters', () => {
    const action: ModuleAction = {
      minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
      name: 'computed',
      type: 'get',
      method: 'get',
      path: '/computed',
      resultType: 'object',
      resultGetter: (_data, params) => ({ echoed: params.id }),
      pagerGetter: (_data, params) => ({
        pageID: Number(params.page),
        recPerPage: 10,
        recTotal: 0,
      }),
    };

    expect(extractResult(action, {}, { id: 42 })).toEqual({ echoed: 42 });
    expect(extractPager(action, {}, { page: 3 })).toEqual({
      pageID: 3,
      recPerPage: 10,
      recTotal: 0,
    });
  });

  test('passes request processing options to function getters', () => {
    const action: ModuleAction = {
      minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
      name: 'computed',
      type: 'get',
      method: 'get',
      path: '/computed',
      resultType: 'object',
      resultGetter: (_data, _params, options) => ({
        picked: options?.pick,
        hasSingleConverter: typeof options?.convertSingle === 'function',
      }),
      pagerGetter: (_data, _params, options) => ({
        pageID: options?.limit === '5' ? 5 : 1,
        recPerPage: 10,
        recTotal: 20,
      }),
    };
    const options = {
      pick: ['id'],
      limit: '5',
      convertSingle: (record: Record<string, unknown>) => record,
    };

    expect(extractResult(action, {}, {}, options)).toEqual({
      picked: ['id'],
      hasSingleConverter: true,
    });
    expect(extractPager(action, {}, {}, options)).toEqual({
      pageID: 5,
      recPerPage: 10,
      recTotal: 20,
    });
  });

  test('extracts mapped result and pager fields from nested paths', () => {
    const action: ModuleAction = {
      minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
      name: 'summary',
      type: 'get',
      method: 'get',
      path: '/summary',
      resultType: 'object',
      resultGetter: {
        rows: 'data.items',
      },
      pagerGetter: {
        pageID: 'data.page',
        recPerPage: 'data.size',
        recTotal: 'data.total',
      },
    };
    const response = {
      data: {
        page: 3,
        size: 20,
        total: 2,
        items: [{ id: 1 }, { id: 2 }],
      },
    };

    expect(extractResult(action, response)).toEqual({
      rows: [{ id: 1 }, { id: 2 }],
    });
    expect(extractPager(action, response)).toEqual({
      pageID: 3,
      recPerPage: 20,
      recTotal: 2,
    });
  });
});
