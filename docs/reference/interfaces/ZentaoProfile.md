[zentao-api](../index.md) / ZentaoProfile

# Interface: ZentaoProfile

Defined in: [src/types/index.ts:157](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L157)

本地持久化的禅道账号 profile。

## Extended by

- [`ZentaoProfileRecord`](ZentaoProfileRecord.md)

## Indexable

> \[`key`: `string`\]: `unknown`

允许上层应用保存额外字段。

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-account"></a> `account` | `string` | 用户账号。 | [src/types/index.ts:161](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L161) |
| <a id="property-config"></a> `config?` | [`ZentaoProfileConfig`](ZentaoProfileConfig.md) | 客户端自定义配置。 | [src/types/index.ts:173](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L173) |
| <a id="property-lastusedtime"></a> `lastUsedTime?` | `string` | 最后使用时间。 | [src/types/index.ts:169](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L169) |
| <a id="property-logintime"></a> `loginTime?` | `string` | 登录时间。 | [src/types/index.ts:167](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L167) |
| <a id="property-server"></a> `server` | `string` | 禅道站点根地址，不包含 `/api.php/v2`。 | [src/types/index.ts:159](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L159) |
| <a id="property-serverconfig"></a> `serverConfig?` | [`ServerConfig`](ServerConfig.md) | 禅道服务端配置。 | [src/types/index.ts:171](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L171) |
| <a id="property-token"></a> `token` | `string` | 禅道 API Token。 | [src/types/index.ts:163](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L163) |
| <a id="property-user"></a> `user?` | `Record`\<`string`, `unknown`\> | 登录验证通过后得到的用户信息。 | [src/types/index.ts:165](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L165) |
