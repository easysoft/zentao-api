[zentao-api](../index.md) / ApiResponse

# Interface: ApiResponse

禅道 API 通用响应结构，允许携带任意业务字段。

## Extended by

- [`ApiListResponse`](ApiListResponse.md)
- [`LoginResponse`](LoginResponse.md)

## Indexable

> \[`key`: `string`\]: `unknown`

其他业务字段。

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-message"></a> `message?` | `unknown` | 服务端消息，可能是字符串、对象或数组。 |
| <a id="property-status"></a> `status` | `"success"` \| `"fail"` | 服务端返回状态。 |
