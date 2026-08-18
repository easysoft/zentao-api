[zentao-api](../index.md) / FileUploadPathInput

# Interface: FileUploadPathInput

Node.js/Bun 本地文件路径形式的上传输入。

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-contenttype"></a> `contentType?` | `string` | 显式 MIME 类型；省略时按文件名推断。 |
| <a id="property-filename"></a> `filename?` | `string` | 上传时使用的文件名；省略时取路径 basename。 |
| <a id="property-path"></a> `path` | `string` | 本地文件路径。 |
