[zentao-api](../index.md) / ResponseData

# Interface: ResponseData

高阶 `request()` 归一化后的返回数据。

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-data"></a> `data?` | `any` | 根据模块动作 `resultGetter` 提取后的业务数据。 |
| <a id="property-message"></a> `message?` | `string` | 禅道服务端返回的消息。 |
| <a id="property-pager"></a> `pager?` | `object` | 统一分页信息。 |
| `pager.page` | `number` | 当前页码。 |
| `pager.recPerPage` | `number` | 每页记录数。 |
| `pager.total` | `number` | 总记录数。 |
| <a id="property-status"></a> `status` | `"success"` \| `"fail"` | 禅道服务端状态；非标准响应会按成功响应包装到 `data`。 |
