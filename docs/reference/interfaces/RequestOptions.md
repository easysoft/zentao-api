[zentao-api](../index.md) / RequestOptions

# Interface: RequestOptions

高阶 `request("moduleName/methodName")` 的单次调用选项。

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-client"></a> `client?` | [`ZentaoClient`](../classes/ZentaoClient.md) | 本次调用使用的客户端；优先级高于全局客户端。 |
| <a id="property-insecure"></a> `insecure?` | `boolean` | 本次调用 TLS 跳过证书验证选项；仅 Node.js 运行时支持。 |
| <a id="property-limit"></a> `limit?` | `string` | 本次调用限制返回列表数量，优先级高于全局 `limit`。 |
| <a id="property-recperpage"></a> `recPerPage?` | `string` | 本次调用使用的每页记录数，优先级高于全局 `recPerPage`。 |
| <a id="property-timeout"></a> `timeout?` | `number` | 本次调用超时时间。 |
