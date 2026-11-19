[zentao-api](../index.md) / ListPage

# Interface: ListPage\<Row\>

[iteratePages](../functions/iteratePages.md) 交付的单页结果，包含本地处理后的记录和服务端分页信息。

## Extends

- [`ResponseData`](ResponseData.md)\<`Row`[]\>

## Type Parameters

| Type Parameter |
| ------ |
| `Row` |

## Properties

| Property | Type | Description | Overrides | Inherited from |
| ------ | ------ | ------ | ------ | ------ |
| <a id="property-apicode"></a> `apiCode?` | `string` \| `number` | 服务端返回的业务错误码或状态码字段。 | - | [`ResponseData`](ResponseData.md).[`apiCode`](ResponseData.md#property-apicode) |
| <a id="property-data"></a> `data` | `Row`[] | 根据模块动作 `resultGetter` 提取后的业务数据。 | [`ResponseData`](ResponseData.md).[`data`](ResponseData.md#property-data) | - |
| <a id="property-filewarnings"></a> `fileWarnings?` | [`FileWarning`](FileWarning.md)[] | 富文本图片解析、上传或清理时产生的警告。 | - | [`ResponseData`](ResponseData.md).[`fileWarnings`](ResponseData.md#property-filewarnings) |
| <a id="property-message"></a> `message?` | `string` | 禅道服务端返回的消息。 | - | [`ResponseData`](ResponseData.md).[`message`](ResponseData.md#property-message) |
| <a id="property-pager"></a> `pager` | `object` | 统一分页信息。 | [`ResponseData`](ResponseData.md).[`pager`](ResponseData.md#property-pager) | - |
| `pager.page` | `number` | 当前页码。 | - | - |
| `pager.recPerPage` | `number` | 每页记录数。 | - | - |
| `pager.total` | `number` | 总记录数。 | - | - |
| <a id="property-raw"></a> `raw?` | `Record`\<`string`, `unknown`\> | 失败响应的原始对象，便于上层展示服务端返回的完整上下文。 | - | [`ResponseData`](ResponseData.md).[`raw`](ResponseData.md#property-raw) |
| <a id="property-rawmessage"></a> `rawMessage?` | `unknown` | 原始消息字段；当服务端返回对象/数组等非字符串消息时保留在这里。 | - | [`ResponseData`](ResponseData.md).[`rawMessage`](ResponseData.md#property-rawmessage) |
| <a id="property-resultobjecttype"></a> `resultObjectType?` | `string` | 成功返回对象或列表时，按 action 声明和最终调用参数解析的 SDK 资源类型；空列表也保留类型。 无统一类型、参数无法解析或失败时省略。类型不随本地筛选、摘取和转换改变。 | - | [`ResponseData`](ResponseData.md).[`resultObjectType`](ResponseData.md#property-resultobjecttype) |
| <a id="property-status"></a> `status` | `"success"` | 禅道服务端状态；非标准响应会按成功响应包装到 `data`。 | [`ResponseData`](ResponseData.md).[`status`](ResponseData.md#property-status) | - |
| <a id="property-writeoutcome"></a> `writeOutcome?` | [`WriteOutcome`](../type-aliases/WriteOutcome.md) | 对象写操作的回执判定。读取操作省略此字段。 | - | [`ResponseData`](ResponseData.md).[`writeOutcome`](ResponseData.md#property-writeoutcome) |
