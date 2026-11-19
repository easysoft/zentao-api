[zentao-api](../index.md) / extractFileIdsFromHtml

# Function: extractFileIdsFromHtml()

> **extractFileIdsFromHtml**(`html`, `siteUrl`): \[`string`, `number`\][]

按富文本 HTML 中 `<img>` 的出现顺序提取禅道图片引用，保留重复项。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `html` | `string` | 禅道富文本 HTML。 |
| `siteUrl` | `string` | 禅道站点根地址，含安装目录，用于匹配带域名的图片地址。 |

## Returns

\[`string`, `number`\][]

每项为 `[imgSrc, zentaoFileID]`。src 使用 HTML 实体解码后的属性值，保留相对路径。没有匹配图片时返回空数组。
