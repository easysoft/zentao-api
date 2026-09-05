[zentao-api](../index.md) / getModuleActionParams

# Function: getModuleActionParams()

> **getModuleActionParams**(`moduleName`, `actionName`, `options?`): [`ModuleActionParam`](../interfaces/ModuleActionParam.md)[]

获取指定模块下的某个动作的参数。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `moduleName` | `string` | 模块名（大小写不敏感）。 |
| `actionName` | `string` | 动作名（大小写不敏感）；支持 `ls` 作为 `list` 的别名。 |
| `options?` | [`ModuleQueryOptions`](../interfaces/ModuleQueryOptions.md) & `object` | 选项。 |

## Returns

[`ModuleActionParam`](../interfaces/ModuleActionParam.md)[]

动作参数。
