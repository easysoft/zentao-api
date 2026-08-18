/**
 * Reads data/zentao-openapi.json, applies scripts/zentao-api-map.json, and
 * generates src/modules/generated.ts containing the ModuleDefinition[] array
 * used by the SDK.
 *
 * Usage:  bun run scripts/update-registry.ts
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Types for the OpenAPI subset we care about
// ---------------------------------------------------------------------------

interface OpenAPIParam {
    name: string;
    in: string;
    description?: string;
    required?: boolean;
    schema?: { type?: string };
}

type OpenAPIRequestMediaType =
    | 'application/json'
    | 'multipart/form-data'
    | 'application/x-www-form-urlencoded';

interface OpenAPIRequestContent {
    schema?: Record<string, unknown>;
    example?: unknown;
}

interface OpenAPIOperation {
    tags?: string[];
    summary?: string;
    description?: string;
    parameters?: OpenAPIParam[];
    requestBody?: {
        required?: boolean;
        content?: Partial<Record<OpenAPIRequestMediaType, OpenAPIRequestContent>>;
    };
    responses?: Record<string, {
        description?: string;
        content?: {
            'application/json'?: {
                schema?: Record<string, unknown>;
                example?: unknown;
            };
        };
    }>;
}

interface OpenAPIDoc {
    tags: { name: string; description: string }[];
    paths: Record<string, Record<string, OpenAPIOperation>>;
}

interface ActionMapping {
    module?: string;
    name?: string;
    [property: string]: unknown;
}

type ActionMap = Record<string, ActionMapping>;

interface OperationReference {
    mappingKey: string;
    mapping?: ActionMapping;
}

interface GeneratedActionRecord {
    name: string;
    operations: OperationReference[];
}

interface ActionNameConflict {
    moduleName: string;
    actionName: string;
    actions: GeneratedActionRecord[];
}

// ---------------------------------------------------------------------------
// Chinese display name mapping for tags
// ---------------------------------------------------------------------------

const TAG_DISPLAY: Record<string, string> = {
    user: '用户',
    program: '项目集',
    product: '产品',
    project: '项目',
    execution: '执行',
    productplan: '产品计划',
    story: '需求',
    epic: '业务需求',
    requirement: '用户需求',
    bug: 'Bug',
    testcase: '测试用例',
    task: '任务',
    feedback: '反馈',
    ticket: '工单',
    system: '应用',
    build: '版本',
    testtask: '测试单',
    release: '发布',
    file: '附件',
    issue: '问题',
    risk: '风险',
    meeting: '会议',
    workflow: '工作流',
    doc: '文档',
    todo: '待办',
    my: '地盘',
};

const SCOPE_LABELS: Record<string, string> = {
    products: '产品',
    projects: '项目',
    executions: '执行',
    programs: '项目集',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert `{paramName}` to `:paramName` so OpenAPI brace paths reuse colon-style helpers */
function braceToColon(path: string): string {
    return path.replace(/\{(\w+)\}/g, ':$1');
}

/** Convert `:paramName` to `{paramName}` */
function colonToBrace(path: string): string {
    return path.replace(/:(\w+)/g, '{$1}');
}

/** Extract param names from a colon-style path */
function extractColonParams(path: string): string[] {
    const matches = path.matchAll(/:(\w+)/g);
    return [...matches].map(m => m[1]);
}

/** Build the canonical key used by scripts/zentao-api-map.json. */
function actionMapKey(method: string, path: string): string {
    return `${method.toLowerCase()} ${colonToBrace(braceToColon(path))}`;
}

function loadActionMap(path: string): ActionMap {
    const parsed: unknown = JSON.parse(readFileSync(path, 'utf-8'));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error(`${path} must contain a JSON object.`);
    }

    const result: ActionMap = {};
    for (const [rawKey, rawMapping] of Object.entries(parsed)) {
        if (!rawMapping || typeof rawMapping !== 'object' || Array.isArray(rawMapping)) {
            throw new Error(`Invalid action mapping for "${rawKey}" in ${path}; expected an object.`);
        }

        const mapping = rawMapping as Record<string, unknown>;
        const { module, name, ...actionProperties } = mapping;
        if ('module' in mapping && (typeof module !== 'string' || module.trim() === '')) {
            throw new Error(`Invalid module mapping for "${rawKey}" in ${path}.`);
        }
        if ('name' in mapping && (typeof name !== 'string' || name.trim() === '')) {
            throw new Error(`Invalid action name mapping for "${rawKey}" in ${path}.`);
        }
        if (!('module' in mapping) && !('name' in mapping) && Object.keys(actionProperties).length === 0) {
            throw new Error(`Empty action mapping for "${rawKey}" in ${path}.`);
        }

        const separator = rawKey.indexOf(' ');
        if (separator <= 0 || separator === rawKey.length - 1) {
            throw new Error(`Invalid API mapping key "${rawKey}" in ${path}; expected "method /path".`);
        }

        const method = rawKey.slice(0, separator).trim();
        const apiPath = rawKey.slice(separator + 1).trim();
        if (!apiPath.startsWith('/')) {
            throw new Error(`Invalid API mapping path "${apiPath}" in ${path}.`);
        }

        const mappingKey = actionMapKey(method, apiPath);
        if (result[mappingKey]) {
            throw new Error(`Duplicate API mapping key "${mappingKey}" in ${path}.`);
        }
        result[mappingKey] = {
            ...(typeof module === 'string' ? { module: module.trim().toLowerCase() } : {}),
            ...(typeof name === 'string' ? { name: name.trim() } : {}),
            ...actionProperties,
        };
    }
    return result;
}

