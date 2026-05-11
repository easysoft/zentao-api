[zentao-api](../index.md) / RequestOptions

# Interface: RequestOptions

Defined in: [src/types/index.ts:49](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L49)

高阶 `request("moduleName/methodName")` 的单次调用选项。

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-client"></a> `client?` | [`ZentaoClient`](../classes/ZentaoClient.md) | 本次调用使用的客户端；优先级高于全局客户端。 | [src/types/index.ts:51](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L51) |
| <a id="property-insecure"></a> `insecure?` | `boolean` | 本次调用 TLS 跳过证书验证选项；仅 Node.js 运行时支持。 | [src/types/index.ts:59](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L59) |
| <a id="property-limit"></a> `limit?` | `string` | 本次调用限制返回列表数量，优先级高于全局 `limit`。 | [src/types/index.ts:55](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L55) |
| <a id="property-recperpage"></a> `recPerPage?` | `string` | 本次调用使用的每页记录数，优先级高于全局 `recPerPage`。 | [src/types/index.ts:53](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L53) |
| <a id="property-timeout"></a> `timeout?` | `number` | 本次调用超时时间。 | [src/types/index.ts:57](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L57) |
