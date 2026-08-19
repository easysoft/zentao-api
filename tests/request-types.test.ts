import { describe, expect, test } from 'bun:test';
import { getModuleAction, request, type BuiltinRequestName, type DataRecord } from '../src/index';

interface ProductSummary {
  id: number;
  name: string;
}

async function typedRequestExamples(): Promise<void> {
  const moduleOnlyName: BuiltinRequestName = 'product';
  const actionName: BuiltinRequestName = 'product/list';
  const detailName: BuiltinRequestName = 'product/1';

  await request(moduleOnlyName, { recPerPage: 20 });
  await request(actionName, { recPerPage: 20, pageID: 1 });

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
