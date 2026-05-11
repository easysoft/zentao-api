[zentao-api](../index.md) / ZentaoProfileRecord

# Interface: ZentaoProfileRecord

Defined in: [src/types/index.ts:179](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L179)

运行时返回的 profile，会额外带上 `account@server` 形式的 key。

## Extends

- [`ZentaoProfile`](ZentaoProfile.md)

## Indexable

> \[`key`: `string`\]: `unknown`

允许上层应用保存额外字段。

## Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="property-account"></a> `account` | `string` | 用户账号。 | [`ZentaoProfile`](ZentaoProfile.md).[`account`](ZentaoProfile.md#property-account) | [src/types/index.ts:161](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L161) |
| <a id="property-config"></a> `config?` | [`ZentaoProfileConfig`](ZentaoProfileConfig.md) | 客户端自定义配置。 | [`ZentaoProfile`](ZentaoProfile.md).[`config`](ZentaoProfile.md#property-config) | [src/types/index.ts:173](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L173) |
| <a id="property-key"></a> `key` | `string` | - | - | [src/types/index.ts:180](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L180) |
| <a id="property-lastusedtime"></a> `lastUsedTime?` | `string` | 最后使用时间。 | [`ZentaoProfile`](ZentaoProfile.md).[`lastUsedTime`](ZentaoProfile.md#property-lastusedtime) | [src/types/index.ts:169](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L169) |
| <a id="property-logintime"></a> `loginTime?` | `string` | 登录时间。 | [`ZentaoProfile`](ZentaoProfile.md).[`loginTime`](ZentaoProfile.md#property-logintime) | [src/types/index.ts:167](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L167) |
| <a id="property-server"></a> `server` | `string` | 禅道站点根地址，不包含 `/api.php/v2`。 | [`ZentaoProfile`](ZentaoProfile.md).[`server`](ZentaoProfile.md#property-server) | [src/types/index.ts:159](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L159) |
| <a id="property-serverconfig"></a> `serverConfig?` | [`ServerConfig`](ServerConfig.md) | 禅道服务端配置。 | [`ZentaoProfile`](ZentaoProfile.md).[`serverConfig`](ZentaoProfile.md#property-serverconfig) | [src/types/index.ts:171](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L171) |
| <a id="property-token"></a> `token` | `string` | 禅道 API Token。 | [`ZentaoProfile`](ZentaoProfile.md).[`token`](ZentaoProfile.md#property-token) | [src/types/index.ts:163](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L163) |
| <a id="property-user"></a> `user?` | `Record`\<`string`, `unknown`\> | 登录验证通过后得到的用户信息。 | [`ZentaoProfile`](ZentaoProfile.md).[`user`](ZentaoProfile.md#property-user) | [src/types/index.ts:165](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L165) |
