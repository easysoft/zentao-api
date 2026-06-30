[zentao-api](../index.md) / ModuleActionRequest

# Interface: ModuleActionRequest

将模块动作和参数解析后的可执行请求描述。

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-action"></a> `action` | [`ModuleAction`](ModuleAction.md) | 匹配到的动作定义。 |
| <a id="property-data"></a> `data?` | `Record`\<`string`, `unknown`\> | 已组装的请求体。 |
| <a id="property-id"></a> `id?` | `number` | 从 `id` 或 `{module}ID` 推断出的对象 ID。 |
| <a id="property-module"></a> `module` | `string` | 模块名称。 |
| <a id="property-params"></a> `params` | `Record`\<`string`, `unknown`\> | 原始调用参数。 |
| <a id="property-path"></a> `path` | `string` | 已替换路径参数后的 API 路径。 |
| <a id="property-query"></a> `query?` | `Record`\<`string`, `string` \| `number`\> | 已组装的查询参数。 |
