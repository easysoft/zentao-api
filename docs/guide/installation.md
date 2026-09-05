# 安装与配置

## 安装包

```sh
npm install zentao-api
```

如果项目使用 Bun：

```sh
bun add zentao-api
```

## 客户端配置

```ts
import { ZentaoClient } from 'zentao-api';

const client = new ZentaoClient({
  baseUrl: 'https://zentao.example.com',
  token: 'your-token',
  timeout: 10_000,
  insecure: false,
});
```

| 选项 | 类型 | 说明 |
| --- | --- | --- |
| `baseUrl` | `string` | 禅道站点根地址，不包含 `/api.php/v2`。 |
| `token` | `string` | 禅道 API Token；也可通过 `login()` 获取。 |
| `timeout` | `number` | 默认请求超时时间，单位毫秒。 |
| `insecure` | `boolean` | 跳过 TLS 证书验证，仅 Node.js 运行时支持。 |

## 全局选项

`ZentaoClient.init()` 会创建客户端并写入全局选项，供高阶 `request()` 使用。

```ts
import { ZentaoClient, request, setGlobalOptions } from 'zentao-api';

ZentaoClient.init({
  baseUrl: 'https://zentao.example.com',
  token: 'your-token',
});

setGlobalOptions({
  recPerPage: '50',
  limit: '20',
  timeout: 30_000,
  throwOnFail: false,
});

const bugs = await request('bug/list', { productID: 1 });
```

| 选项 | 类型 | 说明 |
| --- | --- | --- |
| `client` | `ZentaoClient` | 高阶 `request()` 使用的默认客户端，由 `ZentaoClient.init()` 自动写入。 |
| `version` | `string` | 当前禅道正式版本，例如 `biz13.5`；普通高阶请求直接使用，单次 `forceRefreshConfig` 优先。 |
| `skipVersionCheckOnConfigError` | `boolean` | 配置获取失败时允许登录继续或请求跳过版本检查，默认 `false`；不忽略明确的版本不匹配。 |
| `recPerPage` | `string` | 默认每页记录数，映射到模块动作的 `recPerPage` 参数。 |
| `limit` | `string` | 限制 SDK 归一化后 `data` 的数量，不改变服务端页大小。 |
| `timeout` | `number` | 默认请求超时时间，毫秒。 |
| `insecure` | `boolean` | 跳过 TLS 证书验证，仅 Node.js 支持。 |
| `persistProfiles` | `boolean` | 登录成功后是否把账号、Token 写入本地 profile。 |
| `throwOnFail` | `boolean` | 当禅道返回 `{ status: "fail" }` 时是否抛出 `E_API_FAILED`，默认 `false`。 |

单次调用传入的 options 优先级高于全局选项。

```ts
const bugs = await request(
  'bug/list',
  { productID: 1 },
  { recPerPage: '10', limit: '5', throwOnFail: true },
);
```

## TypeScript

SDK 的公开类型可从包根直接导入：

```ts
import type {
  ModuleAction,
  ModuleDefinition,
  RequestOptions,
  ResponseData,
  ZentaoClientOptions,
} from 'zentao-api';
```

完整类型列表见 [Reference](/reference/)。
