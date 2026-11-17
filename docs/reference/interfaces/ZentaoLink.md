[zentao-api](../index.md) / ZentaoLink

# Interface: ZentaoLink

解析得到的禅道链接；空输入和外链仅返回 url 及必要的 external 标记。

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-external"></a> `external?` | `boolean` | 是否位于其他 origin，或当前安装目录和显式配置的入口路径之外。 |
| <a id="property-hash"></a> `hash?` | `string` | 不含前导 `#` 的锚点，保留编码。 |
| <a id="property-isonlybody"></a> `isOnlyBody?` | `boolean` | 查询参数 `onlybody` 是否为 `yes`。 |
| <a id="property-methodname"></a> `methodName?` | `string` | 页面方法名，缺省为 `index`。 |
| <a id="property-modulename"></a> `moduleName?` | `string` | 页面模块名，缺省为 `index`。 |
| <a id="property-params"></a> `params?` | `Record`\<`string`, `string`\> | 已解码的查询参数，同名值以逗号连接；路径参数另存为 `$1`、`$2` 等，保留编码。 |
| <a id="property-requesttype"></a> `requestType?` | [`LinkRequestType`](../type-aliases/LinkRequestType.md) | 实际采用的路由模式。 |
| <a id="property-tid"></a> `tid?` | `string` | 查询参数 `tid`，缺省为空字符串。 |
| <a id="property-url"></a> `url?` | `string` | 相对链接保留输入；站内完整网址转换为站内路径；外链保留输入。 |
| <a id="property-vars"></a> `vars?` | \[`string`, `string`\][] | 方法参数；GET 值已解码，路径值保留编码且参数名为空字符串。 |
| <a id="property-viewtype"></a> `viewType?` | `string` | 视图类型。 |
