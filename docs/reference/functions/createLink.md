[zentao-api](../index.md) / createLink

# Function: createLink()

> **createLink**(`profile`, `options`): `string`

根据 profile 的服务器配置创建禅道页面链接，同步执行且不访问存储或网络。

支持 GET、PATH_INFO、PATH_INFO2。`relative` 优先级为单次选项 > 全局选项 > false（完整网址）；true 返回站内路径。
`vars` 和 `params` 沿用页面 helper 的约定：调用方按需编码，SDK 不二次编码；不修改输入。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `profile` | [`LinkProfile`](../type-aliases/LinkProfile.md) | 使用 server 与 serverConfig，无需账号或 Token。 |
| `options` | [`CreateLinkOptions`](../interfaces/CreateLinkOptions.md) | 页面模块、方法、参数与输出选项。 |

## Returns

`string`

完整网址或站内路径。

## Throws

`E_MISSING_PARAM`（缺少必要路由配置或页面参数）、
  `E_INVALID_PARAM`（不支持的路由模式或非法配置路径）、`E_INVALID_BASE_URL`。
