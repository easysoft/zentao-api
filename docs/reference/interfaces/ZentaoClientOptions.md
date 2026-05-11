[zentao-api](../index.md) / ZentaoClientOptions

# Interface: ZentaoClientOptions

创建 [ZentaoClient](../classes/ZentaoClient.md) 时使用的配置。

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-baseurl"></a> `baseUrl` | `string` | 禅道站点根地址，例如 `https://zentao.example.com`；SDK 会自动拼接 `/api.php/v2`。 |
| <a id="property-insecure"></a> `insecure?` | `boolean` | 是否跳过 TLS 证书验证；仅 Node.js 运行时支持，浏览器中会抛错。 |
| <a id="property-timeout"></a> `timeout?` | `number` | 默认请求超时时间，单位毫秒。 |
| <a id="property-token"></a> `token?` | `string` | 禅道 API Token；未提供时可稍后通过 [ZentaoClient.login](../classes/ZentaoClient.md#login) 获取并写入实例。 |
