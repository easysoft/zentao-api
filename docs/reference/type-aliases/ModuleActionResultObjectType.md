[zentao-api](../index.md) / ModuleActionResultObjectType

# Type Alias: ModuleActionResultObjectType

> **ModuleActionResultObjectType** = `string` \| \{ `map?`: `Readonly`\<`Record`\<`string`, `string`\>\>; `param`: `string`; \} \| `null`

返回业务对象的 SDK 资源类型，或从调用参数读取类型的可序列化规则。
`null` 表示没有统一对象类型；类型名称不要求是已注册的模块名。

## Union Members

`string`

***

### Type Literal

\{ `map?`: `Readonly`\<`Record`\<`string`, `string`\>\>; `param`: `string`; \}

| Name | Type | Description |
| ------ | ------ | ------ |
| `map?` | `Readonly`\<`Record`\<`string`, `string`\>\> | 参数值到 SDK 类型名的映射；未命中时保留原值。 |
| `param` | `string` | 从 `beforeRequest` 执行后的 `params[param]` 读取非空字符串。 |

***

`null`
