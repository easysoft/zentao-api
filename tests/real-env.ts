import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  ZentaoClient,
  request,
  setGlobalOptions,
  type RequestOptions,
  type ResponseData,
} from '../src/index';
import {
  createRealEnvLogger,
  resolveRealEnvRuntimeOptions,
} from './real-env-support';

const ENV_FILES = ['.env.local', 'env.local'] as const;
const runtimeOptions = resolveRealEnvRuntimeOptions();
const logger = createRealEnvLogger();

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
let requestOptions: RequestOptions = {};
let productID: number | undefined;
let productName = '';
let actorAccount: string | undefined;

const created = {
  fileIDs: [] as number[],
  storyIDs: [] as number[],
  taskIDs: [] as number[],
  bugIDs: [] as number[],
  planID: undefined as number | undefined,
  projectID: undefined as number | undefined,
  executionID: undefined as number | undefined,
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
  if (response.status !== 'success') {
    throw new Error(`Expected ZenTao API success, got ${JSON.stringify(response)}`);
  }
  expect(response.status).toBe('success');
}

function tryExtractID(data: unknown): number | undefined {
  const id = isRecord(data) ? data.id : undefined;
  const numberValue = Number(id);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : undefined;
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
  return ['id', 'rawID'].some((key) => String(item[key]) === String(id));
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
  const response = await request(requestName, params, requestOptions);
  logger.result(summarizeResponse(response));
  return response;
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

describe('real ZenTao product API', () => {
  beforeAll(async () => {
    const config = await loadRealEnvConfig();
    actorAccount = config.reviewer ?? config.account;
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

    productName = `zentao-api-real-${Date.now()}-${randomUUID().slice(0, 8)}`;
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
  });

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
      await cleanupIDs('file/delete', created.fileIDs);
      await cleanupIDs('task/delete', created.taskIDs);
      await cleanupIDs('bug/delete', created.bugIDs);
      await cleanup('execution/delete', created.executionID);
      await cleanup('project/delete', created.projectID);
      await cleanupIDs('story/delete', created.storyIDs);
      await cleanup('productplan/delete', created.planID);
      await cleanup('product/delete', productID);
    } finally {
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
  });

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

      const uploadedStoryResponse = await apiRequest('Verify uploaded story file', 'story/get', {
        id: created.storyIDs[0],
      });
      expectSuccess(uploadedStoryResponse);
      const story = unwrapRecord(uploadedStoryResponse.data);
      const files = isRecord(story.files) ? Object.values(story.files) : [];
      expect(files.some((file) => recordMatchesID(file, fileID))).toBe(true);
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

    const projectName = `${productName} project`;
    created.projectID = await createEntity('Create temporary project', 'project/create', {
      name: projectName,
      model: 'scrum',
      begin: startDate,
      end: projectEndDate,
      products: [productID],
      workflowGroup: 0,
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
      workflowGroup: 0,
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
});
