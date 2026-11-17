[zentao-api](../index.md) / parseLink

# Function: parseLink()

> **parseLink**(`profile`, `url?`, `options?`): [`ZentaoLink`](../interfaces/ZentaoLink.md)

解析禅道页面链接，同步执行且不读取浏览器当前位置、存储或网络。

相对链接以 profile 的页面根路径为基准；同源页面目录和显式配置的入口路径属于内部链接。
其他 origin、这些路径之外及非 HTTP(S) 链接标记为外链。
默认使用 serverConfig.requestType，`requestType: 'auto'` 根据路由参数与入口路径识别。
GET 查询值会解码，同名值以逗号合并；路径变量保留编码并附加到 params 的 `$1`、`$2` 等键。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `profile` | [`LinkProfile`](../type-aliases/LinkProfile.md) | 使用 server 与 serverConfig，无需账号或 Token。 |
| `url?` | `string` | 完整网址或相对链接；空输入直接返回 `{ url }`。 |
| `options?` | [`ParseLinkOptions`](../interfaces/ParseLinkOptions.md) | 可覆盖路由模式或启用自动识别。 |

## Returns

[`ZentaoLink`](../interfaces/ZentaoLink.md)

链接信息；外链仅包含原 url 和 external 标记。

## Throws

`E_MISSING_PARAM`（缺少必要路由配置）、`E_INVALID_PARAM`
  （不支持的路由模式或非法 URL/配置路径）、`E_INVALID_BASE_URL`。
