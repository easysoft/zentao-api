[zentao-api](../index.md) / FileCreateParams

# Type Alias: FileCreateParams

> **FileCreateParams** = `Record`\<`string`, `unknown`\> & `object`

`request("file/create")` 的参数。

## Type Declaration

| Name | Type | Description |
| ------ | ------ | ------ |
| `extra?` | `string` | 附件标记，默认 editor（文档编辑器图片），23.0 / biz14.0 / max9.0 / ipd6.0 起支持；显式空字符串用于普通附件，其他值由服务端按空字符串处理。 |
| `file` | [`FileUploadSource`](FileUploadSource.md) | - |
| `objectID?` | `number` | - |
| `objectType?` | `"bug"` \| `"story"` \| `"task"` \| `"testcase"` \| `string` & `object` | - |
| `uid?` | `string` | 上传批次。保存同一对象时在 JSON 体中携带相同 uid，并使用同一个 Token。 |
