[zentao-api](../index.md) / ApiListResponse

# Interface: ApiListResponse

Defined in: [src/types/index.ts:104](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L104)

禅道 API 列表响应结构。

## Extends

- [`ApiResponse`](ApiResponse.md)

## Indexable

> \[`key`: `string`\]: `unknown`

其他业务字段。

## Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="property-message"></a> `message?` | `unknown` | 服务端消息，可能是字符串、对象或数组。 | [`ApiResponse`](ApiResponse.md).[`message`](ApiResponse.md#property-message) | [src/types/index.ts:98](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L98) |
| <a id="property-pager"></a> `pager?` | [`Pager`](Pager.md) | 原始分页信息。 | - | [src/types/index.ts:106](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L106) |
| <a id="property-status"></a> `status` | `"success"` \| `"fail"` | 服务端返回状态。 | [`ApiResponse`](ApiResponse.md).[`status`](ApiResponse.md#property-status) | [src/types/index.ts:96](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L96) |
