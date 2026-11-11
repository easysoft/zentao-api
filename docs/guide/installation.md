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
| `actionAssistant` | `ActionAssistant` | 操作辅助工具标记，支持字符串或 `{ name, info? }`，默认不发送。 |
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
| `actionAssistant` | `ActionAssistant` | 默认操作辅助工具标记，覆盖客户端配置，空字符串表示关闭，不保存到 profile。 |
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

## 操作辅助工具标记

通过 `actionAssistant` 设置 `ZenTao-Action-Assistant` 请求头，已支持该功能的服务端会将标记记录到操作日志中。客户端构造参数、全局配置和底层或高阶请求均支持同一个 `ActionAssistant` 类型：

```ts
import { request, setGlobalOptions, type ActionAssistant } from 'zentao-api';

setGlobalOptions({ actionAssistant: 'ZenTao CLI <zentao-cli 0.4.1>' });

const actionAssistant: ActionAssistant = { name: 'AI', info: 'zentao ipd_5.0' };
await request('bug/update', { id: 7, title: '修复登录失败' }, { actionAssistant });
// 发送 ZenTao-Action-Assistant: AI <zentao ipd_5.0>

await request('bug/update', { id: 7, title: '人工修改标题' }, { actionAssistant: '' });
// 本次关闭标记，后续请求继续使用全局默认值。
```

- 字符串直接作为头值；对象去除字段首尾空白后序列化为 `name <info>`，`info` 缺省或为空时只发送名称。
- 对象的 `name` 必须是非空字符串，`info` 若提供必须是字符串；两个字段都不能包含尖括号或控制字符，无效对象抛出 `E_INVALID_PARAM`。
- 最终头值沿用原生 `Headers` 校验，不额外编码或截断；不能直接发送中文等非 Latin-1 字符。
- 优先级为：单次 `actionAssistant` > 单次 `headers` 中的同名头 > 全局配置 > 客户端默认值。对象整体替换，不按字段合并。
- `undefined` 表示继承，字符串 `''` 表示关闭并移除请求头。配置仅运行时有效，不随登录保存到 profile。

登录、普通 API 请求、上传和内部预取请求都会携带有效标记；匿名 `getZentaoConfig()` 探测不携带。自定义 `ModuleAction.request` 回调应将收到的 `actionAssistant` 继续传给客户端及回调内部的后续请求。

浏览器跨域调用时，服务端的 CORS 请求头允许列表需要包含 `ZenTao-Action-Assistant`。

## TypeScript

SDK 的公开类型可从包根直接导入：

```ts
import type {
  ActionAssistant,
  ModuleAction,
  ModuleDefinition,
  RequestOptions,
  ResponseData,
  ZentaoClientOptions,
} from 'zentao-api';
```

完整类型列表见 [Reference](/reference/)。
