[zentao-api](../index.md) / ZentaoClientOptions

# Interface: ZentaoClientOptions

Defined in: [src/types/index.ts:4](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L4)

创建 [ZentaoClient](../classes/ZentaoClient.md) 时使用的配置。

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-baseurl"></a> `baseUrl` | `string` | 禅道站点根地址，例如 `https://zentao.example.com`；SDK 会自动拼接 `/api.php/v2`。 | [src/types/index.ts:6](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L6) |
| <a id="property-insecure"></a> `insecure?` | `boolean` | 是否跳过 TLS 证书验证；仅 Node.js 运行时支持，浏览器中会抛错。 | [src/types/index.ts:12](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L12) |
| <a id="property-timeout"></a> `timeout?` | `number` | 默认请求超时时间，单位毫秒。 | [src/types/index.ts:10](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L10) |
| <a id="property-token"></a> `token?` | `string` | 禅道 API Token；未提供时可稍后通过 [ZentaoClient.login](../classes/ZentaoClient.md#login) 获取并写入实例。 | [src/types/index.ts:8](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L8) |
