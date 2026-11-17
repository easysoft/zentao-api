[zentao-api](../index.md) / CreateLinkOptions

# Interface: CreateLinkOptions

创建禅道页面链接的参数。参数名和参数值由调用方按需 URL 编码，SDK 不二次编码。

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-hash"></a> `hash?` | `string` | 锚点，可带前导 `#`；空字符串会添加结尾的 `#`。 |
| <a id="property-methodname"></a> `methodName` | `string` | 页面方法名，例如 `view`。 |
| <a id="property-modulename"></a> `moduleName` | `string` | 页面模块名，例如 `bug`。 |
| <a id="property-params"></a> `params?` | `Record`\<`string`, `unknown`\> | 始终追加到查询字符串的参数；跳过 `$` 开头的键，null/undefined 转为空值。 |
| <a id="property-relative"></a> `relative?` | `boolean` | 返回以 `/` 开头的站内路径；默认 false，返回完整网址。 |
| <a id="property-vars"></a> `vars?` | `string` \| readonly `string`[] \| readonly readonly \[`string`, `string`\][] | 方法参数，支持 `bugID=1&from=list`、字符串数组或键值对数组；路径模式按顺序使用值。 |
| <a id="property-viewtype"></a> `viewType?` | `string` | 视图类型；默认使用服务器的 `defaultView`，未配置时为 `html`。 |
