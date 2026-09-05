[zentao-api](../index.md) / isModuleName

# Function: isModuleName()

> **isModuleName**(`moduleName`, `options?`): `boolean`

判断模块名是否已注册。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `moduleName` | `string` | 模块名；匹配大小写不敏感。 |
| `options?` | [`ModuleQueryOptions`](../interfaces/ModuleQueryOptions.md) | 可选版本过滤。 |

## Returns

`boolean`

已注册返回 `true`，否则 `false`。