function operationReference(method: string, path: string, mapping?: ActionMapping): OperationReference {
    const mappingKey = actionMapKey(method, path);
    return {
        mappingKey,
        ...(mapping ? { mapping } : {}),
    };
}

function findActionNameConflicts(moduleName: string, actions: GeneratedActionRecord[]): ActionNameConflict[] {
    const actionsByName = new Map<string, GeneratedActionRecord[]>();
    for (const action of actions) {
        const normalizedName = action.name.toLowerCase();
        const matches = actionsByName.get(normalizedName) ?? [];
        matches.push(action);
        actionsByName.set(normalizedName, matches);
    }

    const conflicts: ActionNameConflict[] = [];
    for (const matches of actionsByName.values()) {
        if (matches.length > 1) {
            conflicts.push({
                moduleName,
                actionName: matches[0].name,
                actions: matches,
            });
        }
    }
    return conflicts;
}

/** Determine the "resource name" (last non-param segment) for a path */
function resourceSegment(path: string): string {
    const segments = path.split('/').filter(Boolean);
    for (let i = segments.length - 1; i >= 0; i--) {
        if (!segments[i].startsWith(':')) return segments[i];
    }
    return segments[0] ?? '';
}

const PARAM_DESCRIPTION: Record<string, string> = {
    userID: '用户ID',
    programID: '项目集ID',
    productID: '产品ID',
    projectID: '项目ID',
    executionID: '执行ID',
    productplanID: '产品计划ID',
    planID: '产品计划ID',
    storyID: '需求ID',
    epicID: '业务需求ID',
    requirementID: '用户需求ID',
    bugID: 'Bug ID',
    caseID: '测试用例ID',
    testcasID: '测试用例ID',
    taskID: '任务ID',
    feedbackID: '反馈ID',
    ticketID: '工单ID',
    systemID: '应用ID',
    buildID: '版本ID',
    testtaskID: '测试单ID',
    releasID: '发布ID',
    releaseID: '发布ID',
    fileID: '附件ID',
    issueID: '问题ID',
    riskID: '风险ID',
    meetingID: '会议ID',
    docID: '文档ID',
    todoID: '待办ID',
    libID: '文档库ID',
    spaceID: '空间ID',
    moduleID: '模块ID',
    contractID: '合同ID',
};

/** Get a Chinese description from a param name */
function paramDescription(paramName: string): string {
    return PARAM_DESCRIPTION[paramName] ?? paramName;
}

/**
 * Parse option/default-value hints from an OpenAPI description string.
 *
 * Patterns handled:
 *   "状态，默认是unclosed。(all 全部 | unclosed 未关闭 | ...)"
 *   "排序(id_asc | title_asc 标题 | ...)，倒序使用id_desc, ..."
 *   "内部用户 inside | 外部用户 outside"  (bare, label-first)
 *
 * Falls back gracefully: if no pattern matches, returns the raw string.
 */
