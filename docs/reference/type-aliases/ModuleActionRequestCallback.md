[zentao-api](../index.md) / ModuleActionRequestCallback

# Type Alias: ModuleActionRequestCallback

> **ModuleActionRequestCallback** = (`info`) => `Promise`\<`unknown`\>

自定义动作的请求发送逻辑，在版本检查、参数解析和请求体准备完成后调用。
返回原始响应数据，后续仍按动作定义提取结果、分页并应用请求选项；抛出的错误原样传递。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `info` | \{ `body`: `unknown`; `bodyType?`: [`ClientRequestBodyType`](ClientRequestBodyType.md); `client`: [`ZentaoClient`](../classes/ZentaoClient.md); `insecure?`: `boolean`; `options`: [`RequestOptions`](../interfaces/RequestOptions.md); `request`: [`ModuleActionRequest`](../interfaces/ModuleActionRequest.md); `timeout?`: `number`; \} | - |
| `info.body` | `unknown` | 准备好的请求体，例如 JSON 对象或上传用的 FormData。 |
| `info.bodyType?` | [`ClientRequestBodyType`](ClientRequestBodyType.md) | 请求体序列化方式，可直接传给客户端。 |
| `info.client` | [`ZentaoClient`](../classes/ZentaoClient.md) | 本次调用选定的客户端。 |
| `info.insecure?` | `boolean` | 本次请求的 TLS 选项，未指定时回落到全局选项。 |
| `info.options` | [`RequestOptions`](../interfaces/RequestOptions.md) | 调用方传入的原始请求选项。 |
| `info.request` | [`ModuleActionRequest`](../interfaces/ModuleActionRequest.md) | 解析后的路径、查询参数、请求体数据及动作定义。 |
| `info.timeout?` | `number` | 本次请求的超时选项，未指定时回落到全局选项。 |

## Returns

`Promise`\<`unknown`\>
