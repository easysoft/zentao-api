[zentao-api](../index.md) / GlobalOptions

# Interface: GlobalOptions

SDK 进程级全局默认选项，供高阶 [request](../functions/request.md) 调用复用。

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-autofill"></a> `autoFill?` | `boolean` | 是否在执行 `update` 操作时自动填充未传入的字段，默认 false。 优先级低于单次请求选项；语义见 [RequestOptions.autoFill](RequestOptions.md#property-autofill)。 |
| <a id="property-client"></a> `client?` | [`ZentaoClient`](../classes/ZentaoClient.md) | 默认客户端；通常由 `ZentaoClient.init()` 设置。 |
| <a id="property-insecure"></a> `insecure?` | `boolean` | 默认 TLS 跳过证书验证选项；仅 Node.js 运行时支持。 |
| <a id="property-limit"></a> `limit?` | `string` | 默认限制返回列表数量，只影响 SDK 归一化后的 `data`。 |
| <a id="property-persistprofiles"></a> `persistProfiles?` | `boolean` | 是否在登录成功后把账号、Token 和配置持久化为本地 profile。 |
| <a id="property-recperpage"></a> `recPerPage?` | `string` | 默认每页记录数，会映射到模块动作的 `recPerPage` 参数。 |
| <a id="property-throwonfail"></a> `throwOnFail?` | `boolean` | 当禅道服务端返回 `{ status: "fail" }` 时是否抛出 `E_API_FAILED`，默认 false。 |
| <a id="property-timeout"></a> `timeout?` | `number` | 默认请求超时时间，优先级低于单次请求选项。 |