function parseDescriptionOptions(raw: string): {
    description: string;
    defaultValue?: string;
    options?: { value: string; label: string }[];
} {
    try {
        let description = raw;
        let defaultValue: string | undefined;
        let options: { value: string; label: string }[] | undefined;

        // Extract default value: "默认是XXX" / "默认XXX"
        const defaultMatch = raw.match(/默认(?:是|为)?\s*(\S+?)(?:[。，,.)\uff09\s]|$)/);
        if (defaultMatch) {
            defaultValue = defaultMatch[1];
        }

        // Try parenthesized options: "(val1 label1 | val2 label2)"
        const parenMatch = raw.match(/[(\uff08]([^)\uff09]+)[)\uff09]/);
        if (parenMatch) {
            const parsed = parsePipeOptions(parenMatch[1]);
            if (parsed.length >= 2) {
                options = parsed;
                const idx = raw.indexOf(parenMatch[0]);
                description = raw.slice(0, idx).replace(/[,，。\s]+$/, '');
            }
        }

        // Bare pipe-delimited (no parens): "val label | val label" or "label val | label val"
        if (!options && raw.includes('|') && !raw.includes('(')) {
            const parsed = parsePipeOptions(raw);
            if (parsed.length >= 2) {
                options = parsed;
                description = '';
            }
        }

        // For orderBy: expand asc options with desc counterparts
        if (options) {
            const descMatch = raw.match(/倒序使用\s*([\w_]+(?:\s*,\s*[\w_]+)*)/);
            if (descMatch) {
                const descValues = descMatch[1].split(/\s*,\s*/);
                const expanded: { value: string; label: string }[] = [];
                for (const opt of options) {
                    const baseLabel = (opt.label === opt.value) ? opt.value.replace(/_asc$/, '').toUpperCase() : opt.label;
                    expanded.push({ value: opt.value, label: `${baseLabel} 升序` });
                    const descVal = descValues.find(d => d.replace('_desc', '') === opt.value.replace('_asc', ''));
                    if (descVal) {
                        expanded.push({ value: descVal, label: `${baseLabel} 降序` });
                    }
                }
                if (expanded.length > options.length) {
                    options = expanded;
                }
            }
        }

        const finalDesc = description.trim();
        return { description: finalDesc, defaultValue, options };
    } catch {
        return { description: raw };
    }
}

/** Parse "val1 label1 | val2 label2" or "label1 val1 | label2 val2" */
function parsePipeOptions(str: string): { value: string; label: string }[] {
    const parts = str.split('|').map(s => s.trim()).filter(Boolean);
    const parsed: { value: string; label: string }[] = [];

    for (const part of parts) {
        const m = part.match(/^(\S+)\s+(.+)$/);
        if (m) {
            const first = m[1];
            const second = m[2].trim();
            // Heuristic: if first looks like an identifier (ascii), it's the value
            if (/^[a-zA-Z_][\w]*$/.test(first)) {
                parsed.push({ value: first, label: second });
            } else if (/^[a-zA-Z_][\w]*$/.test(second)) {
                // Label-first pattern: "内部用户 inside"
                parsed.push({ value: second, label: first });
            } else {
                parsed.push({ value: first, label: second });
            }
        } else {
            // Single token, e.g. "id_asc" with no label
            const token = part.trim();
            if (token) {
                parsed.push({ value: token, label: token });
            }
        }
    }

    return parsed;
}

// ---------------------------------------------------------------------------
// Classify an OpenAPI operation into an action type
// ---------------------------------------------------------------------------

interface ClassifiedAction {
    name: string;
    type: 'list' | 'get' | 'create' | 'update' | 'delete' | 'action';
    method: 'get' | 'post' | 'put' | 'delete';
    resultType: 'text' | 'object' | 'list';
}

const ACTION_TYPES = new Set<ClassifiedAction['type']>([
    'list',
    'get',
    'create',
    'update',
    'delete',
    'action',
]);

const RESULT_TYPE_BY_ACTION_TYPE: Record<ClassifiedAction['type'], ClassifiedAction['resultType']> = {
    list: 'list',
    get: 'object',
    create: 'object',
    update: 'object',
    delete: 'text',
    action: 'text',
};

function resolveActionType(
    mapping: ActionMapping | undefined,
    fallback: ClassifiedAction['type'],
    mappingKey: string,
): ClassifiedAction['type'] {
    const mappedType = mapping?.type;
    if (mappedType === undefined) return fallback;
    if (typeof mappedType === 'string' && ACTION_TYPES.has(mappedType as ClassifiedAction['type'])) {
        return mappedType as ClassifiedAction['type'];
    }
    throw new Error(`Invalid action type in action mapping "${mappingKey}".`);
}

function resolveActionResultType(
    mapping: ActionMapping | undefined,
    actionType: ClassifiedAction['type'],
    fallback: ClassifiedAction['resultType'],
    mappingKey: string,
): ClassifiedAction['resultType'] {
    const mappedResultType = mapping?.resultType;
    if (mappedResultType === undefined) {
        return mapping?.type === undefined ? fallback : RESULT_TYPE_BY_ACTION_TYPE[actionType];
    }
    if (mappedResultType === 'text' || mappedResultType === 'object' || mappedResultType === 'list') {
        return mappedResultType;
    }
    throw new Error(`Invalid resultType in action mapping "${mappingKey}".`);
}

