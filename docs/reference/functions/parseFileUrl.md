[zentao-api](../index.md) / parseFileUrl

# Function: parseFileUrl()

> **parseFileUrl**(`url`, `siteUrl?`): [`ParsedFileUrl`](../interfaces/ParsedFileUrl.md) \| `undefined`

解析禅道附件的读取或下载路由。路径式链接可附带普通查询参数。
用查询参数指定路由时，模块、方法和文件 ID 必须唯一，且不能与路径路由混用。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `url` | `string` | 附件路径或 URL，支持一次 HTML `&amp;` 转义。 |
| `siteUrl?` | `string` | 禅道站点根地址，含安装目录。解析带域名的地址时必填。 |

## Returns

[`ParsedFileUrl`](../interfaces/ParsedFileUrl.md) \| `undefined`

路由信息。地址无效、站点不匹配或路由含糊时返回 `undefined`。
