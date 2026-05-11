[zentao-api](../index.md) / ApiListResponse

# Interface: ApiListResponse

禅道 API 列表响应结构。

## Extends

- [`ApiResponse`](ApiResponse.md)

## Indexable

> \[`key`: `string`\]: `unknown`

其他业务字段。

## Properties

| Property | Type | Description | Inherited from |
| ------ | ------ | ------ | ------ |
| <a id="property-message"></a> `message?` | `unknown` | 服务端消息，可能是字符串、对象或数组。 | [`ApiResponse`](ApiResponse.md).[`message`](ApiResponse.md#property-message) |
| <a id="property-pager"></a> `pager?` | [`Pager`](Pager.md) | 原始分页信息。 | - |
| <a id="property-status"></a> `status` | `"success"` \| `"fail"` | 服务端返回状态。 | [`ApiResponse`](ApiResponse.md).[`status`](ApiResponse.md#property-status) |
