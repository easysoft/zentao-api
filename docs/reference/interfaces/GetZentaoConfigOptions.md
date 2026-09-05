[zentao-api](../index.md) / GetZentaoConfigOptions

# Interface: GetZentaoConfigOptions

[ZentaoClient.getZentaoConfig](../classes/ZentaoClient.md#getzentaoconfig) 的选项。

## Extends

- `Pick`\<[`ClientRequestOptions`](ClientRequestOptions.md), `"timeout"` \| `"insecure"` \| `"signal"`\>

## Properties

| Property | Type | Description | Inherited from |
| ------ | ------ | ------ | ------ |
| <a id="property-forcerefresh"></a> `forceRefresh?` | `boolean` | 忽略已有缓存并重新获取配置，默认 false；同一客户端的并发获取会合并。 | - |
| <a id="property-insecure"></a> `insecure?` | `boolean` | 单次请求 TLS 跳过证书验证选项；仅 Node.js 运行时支持。 | [`ClientRequestOptions`](ClientRequestOptions.md).[`insecure`](ClientRequestOptions.md#property-insecure) |
| <a id="property-signal"></a> `signal?` | `AbortSignal` | 外部取消信号；会与 SDK 自身的超时控制合并。 | [`ClientRequestOptions`](ClientRequestOptions.md).[`signal`](ClientRequestOptions.md#property-signal) |
| <a id="property-timeout"></a> `timeout?` | `number` | 单次请求超时时间，优先级高于全局和客户端默认值。 | [`ClientRequestOptions`](ClientRequestOptions.md).[`timeout`](ClientRequestOptions.md#property-timeout) |