function classifyOperation(httpMethod: string, path: string, tag: string): ClassifiedAction {
    const method = httpMethod.toLowerCase() as ClassifiedAction['method'];
    const segments = path.split('/').filter(Boolean);
    const lastSeg = segments[segments.length - 1];
    const secondLast = segments.length >= 2 ? segments[segments.length - 2] : '';

    // PUT /resources/:id/{verb} -> action
    if (method === 'put' && !lastSeg.startsWith(':') && secondLast.startsWith(':')) {
        return { name: lastSeg, type: 'action', method, resultType: 'text' };
    }

    // DELETE -> delete
    if (method === 'delete') {
        return { name: 'delete', type: 'delete', method, resultType: 'text' };
    }

    // POST -> create
    if (method === 'post') {
        return { name: 'create', type: 'create', method, resultType: 'object' };
    }

    // GET with last segment being a param -> get (detail)
    if (method === 'get' && lastSeg.startsWith(':')) {
        return { name: 'get', type: 'get', method, resultType: 'object' };
    }

    // GET collection (no trailing param) -> list
    if (method === 'get') {
        return { name: 'list', type: 'list', method, resultType: 'list' };
    }

    // PUT on item path -> update
    if (method === 'put') {
        return { name: 'update', type: 'update', method, resultType: 'object' };
    }

    return { name: httpMethod.toLowerCase(), type: 'action', method, resultType: 'text' };
}

// ---------------------------------------------------------------------------
// Infer resultGetter from the 200 response schema
// ---------------------------------------------------------------------------

function inferResultGetter(op: OpenAPIOperation, actionType: string): string | undefined {
    const schema = op.responses?.['200']?.content?.['application/json']?.schema as Record<string, unknown> | undefined;
    if (!schema) return undefined;
    const props = schema.properties as Record<string, Record<string, unknown>> | undefined;
    if (!props) return undefined;

    if (actionType === 'list') {
        // Find the array property (excluding 'status')
        for (const [key, val] of Object.entries(props)) {
            if (key === 'status') continue;
            if (val?.type === 'array') return key;
        }
    }

    if (actionType === 'get') {
        // Find the first non-status object/non-primitive property
        for (const [key, val] of Object.entries(props)) {
            if (key === 'status' || key === 'id') continue;
            if (val?.type === 'object') return key;
        }
        // Fallback: any non-status key that is not 'id'
        for (const key of Object.keys(props)) {
            if (key !== 'status' && key !== 'id') return key;
        }
    }

    return undefined;
}

// ---------------------------------------------------------------------------
// Build params from OpenAPI parameters
// ---------------------------------------------------------------------------

interface RegistryParam {
    name: string;
    required: boolean;
    type: 'string' | 'number' | 'boolean';
    description: string;
    defaultValue?: string;
    options?: { value: string; label: string }[];
}

function buildParams(parameters: OpenAPIParam[] | undefined): RegistryParam[] | undefined {
    if (!parameters || parameters.length === 0) return undefined;
    const queryParams = parameters.filter(p => p.in === 'query');
    if (queryParams.length === 0) return undefined;

    const PARAM_DESC_FALLBACK: Record<string, string> = {
        browseType: '浏览类型',
        orderBy: '排序',
        status: '状态',
        recPerPage: '每页数量',
        pageID: '页码',
    };

    return queryParams.map(p => {
        const parsed = parseDescriptionOptions(p.description ?? p.name);
        const desc = parsed.description || PARAM_DESC_FALLBACK[p.name] || p.name;
        const param: RegistryParam = {
            name: p.name,
            required: p.required ?? false,
            type: (p.name === 'recPerPage' || p.name === 'pageID') ? 'number' : 'string',
            description: desc,
        };
        if (parsed.defaultValue !== undefined) param.defaultValue = parsed.defaultValue;
        if (parsed.options && parsed.options.length > 0) param.options = parsed.options;
        return param;
    });
}

// ---------------------------------------------------------------------------
// Build requestBody
// ---------------------------------------------------------------------------

interface RegistryRequestBody {
    required?: boolean;
    type: 'object';
    mediaType?: OpenAPIRequestMediaType;
    schema: Record<string, unknown>;
}

function buildRequestBody(op: OpenAPIOperation): RegistryRequestBody | undefined {
    const rb = op.requestBody;
    if (!rb) return undefined;
    const mediaTypes: OpenAPIRequestMediaType[] = [
        'application/json',
        'multipart/form-data',
        'application/x-www-form-urlencoded',
    ];
    const mediaType = mediaTypes.find((candidate) => rb.content?.[candidate]?.schema);
    if (!mediaType) return undefined;
    const content = rb.content?.[mediaType];
    if (!content?.schema) return undefined;

    const result: RegistryRequestBody = {
        type: 'object',
        schema: content.schema,
    };
    if (rb.required) result.required = true;
    if (mediaType !== 'application/json') result.mediaType = mediaType;
    return result;
}

