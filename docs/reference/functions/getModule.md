[zentao-api](../index.md) / getModule

# Function: getModule()

> **getModule**(`moduleName`, `options?`): [`ModuleDefinition`](../interfaces/ModuleDefinition.md) \| `undefined`

获取模块定义。

模块名匹配大小写不敏感。未传版本时返回注册表内部的已深冻结引用（O(1) 查询、零拷贝），
任何写入尝试在严格模式下会抛 `TypeError`；如需修改请使用 [defineModules](defineModules.md)。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `moduleName` | `string` | 模块名。 |
| `options` | [`ModuleQueryOptions`](../interfaces/ModuleQueryOptions.md) | 可选版本过滤；不传时保留完整注册表引用，传入时返回冻结的过滤视图。 |

## Returns

[`ModuleDefinition`](../interfaces/ModuleDefinition.md) \| `undefined`

已注册的模块定义；模块未注册或过滤后没有动作时返回 `undefined`。
