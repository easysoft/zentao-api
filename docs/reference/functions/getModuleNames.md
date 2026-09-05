[zentao-api](../index.md) / getModuleNames

# Function: getModuleNames()

> **getModuleNames**(`options?`): `string`[]

返回当前运行时注册表中的所有模块名。

顺序与模块写入注册表的顺序一致；包括内置模块和通过 [defineModules](defineModules.md) 追加的用户模块。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`ModuleQueryOptions`](../interfaces/ModuleQueryOptions.md) | 可选版本过滤，仅保留含有支持动作的模块。 |

## Returns

`string`[]

模块名数组（保留原始大小写）。
