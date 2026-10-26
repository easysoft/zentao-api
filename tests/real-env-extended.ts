import { expect, test } from 'bun:test';
import { generateKeyPairSync, randomUUID } from 'node:crypto';
import type { ResponseData } from '../src/index';

type API = `${string}/${string}`;
type Params = Record<string, unknown>;
interface Lookup { requestName: API; params: Params; field: string; value: string }
interface RealEnvContext {
  call(name: API, params?: Params): Promise<ResponseData>;
  raw(name: API, params: Params): Promise<unknown>;
  getList(name: API, params?: Params): Promise<Params[]>;
  getRecord(name: API, id: number): Promise<Params>;
  createTracked(name: API, params: Params, cleanup: API, lookup?: Lookup): Promise<number>;
  deleteTracked(name: API, id: number): Promise<void>;
  track(name: API, id: number): void;
  retain(resource: { api: string; id?: number; name?: string }): void;
  product(): number;
  project(): number;
  execution(): number;
  name(): string;
  account(): string;
  date(days: number): string;
}

function record(value: unknown): Params {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected an object.');
  return value as Params;
}
function positiveID(value: unknown): number {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error(`Expected a positive fixture ID, got ${String(value)}`);
  return id;
}
function contains(items: Params[], id: number): void {
  expect(items.some(item => Number(item.id ?? item.rawID) === id)).toBe(true);
}

