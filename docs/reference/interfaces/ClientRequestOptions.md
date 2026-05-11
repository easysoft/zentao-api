[zentao-api](../index.md) / ClientRequestOptions

# Interface: ClientRequestOptions

`ZentaoClient.request()` 的单次请求选项。

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-body"></a> `body?` | `Record`\<`string`, `unknown`\> | JSON 请求体；`GET` 请求会忽略该字段。 |
| <a id="property-insecure"></a> `insecure?` | `boolean` | 单次请求 TLS 跳过证书验证选项；仅 Node.js 运行时支持。 |
| <a id="property-method"></a> `method?` | [`HttpMethod`](../type-aliases/HttpMethod.md) | HTTP 方法，默认 `GET`。 |
| <a id="property-query"></a> `query?` | `Record`\<`string`, `string` \| `number` \| `boolean` \| `undefined`\> | URL 查询参数；`undefined` 值会被跳过。 |
| <a id="property-timeout"></a> `timeout?` | `number` | 单次请求超时时间，优先级高于全局和客户端默认值。 |
