[zentao-api](../index.md) / ZentaoProfile

# Interface: ZentaoProfile

本地持久化的禅道账号 profile。

## Extended by

- [`ZentaoProfileRecord`](ZentaoProfileRecord.md)

## Indexable

> \[`key`: `string`\]: `unknown`

允许上层应用保存额外字段。

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-account"></a> `account` | `string` | 用户账号。 |
| <a id="property-config"></a> `config?` | [`ZentaoProfileConfig`](ZentaoProfileConfig.md) | 客户端自定义配置。 |
| <a id="property-lastusedtime"></a> `lastUsedTime?` | `string` | 最后使用时间。 |
| <a id="property-logintime"></a> `loginTime?` | `string` | 登录时间。 |
| <a id="property-server"></a> `server` | `string` | 禅道站点根地址，不包含 `/api.php/v2`。 |
| <a id="property-serverconfig"></a> `serverConfig?` | [`ServerConfig`](ServerConfig.md) | 禅道服务端配置。 |
| <a id="property-token"></a> `token` | `string` | 禅道 API Token。 |
| <a id="property-user"></a> `user?` | `Record`\<`string`, `unknown`\> | 登录验证通过后得到的用户信息。 |
