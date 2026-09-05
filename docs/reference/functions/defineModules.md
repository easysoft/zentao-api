[zentao-api](../index.md) / defineModules

# Function: defineModules()

> **defineModules**(`input`, `options?`): `void`

注册或扩展模块定义。

行为细节：
- 模块名匹配大小写不敏感。
- 未知模块直接追加到注册表末尾。
- 已存在的模块默认按 `mergeModule` 合并：模块元数据浅合并、动作按名同名替换/未知追加；
  `options.replace` 为 `true` 时整体替换。
- 所有写入都会做深克隆 + 深冻结：调用方后续修改自己的对象不会污染注册表，注册表也不可被外部改写。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | [`ModuleDefinition`](../interfaces/ModuleDefinition.md) \| [`ModuleDefinition`](../interfaces/ModuleDefinition.md)[] | 单个或一组模块定义。 |
| `options` | [`DefineModulesOptions`](../interfaces/DefineModulesOptions.md) | 写入策略，参见 [DefineModulesOptions](../interfaces/DefineModulesOptions.md)。 |

## Returns

`void`

## Throws

`E_INVALID_MODULE_DEFINITION` —— 缺少 `name` 或 `actions` 字段；
  `E_INVALID_ACTION_DEFINITION` —— 动作字段非法或 `minVersion` 缺失、为空、格式错误、系列重复。
