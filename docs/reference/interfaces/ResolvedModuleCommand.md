[zentao-api](../index.md) / ResolvedModuleCommand

# Interface: ResolvedModuleCommand

Defined in: [src/types/index.ts:328](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L328)

将模块动作和参数解析后的可执行请求描述。

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-action"></a> `action` | [`ModuleAction`](ModuleAction.md) | 匹配到的动作定义。 | [src/types/index.ts:332](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L332) |
| <a id="property-data"></a> `data?` | `Record`\<`string`, `unknown`\> | 已组装的请求体。 | [src/types/index.ts:340](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L340) |
| <a id="property-id"></a> `id?` | `number` | 从 `id` 或 `{module}ID` 推断出的对象 ID。 | [src/types/index.ts:342](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L342) |
| <a id="property-module"></a> `module` | `string` | 模块名称。 | [src/types/index.ts:330](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L330) |
| <a id="property-params"></a> `params` | `Record`\<`string`, `unknown`\> | 原始调用参数。 | [src/types/index.ts:334](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L334) |
| <a id="property-path"></a> `path` | `string` | 已替换路径参数后的 API 路径。 | [src/types/index.ts:336](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L336) |
| <a id="property-query"></a> `query?` | `Record`\<`string`, `string` \| `number`\> | 已组装的查询参数。 | [src/types/index.ts:338](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L338) |
