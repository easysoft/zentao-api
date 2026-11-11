import { describe, expect, expectTypeOf, test } from 'bun:test';
import { getModuleAction, request, type ActionAssistant, type BuiltinRequestName, type DataRecord, type RequestOptions } from '../src/index';
import type { ActionAssistant as BrowserActionAssistant } from '../src/browser';

interface ProductSummary {
  id: number;
  name: string;
}

async function typedRequestExamples(): Promise<void> {
  expectTypeOf<BrowserActionAssistant>().toEqualTypeOf<ActionAssistant>();
  const moduleOnlyName: BuiltinRequestName = 'product';
  const actionName: BuiltinRequestName = 'product/list';
  const detailName: BuiltinRequestName = 'product/1';

  await request(moduleOnlyName, { recPerPage: 20 });
  await request(actionName, { recPerPage: 20, pageID: 1 }, { actionAssistant: { name: 'AI', info: 'zentao ipd_5.0' } });

  const products = await request('product/list', { recPerPage: 20, pageID: 1 });
  const rows: DataRecord[] | undefined = products.data;
  rows?.forEach((item) => String(item.id));

  const product = await request(detailName);
  const detail: DataRecord | undefined = product.data;
  String(detail?.id);

  await request('product/update', { id: 1, name: '产品 A', acl: 'open' });
  await request('bug/list', { productID: 1, status: 'active', page: 1 });
  await request('testcase/list', { scope: 'products', scopeID: 1 });
  const uploaded = await request('file/create', {
    file: '/tmp/report.txt',
    objectType: 'story',
    objectID: 1,
  });
  uploaded.data?.id.toFixed();

  const narrowed = await request<ProductSummary[]>('product/list', {});
  narrowed.data?.forEach((product) => product.name.toUpperCase());

  const raw = await request('product/list', {}, { raw: true });
  expectTypeOf(raw).toEqualTypeOf<unknown>();

  const widenedRawOptions: RequestOptions = { raw: true };
  const widenedRaw = await request('product/list', {}, widenedRawOptions);
  expectTypeOf(widenedRaw).toEqualTypeOf<unknown>();

  const normalized = await request('product/list', {}, { raw: false });
  expectTypeOf(normalized.data).toEqualTypeOf<DataRecord[] | undefined>();

  const candidates = await request('relation/candidates', { objectType: 'story', objectID: 1, relatedObjectType: 'task' });
  expectTypeOf(candidates.data).toEqualTypeOf<DataRecord[] | undefined>();
  const calendar = await request('resourcecalendar/get', { accounts: 'admin' });
  expectTypeOf(calendar.data).toEqualTypeOf<DataRecord | undefined>();
  const deliverableOptions = await request('deliverable/options', { projectID: 1 });
  expectTypeOf(deliverableOptions.data).toEqualTypeOf<DataRecord | undefined>();
  await request('relation/unlink', { relationID: 8 });
  const knowledge = await request('knowledge/search', { keywords: ['API'], libIDs: [1] });
  expectTypeOf(knowledge.data).toEqualTypeOf<DataRecord[] | undefined>();
  const sqlRows = await request('db/query', { sql: 'SELECT id FROM zt_user' });
  expectTypeOf(sqlRows.data).toEqualTypeOf<DataRecord[] | undefined>();
}

function getterCompatibilityExamples(): void {
  const getter = getModuleAction('doc', 'get')?.resultGetter;
  if (typeof getter !== 'function') return;

  getter({}, {});
  getter({}, {}, { pick: ['content'] });
}

describe('typed request examples', () => {
  test('compile without running network calls', () => {
    expect(typeof typedRequestExamples).toBe('function');
    expect(typeof getterCompatibilityExamples).toBe('function');
  });
});
