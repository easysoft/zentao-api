[zentao-api](../index.md) / ModuleActionBeforeRequestCallback

# Type Alias: ModuleActionBeforeRequestCallback

> **ModuleActionBeforeRequestCallback** = (`request`) => `Promise`\<`Partial`\<`Omit`\<[`ModuleActionRequest`](../interfaces/ModuleActionRequest.md), `"module"` \| `"action"`\>\>\>

请求发送前的回调，在版本检查、autoFill 和参数解析完成后、请求体准备前调用。
可直接修改本次请求，或返回 `path`、`query`、`data`、`params`、`id` 的部分字段作为补丁。
返回值浅合并到解析后的请求描述中，同名字段以返回值为准；对象字段整体替换。
合并后的请求用于请求体准备、请求发送和响应处理，不会重新执行版本检查、autoFill 或参数解析。
回调抛出或拒绝时终止本次请求，错误原样传递。

## Parameters

| Parameter | Type |
| ------ | ------ |
| `request` | [`ModuleActionRequest`](../interfaces/ModuleActionRequest.md) |

## Returns

`Promise`\<`Partial`\<`Omit`\<[`ModuleActionRequest`](../interfaces/ModuleActionRequest.md), `"module"` \| `"action"`\>\>\>
