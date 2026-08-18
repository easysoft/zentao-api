[zentao-api](../index.md) / FileUploadDataInput

# Interface: FileUploadDataInput

内存数据形式的上传输入。

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-contenttype"></a> `contentType?` | `string` | 显式 MIME 类型；省略时优先使用 Blob.type，再按文件名推断。 |
| <a id="property-data"></a> `data` | `Blob` \| `ArrayBuffer` \| `ArrayBufferView`\<`ArrayBufferLike`\> | 文件内容。 |
| <a id="property-filename"></a> `filename` | `string` | 上传时使用的文件名。 |
