[zentao-api](../index.md) / LoginResponse

# Interface: LoginResponse

Defined in: [src/types/index.ts:110](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L110)

登录接口响应结构。

## Extends

- [`ApiResponse`](ApiResponse.md)

## Indexable

> \[`key`: `string`\]: `unknown`

其他业务字段。

## Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="property-message"></a> `message?` | `unknown` | 服务端消息，可能是字符串、对象或数组。 | [`ApiResponse`](ApiResponse.md).[`message`](ApiResponse.md#property-message) | [src/types/index.ts:98](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L98) |
| <a id="property-serverconfig"></a> `serverConfig?` | [`ServerConfig`](ServerConfig.md) | 部分禅道环境会随登录响应返回服务端配置。 | - | [src/types/index.ts:116](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L116) |
| <a id="property-status"></a> `status` | `"success"` \| `"fail"` | 服务端返回状态。 | [`ApiResponse`](ApiResponse.md).[`status`](ApiResponse.md#property-status) | [src/types/index.ts:96](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L96) |
| <a id="property-token"></a> `token?` | `string` | 登录成功后返回的 API Token。 | - | [src/types/index.ts:112](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L112) |
| <a id="property-user"></a> `user?` | `Record`\<`string`, `unknown`\> | 部分禅道环境会随登录响应返回用户信息。 | - | [src/types/index.ts:114](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L114) |
