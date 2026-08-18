[zentao-api](../index.md) / FileCreateParams

# Type Alias: FileCreateParams

> **FileCreateParams** = `Record`\<`string`, `unknown`\> & `object`

`request("file/create")` 的参数。

## Type Declaration

| Name | Type |
| ------ | ------ |
| `file` | [`FileUploadSource`](FileUploadSource.md) |
| `objectID` | `number` |
| `objectType` | `"bug"` \| `"story"` \| `"task"` \| `"testcase"` \| `string` & `object` |
