[zentao-api](../index.md) / ApiResponse

# Interface: ApiResponse

Defined in: [src/types/index.ts:94](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L94)

禅道 API 通用响应结构，允许携带任意业务字段。

## Extended by

- [`ApiListResponse`](ApiListResponse.md)
- [`LoginResponse`](LoginResponse.md)

## Indexable

> \[`key`: `string`\]: `unknown`

其他业务字段。

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-message"></a> `message?` | `unknown` | 服务端消息，可能是字符串、对象或数组。 | [src/types/index.ts:98](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L98) |
| <a id="property-status"></a> `status` | `"success"` \| `"fail"` | 服务端返回状态。 | [src/types/index.ts:96](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L96) |
