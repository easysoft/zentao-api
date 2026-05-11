[zentao-api](../index.md) / ZentaoProfileConfig

# Interface: ZentaoProfileConfig

Defined in: [src/types/index.ts:133](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L133)

保存到本地 profile 中的客户端偏好配置。

## Indexable

> \[`key`: `string`\]: `unknown`

允许上层应用保存自定义配置。

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-batchfailfast"></a> `batchFailFast?` | `boolean` | 是否在批量操作出错时停止执行后续操作。 | [src/types/index.ts:147](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L147) |
| <a id="property-defaultoutputformat"></a> `defaultOutputFormat?` | `"markdown"` \| `"json"` \| `"raw"` | 默认输出格式，供 CLI 等上层应用复用。 | [src/types/index.ts:135](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L135) |
| <a id="property-defaultrecperpage"></a> `defaultRecPerPage?` | `number` | 默认分页大小。 | [src/types/index.ts:139](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L139) |
| <a id="property-htmltomarkdown"></a> `htmlToMarkdown?` | `boolean` | 是否将对象属性中的 HTML 转换为 Markdown。 | [src/types/index.ts:143](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L143) |
| <a id="property-insecure"></a> `insecure?` | `boolean` | 是否跳过 TLS 证书验证；仅 Node.js 运行时支持。 | [src/types/index.ts:141](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L141) |
| <a id="property-jsonpretty"></a> `jsonPretty?` | `boolean` | JSON 格式化时是否添加缩进。 | [src/types/index.ts:149](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L149) |
| <a id="property-lang"></a> `lang?` | `string` | 界面语言。 | [src/types/index.ts:137](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L137) |
| <a id="property-pagers"></a> `pagers?` | `Record`\<`string`, `number`\> | 模块级分页偏好。 | [src/types/index.ts:151](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L151) |
| <a id="property-timeout"></a> `timeout?` | `number` | 请求超时时间，单位毫秒。 | [src/types/index.ts:145](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L145) |
