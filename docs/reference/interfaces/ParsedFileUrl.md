[zentao-api](../index.md) / ParsedFileUrl

# Interface: ParsedFileUrl

禅道附件页面路由。只有路径式 read 链接提供文件后缀。

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-extension"></a> `extension?` | `string` | 小写后缀，不含点。查询路由的视图参数不代表文件格式。 |
| <a id="property-fileid"></a> `fileID` | `number` | - |
| <a id="property-method"></a> `method` | `"read"` \| `"download"` | - |
