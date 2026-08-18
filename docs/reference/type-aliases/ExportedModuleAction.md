[zentao-api](../index.md) / ExportedModuleAction

# Type Alias: ExportedModuleAction

> **ExportedModuleAction** = `Omit`\<[`ModuleAction`](../interfaces/ModuleAction.md), `"requestBody"`\> & `object`

导出的模块动作定义。

## Type Declaration

| Name | Type | Description |
| ------ | ------ | ------ |
| `bodyMediaType?` | [`ModuleActionRequestMediaType`](ModuleActionRequestMediaType.md) | 请求体媒体类型；省略时为 `application/json`。 |
| `bodyParams` | [`ModuleActionParam`](../interfaces/ModuleActionParam.md)[] | - |
