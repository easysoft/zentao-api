[zentao-api](../index.md) / ZentaoClient

# Class: ZentaoClient

Defined in: [src/client/index.ts:43](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/client/index.ts#L43)

禅道 API 客户端，负责 Token 注入、请求超时、TLS 选项和响应解析。

## Constructors

### Constructor

> **new ZentaoClient**(`options`): `ZentaoClient`

Defined in: [src/client/index.ts:53](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/client/index.ts#L53)

使用完整配置创建客户端。

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`ZentaoClientOptions`](../interfaces/ZentaoClientOptions.md) |

#### Returns

`ZentaoClient`

### Constructor

> **new ZentaoClient**(`baseUrl`): `ZentaoClient`

Defined in: [src/client/index.ts:55](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/client/index.ts#L55)

使用站点根地址创建客户端。

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `baseUrl` | `string` |

#### Returns

`ZentaoClient`

## Properties

| Property | Modifier | Type | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="property-baseurl"></a> `baseUrl` | `readonly` | `string` | 禅道 API v2 根地址。 | [src/client/index.ts:47](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/client/index.ts#L47) |
| <a id="property-siteurl"></a> `siteUrl` | `readonly` | `string` | 禅道站点根地址，不包含 `/api.php/v2`。 | [src/client/index.ts:45](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/client/index.ts#L45) |

## Methods

### delete()

> **delete**\<`T`\>(`path`): `Promise`\<`T`\>

Defined in: [src/client/index.ts:139](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/client/index.ts#L139)

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

Defined in: [src/client/index.ts:124](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/client/index.ts#L124)

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

Defined in: [src/client/index.ts:144](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/client/index.ts#L144)

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

Defined in: [src/client/index.ts:129](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/client/index.ts#L129)

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

Defined in: [src/client/index.ts:134](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/client/index.ts#L134)

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

Defined in: [src/client/index.ts:71](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/client/index.ts#L71)

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

Defined in: [src/client/index.ts:171](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/client/index.ts#L171)

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

Defined in: [src/client/index.ts:183](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/client/index.ts#L183)

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

Defined in: [src/client/index.ts:176](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/client/index.ts#L176)

创建客户端并写入全局选项，供高阶 `request()` 默认使用。

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`ZentaoClientOptions`](../interfaces/ZentaoClientOptions.md) |

#### Returns

`ZentaoClient`
