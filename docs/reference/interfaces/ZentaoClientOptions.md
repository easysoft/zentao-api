[zentao-api](../index.md) / ZentaoClientOptions

# Interface: ZentaoClientOptions

创建 [ZentaoClient](../classes/ZentaoClient.md) 时使用的配置。

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-apiversion"></a> `apiVersion?` | [`ApiVersionOption`](../type-aliases/ApiVersionOption.md) | REST API generation; defaults to v2 for backwards compatibility. |
| <a id="property-baseurl"></a> `baseUrl` | `string` | Site root; apiVersion selects the /api.php/v1 or /api.php/v2 prefix. |
| <a id="property-insecure"></a> `insecure?` | `boolean` | 是否跳过 TLS 证书验证；仅 Node.js 运行时支持，浏览器中会抛错。 |
| <a id="property-timeout"></a> `timeout?` | `number` | 默认请求超时时间，单位毫秒。 |
| <a id="property-token"></a> `token?` | `string` | 禅道 API Token；未提供时可稍后通过 [ZentaoClient.login](../classes/ZentaoClient.md#login) 获取并写入实例。 |