// ---------------------------------------------------------------------------
// Scoped list detection and merging
// ---------------------------------------------------------------------------

interface ScopedListInfo {
    parentResource: string; // e.g. 'products'
    parentParam: string;    // e.g. 'productID'
    childResource: string;  // e.g. 'bugs'
    originalPath: string;
    operation: OpenAPIOperation;
    mapping?: ActionMapping;
}

function parseScopedListPath(path: string): ScopedListInfo | null {
    // Pattern: /:parentResource/:parentParam/:childResource
    const match = path.match(/^\/(\w+)\/:(\w+)\/(\w+)$/);
    if (!match) return null;
    return {
        parentResource: match[1],
        parentParam: match[2],
        childResource: match[3],
        originalPath: path,
        operation: {} as OpenAPIOperation, // filled later
    };
}

// ---------------------------------------------------------------------------
// Main conversion
// ---------------------------------------------------------------------------

interface RegistryBuildResult {
    output: string;
    outputPath: string;
    actionMapPath: string;
    actionNameConflicts: ActionNameConflict[];
    moduleCount: number;
    operationCount: number;
}

function buildRegistry(): RegistryBuildResult {
    const openapiPath = resolve(ROOT, 'data/zentao-openapi.json');
    const outputPath = resolve(ROOT, 'src/modules/generated.ts');
    const actionMapPath = resolve(ROOT, 'scripts/zentao-api-map.json');

    const doc: OpenAPIDoc = JSON.parse(readFileSync(openapiPath, 'utf-8'));
    const actionMap = loadActionMap(actionMapPath);

    // Group operations by their mapped module, falling back to the OpenAPI tag.
    type OpEntry = { path: string; method: string; op: OpenAPIOperation; mapping?: ActionMapping };
    const moduleOps = new Map<string, OpEntry[]>();

    for (const [rawPath, methods] of Object.entries(doc.paths)) {
        const path = braceToColon(rawPath);
        for (const [method, op] of Object.entries(methods)) {
            const tag = op.tags?.[0];
            if (!tag || tag === 'Token') continue;
            const tagLower = tag.toLowerCase();
            const mapping = actionMap[actionMapKey(method, path)];
            const moduleName = mapping?.module ?? tagLower;
            if (!moduleOps.has(moduleName)) moduleOps.set(moduleName, []);
            moduleOps.get(moduleName)!.push({ path, method, op, ...(mapping ? { mapping } : {}) });
        }
    }

    // Preserve tag ordering from the spec and append mapping-only modules in encounter order.
    const moduleOrder = doc.tags
        .map(t => t.name.toLowerCase())
        .filter(t => t !== 'token' && moduleOps.has(t));
    const orderedModules = new Set(moduleOrder);
    for (const moduleName of moduleOps.keys()) {
        if (!orderedModules.has(moduleName)) {
            moduleOrder.push(moduleName);
            orderedModules.add(moduleName);
        }
    }

    const modules: string[] = [];
    const actionMetaByModule: Array<{ name: string; actions: Map<string, ClassifiedAction['resultType']> }> = [];
    const actionNameConflicts: ActionNameConflict[] = [];

    for (const moduleName of moduleOrder) {
        const ops = moduleOps.get(moduleName)!;
        const display = TAG_DISPLAY[moduleName] ?? moduleName;

        // Separate scoped lists from direct operations
        const scopedLists: ScopedListInfo[] = [];
        const directOps: OpEntry[] = [];
        let topLevelListOp: OpEntry | undefined;

        for (const entry of ops) {
            const classification = classifyOperation(entry.method, entry.path, moduleName);
            const mappingKey = actionMapKey(entry.method, entry.path);
            const actionType = resolveActionType(entry.mapping, classification.type, mappingKey);

            if (actionType === 'list') {
                const scoped = parseScopedListPath(entry.path);
                if (scoped && !entry.mapping?.name) {
                    scoped.operation = entry.op;
                    scoped.mapping = entry.mapping;
                    scopedLists.push(scoped);
                } else {
                    const actionName = entry.mapping?.name ?? classification.name;
                    if (!scoped && actionName.toLowerCase() === 'list') topLevelListOp = entry;
                    directOps.push(entry);
                }
            } else {
                directOps.push(entry);
            }
        }

        // Build actions - each entry is the lines BETWEEN { and } (not including the braces)
        const actionBodies: string[] = [];
        const actionDisplayNames: string[] = [];
        const actionMeta = new Map<string, ClassifiedAction['resultType']>();
        const generatedActions: GeneratedActionRecord[] = [];

        const recordAction = (
            name: string,
            resultType: ClassifiedAction['resultType'],
            operations: OperationReference[],
        ) => {
            generatedActions.push({ name, operations });
            if (!actionMeta.has(name)) actionMeta.set(name, resultType);
        };

        // If there are scoped lists and NO top-level list, merge them into one
        if (scopedLists.length > 0 && !topLevelListOp) {
            const first = scopedLists[0];
            const scopeOptions = scopedLists.map(s => ({
                value: s.parentResource,
                label: SCOPE_LABELS[s.parentResource] ?? s.parentResource,
            }));
            const resultGetter = inferResultGetter(first.operation, 'list');
            const params = buildParams(first.operation.parameters);
            const summary = first.operation.summary ?? `获取${display}列表`;
            const mappedProperties = new Map<string, unknown>();
            for (const scoped of scopedLists) {
                for (const [property, value] of Object.entries(scoped.mapping ?? {})) {
                    if (property === 'module' || property === 'name') continue;
                    if (mappedProperties.has(property)
                        && JSON.stringify(mappedProperties.get(property)) !== JSON.stringify(value)) {
                        throw new Error(
                            `Conflicting mapped property "${property}" for merged ${moduleName}/list action.`,
                        );
                    }
                    mappedProperties.set(property, value);
                }
            }
            const mergedMapping = Object.fromEntries(mappedProperties) as ActionMapping;
            const resultType = resolveActionResultType(
                mergedMapping,
                'list',
                'list',
                actionMapKey('get', first.originalPath),
            );

            const scopeDisplayParts = scopeOptions.map(o => o.label).join('/');
            const listDisplay = `获取${display}列表，支持获取${scopeDisplayParts}下的${display}`;
            const singleScope = scopedLists.length === 1;

            actionDisplayNames.push(listDisplay);

            const propertyBlocks = new Map<string, string>();
            propertyBlocks.set('name', `                name: 'list',\n`);
            propertyBlocks.set('display', `                display: '${escapeStr(listDisplay)}',\n`);
            propertyBlocks.set('type', `                type: 'list',\n`);
            propertyBlocks.set('method', `                method: 'get',\n`);
            // Single scope: use concrete path/params; multiple: abstract scope/scopeID
            if (singleScope) {
                propertyBlocks.set('path', `                path: '${escapeStr(`/${first.parentResource}/{${first.parentParam}}/${first.childResource}`)}',\n`);
            } else {
                propertyBlocks.set('path', `                path: '${escapeStr(`/{scope}/{scopeID}/${first.childResource}`)}',\n`);
            }
            propertyBlocks.set('resultType', `                resultType: '${resultType}',\n`);
            propertyBlocks.set('pagerGetter', `                pagerGetter: 'pager',\n`);
            if (resultGetter) {
                propertyBlocks.set('resultGetter', `                resultGetter: '${escapeStr(resultGetter)}',\n`);
            }
            let pathParamsBlock = `                pathParams: {\n`;
            if (singleScope) {
                const scopeLabel = scopeOptions[0].label;
                pathParamsBlock += `                    ${first.parentParam}: '${escapeStr(`所属${scopeLabel}ID`)}',\n`;
            } else {
                pathParamsBlock += `                    scope: {description: '${escapeStr(`${display}所属范围`)}', options: [${scopeOptions.map(o => `{value: '${escapeStr(o.value)}', label: '${escapeStr(o.label)}'}`).join(', ')}]},\n`;
                pathParamsBlock += `                    scopeID: '所属范围ID',\n`;
            }
            pathParamsBlock += `                },\n`;
            propertyBlocks.set('pathParams', pathParamsBlock);
            if (params) {
                let paramsBlock = `                params: [\n`;
                paramsBlock += params.map(p => formatParam(p)).join('');
                paramsBlock += `                ],\n`;
                propertyBlocks.set('params', paramsBlock);
            }
            for (const [property, value] of mappedProperties) {
                propertyBlocks.set(property, formatMappedActionProperty(property, value));
            }
            const body = [...propertyBlocks.values()].join('');
            actionBodies.push(body);
            recordAction('list', resultType, scopedLists.map(scoped =>
                operationReference('get', scoped.originalPath, scoped.mapping),
            ));
        }

        // Process direct operations (including top-level list)
        // Sort: list, get, create, update, delete, then actions alphabetically
        const typeOrder: Record<string, number> = { list: 0, create: 1, get: 2, update: 3, delete: 4 };
        const sorted = [...directOps].sort((a, b) => {
            const ca = classifyOperation(a.method, a.path, moduleName);
            const cb = classifyOperation(b.method, b.path, moduleName);
            const oa = typeOrder[ca.type] ?? 5;
            const ob = typeOrder[cb.type] ?? 5;
            if (oa !== ob) return oa - ob;
            return ca.name.localeCompare(cb.name);
        });

        for (const entry of sorted) {
            const classification = classifyOperation(entry.method, entry.path, moduleName);
            const reference = operationReference(entry.method, entry.path, entry.mapping);
            const actionType = resolveActionType(entry.mapping, classification.type, reference.mappingKey);
            const actionMethod = classification.method;
            const resultType = resolveActionResultType(
                entry.mapping,
                actionType,
                classification.resultType,
                reference.mappingKey,
            );
            const actionName = entry.mapping?.name ?? classification.name;
            const summary = entry.op.summary ?? '';

            actionDisplayNames.push(summary);

            const bracePath = colonToBrace(entry.path);

            const pathParamNames = extractColonParams(entry.path);
            const relevantPathParams = pathParamNames.filter(() => actionType !== 'list' || Boolean(entry.mapping));

            const resultGetter = (actionType === 'list' || actionType === 'get')
                ? inferResultGetter(entry.op, actionType) : undefined;

            const params = (actionType === 'list') ? buildParams(entry.op.parameters) : undefined;
            const requestBody = buildRequestBody(entry.op);

            const propertyBlocks = new Map<string, string>();
            propertyBlocks.set('name', `                name: '${escapeStr(actionName)}',\n`);
            propertyBlocks.set('display', `                display: '${escapeStr(summary)}',\n`);
            propertyBlocks.set('type', `                type: '${actionType}',\n`);
            propertyBlocks.set('method', `                method: '${actionMethod}',\n`);
            propertyBlocks.set('path', `                path: '${escapeStr(bracePath)}',\n`);
            propertyBlocks.set('resultType', `                resultType: '${resultType}',\n`);

            if (actionType === 'list') {
                propertyBlocks.set('pagerGetter', `                pagerGetter: 'pager',\n`);
            }
            if (resultGetter) {
                propertyBlocks.set('resultGetter', `                resultGetter: '${escapeStr(resultGetter)}',\n`);
            }

            if (relevantPathParams.length > 0) {
                let pathParamsBlock = `                pathParams: {\n`;
                for (const pp of relevantPathParams) {
                    pathParamsBlock += `                    ${pp}: '${escapeStr(paramDescription(pp))}',\n`;
                }
                pathParamsBlock += `                },\n`;
                propertyBlocks.set('pathParams', pathParamsBlock);
            }

            if (params) {
                let paramsBlock = `                params: [\n`;
                paramsBlock += params.map(p => formatParam(p)).join('');
                paramsBlock += `                ],\n`;
                propertyBlocks.set('params', paramsBlock);
            }

            if (requestBody) {
                let requestBodyBlock = `                requestBody: {\n`;
                if (requestBody.required) {
                    requestBodyBlock += `                    required: true,\n`;
                }
                requestBodyBlock += `                    type: 'object',\n`;
                if (requestBody.mediaType) {
                    requestBodyBlock += `                    mediaType: '${requestBody.mediaType}',\n`;
                }
                requestBodyBlock += `                    schema: ${indentJson(requestBody.schema, 20)},\n`;
                requestBodyBlock += `                },\n`;
                propertyBlocks.set('requestBody', requestBodyBlock);
            }

            for (const [property, value] of Object.entries(entry.mapping ?? {})) {
                if (property === 'module') continue;
                propertyBlocks.set(property, formatMappedActionProperty(property, value));
            }

            const body = [...propertyBlocks.values()].join('');
            actionBodies.push(body);
            recordAction(actionName, resultType, [reference]);
        }

        actionNameConflicts.push(...findActionNameConflicts(moduleName, generatedActions));

        // Compose module description
        const moduleDesc = `${display}管理，支持${actionDisplayNames.join('、')}`;

        let moduleStr = `    /* ${display}模块 */\n`;
        moduleStr += `    {\n`;
        moduleStr += `        name: '${escapeStr(moduleName)}',\n`;
        moduleStr += `        display: '${escapeStr(display)}',\n`;
        moduleStr += `        description: '${escapeStr(moduleDesc)}',\n`;
        moduleStr += `        actions: [\n`;
        for (let i = 0; i < actionBodies.length; i++) {
            if (i === 0) {
                moduleStr += `            {\n`;
            } else {
                moduleStr += `            }, {\n`;
            }
            moduleStr += actionBodies[i];
        }
        if (actionBodies.length > 0) {
            moduleStr += `            }\n`;
        }
        moduleStr += `        ],\n`;
        moduleStr += `    }`;
        modules.push(moduleStr);
        actionMetaByModule.push({ name: moduleName, actions: actionMeta });
    }

    // Assemble final output
    let output = `import type { ModuleDefinition } from '../types/index.js';\n\n`;
    output += `/**\n`;
    output += ` * 内置模块注册表：key 为模块名（小写），value 为对应禅道 REST 资源元数据。\n`;
    output += ` * 新增模块时优先更新 OpenAPI 数据并重新生成此文件。\n`;
    output += ` *\n`;
    output += ` * 此文件由 scripts/update-registry.ts 自动生成，请勿手动编辑。\n`;
    output += ` */\n`;
    output += `export const BUILTIN_MODULES = [\n`;
    output += modules.join(',\n\n');
    output += `\n] satisfies readonly ModuleDefinition[];\n\n`;
    output += `/** 内置模块动作的精简类型索引，供 request() 名称/返回值推导使用。 */\n`;
    output += `export type BuiltinActionMeta = {\n`;
    for (const module of actionMetaByModule) {
        output += `    ${formatTypePropertyName(module.name)}: {\n`;
        for (const [actionName, resultType] of module.actions) {
            output += `        ${formatTypePropertyName(actionName)}: { resultType: '${resultType}' };\n`;
        }
        output += `    };\n`;
    }
    output += `};\n`;
    output += `export type BuiltinModuleName = keyof BuiltinActionMeta;\n`;

    return {
        output,
        outputPath,
        actionMapPath,
        actionNameConflicts,
        moduleCount: moduleOrder.length,
        operationCount: moduleOrder.map(moduleName => moduleOps.get(moduleName)!.length).reduce((a, b) => a + b, 0),
    };
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatParam(p: RegistryParam): string {
    let s = `                    {\n`;
    s += `                        name: '${p.name}',\n`;
    s += `                        required: ${p.required},\n`;
    s += `                        type: '${p.type}',\n`;
    s += `                        description: '${escapeStr(p.description)}',\n`;
    if (p.defaultValue !== undefined) {
        s += `                        defaultValue: '${escapeStr(p.defaultValue)}',\n`;
    }
    if (p.options && p.options.length > 0) {
        s += `                        options: [\n`;
        for (const opt of p.options) {
            s += `                            { value: '${escapeStr(String(opt.value))}', label: '${escapeStr(opt.label)}' },\n`;
        }
        s += `                        ],\n`;
    }
    s += `                    },\n`;
    return s;
}

function escapeStr(s: string): string {
    return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function formatTypePropertyName(name: string): string {
    return /^[$A-Z_a-z][$\w]*$/.test(name) ? name : `'${escapeStr(name)}'`;
}

function formatMappedActionProperty(property: string, value: unknown): string {
    const key = formatTypePropertyName(property);
    const literal = typeof value === 'string'
        ? `'${escapeStr(value)}'`
        : indentJson(value, 16);
    return `                ${key}: ${literal},\n`;
}

function indentJson(obj: unknown, baseIndent: number): string {
    const json = JSON.stringify(obj, null, 4);
    const indent = ' '.repeat(baseIndent);
    const lines = json.split('\n');
    return lines.map((line, i) => i === 0 ? line : indent + line).join('\n');
}

function reportActionNameConflicts(result: RegistryBuildResult): void {
    const { actionNameConflicts: conflicts } = result;
    if (conflicts.length === 0) return;

    console.warn('');
    console.warn(`⚠️ Found ${conflicts.length} unresolved action name conflict group(s):`);
    for (const conflict of conflicts) {
        console.warn(`   ${conflict.moduleName}/${conflict.actionName}`);
        for (const action of conflict.actions) {
            for (const operation of action.operations) {
                const mappingStatus = operation.mapping
                    ? ` -> ${operation.mapping.module}/${operation.mapping.name}`
                    : ' (no mapping)';
                console.warn(`     - ${operation.mappingKey}${mappingStatus}`);
            }
        }
    }
    console.warn(`Add or update mappings in ${result.actionMapPath} so action names are unique within each module.`);
}

function main() {
    const result = buildRegistry();

    if (process.argv.includes('--check')) {
        const current = readFileSync(result.outputPath, 'utf-8');
        if (current !== result.output) {
            console.error('Generated module registry is out of date.');
            console.error('Run: bun run scripts/update-registry.ts');
            reportActionNameConflicts(result);
            process.exitCode = 1;
            return;
        }
        console.log(`✅ Registry is up to date: ${result.outputPath}`);
        console.log(`   ${result.moduleCount} modules, ${result.operationCount} operations`);
        reportActionNameConflicts(result);
        return;
    }

    writeFileSync(result.outputPath, result.output, 'utf-8');
    console.log(`✅ Generated ${result.outputPath}`);
    console.log(`   ${result.moduleCount} modules, ${result.operationCount} operations`);
    reportActionNameConflicts(result);
}

main();
