[zentao-api](../index.md) / ZentaoProfileConfig

# Interface: ZentaoProfileConfig

保存到本地 profile 中的客户端偏好配置。

## Indexable

> \[`key`: `string`\]: `unknown`

允许上层应用保存自定义配置。

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-batchfailfast"></a> `batchFailFast?` | `boolean` | 是否在批量操作出错时停止执行后续操作。 |
| <a id="property-defaultoutputformat"></a> `defaultOutputFormat?` | `"markdown"` \| `"json"` \| `"raw"` | 默认输出格式，供 CLI 等上层应用复用。 |
| <a id="property-defaultrecperpage"></a> `defaultRecPerPage?` | `number` | 默认分页大小。 |
| <a id="property-htmltomarkdown"></a> `htmlToMarkdown?` | `boolean` | 是否将对象属性中的 HTML 转换为 Markdown。 |
| <a id="property-insecure"></a> `insecure?` | `boolean` | 是否跳过 TLS 证书验证；仅 Node.js 运行时支持。 |
| <a id="property-jsonpretty"></a> `jsonPretty?` | `boolean` | JSON 格式化时是否添加缩进。 |
| <a id="property-lang"></a> `lang?` | `string` | 界面语言。 |
| <a id="property-pagers"></a> `pagers?` | `Record`\<`string`, `number`\> | 模块级分页偏好。 |
| <a id="property-timeout"></a> `timeout?` | `number` | 请求超时时间，单位毫秒。 |
