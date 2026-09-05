[zentao-api](../index.md) / ZentaoClient

# Class: ZentaoClient

禅道 API 客户端，封装一次次原始 HTTP 调用。

主要职责：
- 站点根地址规范化与 `/api.php/v2` 拼接
- 自动注入 `Token` 头
- 请求超时控制（基于 [AbortController](https://developer.mozilla.org/docs/Web/API/AbortController)）
- 可选的 TLS 跳过校验（仅 Node.js 运行时）
- 响应体的 JSON 解析与错误归一化

适合直接调用裸 API；若希望按模块/动作名调用并自动组装路径、参数、分页，
请改用 [request](#request)。

## Constructors

### Constructor

> **new ZentaoClient**(`options`): `ZentaoClient`

使用完整配置创建客户端。

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`ZentaoClientOptions`](../interfaces/ZentaoClientOptions.md) | 客户端配置，参见 [ZentaoClientOptions](../interfaces/ZentaoClientOptions.md)。 |

#### Returns

`ZentaoClient`

#### Throws

`E_INVALID_BASE_URL` —— `baseUrl` 无法解析为合法的 http(s) URL。

### Constructor

> **new ZentaoClient**(`baseUrl`): `ZentaoClient`

使用站点根地址创建客户端。

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `baseUrl` | `string` | 禅道站点根地址，例如 `https://zentao.example.com`； 若误传 `/api.php/v2` 后缀会自动剥离。 |

#### Returns

`ZentaoClient`

#### Throws

`E_INVALID_BASE_URL` —— 地址不合法或协议非 http(s)。

## Properties

| Property | Modifier | Type | Description |
| ------ | ------ | ------ | ------ |
| <a id="property-baseurl"></a> `baseUrl` | `readonly` | `string` | 禅道 API v2 根地址，等于 `siteUrl + '/api.php/v2'`。 |
| <a id="property-siteurl"></a> `siteUrl` | `readonly` | `string` | 禅道站点根地址，不包含 `/api.php/v2`。 |

## Methods

### delete()

> **delete**\<`T`\>(`path`, `options?`): `Promise`\<`T`\>

发起 `DELETE` 请求。

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | 期望的响应体类型。 |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | 相对 [baseUrl](#property-baseurl) 的路径。 |
| `options` | `Omit`\<[`ClientRequestOptions`](../interfaces/ClientRequestOptions.md), `"method"` \| `"body"` \| `"bodyType"`\> | - |

#### Returns

`Promise`\<`T`\>

解析后的响应体（强转为 `T`）。

#### Throws

传输层失败时抛出，详见 [ZentaoClient.request](#request)。

***

### get()

> **get**\<`T`\>(`path`, `options?`): `Promise`\<`T`\>

发起 `GET` 请求。

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | 期望的响应体类型；调用方负责类型收窄，SDK 不做运行时校验。 |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | 相对 [baseUrl](#property-baseurl) 的路径。 |
| `options` | `Omit`\<[`ClientRequestOptions`](../interfaces/ClientRequestOptions.md), `"method"` \| `"body"` \| `"bodyType"`\> | - |

#### Returns

`Promise`\<`T`\>

解析后的响应体（强转为 `T`）。

#### Throws

传输层失败时抛出，详见 [ZentaoClient.request](#request)。

***

### getZentaoConfig()

> **getZentaoConfig**(`options?`): `Promise`\<[`ServerConfig`](../interfaces/ServerConfig.md)\>

获取禅道站点 `/?mode=getconfig` 配置，不发送 API Token。

默认复用不超过 24 小时的缓存；缺失、过期或时间异常时重新获取。
`forceRefresh: true` 忽略缓存。同一客户端的并发刷新共用首次调用的传输选项；
后加入的调用仍可通过自己的 signal 取消等待。
成功后更新实例缓存；启用 `persistProfiles` 且绑定了 profile 时仅更新其配置和获取时间。
返回独立副本，修改返回值不会改变缓存。此方法不会忽略配置获取错误。

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`GetZentaoConfigOptions`](../interfaces/GetZentaoConfigOptions.md) | 缓存、超时、TLS 与取消选项。 |

#### Returns

`Promise`\<[`ServerConfig`](../interfaces/ServerConfig.md)\>

服务器配置。

#### Throws

传输错误、`E_INVALID_ZENTAO_CONFIG`、`E_INVALID_ZENTAO_VERSION` 或 profile 存储错误。

***

### login()

> **login**(`account`, `password`): `Promise`\<`string`\>

使用账号密码登录禅道。

验证成功后强制获取一次站点配置，再把返回的 Token 写入当前客户端实例；
配置获取失败默认阻断登录，只有全局 `skipVersionCheckOnConfigError` 可允许继续。
全局 `version` 不跳过登录时的配置获取。
当全局 `persistProfiles` 为真时，会同时把账号、Token、用户信息、服务端配置和
客户端偏好（仅在显式设置过 `timeout` / `insecure` 时）持久化为本地 profile，
并切换为当前 profile，方便下次通过 [ZentaoClient.fromProfile](#fromprofile) 直接登录态恢复。
重新登录同一账号时保留已有自定义字段，以及未被显式覆盖的客户端偏好。

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `account` | `string` | 禅道用户账号。 |
| `password` | `string` | 禅道用户密码（明文，仅在传输层 TLS 内使用）。 |

#### Returns

`Promise`\<`string`\>

登录成功后返回的 API Token。

#### Throws

`E_LOGIN_FAILED` —— 服务端返回 `status !== "success"` 或缺失 token；
  也可能因底层 [ZentaoClient.request](#request) 而抛出 HTTP/网络/超时错误。

***

### post()

> **post**\<`T`\>(`path`, `body`, `options?`): `Promise`\<`T`\>

发起 `POST` 请求，`body` 会被序列化为 JSON。

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | 期望的响应体类型。 |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | 相对 [baseUrl](#property-baseurl) 的路径。 |
| `body` | `unknown` | JSON 请求体，传入对象/数组将被 `JSON.stringify`。 |
| `options` | `Omit`\<[`ClientRequestOptions`](../interfaces/ClientRequestOptions.md), `"method"`\> | - |

#### Returns

`Promise`\<`T`\>

解析后的响应体（强转为 `T`）。

#### Throws

传输层失败时抛出，详见 [ZentaoClient.request](#request)。

***

### put()

> **put**\<`T`\>(`path`, `body`, `options?`): `Promise`\<`T`\>

发起 `PUT` 请求，`body` 会被序列化为 JSON。

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | 期望的响应体类型。 |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | 相对 [baseUrl](#property-baseurl) 的路径。 |
| `body` | `unknown` | JSON 请求体。 |
| `options` | `Omit`\<[`ClientRequestOptions`](../interfaces/ClientRequestOptions.md), `"method"`\> | - |

#### Returns

`Promise`\<`T`\>

解析后的响应体（强转为 `T`）。

#### Throws

传输层失败时抛出，详见 [ZentaoClient.request](#request)。

***

### request()

#### Call Signature

> **request**(`path`, `options`): `Promise`\<`Response`\>

发起一次原始 API 请求。

选项优先级：本次调用 `options` > 全局选项（[getGlobalOptions](../functions/getGlobalOptions.md)） > 客户端构造时默认值。

特殊处理：
- 默认 HTTP 方法为 `GET`，`GET` 请求即使提供了 `options.body` 也不会发送，避免被部分代理/浏览器拒绝。
- 不自动跟随重定向，避免把 `Token` 或请求体转发到另一个地址。
- 非空响应优先按 JSON 解析；解析失败时回落为字符串原文。
- 业务层失败（即响应体 `{ status: "fail" }`）不会抛出，仍按原样返回；只有 HTTP/网络/超时等传输层错误才会抛错。
- `insecure` 仅在 Node.js 下可用，浏览器中传入会抛 `E_INSECURE_BROWSER`。

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | 相对 [baseUrl](#property-baseurl) 的路径，可省略前导 `/`。 |
| `options` | [`ClientRequestOptions`](../interfaces/ClientRequestOptions.md) & `object` | 单次请求选项，参见 [ClientRequestOptions](../interfaces/ClientRequestOptions.md)。 |

##### Returns

`Promise`\<`Response`\>

解析后的响应体；当响应为空字符串时返回 `undefined`。

##### Throws

可能抛出 `E_HTTP_ERROR`（非 2xx 状态）、`E_NETWORK_ERROR`（底层 fetch 失败）、
  `E_TIMEOUT`（超过 `timeout`）、`E_ABORTED`（外部信号取消）或
  `E_INSECURE_BROWSER`（浏览器中开启了 `insecure`）；传入 `ReadableStream` 请求体时会抛
  `E_INVALID_PARAM`。

#### Call Signature

> **request**(`path`, `options`): `Promise`\<`ArrayBuffer`\>

发起一次原始 API 请求。

选项优先级：本次调用 `options` > 全局选项（[getGlobalOptions](../functions/getGlobalOptions.md)） > 客户端构造时默认值。

特殊处理：
- 默认 HTTP 方法为 `GET`，`GET` 请求即使提供了 `options.body` 也不会发送，避免被部分代理/浏览器拒绝。
- 不自动跟随重定向，避免把 `Token` 或请求体转发到另一个地址。
- 非空响应优先按 JSON 解析；解析失败时回落为字符串原文。
- 业务层失败（即响应体 `{ status: "fail" }`）不会抛出，仍按原样返回；只有 HTTP/网络/超时等传输层错误才会抛错。
- `insecure` 仅在 Node.js 下可用，浏览器中传入会抛 `E_INSECURE_BROWSER`。

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | 相对 [baseUrl](#property-baseurl) 的路径，可省略前导 `/`。 |
| `options` | [`ClientRequestOptions`](../interfaces/ClientRequestOptions.md) & `object` | 单次请求选项，参见 [ClientRequestOptions](../interfaces/ClientRequestOptions.md)。 |

##### Returns

`Promise`\<`ArrayBuffer`\>

解析后的响应体；当响应为空字符串时返回 `undefined`。

##### Throws

可能抛出 `E_HTTP_ERROR`（非 2xx 状态）、`E_NETWORK_ERROR`（底层 fetch 失败）、
  `E_TIMEOUT`（超过 `timeout`）、`E_ABORTED`（外部信号取消）或
  `E_INSECURE_BROWSER`（浏览器中开启了 `insecure`）；传入 `ReadableStream` 请求体时会抛
  `E_INVALID_PARAM`。

#### Call Signature

> **request**(`path`, `options`): `Promise`\<`Blob`\>

发起一次原始 API 请求。

选项优先级：本次调用 `options` > 全局选项（[getGlobalOptions](../functions/getGlobalOptions.md)） > 客户端构造时默认值。

特殊处理：
- 默认 HTTP 方法为 `GET`，`GET` 请求即使提供了 `options.body` 也不会发送，避免被部分代理/浏览器拒绝。
- 不自动跟随重定向，避免把 `Token` 或请求体转发到另一个地址。
- 非空响应优先按 JSON 解析；解析失败时回落为字符串原文。
- 业务层失败（即响应体 `{ status: "fail" }`）不会抛出，仍按原样返回；只有 HTTP/网络/超时等传输层错误才会抛错。
- `insecure` 仅在 Node.js 下可用，浏览器中传入会抛 `E_INSECURE_BROWSER`。

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | 相对 [baseUrl](#property-baseurl) 的路径，可省略前导 `/`。 |
| `options` | [`ClientRequestOptions`](../interfaces/ClientRequestOptions.md) & `object` | 单次请求选项，参见 [ClientRequestOptions](../interfaces/ClientRequestOptions.md)。 |

##### Returns

`Promise`\<`Blob`\>

解析后的响应体；当响应为空字符串时返回 `undefined`。

##### Throws

可能抛出 `E_HTTP_ERROR`（非 2xx 状态）、`E_NETWORK_ERROR`（底层 fetch 失败）、
  `E_TIMEOUT`（超过 `timeout`）、`E_ABORTED`（外部信号取消）或
  `E_INSECURE_BROWSER`（浏览器中开启了 `insecure`）；传入 `ReadableStream` 请求体时会抛
  `E_INVALID_PARAM`。

#### Call Signature

> **request**\<`T`\>(`path`, `options?`): `Promise`\<`T`\>

发起一次原始 API 请求。

选项优先级：本次调用 `options` > 全局选项（[getGlobalOptions](../functions/getGlobalOptions.md)） > 客户端构造时默认值。

特殊处理：
- 默认 HTTP 方法为 `GET`，`GET` 请求即使提供了 `options.body` 也不会发送，避免被部分代理/浏览器拒绝。
- 不自动跟随重定向，避免把 `Token` 或请求体转发到另一个地址。
- 非空响应优先按 JSON 解析；解析失败时回落为字符串原文。
- 业务层失败（即响应体 `{ status: "fail" }`）不会抛出，仍按原样返回；只有 HTTP/网络/超时等传输层错误才会抛错。
- `insecure` 仅在 Node.js 下可用，浏览器中传入会抛 `E_INSECURE_BROWSER`。

##### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | 相对 [baseUrl](#property-baseurl) 的路径，可省略前导 `/`。 |
| `options?` | [`ClientRequestOptions`](../interfaces/ClientRequestOptions.md) | 单次请求选项，参见 [ClientRequestOptions](../interfaces/ClientRequestOptions.md)。 |

##### Returns

`Promise`\<`T`\>

解析后的响应体；当响应为空字符串时返回 `undefined`。

##### Throws

可能抛出 `E_HTTP_ERROR`（非 2xx 状态）、`E_NETWORK_ERROR`（底层 fetch 失败）、
  `E_TIMEOUT`（超过 `timeout`）、`E_ABORTED`（外部信号取消）或
  `E_INSECURE_BROWSER`（浏览器中开启了 `insecure`）；传入 `ReadableStream` 请求体时会抛
  `E_INVALID_PARAM`。

***

### create()

> `static` **create**(`options`): `ZentaoClient`

创建客户端实例，语义等同于 `new ZentaoClient(options)`，便于链式调用。

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`ZentaoClientOptions`](../interfaces/ZentaoClientOptions.md) | 客户端配置，参见 [ZentaoClientOptions](../interfaces/ZentaoClientOptions.md)。 |

#### Returns

`ZentaoClient`

新建的客户端实例。

#### Throws

同 构造函数：`E_INVALID_BASE_URL` 等。

***

### fromProfile()

> `static` **fromProfile**(`profileKey?`): `Promise`\<`ZentaoClient`\>

根据本地持久化 profile 创建客户端。

实际会调用 [switchProfile](../functions/switchProfile.md)：若 `profileKey` 存在则刷新其 `lastUsedTime` 并设为当前 profile；
不传 `profileKey` 时使用当前 profile。Profile 中保存的 `timeout` / `insecure` 偏好也会被带回到客户端实例。

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `profileKey?` | `string` | 可选的 profile key，格式为 `account@server`；不传时使用当前 profile。 |

#### Returns

`Promise`\<`ZentaoClient`\>

用 profile 还原后的客户端实例。

#### Throws

`E_NO_PROFILE`（无任何 profile 且未传 key）、`E_PROFILE_NOT_FOUND`（指定 key 不存在）、
  `E_PROFILE_STORAGE_UNAVAILABLE`（运行时无法访问持久化存储）。

***

### init()

> `static` **init**(`options`): `ZentaoClient`

创建客户端并写入全局选项，作为 [request](#request) 默认使用的实例。

适合应用入口处一次性完成初始化，后续 `request("module/action", params)` 可省略 `options.client`。
多次调用会覆盖上一次的全局客户端。

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`ZentaoClientOptions`](../interfaces/ZentaoClientOptions.md) | 客户端配置，参见 [ZentaoClientOptions](../interfaces/ZentaoClientOptions.md)。 |

#### Returns

`ZentaoClient`

新建并已注册为全局默认的客户端实例。

#### Throws

同 构造函数：`E_INVALID_BASE_URL` 等。
