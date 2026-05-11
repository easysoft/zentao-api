[zentao-api](../index.md) / request

# Function: request()

> **request**(`name`, `params?`, `options?`): `Promise`\<[`ResponseData`](../interfaces/ResponseData.md)\>

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
