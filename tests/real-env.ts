import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { randomUUID } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  ZentaoClient,
  request,
  setGlobalOptions,
  getModule,
  getModuleAction,
  getModuleNames,
  type RequestOptions,
  type ResponseData,
} from '../src/index';
import { resolveActionRequest } from '../src/modules/resolve';
import {
  createRealEnvLogger,
  resolveRealEnvRuntimeOptions,
  resolveRealEnvWorkflowGroup,
  createRealEnvCoverage,
  getMissingRealEnvModule,
  validateRealEnvResponse,
} from './real-env-support';

const ENV_FILES = ['.env.local', 'env.local'] as const;
let runtimeOptions = resolveRealEnvRuntimeOptions();
const logger = createRealEnvLogger();
const coverage = createRealEnvCoverage(getModuleNames().flatMap(name => getModule(name)!.actions.map(action => `${name}/${action.name}`)));
const unavailable = new Map<string, string>();
const extraCreated: { requestName: `${string}/${string}`; id: number }[] = [];
const listParams = { recPerPage: 1000, pageID: 1 };

interface RealEnvConfig {
  baseUrl: string;
  token?: string;
  account?: string;
  password?: string;
  reviewer?: string;
  timeout?: number;
  insecure?: boolean;
}

let client: ZentaoClient | undefined;
let requestOptions: RequestOptions & { raw?: false } = {};
let productID: number | undefined;
let productName = '';
let actorAccount: string | undefined;
let supportModuleID: number | undefined;

const created = {
  fileIDs: [] as number[],
  storyIDs: [] as number[],
  taskIDs: [] as number[],
  bugIDs: [] as number[],
  planID: undefined as number | undefined,
  projectID: undefined as number | undefined,
  executionID: undefined as number | undefined,
  programID: undefined as number | undefined,
};

interface LookupByField {
  requestName: `${string}/${string}`;
  params: Record<string, unknown>;
  field: string;
  value: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function parseEnvValue(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

async function loadLocalEnvFiles(): Promise<void> {
  for (const file of ENV_FILES) {
    if (!(await Bun.file(file).exists())) continue;

    const text = await Bun.file(file).text();
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match) continue;

      const [, key, rawValue] = match;
      process.env[key] ??= parseEnvValue(rawValue);
    }
  }
}

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

async function loadRealEnvConfig(): Promise<RealEnvConfig> {
  await loadLocalEnvFiles();

  const baseUrl = readEnv('ZENTAO_URL') ?? readEnv('ZENTAO_BASE_URL');
  const token = readEnv('ZENTAO_TOKEN');
  const account = readEnv('ZENTAO_ACCOUNT');
  const password = readEnv('ZENTAO_PASSWORD');
  const reviewer = readEnv('ZENTAO_REVIEWER');
  const timeout = Number(readEnv('ZENTAO_TIMEOUT') ?? 30000);
  const insecure = ['1', 'true', 'yes'].includes((readEnv('ZENTAO_INSECURE') ?? '').toLowerCase());

  if (!baseUrl) {
    throw new Error('Missing ZENTAO_URL or ZENTAO_BASE_URL in .env.local/env.local.');
  }
  if (!token && (!account || !password)) {
    throw new Error('Missing ZENTAO_TOKEN or ZENTAO_ACCOUNT/ZENTAO_PASSWORD in .env.local/env.local.');
  }

  return {
    baseUrl,
    token,
    account,
    password,
    reviewer,
    timeout: Number.isFinite(timeout) ? timeout : 30000,
    insecure,
  };
}

function expectSuccess(response: ResponseData): void {
  validateRealEnvResponse(response);
  expect(response.status).toBe('success');
}

function tryExtractID(data: unknown): number | undefined {
  if (!isRecord(data)) return undefined;
  return [data.id, data.rawID, data.caseID].map(Number).find(id => Number.isSafeInteger(id) && id > 0);
}

function requireProductID(): number {
  if (!productID) throw new Error('Temporary product was not created.');
  return productID;
}

function requirePlanID(): number {
  if (!created.planID) throw new Error('Temporary product plan was not created.');
  return created.planID;
}

function requireProjectID(): number {
  if (!created.projectID) throw new Error('Temporary project was not created.');
  return created.projectID;
}

function requireExecutionID(): number {
  if (!created.executionID) throw new Error('Temporary execution was not created.');
  return created.executionID;
}

function recordMatchesID(item: unknown, id: number): boolean {
  if (!isRecord(item)) return false;
  return ['id', 'rawID', 'caseID'].some((key) => String(item[key]) === String(id));
}

function expectListContainsID(data: unknown, id: number): void {
  expect(Array.isArray(data)).toBe(true);
  expect((data as unknown[]).some((item) => recordMatchesID(item, id))).toBe(true);
}

function expectListExcludesID(data: unknown, id: number): void {
  expect(Array.isArray(data)).toBe(true);
  expect((data as unknown[]).some((item) => recordMatchesID(item, id))).toBe(false);
}

function unwrapRecord(data: unknown, nestedKey?: string): Record<string, unknown> {
  if (isRecord(data) && nestedKey && isRecord(data[nestedKey])) {
    return data[nestedKey] as Record<string, unknown>;
  }
  if (!isRecord(data)) {
    throw new Error(`Expected response data to be an object, got ${JSON.stringify(data)}`);
  }
  return data;
}

function removeCreatedID(ids: number[], id: number): void {
  const index = ids.indexOf(id);
  if (index >= 0) ids.splice(index, 1);
}

function dateAfter(days: number): string {
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
}

function maybeAssigned<T extends Record<string, unknown>>(body: T): T {
  return actorAccount ? { ...body, assignedTo: actorAccount } : body;
}

function maybeReviewer(): Record<string, unknown> {
  return actorAccount ? { reviewer: [actorAccount] } : {};
}

function fieldIncludesID(value: unknown, id: number): boolean {
  const expected = String(id);
  if (Array.isArray(value)) return value.some((item) => fieldIncludesID(item, id));
  if (isRecord(value)) return Object.values(value).some((item) => fieldIncludesID(item, id));
  const text = String(value ?? '');
  return text === expected || text.includes(`,${expected},`) || text.split(/[,\s]+/).includes(expected);
}

function summarizeParams(params: Record<string, unknown>): Record<string, unknown> {
  const summary: Record<string, unknown> = {};
  for (const key of ['id', 'productID', 'projectID', 'executionID', 'name', 'title', 'browseType', 'status']) {
    if (params[key] !== undefined) summary[key] = params[key];
  }
  if (isRecord(params.data)) {
    for (const key of ['name', 'title', 'project', 'executionID']) {
      if (params.data[key] !== undefined) summary[key] = params.data[key];
    }
  }
  return summary;
}

function summarizeResponse(response: ResponseData): Record<string, unknown> {
  const summary: Record<string, unknown> = { status: response.status };
  if (response.message) summary.message = response.message;

  const data = response.data;
  if (Array.isArray(data)) {
    summary.count = data.length;
    return summary;
  }

  if (isRecord(data)) {
    for (const key of ['id', 'rawID', 'name', 'title', 'status', 'pri', 'resolution']) {
      if (data[key] !== undefined) summary[key] = data[key];
    }
  }

  return summary;
}

function summarizeCreatedData(): Record<string, unknown> {
  return {
    productID,
    productName,
    planID: created.planID,
    projectID: created.projectID,
    programID: created.programID,
    executionID: created.executionID,
    fileIDs: created.fileIDs,
    storyIDs: created.storyIDs,
    taskIDs: created.taskIDs,
    bugIDs: created.bugIDs,
  };
}

