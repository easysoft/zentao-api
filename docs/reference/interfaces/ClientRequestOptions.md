[zentao-api](../index.md) / ClientRequestOptions

# Interface: ClientRequestOptions

`ZentaoClient.request()` 的单次请求选项。

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-body"></a> `body?` | `unknown` | 请求体；`GET` 请求会忽略该字段。普通对象默认按 JSON 发送，`FormData` / `Blob` / `ArrayBuffer` 等会原样发送。 |
| <a id="property-bodytype"></a> `bodyType?` | [`ClientRequestBodyType`](../type-aliases/ClientRequestBodyType.md) | 请求体序列化方式。默认 `json`；传入 `FormData` 等原生 body 时会自动按 `raw` 处理。 |
| <a id="property-headers"></a> `headers?` | `HeadersInit` | 额外请求头；会与 SDK 自动注入的 `Token` / `Content-Type` 合并。 |
| <a id="property-insecure"></a> `insecure?` | `boolean` | 单次请求 TLS 跳过证书验证选项；仅 Node.js 运行时支持。 |
| <a id="property-method"></a> `method?` | [`HttpMethod`](../type-aliases/HttpMethod.md) | HTTP 方法，默认 `GET`。 |
| <a id="property-query"></a> `query?` | `Record`\<`string`, `unknown`\> | URL 查询参数；对象和数组使用 deepObject 风格序列化，`undefined` 值会被跳过。 |
| <a id="property-responsetype"></a> `responseType?` | [`ClientResponseType`](../type-aliases/ClientResponseType.md) | 响应体解析方式。默认 `auto`，会优先尝试 JSON，失败后回落为文本；`response` 会让 signal 和 timeout 继续控制响应体。 |
| <a id="property-signal"></a> `signal?` | `AbortSignal` | 外部取消信号；会与 SDK 自身的超时控制合并。 |
| <a id="property-timeout"></a> `timeout?` | `number` | 单次请求超时时间，优先级高于全局和客户端默认值。 |
