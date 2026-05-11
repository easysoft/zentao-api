[zentao-api](../index.md) / ModuleActionRequestBody

# Interface: ModuleActionRequestBody

模块动作请求体定义。

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-example"></a> `example?` | `unknown` | 请求体示例。 |
| <a id="property-required"></a> `required?` | `boolean` | 请求体是否必填。 |
| <a id="property-schema"></a> `schema` | `Record`\<`string`, `unknown`\> | OpenAPI 风格 schema，用于从 params 组装 body。 |
| <a id="property-type"></a> `type?` | `"string"` \| `"object"` | 请求体类型。 |
