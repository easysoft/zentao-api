import { describe, expect, expectTypeOf, test } from 'bun:test';
import { getModuleAction, request, type ActionAssistant, type BuiltinRequestName, type DataRecord, type FileCreateParams, type FileReference, type FileResolver, type FileWarning, type GlobalOptions, type RequestOptions, type RequestResultFor, type ResolvedFile } from '../src/index';
import type { ActionAssistant as BrowserActionAssistant, FileResolver as BrowserFileResolver } from '../src/browser';

interface ProductSummary {
  id: number;
  name: string;
}

async function typedRequestExamples(): Promise<void> {
  expectTypeOf<BrowserActionAssistant>().toEqualTypeOf<ActionAssistant>();
  expectTypeOf<BrowserFileResolver>().toEqualTypeOf<FileResolver>();
  expectTypeOf<RequestOptions['fileResolver']>().toEqualTypeOf<GlobalOptions['fileResolver']>();
  const fileResolver: FileResolver = async ({ path, name }: FileReference): Promise<ResolvedFile> => ({ path, name });
  const fileOptions: RequestOptions = {
    fileResolver,
    continueOnFileUploadError: false,
    onFileError: async (warning: FileWarning) => { String(warning.fileID); },
  };
  const htmlResult = await request('story/update', { id: 1, spec: '<img src="file:1">' }, fileOptions);
  expectTypeOf(htmlResult).toEqualTypeOf<unknown>();
  const htmlNormalized = await request('story/update', { id: 1, spec: '<img src="image-1">' }, {
    fileResolver: { 'image-1': { blob: new Blob(['image']), name: 'image.png' } },
    continueOnFileUploadError: true,
    onFileError: warning => { String(warning.message); },
  });
  expectTypeOf(htmlNormalized.fileWarnings).toEqualTypeOf<FileWarning[] | undefined>();
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
    extra: 'editor',
  });
  uploaded.data?.id.toFixed();
  const unattachedParams: FileCreateParams = { file: '/tmp/report.txt' };
  const unattached = await request('file/create', unattachedParams);
  unattached.data?.id.toFixed();
  expectTypeOf<FileCreateParams['extra']>().toEqualTypeOf<string | undefined>();

  const profileName: BuiltinRequestName = 'my/profile';
  const fileName: BuiltinRequestName = 'file/get';
  expectTypeOf<Extract<'file/link', BuiltinRequestName>>().toBeNever();
  expectTypeOf<FileCreateParams['uid']>().toEqualTypeOf<string | undefined>();
  const readName: BuiltinRequestName = 'file/read';
  expectTypeOf((await request(profileName)).data).toEqualTypeOf<DataRecord | undefined>();
  const settings = await request('setting/workHours');
  expectTypeOf(settings.data?.dailyWorkHours).toEqualTypeOf<number | undefined>();
  expectTypeOf(settings.data?.effortUnit).toEqualTypeOf<'day' | 'hour' | undefined>();
  expectTypeOf((await request(fileName, { fileID: 'Zy1hYmM=' })).data).toEqualTypeOf<DataRecord | undefined>();
  expectTypeOf((await request('file/123')).data).toEqualTypeOf<DataRecord | undefined>();
  expectTypeOf((await request(readName, { fileID: 123 })).data).toEqualTypeOf<ArrayBuffer | string | undefined>();
  expectTypeOf((await request(readName, { id: 123, stream: '1' })).data).toEqualTypeOf<ArrayBuffer | string | undefined>();
  expectTypeOf<RequestResultFor<'file/read'>>().toEqualTypeOf<ArrayBuffer | string>();
  expectTypeOf(await request(readName, { fileID: 123 }, { raw: true })).toEqualTypeOf<unknown>();

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
