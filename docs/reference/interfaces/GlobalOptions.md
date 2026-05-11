[zentao-api](../index.md) / GlobalOptions

# Interface: GlobalOptions

Defined in: [src/types/index.ts:16](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L16)

SDK 进程级全局默认选项，供高阶 [request](../functions/request.md) 调用复用。

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-client"></a> `client?` | [`ZentaoClient`](../classes/ZentaoClient.md) | 默认客户端；通常由 `ZentaoClient.init()` 设置。 | [src/types/index.ts:18](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L18) |
| <a id="property-insecure"></a> `insecure?` | `boolean` | 默认 TLS 跳过证书验证选项；仅 Node.js 运行时支持。 | [src/types/index.ts:26](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L26) |
| <a id="property-limit"></a> `limit?` | `string` | 默认限制返回列表数量，只影响 SDK 归一化后的 `data`。 | [src/types/index.ts:22](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L22) |
| <a id="property-persistprofiles"></a> `persistProfiles?` | `boolean` | 是否在登录成功后把账号、Token 和配置持久化为本地 profile。 | [src/types/index.ts:28](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L28) |
| <a id="property-recperpage"></a> `recPerPage?` | `string` | 默认每页记录数，会映射到模块动作的 `recPerPage` 参数。 | [src/types/index.ts:20](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L20) |
| <a id="property-timeout"></a> `timeout?` | `number` | 默认请求超时时间，优先级低于单次请求选项。 | [src/types/index.ts:24](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L24) |
