[zentao-api](../index.md) / readImageFile

# Function: readImageFile()

> **readImageFile**(`source`, `options?`): `Promise`\<[`ImageFileContent`](../interfaces/ImageFileContent.md) \| `undefined`\>

从当前禅道站点读取图片附件。路径中有图片后缀时直接调用 file/read。
无后缀的读取链接和数字 ID 先通过 file/get 取得扩展名，缺少扩展名时取文件标题的后缀。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `string` \| `number` \| [`ParsedFileUrl`](../interfaces/ParsedFileUrl.md) | 附件 URL、[parseFileUrl](parseFileUrl.md) 的解析结果或数字 ID。带域名的 URL 按客户端站点和安装目录匹配。解析结果和 ID 均指当前站点。 |
| `options` | `Pick`\<[`RequestOptions`](../interfaces/RequestOptions.md), `"client"` \| `"timeout"` \| `"insecure"` \| `"actionAssistant"`\> | 客户端和传输选项，省略时使用 SDK 默认值。 |

## Returns

`Promise`\<[`ImageFileContent`](../interfaces/ImageFileContent.md) \| `undefined`\>

含二进制内容、文件名和 MIME 类型的图片。下载链接、无效地址、非图片或空内容返回 `undefined`。

## Throws

沿用附件请求的客户端、版本、传输或服务端错误。
