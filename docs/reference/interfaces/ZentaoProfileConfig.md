[zentao-api](../index.md) / ZentaoProfileConfig

# Interface: ZentaoProfileConfig

保存到本地 profile 中的客户端偏好配置。
SDK 自动恢复 `timeout` / `insecure`；其余字段仅供上层应用读取和解释。
自定义值应使用 JSON 数据，不保留 Date、Map 等类型信息，不支持 BigInt 或循环对象。

## Indexable

> \[`key`: `string`\]: `unknown`

允许上层应用保存 JSON 格式的自定义配置。

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-batchfailfast"></a> `batchFailFast?` | `boolean` | 上层应用是否在批量操作出错时停止执行后续操作。 |
| <a id="property-defaultoutputformat"></a> `defaultOutputFormat?` | `"json"` \| `"raw"` \| `"markdown"` | 默认输出格式，供 CLI 等上层应用复用。 |
| <a id="property-defaultrecperpage"></a> `defaultRecPerPage?` | `number` | 上层应用的默认分页大小；SDK 请求分页使用 `recPerPage` 选项。 |
| <a id="property-insecure"></a> `insecure?` | `boolean` | 是否跳过 TLS 证书验证；仅 Node.js 运行时支持。 |
| <a id="property-jsonpretty"></a> `jsonPretty?` | `boolean` | 上层应用格式化 JSON 时是否添加缩进。 |
| <a id="property-lang"></a> `lang?` | `string` | 上层应用的界面语言，SDK 不自动应用。 |
| <a id="property-pagers"></a> `pagers?` | `Record`\<`string`, `number`\> | 上层应用的模块级分页偏好，SDK 不自动应用。 |
| <a id="property-timeout"></a> `timeout?` | `number` | 请求超时时间，单位毫秒。 |
