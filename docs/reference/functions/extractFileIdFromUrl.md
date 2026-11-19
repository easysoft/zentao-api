[zentao-api](../index.md) / extractFileIdFromUrl

# Function: extractFileIdFromUrl()

> **extractFileIdFromUrl**(`url`, `siteUrl?`): `number` \| `undefined`

从禅道富文本图片的 `src` 提取文件 ID，支持路径路由和 GET 查询路由。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `url` | `string` | 图片的相对路径或 HTTP(S) 地址。查询参数可使用 `&amp;` 分隔。 |
| `siteUrl?` | `string` | 禅道站点根地址，含安装目录。解析带域名的地址时必填。 |

## Returns

`number` \| `undefined`

正的安全整数 ID。地址无效、站点或路由不匹配时返回 `undefined`。
