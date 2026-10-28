[zentao-api](../index.md) / ModuleQueryOptions

# Interface: ModuleQueryOptions

注册库查询选项；不传版本时返回完整的当前定义，不使用全局版本。

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-apiversion"></a> `apiVersion?` | [`ApiVersionOption`](../type-aliases/ApiVersionOption.md) | Contract generation to inspect; defaults to v2. Auto requires a server version. |
| <a id="property-version"></a> `version?` | `string` | 仅返回该禅道版本支持的动作，以及至少含有一个支持动作的模块。 |
