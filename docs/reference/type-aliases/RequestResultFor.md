[zentao-api](../index.md) / RequestResultFor

# Type Alias: RequestResultFor\<Name\>

> **RequestResultFor**\<`Name`\> = `Name` *extends* `"setting/workHours"` ? [`WorkHourSettings`](../interfaces/WorkHourSettings.md) : `ActionMetaOf`\<`Name`\> *extends* `object` ? [`DataRecord`](DataRecord.md)[] : `Name` *extends* `"file/create"` ? [`FileCreateResult`](../interfaces/FileCreateResult.md) : `Name` *extends* `"file/read"` ? `ArrayBuffer` \| `string` : `ActionMetaOf`\<`Name`\> *extends* `object` ? [`DataRecord`](DataRecord.md) : `unknown`

根据内置请求名推导出的 `ResponseData.data` 类型。

## Type Parameters

| Type Parameter |
| ------ |
| `Name` *extends* [`BuiltinRequestName`](BuiltinRequestName.md) |
