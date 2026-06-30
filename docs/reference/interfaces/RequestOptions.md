[zentao-api](../index.md) / RequestOptions

# Interface: RequestOptions

高阶 `request("moduleName")` / `request("moduleName/methodName")` / `request("moduleName/<objectID>")` 的单次调用选项。

## Extends

- [`ProcessListOptions`](ProcessListOptions.md)

## Properties

| Property | Type | Description | Inherited from |
| ------ | ------ | ------ | ------ |
| <a id="property-autofill"></a> `autoFill?` | `boolean` | 是否在执行 `update` 操作时自动填充未传入的字段。 设为 `true` 后，会先 GET 当前对象，把用户未显式传入（含 `params.data`）且 动作 body schema 中声明的字段用现值补齐，再发起 PUT，避免禅道用空值覆盖未提交字段。 因此只需传想修改的字段即可。仅对 `type: 'update'` 且模块存在 `type: 'get'` 动作时生效。 不传时回落到全局 `autoFill`，默认 false。 | - |
| <a id="property-client"></a> `client?` | [`ZentaoClient`](../classes/ZentaoClient.md) | 本次调用使用的客户端；优先级高于全局客户端。 | - |
| <a id="property-filter"></a> `filter?` | `string`[] | 过滤表达式列表，例如 `["status=active", "pri>=2"]`，多条之间按 AND 组合。 | [`ProcessListOptions`](ProcessListOptions.md).[`filter`](ProcessListOptions.md#property-filter) |
| <a id="property-insecure"></a> `insecure?` | `boolean` | 本次调用 TLS 跳过证书验证选项；仅 Node.js 运行时支持。 | - |
| <a id="property-limit"></a> `limit?` | `string` | 限制返回列表数量，在排序后、摘取前截断；不改变服务端页大小。 | [`ProcessListOptions`](ProcessListOptions.md).[`limit`](ProcessListOptions.md#property-limit) |
| <a id="property-pick"></a> `pick?` | `string`[] | 摘取字段路径列表。 | [`ProcessListOptions`](ProcessListOptions.md).[`pick`](ProcessListOptions.md#property-pick) |
| <a id="property-raw"></a> `raw?` | `boolean` | 是否返回原始响应体，默认 false。 | - |
| <a id="property-recperpage"></a> `recPerPage?` | `string` | 本次调用使用的每页记录数，优先级高于全局 `recPerPage`。 | - |
| <a id="property-search"></a> `search?` | `string`[] | 模糊搜索关键词组，组内空格分隔为 OR，多组之间按 AND 组合。 | [`ProcessListOptions`](ProcessListOptions.md).[`search`](ProcessListOptions.md#property-search) |
| <a id="property-searchfields"></a> `searchFields?` | `string`[] | 限定搜索字段，缺省时搜索全部字段。 | [`ProcessListOptions`](ProcessListOptions.md).[`searchFields`](ProcessListOptions.md#property-searchfields) |
| <a id="property-sort"></a> `sort?` | `string` | 排序表达式，多个字段以英文逗号分隔，例如 `pri:desc,id:asc`。 | [`ProcessListOptions`](ProcessListOptions.md).[`sort`](ProcessListOptions.md#property-sort) |
| <a id="property-throwonfail"></a> `throwOnFail?` | `boolean` | 当禅道服务端返回 `{ status: "fail" }` 时是否抛出 `E_API_FAILED`。 不传时回落到全局 `throwOnFail`，默认 false（保留原始失败响应）。 | - |
| <a id="property-timeout"></a> `timeout?` | `number` | 本次调用超时时间。 | - |
