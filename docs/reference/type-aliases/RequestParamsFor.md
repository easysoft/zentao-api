[zentao-api](../index.md) / RequestParamsFor

# Type Alias: RequestParamsFor\<Name\>

> **RequestParamsFor**\<`Name`\> = `Name` *extends* `"file/create"` ? [`FileCreateParams`](FileCreateParams.md) : `Record`\<`string`, `unknown`\>

根据内置请求名推导出的参数类型。字段细节以运行时 registry 为准，这里保持可扩展。

## Type Parameters

| Type Parameter |
| ------ |
| `Name` *extends* [`BuiltinRequestName`](BuiltinRequestName.md) |
