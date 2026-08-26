[zentao-api](../index.md) / getModuleActionParams

# Function: getModuleActionParams()

> **getModuleActionParams**(`moduleName`, `actionName`, `options?`): [`ModuleActionParam`](../interfaces/ModuleActionParam.md)[]

获取指定模块下的某个动作的参数。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `moduleName` | `string` | 模块名（大小写不敏感）。 |
| `actionName` | `string` | 动作名（大小写不敏感）；支持 `ls` 作为 `list` 的别名。 |
| `options?` | \{ `roles?`: [`ModuleActionParamRole`](../type-aliases/ModuleActionParamRole.md)[]; \} | 选项。 |
| `options.roles?` | [`ModuleActionParamRole`](../type-aliases/ModuleActionParamRole.md)[] | 角色，可选 `path`、`query`、`body`。 |

## Returns

[`ModuleActionParam`](../interfaces/ModuleActionParam.md)[]

动作参数。
