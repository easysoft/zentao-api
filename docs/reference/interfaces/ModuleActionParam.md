[zentao-api](../index.md) / ModuleActionParam

# Interface: ModuleActionParam

Defined in: [src/types/index.ts:201](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L201)

模块动作的查询参数定义。

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-defaultvalue"></a> `defaultValue?` | `unknown` | 未显式传入时使用的默认值。 | [src/types/index.ts:209](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L209) |
| <a id="property-description"></a> `description?` | `string` | 参数说明。 | [src/types/index.ts:205](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L205) |
| <a id="property-name"></a> `name` | `string` | 参数名称。 | [src/types/index.ts:203](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L203) |
| <a id="property-options"></a> `options?` | [`ModuleActionParamOption`](../type-aliases/ModuleActionParamOption.md)[] | 参数可选值。 | [src/types/index.ts:213](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L213) |
| <a id="property-required"></a> `required?` | `boolean` | 是否必填。 | [src/types/index.ts:207](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L207) |
| <a id="property-type"></a> `type?` | `"string"` \| `"number"` \| `"boolean"` | 参数值类型，用于基础类型转换。 | [src/types/index.ts:211](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L211) |
