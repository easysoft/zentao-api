[zentao-api](../index.md) / request

# Function: request()

> **request**(`name`, `params?`, `options?`): `Promise`\<[`ResponseData`](../interfaces/ResponseData.md)\>

Defined in: [src/request/index.ts:51](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/request/index.ts#L51)

按模块动作名请求禅道 API。

选项优先级为：本次调用 options > 全局 options > 客户端默认值。

## Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `` `${string}/${string}` `` |
| `params` | `Record`\<`string`, `unknown`\> |
| `options` | [`RequestOptions`](../interfaces/RequestOptions.md) |

## Returns

`Promise`\<[`ResponseData`](../interfaces/ResponseData.md)\>
