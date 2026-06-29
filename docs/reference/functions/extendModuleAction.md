[zentao-api](../index.md) / extendModuleAction

# Function: extendModuleAction()

> **extendModuleAction**(`moduleName`, `actionName`, `action`): `void`

扩展已存在的模块动作。

与 [defineModuleActions](defineModuleActions.md) 的「整体替换」不同，这里对单个动作做**深度合并**：
只需给出待修改的字段，其余字段沿用原动作定义。普通对象递归合并，
数组及其他值由补丁整体替换，值为 `undefined` 的键会被忽略。

当 `action` 为函数时**不做合并**：会以当前动作的深克隆为入参调用它，
其返回值作为完整的动作定义直接取代原动作定义。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `moduleName` | `string` | 目标模块名（大小写不敏感）。 |
| `actionName` | `string` | 目标动作名（大小写不敏感）。 |
| `action` | `Partial`\<[`ModuleAction`](../interfaces/ModuleAction.md)\> \| ((`action`) => [`ModuleAction`](../interfaces/ModuleAction.md)) | 深度合并的补丁对象，或接收当前动作深克隆并返回完整动作定义的函数。 |

## Returns

`void`

## Throws

`E_INVALID_MODULE`（模块未注册）、`E_INVALID_ACTION`（动作不存在）
  或 `E_INVALID_ACTION_DEFINITION`（合并结果缺少 `name` / `path` / `method` 等必填字段）。