async function apiRequest(
  label: string,
  requestName: `${string}/${string}`,
  params: Record<string, unknown> = {},
): Promise<ResponseData> {
  logger.step(label, { api: requestName, ...summarizeParams(params) });
  const [moduleName, actionName] = requestName.split('/');
  const action = getModuleAction(moduleName, actionName)!;
  try {
    const response = await request(requestName, params, requestOptions);
    validateRealEnvResponse(response, action.method === 'get' ? action.resultType : undefined);
    const command = resolveActionRequest(getModule(moduleName)!, actionName, params);
    coverage.record(requestName, 'success', `${action.method?.toUpperCase()} ${command.path.replace(/\/\d+(?=\/|$)/g, '/{id}')}`);
    logger.result(summarizeResponse(response));
    return response;
  } catch (error) {
    coverage.record(requestName, 'fail', undefined, (error as Error).message);
    throw new Error(`${requestName}: ${(error as Error).message}`, { cause: error });
  }
}

async function call(requestName: `${string}/${string}`, params: Record<string, unknown> = {}): Promise<ResponseData> {
  return apiRequest(requestName, requestName, params);
}

async function createTracked(
  requestName: `${string}/${string}`,
  params: Record<string, unknown>,
  deleteName: `${string}/${string}`,
  lookup?: LookupByField,
): Promise<number> {
  const moduleName = deleteName.split('/')[0];
  if (!lookup && moduleName !== 'doc' && !deleteName.endsWith('Module')) {
    lookup = {
      requestName: moduleName === 'todo' ? 'my/todos' : `${moduleName}/list`,
      params: { ...listParams, browseType: ['story', 'epic', 'requirement'].includes(moduleName) ? 'allstory' : 'all',
        ...(['story', 'epic', 'requirement', 'bug', 'testcase', 'feedback', 'ticket', 'release', 'testtask'].includes(moduleName)
          ? { productID: requireProductID() } : {}),
        ...(moduleName === 'task' ? { executionID: requireExecutionID() } : {}),
      },
      field: ['todo', 'task', 'build', 'testtask', 'program'].includes(moduleName) ? 'name' : typeof params.title === 'string' ? 'title' : 'name',
      value: String(params.title ?? params.name),
    };
  }
  try {
    const id = await createEntity(requestName, requestName, params, undefined, lookup);
    extraCreated.push({ requestName: deleteName, id });
    return id;
  } catch (error) {
    // A failed response can follow a successful write. Recover only this run's uniquely named fixture for cleanup.
    if (lookup) {
      try {
        const id = await findCreatedID(lookup);
        if (id) extraCreated.push({ requestName: deleteName, id });
      } catch (lookupError) {
        logger.info('Could not recover the created fixture for cleanup', { api: requestName, name: lookup.value, error: (lookupError as Error).message });
      }
    }
    throw error;
  }
}

async function deleteTracked(requestName: `${string}/${string}`, id: number): Promise<void> {
  if (runtimeOptions.keepTestData) return;
  await call(requestName, { id });
  const index = extraCreated.findIndex(item => item.requestName === requestName && item.id === id);
  if (index >= 0) extraCreated.splice(index, 1);
}

async function getRecord(requestName: `${string}/${string}`, id: number): Promise<Record<string, unknown>> {
  const response = await call(requestName, { id });
  expect(recordMatchesID(response.data, id)).toBe(true);
  return unwrapRecord(response.data);
}

async function getList(requestName: `${string}/${string}`, params: Record<string, unknown> = {}): Promise<Record<string, unknown>[]> {
  const response = await call(requestName, { ...listParams, ...params });
  expect(Array.isArray(response.data)).toBe(true);
  return response.data as Record<string, unknown>[];
}

async function getSupportModuleID(): Promise<number> {
  return supportModuleID ??= await createTracked('product/createStoryModule', {
    productID: requireProductID(), name: `${productName} support`, parentID: 0,
  }, 'story/deleteModule');
}

async function createRequirement(moduleName: 'story' | 'epic' | 'requirement', title: string): Promise<number> {
  return createTracked(`${moduleName}/create`, { productID: requireProductID(), title,
    pri: 3, category: 'feature', estimate: 1, spec: 'Lifecycle specification', verify: 'Verify lifecycle', ...maybeReviewer() }, `${moduleName}/delete`);
}

async function createEntity(
  label: string,
  requestName: `${string}/${string}`,
  params: Record<string, unknown>,
  track?: number[],
  lookup?: LookupByField,
): Promise<number> {
  const response = await apiRequest(label, requestName, params);
  expectSuccess(response);
  const id = tryExtractID(response.data) ?? (lookup ? await findCreatedID(lookup) : undefined);
  if (!id) {
    throw new Error(`Could not determine created id for ${requestName}: ${JSON.stringify(response.data)}`);
  }
  track?.push(id);
  logger.result({ createdID: id });
  return id;
}

async function findCreatedID(lookup: LookupByField): Promise<number | undefined> {
  const response = await apiRequest(`Lookup ${lookup.requestName}`, lookup.requestName, lookup.params);
  expectSuccess(response);
  if (!Array.isArray(response.data)) return undefined;

  const record = response.data.find((item) => (
    isRecord(item) && String(item[lookup.field]) === lookup.value
  ));
  return tryExtractID(record);
}

async function expectDeleteSuccess(requestName: `${string}/${string}`, id: number): Promise<void> {
  const response = await apiRequest(`Delete ${requestName}`, requestName, { id });
  expectSuccess(response);
}

const config = await loadRealEnvConfig();
runtimeOptions = resolveRealEnvRuntimeOptions();
actorAccount = config.reviewer ?? config.account;
if (!actorAccount) throw new Error('Set ZENTAO_ACCOUNT or ZENTAO_REVIEWER for real environment owners, reviewers and team members.');
logger.environment({
  envFiles: ENV_FILES,
  baseUrl: config.baseUrl,
  authMode: config.token ? 'token' : 'account-password',
  account: config.account,
  reviewer: actorAccount,
  timeout: config.timeout,
  insecure: config.insecure,
  keepTestData: runtimeOptions.keepTestData,
  token: config.token,
  password: config.password,
});

client = new ZentaoClient({
  baseUrl: config.baseUrl,
  token: config.token,
  timeout: config.timeout,
  insecure: config.insecure,
});

if (!config.token) {
  logger.step('Login with account/password', { account: config.account });
  await client.login(config.account!, config.password!);
  logger.result({ status: 'success' });
} else {
  logger.info('Using token authentication');
}

requestOptions = {
  client,
  timeout: config.timeout,
  insecure: config.insecure,
};
setGlobalOptions({ client, timeout: config.timeout, insecure: config.insecure });
// Probe only known optional modules. Authentication, SQL and other unexpected errors remain failures.
for (const [moduleName, probe] of [
  ['issue', 'issue/list'], ['risk', 'risk/list'], ['meeting', 'meeting/list'],
  ['workflow', 'workflow/list'], ['storygrade', 'story/getGrades'],
] as const) {
  const response = await request(probe, { recPerPage: 1, pageID: 1 }, requestOptions);
  const missing = getMissingRealEnvModule(response.data);
  if (missing === `module/${moduleName === 'workflow' ? 'contract' : moduleName}/control.php`) {
    const reason = `Server module unavailable: ${missing}`;
    unavailable.set(moduleName, reason);
    logger.info(reason);
    const actions = moduleName === 'storygrade' ? ['story/getGrades']
      : getModule(moduleName)!.actions.map(action => `${moduleName}/${action.name}`);
    if (['issue', 'risk', 'meeting'].includes(moduleName)) actions.push(`my/${moduleName}s`);
    for (const action of actions) coverage.exclude(action, reason);
  } else {
    validateRealEnvResponse(response, 'list');
  }
}
for (const action of ['issue/create', 'risk/create', 'risk/update', 'system/create']) {
  if (!unavailable.has(action.split('/')[0])) coverage.exclude(action, 'No delete API is available to clean up this resource.');
}