/** Additional scenarios use the same temporary product and the same cleanup/coverage recorder. */
export function registerExtendedRealEnvTests(ctx: RealEnvContext): void {
  const { call, raw, getList, getRecord, createTracked, deleteTracked, track, retain, product, project, execution, name, account, date } = ctx;
  const scopedLookup = (api: API, field: string, value: string): Lookup => ({
    requestName: api, params: { projectID: project(), browseType: 'all', recPerPage: 1000 }, field, value,
  });

  test('creates and updates a product application', async () => {
    const title = `${name()} extra application`;
    const response = await call('system/create', { productID: product(), name: title, integrated: 0, children: [] });
    const systems = await getList('system/list', { productID: product() });
    const id = positiveID((response.data as Params)?.id ?? systems.find(item => item.name === title)?.id);
    retain({ api: 'system/create', id, name: title });
    await call('system/update', { id, name: `${title} updated`, children: [] });
    expect((await getList('system/list', { productID: product() })).find(item => Number(item.id) === id)?.name).toBe(`${title} updated`);
  }, 60000);

  for (const api of ['issue/create', 'risk/create', 'project/createRisk'] as const) {
    test(`creates a temporary ${api} and reads it through both scopes`, async () => {
      const module = api === 'issue/create' ? 'issue' : 'risk';
      const title = `${name()} ${api}`;
      const body = module === 'issue'
        ? { objectID: project(), title, type: 'code', severity: 3, pri: 3, execution: execution(), owner: account(), assignedTo: account() }
        : { projectID: project(), project: project(), name: title, execution: execution(), impact: 1, probability: 1, pri: 3,
          source: 'team', category: 'technical', strategy: 'acceptance', identifiedDate: date(0), assignedTo: account() };
      const response = await call(api, body);
      const items = await getList(`${module}/list`);
      const id = positiveID((response.data as Params)?.id ?? items.find(item => (item.name ?? item.title) === title)?.id);
      retain({ api, id, name: title });
      expect((await getRecord(`${module}/get`, id))[module === 'issue' ? 'title' : 'name']).toBe(title);
      for (const scope of ['project', 'execution'] as const) {
        contains(await getList(`${module}/${scope}${module === 'issue' ? 'Issues' : 'Risks'}`, {
          [`${scope}ID`]: scope === 'project' ? project() : execution(),
        }), id);
      }
      if (module === 'risk') {
        await call('risk/update', { id, ...body, name: `${title} updated` });
        expect((await getRecord('risk/get', id)).name).toBe(`${title} updated`);
      }
    }, 60000);
  }

  let activity: Params | undefined;
  for (const scope of ['project', 'execution'] as const) {
    test(`process tailoring in the temporary ${scope}`, async () => {
      const params = { [`${scope}ID`]: scope === 'project' ? project() : execution() };
      const items = await getList('process/list', { ...params, browseType: 'wait' });
      const item = items.find(item => item.type === 'activity' && !item.noTrim) ?? items.find(item => item.type === 'activity');
      if (!item) throw new Error(`The temporary ${scope} workflow has no activities to tailor.`);
      if (scope === 'project') activity = item;
      const id = positiveID(item.rawID);
      await call(scope === 'project' ? 'process/setProject' : 'process/setExecution', { ...params, items: [{ type: 'activity', id, result: 'yes' }] });
      expect((await getList('process/list', { ...params, browseType: 'yes' })).some(item => Number(item.rawID) === id && item.type === 'activity')).toBe(true);
    }, 60000);
  }

  const auditBody = () => {
    if (!activity) throw new Error('Process tailoring did not provide an activity for the audit plan.');
    return { projectID: project(), execution: execution(), process: positiveID(activity.process), objectID: positiveID(activity.rawID),
      objectType: 'activity', status: 'wait', isCycle: 0, checkDateList: [date(1)], assignedToList: [account()] };
  };
  const trackAuditPlans = async () => {
    const plans = await getList('auditplan/list', { projectID: project(), browseType: 'all' });
    for (const plan of plans) track('auditplan/delete', positiveID(plan.id));
    return plans;
  };
  test('audit plan create, read, edit and check', async () => {
    try { await call('auditplan/create', auditBody()); }
    finally { await trackAuditPlans(); }
    const plans = await getList('auditplan/list', { executionID: execution(), browseType: 'all' });
    const id = positiveID(plans[0]?.id);
    const detail = await getRecord('auditplan/get', id);
    expect(Number(detail.project)).toBe(project());
    await call('auditplan/update', { id, ...auditBody(), assignedTo: account(), comment: 'Updated temporary audit plan' });
    expect((await getRecord('auditplan/get', id)).assignedTo).toBe(account());
    await call('auditplan/check', { id, listID: [], result: [], status: [] });
  }, 60000);
  test('batch creates audit plans', async () => {
    const body = auditBody();
    const before = await getList('auditplan/list', { projectID: project(), browseType: 'all' });
    try {
      await call('auditplan/batchCreate', { projectID: project(), process: [String(body.process)], execution: [String(execution())],
        objectID: [String(body.objectID)], objectType: ['activity'], checkDate: [date(2)], assignedTo: [account()], status: ['wait'] });
    } finally { await trackAuditPlans(); }
    expect((await getList('auditplan/list', { projectID: project(), browseType: 'all' })).length).toBeGreaterThan(before.length);
  }, 60000);

  test('opportunity CRUD and batch creation', async () => {
    const title = `${name()} opportunity`;
    const body = { projectID: project(), execution: execution(), name: title, source: 'team', impact: 1, chance: 1, pri: 3,
      identifiedDate: date(0), assignedTo: account(), desc: 'Temporary opportunity' };
    const id = await createTracked('opportunity/create', body, 'opportunity/delete', scopedLookup('opportunity/list', 'name', title));
    expect((await getRecord('opportunity/get', id)).name).toBe(title);
    await call('opportunity/update', { id, ...body, name: `${title} updated` });
    expect((await getRecord('opportunity/get', id)).name).toBe(`${title} updated`);
    contains(await getList('opportunity/list', { projectID: project() }), id);
    contains(await getList('opportunity/list', { executionID: execution() }), id);
    const batchName = `${name()} batch opportunity`;
    await createTracked('opportunity/batchCreate', { projectID: project(), name: [batchName], source: ['team'],
      execution: [String(execution())], impact: ['1'], chance: ['1'], pri: ['3'], desc: ['Temporary batch opportunity'] },
    'opportunity/delete', scopedLookup('opportunity/list', 'name', batchName));
    await deleteTracked('opportunity/delete', id);
  }, 60000);

  let deliverableID: number | undefined;
  test('submits a temporary document as a project deliverable', async () => {
    const options = record((await call('deliverable/options', { projectID: project() })).data);
    const definitionID = positiveID(Object.keys(options)[0]);
    const title = `${name()} deliverable`;
    const libID = await createTracked('doc/createProjectLib', { projectID: project(), name: title, acl: 'default' }, 'doc/deleteLib');
    const docID = await createTracked('doc/createProjectDoc', { projectID: project(), libID, title, content: 'Temporary deliverable content', contentType: 'doc' }, 'doc/delete');
    deliverableID = await createTracked('deliverable/create', { projectID: project(), deliverable: definitionID, sourceType: 'project', sourceID: project(),
      doc: { [definitionID]: { doc: [docID], docVersion: [1], name: [title] } } }, 'deliverable/delete',
    { requestName: 'deliverable/list', params: { projectID: project(), browseType: 'normal' }, field: 'title', value: title });
    expect(Number((await getRecord('deliverable/get', deliverableID)).project)).toBe(project());
    contains(await getList('deliverable/list', { projectID: project() }), deliverableID);
  }, 60000);

  for (const scope of ['project', 'execution'] as const) {
    test(`nonconformity CRUD in the temporary ${scope}`, async () => {
      const body = { [`${scope}ID`]: scope === 'project' ? project() : execution(), execution: execution(),
        data: { deliverable: positiveID(deliverableID) }, objectType: 'deliverable', title: `${name()} ${scope} nonconformity`, severity: 3, type: 'process' };
      const id = await createTracked(scope === 'project' ? 'nc/createProject' : 'nc/createExecution', body, 'nc/delete', scopedLookup('nc/list', 'title', body.title));
      expect((await getRecord('nc/get', id)).title).toBe(body.title);
      await call('nc/update', { id, ...body, title: `${body.title} updated`, assignedTo: account(), deadline: date(7) });
      expect((await getRecord('nc/get', id)).title).toBe(`${body.title} updated`);
      contains(await getList('nc/list', { projectID: project(), browseType: 'all' }), id);
      contains(await getList('nc/list', { executionID: execution(), browseType: 'all' }), id);
      await deleteTracked('nc/delete', id);
    }, 60000);
  }

  test('baseline CRUD for the temporary deliverable', async () => {
    const title = `${name()} baseline`;
    const body = { projectID: project(), title, version: '1.0', category: [String(positiveID(deliverableID))] };
    const id = await createTracked('baseline/create', body, 'baseline/delete', scopedLookup('baseline/list', 'title', title));
    expect((await getRecord('baseline/get', id)).title).toBe(title);
    await call('baseline/update', { id, ...body, title: `${title} updated`, version: '1.1' });
    expect((await getRecord('baseline/get', id)).version).toBe('1.1');
    contains(await getList('baseline/list', { projectID: project() }), id);
    await deleteTracked('baseline/delete', id);
  }, 60000);

  test('project change CRUD', async () => {
    const title = `${name()} change`;
    const body = { projectID: project(), name: title, urgency: 'normal', type: 'scope', owner: account(), reason: 'Temporary API test', desc: 'Temporary change' };
    const id = await createTracked('change/create', body, 'change/delete', scopedLookup('change/list', 'name', title));
    expect((await getRecord('change/get', id)).name).toBe(title);
    await call('change/update', { id, ...body, name: `${title} updated` });
    expect((await getRecord('change/get', id)).name).toBe(`${title} updated`);
    contains(await getList('change/list', { projectID: project() }), id);
    await deleteTracked('change/delete', id);
  }, 60000);

  test('project weekly report CRUD', async () => {
    const title = `${name()} weekly report`;
    const tables = await getList('db/tables');
    const table = String(tables.find(item => /(?:^|_)module$/.test(String(item.name)))?.name ?? '');
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(table)) throw new Error('No module table is available to discover weekly report categories.');
    const categories = (await call('db/query', { sql: `SELECT id FROM ${table} WHERE type = 'reportTemplate' AND deleted = '0'`, limit: 100 })).data as Params[];
    const category = positiveID(categories[0]?.id);
    const id = await createTracked('weekly/create', { projectID: project(), title, reportModule: String(category), templateID: 0,
      templateDesc: 'Temporary API report', acl: 'open', status: 'draft' }, 'weekly/delete', scopedLookup('weekly/list', 'title', title));
    expect((await getRecord('weekly/get', id)).title).toBe(title);
    contains(await getList('weekly/list', { projectID: project() }), id);
    await call('weekly/update', { id, title: `${title} updated`, status: 'draft', contentType: 'doc', type: 'text', content: '<p>Updated weekly report</p>', rawContent: 'Updated weekly report' });
    expect((await getRecord('weekly/get', id)).title).toBe(`${title} updated`);
    contains(await getList('weekly/list', { projectID: project() }), id);
    await deleteTracked('weekly/delete', id);
  }, 60000);

  test('workflow groups and project resource calendar', async () => {
    expect((await getList('workflowgroup/list')).length).toBeGreaterThan(0);
    const calendar = await call('resourcecalendar/get', { projectID: project(), accounts: account(), type: 'person', mode: 'wait' });
    expect(calendar.data).toBeObject();
  }, 60000);

  test('links and unlinks two temporary requirements', async () => {
    const ids: number[] = [];
    for (let index = 0; index < 2; index++) ids.push(await createTracked('story/create', { productID: product(), title: `${name()} relation ${index}`,
      category: 'feature', spec: 'Temporary relation', reviewer: [account()] }, 'story/delete'));
    const params = { objectType: 'story', objectID: ids[0], relatedObjectType: 'story', browseType: 'all', recPerPage: 1000 };
    contains(await getList('relation/candidates', params), ids[1]);
    const rawCandidates = record(await raw('relation/candidates', params));
    const relationKey = Object.keys(record(rawCandidates.relationPairs))[0];
    if (!relationKey) throw new Error('No relation types are configured for requirements.');
    await call('relation/link', { ...params, data: { relation: { [ids[1]]: relationKey } } });
    const relations = await getList('relation/list', params);
    const relation = relations.find(item => Number(item.id ?? item.relatedObjectID) === ids[1] && item.relationType === 'custom');
    const id = positiveID(relation?.relationID);
    track('relation/unlink', id);
    await deleteTracked('relation/unlink', id);
  }, 60000);

  const flowModule = `apitest${randomUUID().slice(0, 8).replace(/[0-9]/g, digit => 'abcdefghij'[Number(digit)])}`;
  let flowID: number | undefined;
  const requireFlow = () => positiveID(flowID);
  test('temporary workflow definition create, read, update and copy', async () => {
    flowID = await createTracked('workflow/createFlow', { module: flowModule, name: flowModule, navigator: 'primary' }, 'workflow/deleteFlow',
      { requestName: 'workflow/flows', params: { onlyCustom: '1', status: 'wait' }, field: 'module', value: flowModule });
    expect((await getRecord('workflow/getFlow', flowID)).module).toBe(flowModule);
    await call('workflow/updateFlow', { id: flowID, name: `${flowModule} v2`, navigator: 'primary', positionModule: 'main' });
    expect((await getRecord('workflow/getFlow', flowID)).name).toBe(`${flowModule} v2`);
    contains(await getList('workflow/flows', { status: 'wait', onlyCustom: '1' }), flowID);
    const copyID = await createTracked('workflow/copyFlow', { id: flowID, module: `${flowModule}copy`, name: `${flowModule} copy`, navigator: 'primary' }, 'workflow/deleteFlow',
      { requestName: 'workflow/flows', params: { status: 'wait', onlyCustom: '1' }, field: 'module', value: `${flowModule}copy` });
    expect((await getRecord('workflow/getFlow', copyID)).module).toBe(`${flowModule}copy`);
  }, 60000);

  for (const kind of ['Field', 'Action', 'Label', 'Table', 'Datasource', 'Rule'] as const) {
    test(`temporary workflow ${kind.toLowerCase()} CRUD`, async () => {
      if (!['Datasource', 'Rule'].includes(kind)) requireFlow();
      const title = `api-${name().slice(-8)}-${kind.toLowerCase()}`;
      const bodies = {
        Field: { module: flowModule, name: title, field: 'apitext', control: 'input', type: 'varchar', length: '255' },
        Action: { module: flowModule, action: 'apicheck', name: title, type: 'single' },
        Label: { module: flowModule, action: 'browse', code: 'apilabel', label: title, type: 'data', fields: ['id'], operators: ['>'], values: ['0'] },
        // The parent module is a path parameter; the child table code belongs in the JSON body.
        Table: { module: flowModule, data: { module: `${flowModule}detail`, name: title } },
        Datasource: { type: 'sql', name: title, code: `${flowModule}source`, sql: 'SELECT 1 AS id, \'API test\' AS name', keyField: 'id', valueField: 'name' },
        Rule: { type: 'regex', name: title, rule: '/^[a-z]+$/i' },
      };
      const listName: API = `workflow/${kind.toLowerCase()}s`;
      const field = kind === 'Label' ? 'label' : 'name';
      const id = await createTracked(`workflow/create${kind}`, bodies[kind], `workflow/delete${kind}`,
        { requestName: listName, params: { module: flowModule }, field, value: title });
      expect((await getRecord(`workflow/get${kind}`, id))[field]).toBe(title);
      await call(`workflow/update${kind}`, { id, ...bodies[kind], [field]: `${title} v2`,
        ...(kind === 'Table' ? { data: { name: `${title} v2` } } : {}) });
      expect((await getRecord(`workflow/get${kind}`, id))[field]).toBe(`${title} v2`);
      contains(await getList(listName, { module: flowModule }), id);
      if (kind === 'Action') {
        for (const [action, body] of [
          ['setActionCSS', { css: '.api-test { color: inherit; }' }], ['setActionJS', { js: '/* API integration test */' }],
          ['setActionNotice', { toList: [] }], ['setActionVerification', { type: 'no' }],
        ] as const) await call(`workflow/${action}`, { id, ...body });
        const action = await getRecord('workflow/getAction', id);
        expect(String(action.css)).toContain('api-test');
        expect(String(action.js)).toContain('API integration test');
      }
      await deleteTracked(`workflow/delete${kind}`, id);
    }, 60000);
  }

  test('temporary workflow configuration, publication and status transitions', async () => {
    const id = requireFlow();
    for (const [api, body] of [
      ['setFlowCSS', { css: '.api-test { color: inherit; }' }], ['setFlowJS', { js: '/* API integration test */' }],
      ['setApproval', { approval: 'disabled' }], ['setFulltextSearch', { contentField: ['id'] }],
      ...(['setExport', 'setSearch', 'setValue'] as const).map(api => [api, { modules: [flowModule], fields: { [flowModule]: ['id'] } }] as const),
    ] as const) await call(`workflow/${api}`, { id, module: flowModule, ...body });
    const flow = await getRecord('workflow/getFlow', id);
    expect(String(flow.css)).toContain('api-test');
    expect(String(flow.js)).toContain('API integration test');
    await call('workflow/releaseFlow', { id, navigator: 'primary', positionModule: 'main' });
    expect((await getRecord('workflow/getFlow', id)).status).toBe('normal');
    await call('workflow/deactivateFlow', { id });
    expect((await getRecord('workflow/getFlow', id)).status).toBe('pause');
    await call('workflow/activateFlow', { id });
    expect((await getRecord('workflow/getFlow', id)).status).toBe('normal');
  }, 120000);

  test('database metadata and read-only query for the temporary product', async () => {
    const tables = await getList('db/tables');
    const table = String(tables.find(item => /(?:^|_)product$/.test(String(item.name)))?.name ?? '');
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(table)) throw new Error('No product table is available through the database API.');
    const metadata = record((await call('db/table', { table })).data);
    expect(metadata.columns).toBeArray();
    contains((await call('db/query', { sql: `SELECT id, name FROM ${table} WHERE id = ${product()}`, limit: 1, page: 1 })).data as Params[], product());
  }, 60000);

  let libraryID: number | undefined;
  let knowledgeID: number | undefined;
  test('knowledge libraries and entries', async () => {
    const libraries = await getList('knowledgelib/list', { recPerPage: 100 });
    libraryID = positiveID(libraries[0]?.id);
    const items = await getList('knowledge/list', { libID: libraryID, recPerPage: 100 });
    knowledgeID = positiveID(items[0]?.id);
  }, 60000);
  test('knowledge detail', async () => { await getRecord('knowledge/get', positiveID(knowledgeID)); }, 30000);
  for (const api of ['knowledge/search', 'knowledge/embeddingsSearch'] as const) {
    test(api, async () => {
      await call(api, { libIDs: [positiveID(libraryID)], keyword: name(), keywords: [name()], recPerPage: 10, limit: 5 });
    }, 60000);
  }

  let spaceID: number | undefined;
  test('code spaces and repositories', async () => {
    const spaces = await getList('space/list', { recPerPage: 100 });
    spaceID = positiveID(spaces[0]?.id);
    await getList('repo/list', { spaceID, recPerPage: 100 });
  }, 60000);
  test('product repository list', async () => { await getList('product/repos', { productID: product() }); }, 30000);
  test('creates a repository associated with the temporary product', async () => {
    const response = await call('repo/create', { space: positiveID(spaceID), product: [product()], name: name(), desc: 'Temporary API integration test' });
    const id = positiveID(record(response.data).id);
    retain({ api: 'repo/create', id, name: name() });
    contains(await getList('repo/list', { spaceID, recPerPage: 100 }), id);
    contains(await getList('product/repos', { productID: product() }), id);
  }, 60000);
  test('registers a disposable SSH public key', async () => {
    const { publicKey } = generateKeyPairSync('ed25519');
    const key = publicKey.export({ format: 'jwk' });
    const algorithm = Buffer.from('ssh-ed25519');
    const bytes = Buffer.from(key.x!, 'base64url');
    const header = Buffer.alloc(4); header.writeUInt32BE(algorithm.length);
    const length = Buffer.alloc(4); length.writeUInt32BE(bytes.length);
    const publicKeyText = `ssh-ed25519 ${Buffer.concat([header, algorithm, length, bytes]).toString('base64')} ${name()}`;
    await call('my/createSSH', { name: name(), publicKey: publicKeyText });
    // The private key is never persisted, so the registered key cannot be used after this process exits.
    retain({ api: 'my/createSSH', name: name() });
  }, 60000);
}
