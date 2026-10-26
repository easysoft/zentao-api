# zentao-api

[![npm version](https://img.shields.io/npm/v/zentao-api)](https://www.npmjs.com/package/zentao-api)
[![Node.js](https://img.shields.io/node/v/zentao-api)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/zentao-api)](https://github.com/easysoft/zentao-api/blob/main/LICENSE)

Browser & Node.js SDK for [ZenTao](https://www.zentao.net) (禅道) API v2.

`zentao-api` 是一个零运行时依赖的 JavaScript/TypeScript SDK，提供底层 REST 客户端和基于模块注册表的高阶请求接口，可运行在 Node.js 18+、Bun、浏览器打包工具及 CDN/script 标签环境中。

[快速开始](#快速开始) · [调用方式](#两种调用方式) · [浏览器](#浏览器) · [完整文档](#文档)

## 特性

- 两层 API：使用 `ZentaoClient` 直接调用 REST 路径，或使用 `request("module/action")` 自动组装路径、查询参数和请求体。
- 完整类型提示：内置请求名、参数和 `data` 返回值可由 TypeScript 自动推导。
- 统一响应结构：自动提取业务数据和分页信息，稳定返回 `ResponseData<T>`。
- 覆盖禅道常用模块：产品、项目、执行、需求、任务、Bug、测试、版本、发布等。
- 内置本地数据处理：支持转换、过滤、搜索、排序、限制数量和字段摘取。
- 可扩展模块注册表、持久化 Profile、稳定错误码及 Node.js 自签名证书支持。

## 安装

```sh
npm install zentao-api
```

使用 Bun：

```sh
bun add zentao-api
```

包采用 ESM，并自带 TypeScript 类型定义。Node.js 需要 18 或更高版本。

## 快速开始

推荐通过 `ZentaoClient.init()` 配置全局客户端，再使用高阶 `request()` 调用内置模块：

```ts
import { ZentaoClient, request } from 'zentao-api';

ZentaoClient.init({
  baseUrl: 'https://zentao.example.com',
  token: 'your-token',
});

const result = await request('product/list', {
  browseType: 'all',
  recPerPage: 20,
  pageID: 1,
});

console.log(result.data);         // 产品列表
console.log(result.pager?.total); // 总记录数
```

`baseUrl` 填写禅道站点根地址；SDK 会自动拼接 `/api.php/v2`，并在后续请求中注入 `Token` 请求头。

### 使用账号密码登录

没有 token 时，可以先登录。`ZentaoClient.init()` 返回的实例同时也是 `request()` 使用的全局客户端：

```ts
import { ZentaoClient, request } from 'zentao-api';

const client = ZentaoClient.init({
  baseUrl: 'https://zentao.example.com',
});

await client.login('admin', 'password');

const products = await request('product/list');
```

请从环境变量或安全配置中读取账号、密码和 token，不要将凭据提交到代码仓库。

## 两种调用方式

| 调用方式 | 适合场景 | 返回值 |
| --- | --- | --- |
| `request("module/action")` | 调用注册表中的常用禅道 API，自动处理参数与分页 | 统一的 `ResponseData<T>` |
| `ZentaoClient` | 调用尚未注册的路径、上传文件或读取二进制响应 | 禅道原始响应体 |

### 高阶模块请求

请求名支持三种写法：

```ts
await request('product');      // product/list
await request('product/list'); // 显式动作名
await request('product/1');    // product/get，且对象 ID 为 1
```

带作用域的列表可以传产品、项目或执行 ID，SDK 会自动选择实际路径：

```ts
const bugs = await request('bug/list', {
  productID: 1,
  browseType: 'unclosed',
});

// 也可以显式指定作用域：
const projectBugs = await request('bug/list', {
  scope: 'projects',
  scopeID: 8,
});
```

单次调用选项会覆盖全局选项。下面的处理只作用于 SDK 返回的 `data`，不会改变服务端数据：

```ts
const bugs = await request(
  'bug/list',
  { productID: 1, recPerPage: 100 },
  {
    filter: ['status=active,pri>=2'],
    search: ['登录'],
    sort: 'pri:desc,id:asc',
    limit: '10',
    pick: ['id', 'title', 'pri'],
  },
);
```

更多过滤语法和处理顺序见[本地数据处理指南](https://github.com/easysoft/zentao-api/blob/main/docs/guide/data-processing.md)。

### 统一返回结构

除非启用 `raw`，`request()` 始终返回以下结构：

```ts
interface ResponseData<T> {
  status: 'success' | 'fail';
  message?: string;
  data?: T;
  pager?: {
    total: number;
    page: number;
    recPerPage: number;
  };
}
```

内置请求会自动推导参数和数据类型；自定义调用也可以显式收窄 `data`：

```ts
interface ProductSummary {
  id: number;
  name: string;
}

const result = await request<ProductSummary[]>('product/list', {});
result.data?.forEach((product) => console.log(product.name));
```

需要完整服务端响应时，传入 `{ raw: true }`。此时会跳过响应归一化、本地数据处理和 `throwOnFail`：

```ts
const raw = await request('product/list', {}, { raw: true });
```

### 上传附件

Node.js/Bun 可以直接把本地文件路径交给高阶 `request()`；SDK 会根据模块注册表构造 `multipart/form-data`。浏览器中请传 `File` 或 `Blob`，不能传本地路径。

```ts
const uploaded = await request('file/create', {
  file: '/tmp/zentao-api-upload.txt',
  objectType: 'story',
  objectID: 1,
});

console.log(uploaded.data?.id, uploaded.data?.url);
```

单个本地文件或 Blob 默认限制为 50 MiB；可通过单次调用选项 `maxUploadBytes` 调整。

### 底层 REST 客户端

`ZentaoClient` 适合直接调用 API v2 路径：

```ts
import { ZentaoClient } from 'zentao-api';

const client = new ZentaoClient({
  baseUrl: 'https://zentao.example.com',
  token: 'your-token',
  timeout: 10_000,
});

const products = await client.get('/products');
const product = await client.get('/products/1');
const created = await client.post('/products', { name: '新产品' });
```

通用 `client.request()` 还支持自定义请求头、查询参数、`AbortSignal`、`FormData`，以及 `text`、`arrayBuffer`、`blob`、`response` 等响应类型。

## 配置

### 客户端选项

| 选项 | 类型 | 说明 |
| --- | --- | --- |
| `baseUrl` | `string` | 禅道站点根地址；SDK 自动处理 `/api.php/v2`。 |
| `token` | `string` | 禅道 API Token；也可稍后通过 `login()` 获取。 |
| `timeout` | `number` | 默认请求超时时间，单位为毫秒，默认 `10000`。 |
| `insecure` | `boolean` | 跳过 TLS 证书校验，仅支持 Node.js 运行时。 |

### 全局选项

```ts
import { setGlobalOptions } from 'zentao-api';

setGlobalOptions({
  recPerPage: '50',
  limit: '20',
  timeout: 30_000,
  throwOnFail: true,
  autoFill: false,
});
```

常用全局选项包括 `client`、`version`、`recPerPage`、`limit`、`timeout`、`insecure`、`persistProfiles`、`skipVersionCheckOnConfigError`、`throwOnFail` 和 `autoFill`。优先级通常为：单次调用选项 > 全局选项 > 客户端默认值。

### 禅道版本检查

高阶 `request()` 会在发送业务请求前检查 Action 的必填 `minVersion`。四个系列分别比较，例如 `22.5`、`biz13.5`、`max8.5`、`ipd5.5`；支持点分数字正式版本，暂不支持 alpha、beta、rc 等后缀。底层 `client.get/post/request` 不检查 Action 版本。

```ts
setGlobalOptions({ version: 'biz13.5' });
await request('story/getGrades'); // 直接使用全局版本，无需获取配置
await request('story/getGrades', {}, { forceRefreshConfig: true }); // 用服务器实际版本校验本次请求

const config = await client.getZentaoConfig(); // 复用有效缓存，缺失或过期时获取
const freshConfig = await client.getZentaoConfig({ forceRefresh: true });
```

`getZentaoConfig()` 只需站点地址，无需登录或 profile；未提供 Token 或 Token 已过期时都可调用。请求不发送 API Token，浏览器中还会显式省略 Cookie 等凭据，因此可以在登录前查询版本：

```ts
const siteClient = new ZentaoClient('https://zentao.example.com');
const { version } = await siteClient.getZentaoConfig();
```

强制刷新不会改写全局 `version`。未指定全局版本时，使用不超过 24 小时的缓存；缓存缺失、过期或时间异常时访问站点根地址的 `/?mode=getconfig`。登录验证成功后也会强制获取一次，即使已设置全局版本。

配置获取失败默认停止调用；可以通过全局或单次 `skipVersionCheckOnConfigError: true` 跳过本次检查。该选项不忽略版本不匹配、版本格式错误、取消或 profile 存储错误。版本不匹配抛出 `E_UNSUPPORTED_ZENTAO_VERSION`。

### 持久化 Profile

`login()` 默认不会自动写入 Profile。先启用 `persistProfiles`，登录成功后才会保存站点、账号、token、客户端配置，以及 `serverConfig` 和获取时间 `serverConfigFetchedAt`：

```ts
import { ZentaoClient, setGlobalOptions } from 'zentao-api';

setGlobalOptions({ persistProfiles: true });

const client = ZentaoClient.init({
  baseUrl: 'https://zentao.example.com',
});

await client.login('admin', 'password');
```

后续可以恢复当前 Profile；如需继续调用高阶 `request()`，再把恢复的客户端设为全局客户端：

```ts
const client = await ZentaoClient.fromProfile();
setGlobalOptions({ client });

// 或指定 profile key
const another = await ZentaoClient.fromProfile(
  'admin@https://zentao.example.com',
);

// 只读取并恢复，不切换当前 Profile、不更新使用时间、不写存储。
const isolated = await ZentaoClient.fromProfile(
  'admin@https://zentao.example.com', { activate: false },
);
```

| 环境 | 存储位置 |
| --- | --- |
| Node.js / Bun | `~/.config/zentao/zentao.json` |
| 浏览器 | `localStorage` |

Profile 包含可直接调用 API 的 token，请按敏感凭据保护其存储位置。

## 错误处理

HTTP、网络、超时、参数、模块解析和 Profile 错误会统一抛出带稳定错误码的 `ZentaoError`：

```ts
import { request, ZentaoError } from 'zentao-api';

try {
  await request('bug/resolve', {
    bugID: 1001,
    resolution: 'fixed',
  }, {
    throwOnFail: true,
  });
} catch (error) {
  if (error instanceof ZentaoError) {
    console.error(error.code);    // 例如 E_HTTP_ERROR、E_TIMEOUT
    console.error(error.message);
    console.error(error.details);
  }
}
```

禅道返回 `{ status: "fail" }` 属于业务失败，默认仍作为 `ResponseData` 返回；只有启用单次或全局 `throwOnFail` 后，才会抛出 `E_API_FAILED`。HTTP、网络和超时等传输层错误始终抛出异常。

## 浏览器

Vite、Webpack、Rspack 等打包工具可以从包根导入；需要显式选择浏览器入口时使用 `zentao-api/browser`：

```ts
import { ZentaoClient, request } from 'zentao-api/browser';
```

使用 script 标签时，UMD 构建会将公共 API 暴露到 `window.ZentaoAPI`：

```html
<script src="https://cdn.jsdelivr.net/npm/zentao-api@latest/dist/browser/zentao-api.global.js"></script>
<script>
  const client = new window.ZentaoAPI.ZentaoClient({
    baseUrl: 'https://zentao.example.com',
    token: 'your-token',
  });

  console.log(window.ZentaoAPI.VERSION);
</script>
```

> 浏览器直连要求禅道服务器允许 CORS，并会向前端暴露 token；敏感场景请通过后端代理。`insecure` 仅适用于 Node.js，在浏览器中使用会抛出 `E_INSECURE_BROWSER`。

## 模块注册表与扩展

可以在运行时查看 SDK 当前支持的模块、动作和参数：

```ts
import {
  getModule,
  getModuleAction,
  getModuleActionParams,
  getModuleNames,
  getObjectProps,
} from 'zentao-api';

const modules = getModuleNames();
const action = getModuleAction('bug', 'create');
const params = getModuleActionParams('bug', 'create');
const labels = getObjectProps('bug');

const supported = getModule('story', { version: 'biz13.0' });
const unavailable = getModuleAction('story', 'getGrades', { version: 'biz13.0' }); // undefined
const supportedParams = getModuleActionParams('story', 'create', { version: 'biz13.0', roles: ['body'] });
```

模块查询只使用显式传入的 `version`，省略时返回当前完整定义，不受全局版本影响。过滤后没有动作的模块不返回。旧 Action 后续新增的参数仍按当前定义返回，不做参数级版本过滤。

未注册的 API 可以新增为自定义模块：

```ts
import { defineModules } from 'zentao-api';

defineModules({
  name: 'custom',
  actions: [
    {
      name: 'list',
      minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
      type: 'list',
      path: '/custom',
      resultGetter: 'items',
    },
  ],
});
```

只需修改已有动作的个别字段时，使用 `extendModuleAction()`；补丁对象会深度合并，数组会整体替换：

```ts
import { extendModuleAction } from 'zentao-api';

extendModuleAction('task', 'list', {
  path: '/executions/{executionID}/tasks',
  pathParams: { executionID: '执行 ID' },
});
```

`defineModuleActions()` 可追加或整体替换单个动作，`defineModules(module, { replace: true })` 可整体替换同名模块。请确保扩展代码在第一次调用 `request()` 前执行。

所有完整 Action 定义都必须包含非空的 `minVersion` 数组，同一系列不能重复；未列出的系列视为不支持。SDK 0.5.5 及之前已有的 Action 最低版本为 `22.0 / biz13.0 / max8.0 / ipd5.0`，之后新增的 Action 为 `22.5 / biz13.5 / max8.5 / ipd5.5`。

## 文档

- [快速开始](https://github.com/easysoft/zentao-api/blob/main/docs/guide/index.md)
- [安装与配置](https://github.com/easysoft/zentao-api/blob/main/docs/guide/installation.md)
- [常见 API 示例](https://github.com/easysoft/zentao-api/blob/main/docs/guide/examples.md)
- [Profile 与错误处理](https://github.com/easysoft/zentao-api/blob/main/docs/guide/profiles-and-errors.md)
- [SDK API Reference](https://github.com/easysoft/zentao-api/tree/main/docs/reference)
- [ZenTao 模块与动作列表](https://github.com/easysoft/zentao-api/tree/main/docs/zentao-api)
- [变更日志](https://github.com/easysoft/zentao-api/blob/main/CHANGES.md)

## 开发与贡献

本仓库只使用 [Bun](https://bun.sh) 管理开发依赖，请勿使用 npm、pnpm 或 yarn 安装仓库依赖，以免生成额外 lockfile。

```sh
bun install
bun test                  # 单元测试
bun run test:real         # 真实禅道环境集成测试
bun run docs:dev          # 生成并预览文档站
bun run check             # 完整 CI：测试、类型检查、注册表、构建、冒烟测试
```

`bun run test:real` 会依次读取 `.env.local` 和 `env.local`，已有环境变量优先，需要配置 `ZENTAO_URL`（或 `ZENTAO_BASE_URL`），以及 `ZENTAO_TOKEN` 或 `ZENTAO_ACCOUNT` / `ZENTAO_PASSWORD`。配置文件已被 Git 忽略，日志不输出密码或 Token。使用 `bun run test:real -- --keep-test-data` 可保留测试创建的数据，供排查失败场景。

认证后首先创建名称唯一的临时产品，需求、计划、项目、执行和其他业务数据均围绕该产品创建。场景独立执行，某个接口或断言失败后仍会继续其他场景；最后按依赖顺序清理，删除临时产品并通过产品列表确认删除结果。某条清理请求失败不会阻止后续清理，失败资源的 ID 会保存在报告中。默认 `bun test` 不会执行真实环境测试。

测试创建和更新项目时会复用现有 Scrum 项目的有效项目流程，也可通过 `ZENTAO_WORKFLOW_GROUP` 显式指定流程 ID。没有可复用流程时默认使用开源版的 `0`；付费版需要指定有效的流程 ID。

真实环境测试按场景执行，覆盖以下流程：

- 产品、项目集、项目、执行、计划，以及用户和团队成员维护。
- 研发需求、业务需求、用户需求、任务、Bug、测试用例和模块目录的增删改查、状态流转，以及产品/项目/执行范围的列表。
- 应用查询和修改、构建、测试单、发布、反馈、工单、转化操作和待办。
- 个人、团队、产品、项目四类文档空间中的文档库、目录、文档，以及个人工作列表、会议和自定义合同工作流。
- 过程裁剪、质量保证计划和检查、不符合项、机会、交付物、基线、变更、周报、对象关联、项目流程和资源日历。
- 独立临时工作流及其字段、动作、标签、子表、数据源、验证规则、配置、发布和状态流转。
- 数据库元数据及临时产品的只读 SQL 查询、知识库和知识详情/搜索、代码空间、绑定临时产品的代码库和一次性 SSH 公钥。

使用 Token 时仍需设置 `ZENTAO_ACCOUNT` 或 `ZENTAO_REVIEWER`，供负责人、成员和评审人字段使用。全局配置类接口使用本次运行创建的独立数据；只能读取的知识库、代码空间和报告分类会复用环境已有配置，环境中需有可读知识条目和已配置的 GitFox/向量检索服务。`--keep-test-data` 会保留新增场景的数据；原有生命周期场景中的“删除第二个任务”仍会执行，该模式不能作为完整删除覆盖的验收结果。

问题、风险、应用、代码库和 SSH 公钥没有注册删除 API，测试仍会执行这些写操作，并在报告的 `retainedResources` 中记录 ID 或名称，便于后续手工清理。SSH 私钥不会保存。临时产品仍按正常流程删除；测试应仅在允许这些操作的环境运行。

每次运行会输出接口统计并写入 `coverage/real-env.json`，同时在 `coverage/real-env/` 保留带时间戳的报告（均已被 Git 忽略）。报告列出已执行、成功、失败、尚未测试的动作及实际访问的不同路径，同时记录临时产品 ID、退出码、耗时、清理错误和未清理资源。动作只要出现一次失败就归入失败，即使另一组参数调用成功；接口成功也不代表后续场景断言通过，应同时检查退出码和 `passed`。

默认模式按当前注册表检查全部动作：接口失败、场景断言失败、清理失败或仍有未测试动作都会导致非零退出码。服务端模块缺失、工作流未发布、自定义必填字段、权限或外部服务异常均如实报错，不自动跳过。前置资源创建失败时，依赖它的动作会保留在 `untested` 中，不能计为通过；修复环境问题后重新运行验证。

模块注册表由 `data/zentao-openapi.json` 生成。请勿手动编辑 `src/modules/generated.ts`；更新规范后运行：

```sh
bun run scripts/update-registry.ts
bun run docs:generate
```

提交代码前请确保 `bun run check` 通过。欢迎提交 Issue 和 Pull Request。

## License

[MIT](https://github.com/easysoft/zentao-api/blob/main/LICENSE)
