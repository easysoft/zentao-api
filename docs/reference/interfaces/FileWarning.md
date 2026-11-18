[zentao-api](../index.md) / FileWarning

# Interface: FileWarning

HTML 文件处理中的错误上下文，可用于展示问题或重试关联、清理。

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-code"></a> `code` | `string` | SDK 或服务端错误码。 |
| <a id="property-field"></a> `field?` | `string` | HTML body 字段名。 |
| <a id="property-fileid"></a> `fileID?` | `number` | 本次上传产生的禅道文件 ID。 |
| <a id="property-message"></a> `message` | `string` | 可读错误消息。 |
| <a id="property-name"></a> `name?` | `string` | 文件名。 |
| <a id="property-objectid"></a> `objectID?` | `number` | 文件应关联的对象 ID。 |
| <a id="property-objecttype"></a> `objectType?` | `string` | 文件应关联的对象类型。 |
| <a id="property-path"></a> `path?` | `string` | 原始文件引用路径。 |
| <a id="property-stage"></a> `stage` | `"resolve"` \| `"upload"` \| `"associate"` \| `"cleanup"` | 出错阶段：解析、上传、关联或清理。 |
