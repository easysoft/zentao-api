[zentao-api](../index.md) / ZentaoProfileRecord

# Interface: ZentaoProfileRecord

运行时返回的 profile，会额外带上 `account@server` 形式的 key。

## Extends

- [`ZentaoProfile`](ZentaoProfile.md)

## Indexable

> \[`key`: `string`\]: `unknown`

允许上层应用保存额外字段。

## Properties

| Property | Type | Description | Inherited from |
| ------ | ------ | ------ | ------ |
| <a id="property-account"></a> `account` | `string` | 用户账号。 | [`ZentaoProfile`](ZentaoProfile.md).[`account`](ZentaoProfile.md#property-account) |
| <a id="property-config"></a> `config?` | [`ZentaoProfileConfig`](ZentaoProfileConfig.md) | 客户端自定义配置。 | [`ZentaoProfile`](ZentaoProfile.md).[`config`](ZentaoProfile.md#property-config) |
| <a id="property-key"></a> `key` | `string` | - | - |
| <a id="property-lastusedtime"></a> `lastUsedTime?` | `string` | 最后使用时间。 | [`ZentaoProfile`](ZentaoProfile.md).[`lastUsedTime`](ZentaoProfile.md#property-lastusedtime) |
| <a id="property-logintime"></a> `loginTime?` | `string` | 登录时间。 | [`ZentaoProfile`](ZentaoProfile.md).[`loginTime`](ZentaoProfile.md#property-logintime) |
| <a id="property-server"></a> `server` | `string` | 禅道站点根地址，不包含 `/api.php/v2`。 | [`ZentaoProfile`](ZentaoProfile.md).[`server`](ZentaoProfile.md#property-server) |
| <a id="property-serverconfig"></a> `serverConfig?` | [`ServerConfig`](ServerConfig.md) | 禅道服务端配置。 | [`ZentaoProfile`](ZentaoProfile.md).[`serverConfig`](ZentaoProfile.md#property-serverconfig) |
| <a id="property-token"></a> `token` | `string` | 禅道 API Token。 | [`ZentaoProfile`](ZentaoProfile.md).[`token`](ZentaoProfile.md#property-token) |
| <a id="property-user"></a> `user?` | `Record`\<`string`, `unknown`\> | 登录验证通过后得到的用户信息。 | [`ZentaoProfile`](ZentaoProfile.md).[`user`](ZentaoProfile.md#property-user) |
