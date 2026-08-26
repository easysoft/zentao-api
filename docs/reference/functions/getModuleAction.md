[zentao-api](../index.md) / getModuleAction

# Function: getModuleAction()

> **getModuleAction**(`moduleName`, `actionName`): [`ModuleAction`](../interfaces/ModuleAction.md) \| `undefined`

获取指定模块下的某个动作。

解析顺序：
1. `actionName === 'ls'` 时映射为 `list`（仅作为别名，不会修改注册表）。
2. 在该模块的动作中按名称大小写不敏感匹配。

返回值同样是已深冻结的引用，请勿尝试修改。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `moduleName` | `string` | 模块名（大小写不敏感）。 |
| `actionName` | `string` | 动作名（大小写不敏感）；支持 `ls` 作为 `list` 的别名。 |

## Returns

[`ModuleAction`](../interfaces/ModuleAction.md) \| `undefined`

匹配到的动作定义；模块未注册或动作不存在时返回 `undefined`。
