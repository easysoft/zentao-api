import { extendModuleAction } from './define.js';
import { ZentaoError } from '../misc/errors.js';
import { isRecord } from '../utils/index.js';
import type { ModuleAction, ModuleActionRequestCallback } from '../types/index.js';

// Contracts checked against zentaopms_21.2_20241206/config/routes.php and api/v1/entries.
// Keep these separate from the generated v2 OpenAPI definitions.
const MIN_VERSION = ['21.2'];
const pager = { pageID: 'page', recPerPage: 'limit', recTotal: 'total' };
const aliases: Record<string, string> = { pageID: 'page', recPerPage: 'limit', orderBy: 'order', browseType: 'status' };

type Patch = Partial<Omit<ModuleAction, 'apiV1'>>;
function contract(module: string, name: string, patch: Patch = {}, fields?: string, required?: string[]) {
  extendModuleAction(module, name, action => {
    const fieldNames = fields?.split(',');
    const properties = action.requestBody?.schema.properties as Record<string, unknown> | undefined;
    const request: ModuleActionRequestCallback = async ({ request: command, client, body, timeout, insecure }) => {
      const query: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(command.query ?? {})) {
        query[key === 'browseType' && module === 'user' ? 'browse' : aliases[key] ?? key] = value;
      }
      // Accept v1-native filters without confusing the local output limit with the API page size.
      for (const key of ['status', 'branch', 'type', 'program', 'project']) {
        if (command.params[key] !== undefined) query[key] = command.params[key];
      }
      const payload = isRecord(body) ? { ...body } : body;
      if (isRecord(payload)) {
        for (const key of Object.keys(command.action.pathParams ?? {})) delete payload[key];
        for (const key of ['assignedTo','resolvedBy','closedBy','PO','PM','QD','RD']) {
          if (isRecord(payload[key])) payload[key] = (payload[key] as Record<string, unknown>).account ?? '';
        }
        for (const key of ['openedBuild','reviewer','whitelist','mailto']) {
          if (Array.isArray(payload[key])) payload[key] = (payload[key] as unknown[]).map(value => isRecord(value) ? value.account ?? value.id : value);
        }
      }
      if (fieldNames) {
        for (const key of Object.keys(properties ?? {})) {
          if (!fieldNames.includes(key) && !Object.hasOwn(command.action.pathParams ?? {}, key) && Object.hasOwn(command.params, key)) {
            throw new ZentaoError('E_INVALID_PARAM', { param: key, value: 'not supported by API v1' });
          }
        }
        if (isRecord(payload)) for (const key of Object.keys(payload)) {
          if (!fieldNames.includes(key)) throw new ZentaoError('E_INVALID_PARAM', { param: key, value: 'not supported by API v1' });
        }
      }
      if (module === 'my') {
        const field = name === 'bugs' ? 'bug' : name === 'tasks' ? 'task' : 'story';
        query.fields = field;
        query.type ??= 'assignedTo';
      }
      if (module === 'story' && name === 'create') query.type = 'story';
      const response = await client.request(command.path, {
        apiVersion: 'v1', method: command.action.method!.toUpperCase() as 'GET' | 'POST' | 'PUT' | 'DELETE',
        query, body: payload, timeout, insecure, responseType: 'response',
      });
      let raw: unknown;
      try { raw = JSON.parse(await response.text()); }
      catch { throw new ZentaoError('E_API_FAILED', { message: 'API v1 returned invalid JSON.' }); }
      if (!isRecord(raw)) throw new ZentaoError('E_API_FAILED', { message: 'API v1 returned an invalid object.' });
      if (raw.error || raw.result === 'fail') return { ...raw, status: 'fail', message: raw.message ?? raw.error };
      if (raw.status === 'fail') return raw;
      if (command.action.resultType === 'list') {
        const key = module === 'my' ? (name === 'bugs' ? 'bug' : name === 'tasks' ? 'task' : 'story') : undefined;
        const list = key && isRecord(raw[key]) ? raw[key] : raw;
        const getter = command.action.resultGetter as string;
        const value = key ? list[name] : raw[getter];
        if (!Array.isArray(value) || list.total === null || !Number.isSafeInteger(Number(list.total)) || Number(list.total) < 0) {
          throw new ZentaoError('E_API_FAILED', { message: 'API v1 returned an invalid list or pagination.' });
        }
        if (key) return { ...list, page: Number(command.params.pageID ?? command.params.page ?? 1), limit: Number(command.params.recPerPage ?? 20) };
      }
      return raw;
    };
    const apiV1: NonNullable<ModuleAction['apiV1']> = {
      minVersion: MIN_VERSION, request, beforeRequest: undefined,
      ...(action.type === 'get' ? { resultGetter: undefined } : {}),
      ...(action.type === 'list' ? { pagerGetter: pager } : {}),
      ...patch,
    };
    if (fieldNames) apiV1.requestBody = { schema: {
      type: 'object', required: required ?? [],
      properties: Object.fromEntries(fieldNames.map(key => [key, properties?.[key] ?? { type: ['products','plans','whitelist','reviewer','mailto','openedBuild'].includes(key) ? 'array' : 'string' }])),
    } };
    return { ...action, apiV1 };
  });
}