describe('real ZenTao product API', () => {
  beforeAll(async () => {
    productName = `zentao-api-real-${randomUUID().slice(0, 8)}`;
    const response = await apiRequest('Create temporary product', 'product/create', {
      name: productName,
      type: 'normal',
      acl: 'open',
    });

    expectSuccess(response);
    productID = tryExtractID(response.data) ?? await findCreatedID({
      requestName: 'product/list',
      params: {
        browseType: 'all',
        orderBy: 'id_desc',
        recPerPage: 1000,
        pageID: 1,
      },
      field: 'name',
      value: productName,
    });
    if (!productID) {
      throw new Error(`Could not determine temporary product id: ${JSON.stringify(response.data)}`);
    }
    logger.result({ productID, productName });
  }, 120000);

  afterAll(async () => {
    const cleanupErrors: string[] = [];
    const cleanup = async (requestName: `${string}/${string}`, id: number | undefined) => {
      if (!client || !id) return;
      try {
        const response = await apiRequest(`Cleanup ${requestName}`, requestName, { id });
        if (response.status !== 'success') {
          cleanupErrors.push(`${requestName} #${id}: ${response.message ?? 'status fail'}`);
        }
      } catch (error) {
        if (['epic/delete', 'requirement/delete'].includes(requestName) && (error as Error).message.includes('Missing required parameter: storyID')) {
          try {
            await apiRequest('Cleanup through shared story endpoint', 'story/delete', { id });
            return;
          } catch (fallbackError) {
            cleanupErrors.push(`story/delete #${id}: ${(fallbackError as Error).message}`);
          }
        }
        cleanupErrors.push(`${requestName} #${id}: ${(error as Error).message ?? String(error)}`);
      }
    };
    const cleanupIDs = async (requestName: `${string}/${string}`, ids: number[]) => {
      for (const id of [...ids].reverse()) {
        await cleanup(requestName, id);
      }
      ids.length = 0;
    };

    try {
      if (runtimeOptions.keepTestData) {
        logger.info('Keeping real environment test data because --keep-test-data is set', summarizeCreatedData());
        return;
      }

      logger.info('Cleaning up real environment test data', summarizeCreatedData());
      for (const item of [...extraCreated].reverse()) await cleanup(item.requestName, item.id);
      await cleanupIDs('file/delete', created.fileIDs);
      await cleanupIDs('task/delete', created.taskIDs);
      await cleanupIDs('bug/delete', created.bugIDs);
      await cleanup('execution/delete', created.executionID);
      await cleanup('project/delete', created.projectID);
      await cleanupIDs('story/delete', created.storyIDs);
      await cleanup('productplan/delete', created.planID);
      await cleanup('product/delete', productID);
      await cleanup('program/delete', created.programID);
    } finally {
      const report = { ...coverage.report(), keepTestData: runtimeOptions.keepTestData, cleanupErrors,
        retained: runtimeOptions.keepTestData ? { ...summarizeCreatedData(), extraCreated } : undefined };
      mkdirSync('coverage', { recursive: true });
      writeFileSync('coverage/real-env.json', `${JSON.stringify(report, null, 2)}\n`);
      logger.info('API coverage', { exercised: report.exercised, successful: report.successful.length, total: report.total,
        failed: report.failed.length, excluded: Object.keys(report.excluded).length,
        untested: report.untested.length, routes: report.routes.length, report: 'coverage/real-env.json' });
      setGlobalOptions({
        client: undefined,
        recPerPage: undefined,
        limit: undefined,
        timeout: undefined,
        insecure: undefined,
      });
    }

    if (cleanupErrors.length > 0) {
      throw new Error(`Real environment cleanup failed:\n${cleanupErrors.join('\n')}`);
    }
  }, 120000);

  test('runs a write-heavy product lifecycle against the real API', async () => {
    const productID = requireProductID();
    const startDate = dateAfter(0);
    const planEndDate = dateAfter(30);
    const projectEndDate = dateAfter(45);
    const executionEndDate = dateAfter(14);

    const productDetailResponse = await apiRequest('Fetch temporary product detail', 'product/get', { id: productID });
    expectSuccess(productDetailResponse);
    expect(recordMatchesID(productDetailResponse.data, productID)).toBe(true);

    const productListResponse = await apiRequest('Fetch product list', 'product/list', {
      browseType: 'all',
      orderBy: 'id_desc',
      recPerPage: 1000,
      pageID: 1,
    });
    expectSuccess(productListResponse);
    expectListContainsID(productListResponse.data, productID);

    const updatedName = `${productName}-updated`;
    const updateResponse = await apiRequest('Update temporary product name', 'product/update', {
      id: productID,
      name: updatedName,
      type: 'normal',
      acl: 'open',
    });

    expectSuccess(updateResponse);

    const getResponse = await apiRequest('Verify updated product detail', 'product/get', { id: requireProductID() });
    expectSuccess(getResponse);
    expect(isRecord(getResponse.data) ? getResponse.data.name : undefined).toBe(updatedName);

    for (let index = 0; index < 3; index += 1) {
      const storyTitle = `${productName} story ${index + 1}`;
      const storyID = await createEntity(`Create story ${index + 1}`, 'story/create', maybeAssigned({
        productID,
        title: storyTitle,
        pri: index + 1,
        estimate: index + 1,
        category: 'feature',
        source: 'po',
        spec: `Real environment story ${index + 1}`,
        verify: `Verify story ${index + 1}`,
        ...maybeReviewer(),
      }), created.storyIDs, {
        requestName: 'story/list',
        params: {
          productID,
          browseType: 'allstory',
          orderBy: 'id_desc',
          recPerPage: 1000,
          pageID: 1,
        },
        field: 'title',
        value: storyTitle,
      });
      expect(storyID).toBeGreaterThan(0);
    }

    const storyListResponse = await apiRequest('Fetch product story list', 'story/list', {
      productID,
      browseType: 'allstory',
      orderBy: 'id_desc',
      recPerPage: 1000,
      pageID: 1,
    });
    expectSuccess(storyListResponse);
    for (const storyID of created.storyIDs) {
      expectListContainsID(storyListResponse.data, storyID);
    }

    const firstStoryResponse = await apiRequest('Fetch first story detail', 'story/get', { id: created.storyIDs[0] });
    expectSuccess(firstStoryResponse);
    expect(recordMatchesID(firstStoryResponse.data, created.storyIDs[0])).toBe(true);

    const uploadDir = mkdtempSync(join(tmpdir(), 'zentao-api-real-upload-'));
    const uploadPath = join(uploadDir, 'real-upload.txt');
    const uploadContent = `zentao-api real upload ${randomUUID()}`;
    writeFileSync(uploadPath, uploadContent);
    try {
      const uploadResponse = await apiRequest('Upload file to first story', 'file/create', {
        file: uploadPath,
        objectType: 'story',
        objectID: created.storyIDs[0],
      });
      expectSuccess(uploadResponse);
      const fileID = tryExtractID(uploadResponse.data);
      if (!fileID) {
        throw new Error(`Could not determine uploaded file id: ${JSON.stringify(uploadResponse.data)}`);
      }
      created.fileIDs.push(fileID);
      await call('file/update', { id: fileID, fileName: 'renamed-real-upload.txt' });

      const uploadedStoryResponse = await apiRequest('Verify uploaded story file', 'story/get', {
        id: created.storyIDs[0],
      });
      expectSuccess(uploadedStoryResponse);
      const story = unwrapRecord(uploadedStoryResponse.data);
      const files = isRecord(story.files) ? Object.values(story.files) : [];
      expect(files.some((file) => recordMatchesID(file, fileID))).toBe(true);
      expect(files.some(file => isRecord(file) && String(file.title).includes('renamed-real-upload'))).toBe(true);
    } finally {
      rmSync(uploadDir, { recursive: true, force: true });
    }

    const planTitle = `${productName} plan`;
    created.planID = await createEntity('Create product plan', 'productplan/create', {
      productID,
      title: planTitle,
      begin: startDate,
      end: planEndDate,
      desc: 'Real environment API test plan',
    }, undefined, {
      requestName: 'productplan/list',
      params: {
        productID,
        browseType: 'all',
        orderBy: 'id_desc',
        recPerPage: 1000,
        pageID: 1,
      },
      field: 'title',
      value: planTitle,
    });

    const planUpdateResponse = await apiRequest('Update product plan', 'productplan/update', {
      id: requirePlanID(),
      title: `${planTitle} updated`,
      begin: startDate,
      end: planEndDate,
      desc: 'Updated by real environment API test',
    });
    expectSuccess(planUpdateResponse);

    const planListResponse = await apiRequest('Fetch product plan list', 'productplan/list', {
      productID,
      browseType: 'all',
      orderBy: 'id_desc',
      recPerPage: 1000,
      pageID: 1,
    });
    expectSuccess(planListResponse);
    expectListContainsID(planListResponse.data, requirePlanID());

    const planDetailResponse = await apiRequest('Fetch product plan detail', 'productplan/get', { id: requirePlanID() });
    expectSuccess(planDetailResponse);
    expect(recordMatchesID(planDetailResponse.data, requirePlanID())).toBe(true);

    for (const [index, storyID] of created.storyIDs.entries()) {
      const storyPlanResponse = await apiRequest(`Link story ${index + 1} to plan`, 'story/update', {
        id: storyID,
        data: {
          title: `${productName} story ${index + 1}`,
          pri: index + 1,
          estimate: index + 1,
          category: 'feature',
          source: 'po',
          plan: requirePlanID(),
        },
      });
      expectSuccess(storyPlanResponse);
    }

    const plannedStoryResponse = await apiRequest('Verify first story plan link', 'story/get', { id: created.storyIDs[0] });
    expectSuccess(plannedStoryResponse);
    expect(fieldIncludesID(unwrapRecord(plannedStoryResponse.data).plan, requirePlanID())).toBe(true);

    const availableProjectsResponse = await apiRequest('Fetch project workflow groups', 'project/list', {
      browseType: 'all',
      orderBy: 'id_desc',
      recPerPage: 1000,
      pageID: 1,
    });
    expectSuccess(availableProjectsResponse);
    expect(Array.isArray(availableProjectsResponse.data)).toBe(true);
    const workflowGroup = resolveRealEnvWorkflowGroup(
      availableProjectsResponse.data as Record<string, unknown>[],
      readEnv('ZENTAO_WORKFLOW_GROUP'),
    );
    logger.info('Using project workflow group', { workflowGroup });

    const projectName = `${productName} project`;
    created.projectID = await createEntity('Create temporary project', 'project/create', {
      name: projectName,
      model: 'scrum',
      begin: startDate,
      end: projectEndDate,
      products: [productID],
      workflowGroup,
      PM: actorAccount,
    }, undefined, {
      requestName: 'project/list',
      params: {
        browseType: 'all',
        orderBy: 'id_desc',
        recPerPage: 1000,
        pageID: 1,
      },
      field: 'name',
      value: projectName,
    });

    const projectUpdateResponse = await apiRequest('Update temporary project', 'project/update', {
      id: requireProjectID(),
      name: `${projectName} updated`,
      model: 'scrum',
      begin: startDate,
      end: projectEndDate,
      products: [productID],
      workflowGroup,
      PM: actorAccount,
    });
    expectSuccess(projectUpdateResponse);

    const projectListResponse = await apiRequest('Fetch project list', 'project/list', {
      browseType: 'all',
      orderBy: 'id_desc',
      recPerPage: 1000,
      pageID: 1,
    });
    expectSuccess(projectListResponse);
    expectListContainsID(projectListResponse.data, requireProjectID());

    const executionName = `${productName} execution`;
    created.executionID = await createEntity('Create execution with product plan', 'execution/create', {
      data: {
        project: requireProjectID(),
        name: executionName,
        lifetime: 'short',
        begin: startDate,
        end: executionEndDate,
        days: 10,
        products: [productID],
        plans: { [String(productID)]: [requirePlanID()] },
        PO: actorAccount,
        QD: actorAccount,
        PM: actorAccount,
        RD: actorAccount,
        acl: 'open',
      },
    }, undefined, {
      requestName: 'execution/list',
      params: {
        status: 'all',
        orderBy: 'rawID_desc',
        recPerPage: 1000,
        pageID: 1,
      },
      field: 'name',
      value: executionName,
    });

    const executionDetailResponse = await apiRequest('Fetch execution detail', 'execution/get', { id: requireExecutionID() });
    expectSuccess(executionDetailResponse);
    expect(recordMatchesID(executionDetailResponse.data, requireExecutionID())).toBe(true);

    const executionListResponse = await apiRequest('Fetch execution list', 'execution/list', {
      status: 'all',
      orderBy: 'rawID_desc',
      recPerPage: 1000,
      pageID: 1,
    });
    expectSuccess(executionListResponse);
    expectListContainsID(executionListResponse.data, requireExecutionID());

    const executionUpdateResponse = await apiRequest('Update execution', 'execution/update', {
      id: requireExecutionID(),
      data: {
        name: `${productName} execution updated`,
        begin: startDate,
        end: executionEndDate,
        products: [productID],
        plans: { [String(productID)]: [requirePlanID()] },
        acl: 'open',
      },
    });
    expectSuccess(executionUpdateResponse);

    for (let index = 0; index < 3; index += 1) {
      const taskName = `${productName} task ${index + 1}`;
      const taskID = await createEntity(`Create task ${index + 1} from story`, 'task/create', maybeAssigned({
        executionID: requireExecutionID(),
        name: taskName,
        type: 'devel',
        pri: index + 2,
        estimate: index + 1,
        story: created.storyIDs[index],
        desc: `Real environment task ${index + 1}`,
      }), created.taskIDs, {
        requestName: 'task/list',
        params: {
          executionID: requireExecutionID(),
          status: 'all',
          orderBy: 'id_desc',
          recPerPage: 1000,
          pageID: 1,
        },
        field: 'name',
        value: taskName,
      });
      expect(taskID).toBeGreaterThan(0);
    }

    const taskListResponse = await apiRequest('Fetch execution task list', 'task/list', {
      executionID: requireExecutionID(),
      status: 'all',
      orderBy: 'id_desc',
      recPerPage: 1000,
      pageID: 1,
    });
    expectSuccess(taskListResponse);
    for (const taskID of created.taskIDs) {
      expectListContainsID(taskListResponse.data, taskID);
    }

    const firstTaskID = created.taskIDs[0];
    const firstTaskUpdateResponse = await apiRequest('Update first task priority', 'task/update', {
      id: firstTaskID,
      name: `${productName} task 1`,
      type: 'devel',
      pri: 1,
      estimate: 1,
      story: created.storyIDs[0],
      desc: 'Updated priority in real environment API test',
    });
    expectSuccess(firstTaskUpdateResponse);

    const firstTaskResponse = await apiRequest('Fetch first task detail', 'task/get', { id: firstTaskID });
    expectSuccess(firstTaskResponse);
    const firstTask = unwrapRecord(firstTaskResponse.data, 'task');
    expect(recordMatchesID(firstTask, firstTaskID)).toBe(true);
    expect(String(firstTask.pri)).toBe('1');
    expect(fieldIncludesID(firstTask.story, created.storyIDs[0])).toBe(true);

    const thirdTaskID = created.taskIDs[2];
    const taskStartResponse = await apiRequest('Start third task', 'task/start', {
      id: thirdTaskID,
      realStarted: startDate,
      consumed: 0,
      left: 1,
      comment: 'Started by real environment API test',
    });
    expectSuccess(taskStartResponse);

    const taskFinishResponse = await apiRequest('Finish third task', 'task/finish', {
      id: thirdTaskID,
      currentConsumed: 1,
      consumed: 1,
      realStarted: startDate,
      finishedDate: dateAfter(1),
      comment: 'Finished by real environment API test',
    });
    expectSuccess(taskFinishResponse);

    const secondTaskID = created.taskIDs[1];
    await expectDeleteSuccess('task/delete', secondTaskID);
    removeCreatedID(created.taskIDs, secondTaskID);

    const taskListAfterDeleteResponse = await apiRequest('Fetch task list after deleting second task', 'task/list', {
      executionID: requireExecutionID(),
      status: 'all',
      orderBy: 'id_desc',
      recPerPage: 1000,
      pageID: 1,
    });
    expectSuccess(taskListAfterDeleteResponse);
    expectListExcludesID(taskListAfterDeleteResponse.data, secondTaskID);

    const executionStoryListResponse = await apiRequest('Fetch execution story list', 'story/list', {
      executionID: requireExecutionID(),
      browseType: 'allstory',
      orderBy: 'id_desc',
      recPerPage: 1000,
      pageID: 1,
    });
    expectSuccess(executionStoryListResponse);
    expect(Array.isArray(executionStoryListResponse.data)).toBe(true);

    for (let index = 0; index < 3; index += 1) {
      const bugTitle = `${productName} bug ${index + 1}`;
      const bugID = await createEntity(`Create bug ${index + 1}`, 'bug/create', {
        productID,
        title: bugTitle,
        openedBuild: ['trunk'],
        project: requireProjectID(),
        execution: requireExecutionID(),
        severity: index + 1,
        pri: index + 1,
        type: 'codeerror',
        steps: `[Steps] reproduce bug ${index + 1}\n[Result] real environment check\n[Expect] API succeeds`,
        story: created.storyIDs[index],
      }, created.bugIDs, {
        requestName: 'bug/list',
        params: {
          productID,
          browseType: 'all',
          orderBy: 'id_desc',
          recPerPage: 1000,
          pageID: 1,
        },
        field: 'title',
        value: bugTitle,
      });
      expect(bugID).toBeGreaterThan(0);
    }

    const bugListResponse = await apiRequest('Fetch product bug list', 'bug/list', {
      productID,
      browseType: 'all',
      orderBy: 'id_desc',
      recPerPage: 1000,
      pageID: 1,
    });
    expectSuccess(bugListResponse);
    for (const bugID of created.bugIDs) {
      expectListContainsID(bugListResponse.data, bugID);
    }

    const firstBugID = created.bugIDs[0];
    const updatedBugSteps = '[Steps] updated by real environment test\n[Result] updated description\n[Expect] update succeeds';
    const bugUpdateResponse = await apiRequest('Update first bug description', 'bug/update', {
      id: firstBugID,
      title: `${productName} bug 1`,
      severity: 1,
      pri: 1,
      type: 'codeerror',
      openedBuild: ['trunk'],
      steps: updatedBugSteps,
      project: requireProjectID(),
      execution: requireExecutionID(),
      story: created.storyIDs[0],
    });
    expectSuccess(bugUpdateResponse);

    const firstBugResponse = await apiRequest('Fetch first bug detail', 'bug/get', { id: firstBugID });
    expectSuccess(firstBugResponse);
    const firstBug = unwrapRecord(firstBugResponse.data, 'bug');
    expect(recordMatchesID(firstBug, firstBugID)).toBe(true);
    expect(String(firstBug.steps)).toContain('updated description');

    const bugResolveResponse = await apiRequest('Resolve first bug', 'bug/resolve', {
      id: firstBugID,
      resolution: 'fixed',
      resolvedBuild: 'trunk',
      resolvedDate: startDate,
      comment: 'Resolved by real environment API test',
    });
    expectSuccess(bugResolveResponse);

    const resolvedBugResponse = await apiRequest('Verify resolved bug detail', 'bug/get', { id: firstBugID });
    expectSuccess(resolvedBugResponse);
    const resolvedBug = unwrapRecord(resolvedBugResponse.data, 'bug');
    expect(String(resolvedBug.resolution)).toBe('fixed');
  }, 120000);

  test('creates, updates and reads a temporary program with its product and project', async () => {
    const body = { name: `${productName} program`, begin: dateAfter(0), end: dateAfter(60), PM: actorAccount };
    created.programID = await createEntity('Create program', 'program/create', body, undefined, {
      requestName: 'program/list', params: { ...listParams, browseType: 'all' }, field: 'name', value: body.name,
    });
    const id = created.programID;
    expect((await getRecord('program/get', id)).name).toBe(body.name);
    await call('program/update', { id, ...body, name: `${body.name} updated` });
    expect((await getRecord('program/get', id)).name).toBe(`${body.name} updated`);
    expectListContainsID(await getList('program/list', { browseType: 'all' }), id);

    await call('product/update', { id: requireProductID(), name: `${productName}-updated`, type: 'normal', acl: 'open', program: id });
    const projects = await getList('project/list', { browseType: 'all' });
    const project = projects.find(item => recordMatchesID(item, requireProjectID()))!;
    await call('project/update', { id: requireProjectID(), name: project.name, model: 'scrum',
      begin: dateAfter(0), end: dateAfter(45), products: [requireProductID()], workflowGroup: project.workflowGroup, parent: id, PM: actorAccount });
    expectListContainsID(await getList('product/programProducts', { programID: id }), requireProductID());
    expectListContainsID(await getList('project/programProjects', { programID: id, browseType: 'all' }), requireProjectID());
  }, 60000);

  test('creates a temporary user and maintains only the temporary project and execution teams', async () => {
    const account = `apitest_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
    const id = await createTracked('user/create', { account, realname: 'API temporary user', password: `Aa9!${randomUUID()}` }, 'user/delete', {
      requestName: 'user/list', params: listParams, field: 'account', value: account,
    });
    expect((await getRecord('user/get', id)).account).toBe(account);
    await call('user/update', { id, realname: 'API updated temporary user' });
    expect((await getRecord('user/get', id)).realname).toBe('API updated temporary user');
    expectListContainsID(await getList('user/list'), id);
    for (const moduleName of ['project', 'execution'] as const) {
      const parentID = moduleName === 'project' ? requireProjectID() : requireExecutionID();
      await call(`${moduleName}/members`, { id: parentID, account: [actorAccount, account],
        role: ['PM', 'dev'], days: [10, 10], hours: [7, 7], limited: ['no', 'no'] });
      for (const action of ['team', `${moduleName}Members`]) {
        const members = await getList(`${moduleName}/${action}`, { [`${moduleName}ID`]: parentID });
        expect(members.some(member => member.account === account)).toBe(true);
      }
    }
    await deleteTracked('user/delete', id);
    if (!runtimeOptions.keepTestData) expectListExcludesID(await getList('user/list'), id);
  }, 60000);

  for (const moduleName of ['story', 'bug', 'testcase', 'task'] as const) {
    test(`${moduleName} module directory CRUD`, async () => {
      const parent = moduleName === 'task' ? { executionID: requireExecutionID() } : { productID: requireProductID() };
      const creator = moduleName === 'task' ? 'execution/createTaskModule' : `product/create${moduleName[0].toUpperCase()}${moduleName.slice(1)}Module` as const;
      const name = `${productName} ${moduleName} module`;
      const id = await createTracked(creator, { ...parent, name, parentID: 0 }, `${moduleName}/deleteModule`, {
        requestName: `${moduleName}/modules`, params: parent, field: 'name', value: name,
      });
      expectListContainsID(await getList(`${moduleName}/modules`, parent), id);
      await call(`${moduleName}/updateModule`, { id, name: `${name} updated`, parent: 0 });
      const modules = await getList(`${moduleName}/modules`, parent);
      expect(modules.find(item => recordMatchesID(item, id))?.name).toBe(`${name} updated`);
      await deleteTracked(`${moduleName}/deleteModule`, id);
      if (!runtimeOptions.keepTestData) expectListExcludesID(await getList(`${moduleName}/modules`, parent), id);
    }, 60000);
  }

  for (const moduleName of ['story', 'epic', 'requirement'] as const) {
    test(`${moduleName} CRUD`, async () => {
      const title = `${productName} ${moduleName} lifecycle`;
      const id = await createRequirement(moduleName, title);
      expect((await getRecord(`${moduleName}/get`, id)).title).toBe(title);
      await call(`${moduleName}/update`, { id, title: `${title} updated`, pri: 2, category: 'feature', estimate: 1 });
      expect((await getRecord(`${moduleName}/get`, id)).title).toBe(`${title} updated`);
      expectListContainsID(await getList(`${moduleName}/list`, { productID: requireProductID(), browseType: 'allstory' }), id);
      await deleteTracked(`${moduleName}/delete`, id);
      if (!runtimeOptions.keepTestData) expectListExcludesID(await getList(`${moduleName}/list`, { productID: requireProductID(), browseType: 'allstory' }), id);
    }, 60000);
    for (const transition of ['close', 'activate', 'change'] as const) {
      test(`${moduleName}/${transition} transition`, async () => {
        const title = `${productName} ${moduleName} ${transition}`;
        const id = await createRequirement(moduleName, title);
        // All three requirement types share the story model; prepare state independently of the route under test.
        if (transition !== 'close') await call('story/close', { id, closedReason: 'postponed' });
        if (transition === 'change') await call('story/activate', { id, assignedTo: actorAccount });
        await call(`${moduleName}/${transition}`, { id, title: `${title} changed`, closedReason: 'postponed',
          assignedTo: actorAccount, comment: 'Temporary lifecycle test', spec: 'Changed lifecycle specification', verify: 'Changed acceptance', ...maybeReviewer() });
        const detail = await getRecord(`${moduleName}/get`, id);
        if (transition === 'close') expect(detail.status).toBe('closed');
        if (transition === 'activate') expect(['draft', 'active']).toContain(String(detail.status));
        if (transition === 'change') expect(detail.title).toBe(`${title} changed`);
      }, 60000);
    }
  }

  test('testcase CRUD with steps and product/project/execution scopes', async () => {
    const body = { productID: requireProductID(), title: `${productName} testcase`, type: 'feature', pri: 3,
      precondition: 'A temporary product exists', steps: ['Open temporary product', 'Read its name'], expects: ['Product exists', 'Name matches'],
      stepType: ['step', 'step'], project: requireProjectID(), execution: requireExecutionID() };
    const id = await createTracked('testcase/create', body, 'testcase/delete');
    expect((await getRecord('testcase/get', id)).title).toBe(body.title);
    await call('testcase/update', { id, ...body, title: `${body.title} updated`, pri: 1 });
    const detail = await getRecord('testcase/get', id);
    expect(detail.title).toBe(`${body.title} updated`);
    expect(Number(detail.pri)).toBe(1);
    expect(Array.isArray(detail.steps) && detail.steps.length === 2).toBe(true);
    expectListContainsID(await getList('testcase/list', { productID: requireProductID() }), id);
    await getList('testcase/list', { projectID: requireProjectID() });
    await getList('testcase/list', { executionID: requireExecutionID() });
    await deleteTracked('testcase/delete', id);
    if (!runtimeOptions.keepTestData) expectListExcludesID(await getList('testcase/list', { productID: requireProductID() }), id);
  }, 60000);

  test('build, testtask and release CRUD with scoped lists', async () => {
    const systems = await getList('system/list', { productID: requireProductID() });
    const systemID = tryExtractID(systems[0]);
    if (!systemID) throw new Error('The temporary product has no default application for build/release tests.');
    await call('system/update', { id: systemID, name: `${productName} application`, children: [], desc: 'Temporary product application' });
    expect((await getList('system/list', { productID: requireProductID() })).find(item => recordMatchesID(item, systemID))?.name).toBe(`${productName} application`);
    const buildBody = { executionID: requireExecutionID(), product: requireProductID(), system: systemID,
      name: `${productName} build`, builder: actorAccount, date: dateAfter(0), desc: 'Temporary build' };
    const buildID = await createTracked('build/create', buildBody, 'build/delete', {
      requestName: 'build/list', params: { ...listParams, executionID: requireExecutionID() }, field: 'name', value: buildBody.name,
    });
    await call('build/update', { id: buildID, ...buildBody, execution: requireExecutionID(), name: `${buildBody.name} updated` });
    for (const params of [{ projectID: requireProjectID() }, { executionID: requireExecutionID() }]) {
      const builds = await getList('build/list', params);
      expect(builds.find(item => recordMatchesID(item, buildID))?.name).toBe(`${buildBody.name} updated`);
    }
    const testBody = { productID: requireProductID(), name: `${productName} testtask`, build: buildID,
      execution: requireExecutionID(), type: ['integrate'], owner: actorAccount, status: 'wait', begin: dateAfter(0), end: dateAfter(7) };
    const testID = await createTracked('testtask/create', testBody, 'testtask/delete');
    await call('testtask/update', { id: testID, ...testBody, name: `${testBody.name} updated`, status: 'doing' });
    for (const params of [{ productID: requireProductID() }, { projectID: requireProjectID() }, { executionID: requireExecutionID() }]) {
      const tests = await getList('testtask/list', params);
      expect(tests.find(item => recordMatchesID(item, testID))?.name).toBe(`${testBody.name} updated`);
    }
    const releaseBody = { productID: requireProductID(), system: systemID, name: `${productName} release`, build: [buildID], status: 'wait', date: dateAfter(7) };
    const releaseID = await createTracked('release/create', releaseBody, 'release/delete');
    await call('release/update', { id: releaseID, ...releaseBody, name: `${releaseBody.name} updated` });
    expect((await getList('release/list', { productID: requireProductID() })).find(item => recordMatchesID(item, releaseID))?.name).toBe(`${releaseBody.name} updated`);
    await deleteTracked('release/delete', releaseID);
    await deleteTracked('testtask/delete', testID);
    await deleteTracked('build/delete', buildID);
    if (!runtimeOptions.keepTestData) {
      expectListExcludesID(await getList('release/list', { productID: requireProductID() }), releaseID);
      expectListExcludesID(await getList('testtask/list', { productID: requireProductID() }), testID);
      expectListExcludesID(await getList('build/list', { executionID: requireExecutionID() }), buildID);
    }
  }, 60000);

  for (const target of ['story', 'bug', 'task'] as const) {
    test(`creates ${target} through the project route`, async () => {
      const title = `${productName} project ${target}`;
      const id = await createTracked(`project/create${target[0].toUpperCase()}${target.slice(1)}`, {
        projectID: requireProjectID(), productID: requireProductID(), executionID: requireExecutionID(),
        title, name: title, spec: 'Project scoped requirement', ...maybeReviewer(),
        openedBuild: ['trunk'], type: target === 'bug' ? 'codeerror' : 'devel', severity: 3, pri: 3,
        steps: 'Project scoped bug', estimate: 1, assignedTo: actorAccount,
      }, `${target}/delete`);
      const detail = await getRecord(`${target}/get`, id);
      expect(detail.title ?? detail.name).toBe(title);
      if (target !== 'task') expectListContainsID(await getList(`${target}/list`, {
        projectID: requireProjectID(), browseType: target === 'story' ? 'allstory' : 'all',
      }), id);
    }, 60000);
  }

  test('bug confirm/resolve/close/activate and task start/finish/close/activate', async () => {
    const bugID = await createTracked('bug/create', { productID: requireProductID(), project: requireProjectID(), execution: requireExecutionID(),
      title: `${productName} transition bug`, openedBuild: ['trunk'], type: 'codeerror', severity: 3, pri: 3, steps: 'Temporary bug' }, 'bug/delete');
    expectListContainsID(await getList('bug/list', { projectID: requireProjectID() }), bugID);
    await getList('bug/list', { executionID: requireExecutionID() });
    await call('bug/confirm', { id: bugID, assignedTo: actorAccount, type: 'codeerror', pri: 2, comment: 'Confirm temporary bug' });
    const confirmedBug = await getRecord('bug/get', bugID);
    expect(Number(confirmedBug.confirmed)).toBe(1);
    expect(confirmedBug.status).toBe('active');
    await call('bug/resolve', { id: bugID, resolution: 'fixed', resolvedBuild: 'trunk', resolvedDate: dateAfter(0) });
    await call('bug/close', { id: bugID, comment: 'Close temporary bug' });
    expect((await getRecord('bug/get', bugID)).status).toBe('closed');
    await call('bug/activate', { id: bugID, openedBuild: ['trunk'], assignedTo: actorAccount, comment: 'Reactivate temporary bug' });
    expect((await getRecord('bug/get', bugID)).status).toBe('active');
    const taskID = await createTracked('task/create', { executionID: requireExecutionID(), name: `${productName} transition task`,
      type: 'devel', assignedTo: actorAccount, estimate: 1 }, 'task/delete');
    expect((await getRecord('task/get', taskID)).name).toBe(`${productName} transition task`);
    await call('task/start', { id: taskID, realStarted: dateAfter(0), consumed: 0, left: 1 });
    expect((await getRecord('task/get', taskID)).status).toBe('doing');
    await call('task/finish', { id: taskID, currentConsumed: 1, consumed: 1, realStarted: dateAfter(0), finishedDate: dateAfter(1) });
    await call('task/close', { id: taskID, comment: 'Close temporary task' });
    expect((await getRecord('task/get', taskID)).status).toBe('closed');
    await call('task/activate', { id: taskID, left: 1, assignedTo: actorAccount });
    expect((await getRecord('task/get', taskID)).status).toBe('doing');
  }, 60000);

  for (const moduleName of ['feedback', 'ticket'] as const) {
    test(`${moduleName} CRUD and close/activate transitions`, async () => {
      const body = { product: requireProductID(), title: `${productName} ${moduleName}`, module: await getSupportModuleID(),
        type: moduleName === 'feedback' ? 'story' : 'code', desc: 'Temporary customer request', assignedTo: actorAccount, openedBuild: ['trunk'] };
      const id = await createTracked(`${moduleName}/create`, body, `${moduleName}/delete`);
      expect((await getRecord(`${moduleName}/get`, id)).title).toBe(body.title);
      await call(`${moduleName}/update`, { id, ...body, title: `${body.title} updated` });
      expect((await getRecord(`${moduleName}/get`, id)).title).toBe(`${body.title} updated`);
      expectListContainsID(await getList(`${moduleName}/list`, { productID: requireProductID() }), id);
      await call(`${moduleName}/close`, { id, closedReason: 'refuse', comment: 'Close temporary request' });
      expect((await getRecord(`${moduleName}/get`, id)).status).toBe('closed');
      await call(`${moduleName}/activate`, { id, assignedTo: actorAccount, comment: 'Reactivate temporary request' });
      expect((await getRecord(`${moduleName}/get`, id)).status).not.toBe('closed');
      await deleteTracked(`${moduleName}/delete`, id);
      if (!runtimeOptions.keepTestData) expectListExcludesID(await getList(`${moduleName}/list`, { productID: requireProductID() }), id);
    }, 60000);

    for (const target of (moduleName === 'feedback' ? ['story', 'bug', 'task', 'todo', 'ticket'] : ['story', 'bug']) as ('story' | 'bug' | 'task' | 'todo' | 'ticket')[]) {
      test(`converts ${moduleName} to ${target}`, async () => {
        const title = `${productName} ${moduleName} to ${target}`;
        const sourceID = await createTracked(`${moduleName}/create`, { product: requireProductID(), title, module: await getSupportModuleID(),
          type: moduleName === 'feedback' ? 'story' : 'code', desc: 'Temporary conversion input', openedBuild: ['trunk'] }, `${moduleName}/delete`);
        const action = `${moduleName}/create${target[0].toUpperCase()}${target.slice(1)}` as const;
        const id = await createTracked(action, { id: sourceID, productID: requireProductID(), product: requireProductID(),
          title, name: title, spec: 'Converted requirement', category: 'feature', openedBuild: ['trunk'], type: target === 'bug' ? 'codeerror' : target === 'task' ? 'devel' : 'code',
          steps: 'Converted bug', severity: 3, pri: 3, module: await getSupportModuleID(), executionID: requireExecutionID(), assignedTo: actorAccount,
          estStarted: dateAfter(0), deadline: dateAfter(7), date: dateAfter(0) }, `${target}/delete`);
        if (target === 'todo') expectListContainsID(await getList('my/todos', { browseType: 'all' }), id);
        else {
          const detail = await getRecord(`${target}/get`, id);
          expect(detail.title ?? detail.name).toBe(title);
        }
      }, 60000);
    }
  }

  test('todo CRUD through the personal work list', async () => {
    const body = { date: dateAfter(0), type: 'custom', name: `${productName} todo`, begin: '0900', end: '0930', assignedTo: actorAccount, desc: 'Temporary todo' };
    const id = await createTracked('todo/create', body, 'todo/delete', {
      requestName: 'my/todos', params: { ...listParams, browseType: 'all' }, field: 'name', value: body.name,
    });
    await call('todo/update', { id, ...body, name: `${body.name} updated` });
    expect((await getList('my/todos', { browseType: 'all' })).find(item => recordMatchesID(item, id))?.name).toBe(`${body.name} updated`);
    await deleteTracked('todo/delete', id);
    if (!runtimeOptions.keepTestData) expectListExcludesID(await getList('my/todos', { browseType: 'all' }), id);
  }, 60000);

  test('feedback close with confirmClose', async () => {
    const id = await createTracked('feedback/create', { product: requireProductID(), title: `${productName} force-close`, type: 'story' }, 'feedback/delete');
    await call('feedback/close', { id, closedReason: 'refuse', confirmClose: 'yes' });
    expect((await getRecord('feedback/get', id)).status).toBe('closed');
  }, 60000);

  for (const scope of ['my', 'team', 'product', 'project'] as const) {
    test(`${scope} document spaces, libraries, modules and document CRUD`, async () => {
      const suffix = `${scope[0].toUpperCase()}${scope.slice(1)}`;
      const name = `${productName} ${scope} documents`;
      let parent: Record<string, unknown>;
      if (scope === 'my' || scope === 'team') {
        const spaceID = await createTracked(`doc/create${suffix}Space`, { name }, 'doc/deleteSpace');
        expect((await getRecord('doc/getSpace', spaceID)).name).toBe(name);
        await call('doc/updateSpace', { id: spaceID, name: `${name} updated` });
        expect((await getRecord('doc/getSpace', spaceID)).name).toBe(`${name} updated`);
        expectListContainsID(await getList(`doc/${scope}Spaces`), spaceID);
        parent = { spaceID };
      } else {
        const id = scope === 'product' ? requireProductID() : requireProjectID();
        expectListContainsID(await getList(`doc/${scope}Spaces`), id);
        parent = { [`${scope}ID`]: id };
      }
      const libID = await createTracked(`doc/create${suffix}Lib`, { ...parent, name, acl: scope === 'team' ? 'open' : 'default' }, 'doc/deleteLib');
      expect((await getRecord('doc/getLib', libID)).name).toBe(name);
      await call('doc/updateLib', { id: libID, name: `${name} library updated`, acl: scope === 'team' ? 'open' : 'default' });
      expect((await getRecord('doc/getLib', libID)).name).toBe(`${name} library updated`);
      expectListContainsID(await getList(`doc/${scope}Libs`, parent), libID);
      const moduleID = await createTracked(`doc/create${suffix}Module`, { ...parent, libID, name: `${name} module`, parentID: 0 }, 'doc/deleteModule');
      await call('doc/updateModule', { id: moduleID, name: `${name} module updated` });
      expectListContainsID(await getList(`doc/${scope}Modules`, { ...parent, libID }), moduleID);
      const docID = await createTracked(`doc/create${suffix}Doc`, { ...parent, libID, moduleID, title: name,
        content: '# Temporary document\n\nCreated by real environment API test.', contentType: 'doc' }, 'doc/delete');
      expect((await getRecord('doc/get', docID)).title).toBe(name);
      await call('doc/update', { id: docID, moduleID, title: `${name} updated`, content: '# Updated document\n\nUpdated API content.', contentType: 'doc' });
      const document = await getRecord('doc/get', docID);
      expect(document.title).toBe(`${name} updated`);
      expect(String(document.content)).toContain('Updated API content');
      expectListContainsID(await getList(`doc/${scope}Docs`, { ...parent, libID }), docID);
      await deleteTracked('doc/delete', docID);
      if (!runtimeOptions.keepTestData) expectListExcludesID(await getList(`doc/${scope}Docs`, { ...parent, libID }), docID);
    }, 60000);
  }

  for (const action of getModule('my')!.actions) {
    const dependency = ({ meetings: 'meeting', issues: 'issue', risks: 'risk' } as Record<string, string>)[action.name];
    test.skipIf(unavailable.has(dependency))(`personal list my/${action.name}`, async () => {
      const response = await call(`my/${action.name}`, { recPerPage: 2, pageID: 1 });
      expect(Array.isArray(response.data)).toBe(true);
      if (response.pager) {
        expect(response.pager.page).toBe(1);
        expect(response.pager.recPerPage).toBe(2);
        expect(response.pager.total).toBeGreaterThanOrEqual((response.data as unknown[]).length);
      }
    }, 30000);
  }

  test.skipIf(unavailable.has('storygrade'))('story grade options', async () => {
    await getList('story/getGrades');
  }, 30000);

  for (const moduleName of ['issue', 'risk'] as const) {
    test.skipIf(unavailable.has(moduleName))(`${moduleName} read APIs`, async () => {
      const items = await getList(`${moduleName}/list`);
      await getList(`${moduleName}/project${moduleName === 'issue' ? 'Issues' : 'Risks'}`, { projectID: requireProjectID() });
      await getList(`${moduleName}/execution${moduleName === 'issue' ? 'Issues' : 'Risks'}`, { executionID: requireExecutionID() });
      const id = tryExtractID(items[0]);
      if (id) await getRecord(`${moduleName}/get`, id);
      else coverage.exclude(`${moduleName}/get`, 'No existing record; creation has no cleanup API.');
    }, 60000);
  }

  test.skipIf(unavailable.has('meeting'))('meeting CRUD and minutes', async () => {
    const body = { project: requireProjectID(), execution: requireExecutionID(), name: `${productName} meeting`,
      begin: `${dateAfter(7)} 09:00`, end: `${dateAfter(7)} 10:00`, mode: 'online', host: actorAccount, participant: [actorAccount], room: 0 };
    const id = await createTracked('meeting/create', body, 'meeting/delete');
    await call('meeting/update', { id, ...body, name: `${body.name} updated` });
    expect((await getRecord('meeting/get', id)).name).toBe(`${body.name} updated`);
    await call('meeting/minutes', { id, minutes: 'Temporary API meeting minutes' });
    expect(String((await getRecord('meeting/get', id)).minutes)).toContain('Temporary API meeting minutes');
    expectListContainsID(await getList('meeting/list'), id);
    expectListContainsID(await getList('meeting/projectMeetings', { projectID: requireProjectID() }), id);
    expectListContainsID(await getList('meeting/executionMeetings', { executionID: requireExecutionID() }), id);
  }, 60000);

  test.skipIf(unavailable.has('workflow'))('custom contract workflow CRUD', async () => {
    const name = `${productName} contract`;
    const id = await createTracked('workflow/create', { name }, 'workflow/delete', {
      requestName: 'workflow/list', params: {}, field: 'name', value: name,
    });
    await call('workflow/update', { id, name: `${name} updated` });
    const contracts = await getList('workflow/list');
    expect(contracts.find(item => recordMatchesID(item, id))?.name).toBe(`${name} updated`);
    if (contracts.some(item => recordMatchesID(item, 1))) await getRecord('workflow/getContract', 1);
    else coverage.exclude('workflow/getContract', 'Registry detail route is fixed to contract #1, which does not exist.');
  }, 60000);

  test('closes the temporary execution, project and product after all dependent scenarios', async () => {
    await getList('story/list', { projectID: requireProjectID(), browseType: 'allstory' });
    await getList('execution/projectExecutions', { projectID: requireProjectID(), browseType: 'all' });
    await call('execution/close', { id: requireExecutionID(), realEnd: dateAfter(0), comment: 'Temporary lifecycle completed' });
    expect((await getRecord('execution/get', requireExecutionID())).status).toBe('closed');
    await call('project/close', { id: requireProjectID(), realEnd: dateAfter(0), comment: 'Temporary lifecycle completed' });
    expect((await getList('project/list', { browseType: 'all' })).find(item => recordMatchesID(item, requireProjectID()))?.status).toBe('closed');
    await call('product/close', { id: requireProductID(), comment: 'Temporary lifecycle completed' });
    expect((await getRecord('product/get', requireProductID())).status).toBe('close');
  }, 60000);
});
