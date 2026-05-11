[zentao-api](../index.md) / ZentaoClient

# Class: ZentaoClient

禅道 API 客户端，负责 Token 注入、请求超时、TLS 选项和响应解析。

## Constructors

### Constructor

> **new ZentaoClient**(`options`): `ZentaoClient`

使用完整配置创建客户端。

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`ZentaoClientOptions`](../interfaces/ZentaoClientOptions.md) |

#### Returns

`ZentaoClient`

### Constructor

> **new ZentaoClient**(`baseUrl`): `ZentaoClient`

使用站点根地址创建客户端。

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `baseUrl` | `string` |

#### Returns

`ZentaoClient`

## Properties

| Property | Modifier | Type | Description |
| ------ | ------ | ------ | ------ |
| <a id="property-baseurl"></a> `baseUrl` | `readonly` | `string` | 禅道 API v2 根地址。 |
| <a id="property-siteurl"></a> `siteUrl` | `readonly` | `string` | 禅道站点根地址，不包含 `/api.php/v2`。 |

## Methods

### delete()

> **delete**\<`T`\>(`path`): `Promise`\<`T`\>

发起 DELETE 请求。

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |

#### Returns

`Promise`\<`T`\>

***

### get()

> **get**\<`T`\>(`path`): `Promise`\<`T`\>

发起 GET 请求并按调用方指定类型返回。

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |

#### Returns

`Promise`\<`T`\>

***

### login()

> **login**(`account`, `password`): `Promise`\<`string`\>

使用账号密码登录，成功后把返回 Token 写入当前客户端实例。

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `account` | `string` |
| `password` | `string` |

#### Returns

`Promise`\<`string`\>

***

### post()

> **post**\<`T`\>(`path`, `body`): `Promise`\<`T`\>

发起 POST 请求并发送 JSON body。

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |
| `body` | `any` |

#### Returns

`Promise`\<`T`\>

***

### put()

> **put**\<`T`\>(`path`, `body`): `Promise`\<`T`\>

发起 PUT 请求并发送 JSON body。

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |
| `body` | `any` |

#### Returns

`Promise`\<`T`\>

***

### request()

> **request**(`path`, `options?`): `Promise`\<`unknown`\>

发起一次原始 API 请求。

默认使用 GET；当服务端返回 `{ status: "fail" }` 时仍按原始内容返回，
只有 HTTP/网络/超时等传输层错误会抛出 [ZentaoError](ZentaoError.md)。

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |
| `options` | [`ClientRequestOptions`](../interfaces/ClientRequestOptions.md) |

#### Returns

`Promise`\<`unknown`\>

***

### create()

> `static` **create**(`options`): `ZentaoClient`

创建客户端实例，语义等同于 `new ZentaoClient(options)`。

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`ZentaoClientOptions`](../interfaces/ZentaoClientOptions.md) |

#### Returns

`ZentaoClient`

***

### fromProfile()

> `static` **fromProfile**(`profileKey?`): `Promise`\<`ZentaoClient`\>

根据本地持久化 profile 创建客户端；不传 key 时使用当前 profile。

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `profileKey?` | `string` |

#### Returns

`Promise`\<`ZentaoClient`\>

***

### init()

> `static` **init**(`options`): `ZentaoClient`

创建客户端并写入全局选项，供高阶 `request()` 默认使用。

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`ZentaoClientOptions`](../interfaces/ZentaoClientOptions.md) |

#### Returns

`ZentaoClient`
