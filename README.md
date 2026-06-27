# zentao-api

[![npm version](https://img.shields.io/npm/v/zentao-api)](https://www.npmjs.com/package/zentao-api)
[![license](https://img.shields.io/npm/l/zentao-api)](./LICENSE)
[![node](https://img.shields.io/node/v/zentao-api)](https://nodejs.org)

Browser & Node.js SDK for [ZenTao](https://www.zentao.net) (禅道) API v2.

`zentao-api` 是一个面向禅道 API v2 的轻量 JavaScript/TypeScript SDK，可用于 Node.js 18+、浏览器打包工具以及 CDN/script 标签场景。

---

## 安装 / Install

```sh
npm install zentao-api
```

## 快速开始 / Quick Start

### 创建客户端

```ts
import { ZentaoClient } from 'zentao-api';

const client = new ZentaoClient({
  baseUrl: 'https://zentao.example.com',
  token: 'your-token',
});

const products = await client.get('/products');
```

`baseUrl` 是禅道站点根地址。SDK 会在内部追加 `/api.php/v2`。

### 账号密码登录

如果还没有 token，可以使用账号密码登录：

```ts
const client = new ZentaoClient('https://zentao.example.com');
const token = await client.login('admin', 'password');
```

### 全局客户端与模块请求

```ts
import { ZentaoClient, request, setGlobalOptions } from 'zentao-api';

ZentaoClient.init({
  baseUrl: 'https://zentao.example.com',
  token: 'your-token',
});

setGlobalOptions({ recPerPage: '50' });

const result = await request('product/list', {});
```

请求名支持三种写法：

```ts
await request('product');      // 默认调用 product/list
await request('product/list'); // 显式调用模块动作
await request('product/1');    // 详情快捷写法，等价于 product/get + id=1
```

单次调用的选项会覆盖全局选项：

```ts
const result = await request('bug/list', { product: 1 }, { limit: '10' });
```

### 从本地 Profile 恢复

SDK 支持将登录信息持久化到本地（Node.js: `~/.config/zentao/zentao.json`，浏览器: `localStorage`），后续可直接恢复客户端：

```ts
const client = await ZentaoClient.fromProfile();
// 或指定 profile key
const client = await ZentaoClient.fromProfile('admin@https://zentao.example.com');
```

## API 概览

### ZentaoClient

| 方法 | 说明 |
|------|------|
| `client.get<T>(path)` | GET 请求 |
| `client.post<T>(path, body)` | POST 请求 |
| `client.put<T>(path, body)` | PUT 请求 |
| `client.delete<T>(path)` | DELETE 请求 |
| `client.login(account, password)` | 账号密码登录，返回 token |
| `client.request(path, options?)` | 通用请求（底层方法） |
| `ZentaoClient.init(options)` | 创建全局单例客户端 |
| `ZentaoClient.create(options)` | 工厂方法创建客户端 |
| `ZentaoClient.fromProfile(key?)` | 从持久化 profile 恢复客户端 |

### 模块请求

| 函数 | 说明 |
|------|------|
| `request(name, params?, options?)` | 按 `"module"`、`"module/action"` 或 `"module/<objectID>"` 调用已注册模块 |
| `defineModules(modules, options?)` | 注册或扩展模块定义 |
| `defineModuleActions(module, actions)` | 为已有模块追加或替换动作 |
| `getModule(name)` | 获取模块定义 |
| `getModuleAction(module, action)` | 获取指定动作定义 |
| `setGlobalOptions(options)` | 设置全局默认选项 |
| `getGlobalOptions()` | 获取当前全局选项 |

## 错误处理

SDK 所有传输层错误均通过 `ZentaoError` 抛出，包含稳定的错误码：

```ts
import { ZentaoError } from 'zentao-api';

try {
  await client.get('/products');
} catch (error) {
  if (error instanceof ZentaoError) {
    console.error(error.code);    // e.g. 'E_HTTP_ERROR', 'E_TIMEOUT', 'E_NETWORK_ERROR'
    console.error(error.message);
  }
}
```

> **注意**：服务端返回 `{ status: "fail" }` 时 SDK 默认不会抛出异常，按原始响应内容返回。需要把业务失败转为异常时，可在单次请求或全局选项中启用 `throwOnFail`。HTTP/网络/超时等传输层错误始终会抛出 `ZentaoError`。

## 扩展模块

生成的模块定义来自 `scripts/update-registry.ts`。你可以在调用 `request()` 前扩展模块，或新增、替换动作。

### 新增模块

```ts
import { defineModules } from 'zentao-api';

defineModules({
  name: 'custom',
  actions: [
    {
      name: 'list',
      type: 'list',
      method: 'GET',
      path: '/custom',
      resultType: 'list',
      resultGetter: 'items',
    },
  ],
});
```

### 为已有模块追加动作

```ts
import { defineModuleActions } from 'zentao-api';

defineModuleActions('bug', {
  name: 'archive',
  type: 'action',
  method: 'PUT',
  path: '/bugs/{bugID}/archive',
  pathParams: { bugID: 'Bug ID' },
  resultType: 'text',
});
```

### 合并与替换

同名模块默认**合并**定义：同名动作会替换，未知动作会追加。如需**整体替换**模块，传入 `{ replace: true }`：

```ts
defineModules(myModule, { replace: true });
```

如果扩展定义拆分在多个文件中，请在应用启动入口中显式导入这些文件，确保它们在调用 `request()` 前完成注册。

## TypeScript 支持

SDK 提供完整的 TypeScript 类型定义，所有公共类型均可直接导入：

```ts
import type {
  ZentaoClientOptions,
  ModuleDefinition,
  ModuleAction,
  ResponseData,
  RequestOptions,
} from 'zentao-api';
```

## 浏览器

浏览器打包工具可以正常导入这个包：

```ts
import { ZentaoClient } from 'zentao-api';
```

如果使用 script 标签，请使用浏览器构建包，并从 `window.ZentaoAPI` 读取 API：

```html
<script src="https://cdn.jsdelivr.net/npm/zentao-api@latest/dist/browser/zentao-api.global.js"></script>
<script>
  console.log(window.ZentaoAPI.VERSION, window.ZentaoAPI.BUILD);
  const client = new window.ZentaoAPI.ZentaoClient('https://zentao.example.com');
</script>
```

> **CORS**：浏览器直接请求要求禅道服务器允许 CORS。浏览器代码也会把 token 暴露给前端；如果这不可接受，请使用后端代理。
>
> **TLS**：`insecure` TLS 选项仅适用于 Node.js，在浏览器运行时会抛出错误。

## 测试

```sh
bun test              # 单元测试
bun run test:coverage # 含覆盖率的单元测试
bun run check         # 完整 CI 流程：测试 + 类型检查 + 注册表 + 构建 + 冒烟测试
```

### 真实环境测试

真实环境测试需要连接到运行中的禅道实例，不包含在默认 `bun test` 中：

```sh
bun run test:real
bun run test:real -- --keep-test-data   # 保留临时数据以便手动检查
```

测试会优先读取 `.env.local`，如果不存在则读取 `env.local`。支持的环境变量：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `ZENTAO_URL` | 禅道站点地址 | *(必填)* |
| `ZENTAO_ACCOUNT` | 登录账号 | *(必填)* |
| `ZENTAO_PASSWORD` | 登录密码 | *(必填)* |
| `ZENTAO_TOKEN` | 直接提供 Token（替代账号密码） | — |
| `ZENTAO_REVIEWER` | 需求评审人（未设置时复用 `ZENTAO_ACCOUNT`） | — |
| `ZENTAO_KEEP_TEST_DATA` | 保留临时测试数据 | `false` |
| `ZENTAO_TIMEOUT` | 请求超时（ms） | `30000` |
| `ZENTAO_INSECURE` | 跳过 TLS 证书验证 | `false` |

## 项目结构

```
zentao-api/
├── src/
│   ├── client/         # ZentaoClient 核心实现
│   ├── modules/        # 模块注册表与解析逻辑
│   │   ├── generated.ts  # 自动生成，勿手动编辑
│   │   ├── registry.ts   # 运行时注册表
│   │   └── resolve.ts    # 路径模板与参数解析
│   ├── request/        # 高阶请求函数
│   ├── profiles/       # 本地 profile 持久化
│   ├── misc/           # 错误、全局选项、环境检测
│   ├── types/          # TypeScript 类型定义
│   ├── utils/          # 通用工具函数
│   └── index.ts        # 公共 API 入口
├── scripts/            # 构建与代码生成脚本
├── tests/              # 单元测试与真实环境测试
├── data/               # OpenAPI 规范文件
└── dist/               # 构建产物
```

## 贡献

欢迎贡献代码！请确保提交前通过完整检查：

```sh
bun run check
```

## 许可证 / License

[MIT](./LICENSE)
