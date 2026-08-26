[zentao-api](../index.md) / ModuleActionParam

# Interface: ModuleActionParam

模块动作的查询参数定义。

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-defaultvalue"></a> `defaultValue?` | `unknown` | 未显式传入时使用的默认值。 |
| <a id="property-description"></a> `description?` | `string` | 参数说明。 |
| <a id="property-explode"></a> `explode?` | `boolean` | OpenAPI 查询参数是否展开序列化。 |
| <a id="property-format"></a> `format?` | `string` | OpenAPI schema format，例如 `binary` 或 `int32`。 |
| <a id="property-name"></a> `name` | `string` | 参数名称。 |
| <a id="property-options"></a> `options?` | readonly [`ModuleActionParamOption`](../type-aliases/ModuleActionParamOption.md)[] | 参数可选值。 |
| <a id="property-required"></a> `required?` | `boolean` | 是否必填。 |
| <a id="property-role"></a> `role?` | [`ModuleActionParamRole`](../type-aliases/ModuleActionParamRole.md) | 参数角色。 |
| <a id="property-style"></a> `style?` | `string` | OpenAPI 查询参数序列化样式，例如 `deepObject`。 |
| <a id="property-type"></a> `type?` | `"string"` \| `"number"` \| `"boolean"` \| `"object"` \| `"array"` | 参数值类型，用于基础类型转换。 |