export function applyV1Contracts(): void {
  for (const module of ['user', 'product', 'project', 'execution']) contract(module, 'list');
  for (const module of ['user', 'product', 'execution', 'bug', 'task', 'story']) contract(module, 'get');
  contract('product', 'programProducts');
  contract('project', 'programProjects');
  contract('execution', 'projectExecutions');
  contract('bug', 'list');
  contract('story', 'list');
  contract('task', 'list');
  for (const name of ['bugs', 'tasks', 'stories']) contract('my', name, { path: '/user' });

  // Write fields are deliberately listed per v1 controller, rather than reusing the v2 body wholesale.
  const product = 'program,line,name,PO,QD,RD,type,desc,whitelist,acl';
  contract('product', 'create', {}, product, ['name']);
  contract('product', 'update', {}, product + ',status', ['name']);
  contract('product', 'delete');
  const bug = 'title,project,execution,openedBuild,assignedTo,pri,severity,type,story,resolvedBy,resolvedBuild,closedBy,resolution,product,plan,task,module,steps,mailto,keywords,uid,notifyEmail';
  contract('bug', 'create', { path: '/products/{productID}/bugs', pathParams: { productID: 'Product ID' } }, bug, ['title','openedBuild']);
  contract('bug', 'update', {}, bug);
  contract('bug', 'delete');
  contract('task', 'create', { path: '/executions/{executionID}/tasks', pathParams: { executionID: 'Execution ID' } }, 'name,type,assignedTo,estimate,story,execution,project,module,pri,desc,estStarted,deadline,mailto,team,teamEstimate,multiple,uid,mode', ['name']);
  contract('task', 'update', {}, 'name,type,desc,assignedTo,pri,estimate,left,consumed,story,parent,execution,module,closedReason,status,estStarted,deadline,team,teamEstimate,teamConsumed,teamLeft,multiple,mailto,uid');
  contract('task', 'delete');
  contract('story', 'create', { path: '/products/{productID}/stories', pathParams: { productID: 'Product ID' } }, 'title,spec,verify,module,reviewer,type,parent,moduleOptionMenu,source,sourceNote,category,pri,estimate,mailto,keywords,notifyemail,uid,status,plan,branch', ['title']);
  contract('story', 'update', {}, 'title,product,parent,reviewer,type,plan,module,source,sourceNote,category,pri,estimate,mailto,keywords,uid,stage,notifyEmail,status', ['title']);
  contract('story', 'delete');
  for (const [name, fields] of Object.entries({ confirm: 'assignedTo,mailto,comment,pri,type,status,deadline', resolve: 'resolution,resolvedBuild,resolvedDate,duplicateBug,assignedTo,uid,comment', close: 'comment', activate: 'assignedTo,uid,openedBuild,comment' })) {
    contract('bug', name, { method: 'post', path: '/bugs/{bugID}/' + (name === 'activate' ? 'active' : name) }, fields);
  }
  for (const [name, fields] of Object.entries({ start: 'assignedTo,consumed,left,comment,realStarted', finish: 'assignedTo,realStarted,finishedDate,comment,currentConsumed', close: 'comment', activate: 'assignedTo,left,comment' })) {
    contract('task', name, { method: 'post', path: '/tasks/{taskID}/' + (name === 'activate' ? 'active' : name) }, fields);
  }
  contract('story', 'activate', { method: 'post', path: '/stories/{storyID}/active' }, 'assignedTo,status,comment');
  contract('story', 'close', { method: 'post' }, 'closedReason,duplicateStory,comment');
  contract('story', 'change', { method: 'post' }, 'reviewer,comment,executions,bugs,cases,tasks,reviewedBy,uid,title,spec,verify');
}
