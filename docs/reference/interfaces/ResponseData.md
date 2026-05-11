[zentao-api](../index.md) / ResponseData

# Interface: ResponseData

Defined in: [src/types/index.ts:63](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L63)

高阶 `request()` 归一化后的返回数据。

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-data"></a> `data?` | `any` | 根据模块动作 `resultGetter` 提取后的业务数据。 | [src/types/index.ts:69](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L69) |
| <a id="property-message"></a> `message?` | `string` | 禅道服务端返回的消息。 | [src/types/index.ts:67](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L67) |
| <a id="property-pager"></a> `pager?` | `object` | 统一分页信息。 | [src/types/index.ts:71](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L71) |
| `pager.page` | `number` | 当前页码。 | [src/types/index.ts:75](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L75) |
| `pager.recPerPage` | `number` | 每页记录数。 | [src/types/index.ts:77](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L77) |
| `pager.total` | `number` | 总记录数。 | [src/types/index.ts:73](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L73) |
| <a id="property-status"></a> `status` | `"success"` \| `"fail"` | 禅道服务端状态；非标准响应会按成功响应包装到 `data`。 | [src/types/index.ts:65](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L65) |
