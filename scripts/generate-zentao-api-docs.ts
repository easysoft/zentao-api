import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { getModule, getModuleNames } from '../src/modules/registry.js';
import type { ModuleAction, ModuleActionParam, ModuleDefinition } from '../src/types/index.js';

export interface RenderedZentaoApiDocs {
  index: string;
  pages: Array<{
    slug: string;
    title: string;
    content: string;
  }>;
  sidebar: Array<{
    text: string;
    link?: string;
    collapsed?: boolean;
    items?: Array<{ text: string; link: string }>;
  }>;
}

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUTPUT_DIR = resolve(ROOT, 'docs/zentao-api');

function escapeTable(value: unknown): string {
  return String(value ?? '')
    .replace(/\r?\n/g, '<br>')
    .replace(/\|/g, '\\|');
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'module';
}

function titleOf(module: ModuleDefinition): string {
  return module.display ? `${module.display} (${module.name})` : String(module.name);
}

function paramDescription(value: string | Omit<ModuleActionParam, 'name'>): string {
  return typeof value === 'string' ? value : value.description ?? '';
}

function typeName(param: ModuleActionParam): string {
  return param.type ?? 'string';
}

function defaultValue(param: ModuleActionParam): string {
  return param.defaultValue === undefined ? '' : `\`${String(param.defaultValue)}\``;
}

function renderPathParams(action: ModuleAction): string {
  if (!action.pathParams || Object.keys(action.pathParams).length === 0) {
    return '无路径参数。';
  }

  const rows = Object.entries(action.pathParams)
    .map(([name, value]) => `| \`${escapeTable(name)}\` | ${escapeTable(paramDescription(value))} |`)
    .join('\n');

  return [
    '| 参数 | 说明 |',
    '| --- | --- |',
    rows,
  ].join('\n');
}

function renderQueryParams(action: ModuleAction): string {
  if (!action.params || action.params.length === 0) {
    return '无查询参数。';
  }

  const rows = action.params
    .map((param) => {
      const options = param.options?.map((option) => `\`${option.value}\` ${option.label}`).join('<br>') ?? '';
      return `| \`${escapeTable(param.name)}\` | ${escapeTable(typeName(param))} | ${param.required ? '是' : '否'} | ${defaultValue(param)} | ${escapeTable(param.description ?? '')}${options ? `<br>${escapeTable(options)}` : ''} |`;
    })
    .join('\n');

  return [
    '| 参数 | 类型 | 必填 | 默认值 | 说明 |',
    '| --- | --- | --- | --- | --- |',
    rows,
  ].join('\n');
}

function schemaExample(schema: Record<string, unknown> | undefined): unknown {
  if (!schema) return {};
  if (schema.example !== undefined) return schema.example;

  const type = schema.type;
  if (type === 'array') {
    return [schemaExample(schema.items as Record<string, unknown> | undefined)];
  }
  if (type === 'integer' || type === 'number') return 1;
  if (type === 'boolean') return true;
  if (type === 'string') return '<string>';

  const properties = schema.properties as Record<string, Record<string, unknown>> | undefined;
  if (!properties) return {};

  const result: Record<string, unknown> = {};
  for (const [key, propertySchema] of Object.entries(properties)) {
    result[key] = schemaExample(propertySchema);
  }
  return result;
}

function renderRequestBody(action: ModuleAction): string {
  if (!action.requestBody) {
    return '无请求体。';
  }

  const required = action.requestBody.required ? '是' : '否';
  const schema = JSON.stringify(action.requestBody.schema, null, 2);
  const example = JSON.stringify(action.requestBody.example ?? schemaExample(action.requestBody.schema), null, 2);

  return [
    `请求体必填：${required}`,
    '',
    'Schema:',
    '',
    '```json',
    schema,
    '```',
    '',
    '示例:',
    '',
    '```json',
    example,
    '```',
  ].join('\n');
}

function renderResponse(action: ModuleAction): string {
  const lines = [
    `- 返回形态：\`${action.resultType}\``,
  ];
  if (action.resultGetter) {
    lines.push(`- 结果字段：\`${typeof action.resultGetter === 'string' ? action.resultGetter : 'custom'}\``);
  }
  if (action.pagerGetter) {
    lines.push(`- 分页字段：\`${typeof action.pagerGetter === 'string' ? action.pagerGetter : 'custom'}\``);
  }
  return lines.join('\n');
}

