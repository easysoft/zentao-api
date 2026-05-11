[zentao-api](../index.md) / ModuleAction

# Interface: ModuleAction

Defined in: [src/types/index.ts:263](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L263)

禅道模块中的单个 API 动作定义。

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-description"></a> `description?` | `string` | 动作说明。 | [src/types/index.ts:271](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L271) |
| <a id="property-display"></a> `display?` | `string` | 面向用户展示的动作名称。 | [src/types/index.ts:269](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L269) |
| <a id="property-method"></a> `method` | [`ModuleActionMethod`](../type-aliases/ModuleActionMethod.md) | HTTP 方法。 | [src/types/index.ts:273](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L273) |
| <a id="property-name"></a> `name` | [`ModuleActionName`](../type-aliases/ModuleActionName.md) | 动作名称，例如 `list`、`get`、`close`。 | [src/types/index.ts:265](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L265) |
| <a id="property-pagergetter"></a> `pagerGetter?` | `string` \| [`ModuleActionPagerGetterMap`](ModuleActionPagerGetterMap.md) \| ((`data`, `params`) => [`Pager`](Pager.md)) | 从原始响应中提取分页信息的位置或函数。 | [src/types/index.ts:285](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L285) |
| <a id="property-params"></a> `params?` | [`ModuleActionParam`](ModuleActionParam.md)[] | 查询参数定义。 | [src/types/index.ts:279](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L279) |
| <a id="property-path"></a> `path` | `string` | API 路径模板，可包含 `{productID}` 等路径参数。 | [src/types/index.ts:275](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L275) |
| <a id="property-pathparams"></a> `pathParams?` | `Record`\<`string`, `string` \| `Omit`\<[`ModuleActionParam`](ModuleActionParam.md), `"name"`\>\> | 路径参数定义；字符串为说明，对象可携带默认值和可选项。 | [src/types/index.ts:277](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L277) |
| <a id="property-render"></a> `render?` | `string` \| [`ModuleActionResultRender`](../type-aliases/ModuleActionResultRender.md) \| `Record`\<[`ModuleActionResultRenderType`](../type-aliases/ModuleActionResultRenderType.md), [`ModuleActionResultRender`](../type-aliases/ModuleActionResultRender.md)\> | 供上层应用使用的渲染配置。 | [src/types/index.ts:289](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L289) |
| <a id="property-requestbody"></a> `requestBody?` | [`ModuleActionRequestBody`](ModuleActionRequestBody.md) | 请求体定义。 | [src/types/index.ts:281](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L281) |
| <a id="property-resultgetter"></a> `resultGetter?` | `string` \| `Record`\<`string`, `string`\> \| ((`data`, `params`) => `unknown`) | 从原始响应中提取业务数据的位置或函数。 | [src/types/index.ts:287](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L287) |
| <a id="property-resulttype"></a> `resultType` | [`ModuleActionResultType`](../type-aliases/ModuleActionResultType.md) | 结果形态。 | [src/types/index.ts:283](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L283) |
| <a id="property-type"></a> `type` | [`ModuleActionType`](../type-aliases/ModuleActionType.md) | 动作类型，决定高阶 request 的路径/参数解析策略。 | [src/types/index.ts:267](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L267) |
