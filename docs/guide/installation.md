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
});

const bugs = await request('bug/list', { productID: 1 });
```

单次调用传入的 options 优先级高于全局选项。

```ts
const bugs = await request(
  'bug/list',
  { productID: 1 },
  { recPerPage: '10', limit: '5' },
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
