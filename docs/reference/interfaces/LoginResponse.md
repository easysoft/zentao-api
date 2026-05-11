[zentao-api](../index.md) / LoginResponse

# Interface: LoginResponse

登录接口响应结构。

## Extends

- [`ApiResponse`](ApiResponse.md)

## Indexable

> \[`key`: `string`\]: `unknown`

其他业务字段。

## Properties

| Property | Type | Description | Inherited from |
| ------ | ------ | ------ | ------ |
| <a id="property-message"></a> `message?` | `unknown` | 服务端消息，可能是字符串、对象或数组。 | [`ApiResponse`](ApiResponse.md).[`message`](ApiResponse.md#property-message) |
| <a id="property-serverconfig"></a> `serverConfig?` | [`ServerConfig`](ServerConfig.md) | 部分禅道环境会随登录响应返回服务端配置。 | - |
| <a id="property-status"></a> `status` | `"success"` \| `"fail"` | 服务端返回状态。 | [`ApiResponse`](ApiResponse.md).[`status`](ApiResponse.md#property-status) |
| <a id="property-token"></a> `token?` | `string` | 登录成功后返回的 API Token。 | - |
| <a id="property-user"></a> `user?` | `Record`\<`string`, `unknown`\> | 部分禅道环境会随登录响应返回用户信息。 | - |
