[zentao-api](../index.md) / ClientRequestOptions

# Interface: ClientRequestOptions

Defined in: [src/types/index.ts:35](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L35)

`ZentaoClient.request()` 的单次请求选项。

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-body"></a> `body?` | `Record`\<`string`, `unknown`\> | JSON 请求体；`GET` 请求会忽略该字段。 | [src/types/index.ts:39](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L39) |
| <a id="property-insecure"></a> `insecure?` | `boolean` | 单次请求 TLS 跳过证书验证选项；仅 Node.js 运行时支持。 | [src/types/index.ts:45](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L45) |
| <a id="property-method"></a> `method?` | [`HttpMethod`](../type-aliases/HttpMethod.md) | HTTP 方法，默认 `GET`。 | [src/types/index.ts:37](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L37) |
| <a id="property-query"></a> `query?` | `Record`\<`string`, `string` \| `number` \| `boolean` \| `undefined`\> | URL 查询参数；`undefined` 值会被跳过。 | [src/types/index.ts:41](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L41) |
| <a id="property-timeout"></a> `timeout?` | `number` | 单次请求超时时间，优先级高于全局和客户端默认值。 | [src/types/index.ts:43](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L43) |
