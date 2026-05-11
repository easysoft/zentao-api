[zentao-api](../index.md) / ModuleActionParam

# Interface: ModuleActionParam

模块动作的查询参数定义。

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-defaultvalue"></a> `defaultValue?` | `unknown` | 未显式传入时使用的默认值。 |
| <a id="property-description"></a> `description?` | `string` | 参数说明。 |
| <a id="property-name"></a> `name` | `string` | 参数名称。 |
| <a id="property-options"></a> `options?` | [`ModuleActionParamOption`](../type-aliases/ModuleActionParamOption.md)[] | 参数可选值。 |
| <a id="property-required"></a> `required?` | `boolean` | 是否必填。 |
| <a id="property-type"></a> `type?` | `"string"` \| `"number"` \| `"boolean"` | 参数值类型，用于基础类型转换。 |