function paramsExample(action: ModuleAction): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(action.pathParams ?? {})) {
    const detail = typeof value === 'string' ? undefined : value;
    params[name] = detail?.defaultValue ?? (name.toLowerCase().endsWith('id') ? 1 : '<string>');
  }
  for (const param of action.params ?? []) {
    params[param.name] = param.defaultValue ?? param.options?.[0]?.value ?? (param.type === 'number' ? 1 : '<string>');
  }
  if (action.requestBody?.schema) {
    Object.assign(params, schemaExample(action.requestBody.schema));
  }
  return params;
}

function renderSdkExample(module: ModuleDefinition, action: ModuleAction): string {
  const params = paramsExample(action);
  const hasParams = Object.keys(params).length > 0;
  const call = hasParams
    ? `const result = await request("${module.name}/${action.name}", ${JSON.stringify(params, null, 2)});`
    : `const result = await request("${module.name}/${action.name}");`;

  return [
    '```ts',
    "import { request } from 'zentao-api';",
    '',
    call,
    '```',
  ].join('\n');
}

function renderAction(module: ModuleDefinition, action: ModuleAction): string {
  const title = action.display || String(action.name);
  const description = action.description ? `\n${action.description}\n` : '';

  return [
    `## ${title}`,
    description,
    `- SDK 调用：\`request("${module.name}/${action.name}", params)\``,
    `- HTTP：\`${String(action.method).toUpperCase()} ${action.path}\``,
    `- 动作类型：\`${action.type}\``,
    '',
    '### 路径参数',
    '',
    renderPathParams(action),
    '',
    '### 查询参数',
    '',
    renderQueryParams(action),
    '',
    '### 请求体',
    '',
    renderRequestBody(action),
    '',
    '### 返回值',
    '',
    renderResponse(action),
    '',
    '### SDK 示例',
    '',
    renderSdkExample(module, action),
  ].join('\n');
}

function renderModulePage(module: ModuleDefinition): string {
  const rows = module.actions
    .map((action) => `| \`${action.name}\` | ${escapeTable(action.display ?? '')} | \`${String(action.method).toUpperCase()}\` | \`${escapeTable(action.path)}\` |`)
    .join('\n');

  return [
    `# ${titleOf(module)}`,
    '',
    module.description ?? '',
    '',
    '## 动作概览',
    '',
    '| SDK 动作 | 说明 | 方法 | 路径 |',
    '| --- | --- | --- | --- |',
    rows,
    '',
    ...module.actions.map((action) => renderAction(module, action)),
    '',
  ].join('\n');
}

export function getRegistryModules(): ModuleDefinition[] {
  return getModuleNames().map((name) => getModule(name));
}

export function renderZentaoApiDocs(modules: ModuleDefinition[]): RenderedZentaoApiDocs {
  const pages = modules.map((module) => ({
    slug: slugify(String(module.name)),
    title: titleOf(module),
    content: renderModulePage(module),
  }));

  const indexRows = modules
    .map((module, index) => `| [${escapeTable(module.display ?? module.name)}](./${pages[index].slug}.md) | \`${escapeTable(module.name)}\` | ${module.actions.length} | ${escapeTable(module.description ?? '')} |`)
    .join('\n');

  const index = [
    '# ZenTao API',
    '',
    '本节从 SDK 当前运行时模块注册表动态生成，内容对应 `request("module/action")` 可调用的模块动作。',
    '',
    '| 模块 | SDK 名称 | 动作数 | 说明 |',
    '| --- | --- | --- | --- |',
    indexRows,
    '',
  ].join('\n');

  const sidebar = [
    {
      text: 'ZenTao API',
      items: [
        { text: '概览', link: '/zentao-api/' },
        ...pages.map((page) => ({ text: page.title, link: `/zentao-api/${page.slug}` })),
      ],
    },
  ];

  return { index, pages, sidebar };
}

export function writeZentaoApiDocs(outputDir = OUTPUT_DIR): RenderedZentaoApiDocs {
  const rendered = renderZentaoApiDocs(getRegistryModules());
  rmSync(outputDir, { recursive: true, force: true });
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(join(outputDir, 'index.md'), rendered.index);
  writeFileSync(join(outputDir, 'sidebar.json'), `${JSON.stringify(rendered.sidebar, null, 2)}\n`);
  for (const page of rendered.pages) {
    writeFileSync(join(outputDir, `${page.slug}.md`), page.content);
  }
  return rendered;
}

if (import.meta.main) {
  const rendered = writeZentaoApiDocs();
  console.log(`Generated ${rendered.pages.length} ZenTao API module pages.`);
}
