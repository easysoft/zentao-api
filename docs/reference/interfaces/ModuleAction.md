[zentao-api](../index.md) / ModuleAction

# Interface: ModuleAction

禅道模块中的单个 API 动作定义。

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-description"></a> `description?` | `string` | 动作说明。 |
| <a id="property-display"></a> `display?` | `string` | 面向用户展示的动作名称。 |
| <a id="property-method"></a> `method` | [`ModuleActionMethod`](../type-aliases/ModuleActionMethod.md) | HTTP 方法。 |
| <a id="property-name"></a> `name` | [`ModuleActionName`](../type-aliases/ModuleActionName.md) | 动作名称，例如 `list`、`get`、`close`。 |
| <a id="property-pagergetter"></a> `pagerGetter?` | `string` \| [`ModuleActionPagerGetterMap`](ModuleActionPagerGetterMap.md) \| ((`data`, `params`) => [`Pager`](Pager.md)) | 从原始响应中提取分页信息的位置或函数。 |
| <a id="property-params"></a> `params?` | [`ModuleActionParam`](ModuleActionParam.md)[] | 查询参数定义。 |
| <a id="property-path"></a> `path` | `string` | API 路径模板，可包含 `{productID}` 等路径参数。 |
| <a id="property-pathparams"></a> `pathParams?` | `Record`\<`string`, `string` \| `Omit`\<[`ModuleActionParam`](ModuleActionParam.md), `"name"`\>\> | 路径参数定义；字符串为说明，对象可携带默认值和可选项。 |
| <a id="property-render"></a> `render?` | `string` \| [`ModuleActionResultRender`](../type-aliases/ModuleActionResultRender.md) \| `Record`\<[`ModuleActionResultRenderType`](../type-aliases/ModuleActionResultRenderType.md), [`ModuleActionResultRender`](../type-aliases/ModuleActionResultRender.md)\> | 供上层应用使用的渲染配置。 |
| <a id="property-requestbody"></a> `requestBody?` | [`ModuleActionRequestBody`](ModuleActionRequestBody.md) | 请求体定义。 |
| <a id="property-resultgetter"></a> `resultGetter?` | `string` \| `Record`\<`string`, `string`\> \| ((`data`, `params`) => `unknown`) | 从原始响应中提取业务数据的位置或函数。 |
| <a id="property-resulttype"></a> `resultType` | [`ModuleActionResultType`](../type-aliases/ModuleActionResultType.md) | 结果形态。 |
| <a id="property-type"></a> `type` | [`ModuleActionType`](../type-aliases/ModuleActionType.md) | 动作类型，决定高阶 request 的路径/参数解析策略。 |
