[zentao-api](../index.md) / defineModules

# Function: defineModules()

> **defineModules**(`input`, `options?`): `void`

Defined in: [src/modules/registry.ts:91](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/modules/registry.ts#L91)

定义或扩展模块；同名模块默认合并动作，`replace` 为真时整体替换，未知模块追加。

## Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`ModuleDefinition`](../interfaces/ModuleDefinition.md) \| [`ModuleDefinition`](../interfaces/ModuleDefinition.md)[] |
| `options` | [`DefineModulesOptions`](../interfaces/DefineModulesOptions.md) |

## Returns

`void`
