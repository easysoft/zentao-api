[zentao-api](../index.md) / request

# Function: request()

## Call Signature

> **request**(`name`, `params`, `options`): `Promise`\<`unknown`\>

按模块名或模块动作名请求禅道 API。

选项优先级为：本次调用 options > 全局 options > 客户端默认值。
当响应 `status` 为 `"fail"` 时，默认按原样返回；若 `options.throwOnFail`
或全局 `throwOnFail` 为真，则改为抛出 `E_API_FAILED`。

对 `update` 动作，当 `options.autoFill` 或全局 `autoFill` 为真时，会先 GET 当前对象，
用现值补齐用户未显式传入的 body 字段后再 PUT，避免禅道覆盖未提交字段。详见 [RequestOptions.autoFill](../interfaces/RequestOptions.md#property-autofill)。

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name` | `string` | 请求名，例如 `product`、`product/list` 或 `product/1`。 |
| `params` | `Record`\<`string`, `unknown`\> \| `undefined` | 请求参数。 |
| `options` | [`RequestOptions`](../interfaces/RequestOptions.md) & `object` | 请求选项。 |

### Returns

`Promise`\<`unknown`\>

默认返回归一化后的禅道 API 响应；`options.raw` 为 true 时返回未经归一化的原始响应。

### Throws

传输层错误、参数缺失或 `throwOnFail` 启用时的业务失败。

## Call Signature

> **request**\<`Name`\>(`name`, `params?`, `options?`): `Promise`\<[`ResponseData`](../interfaces/ResponseData.md)\<[`RequestResultFor`](../type-aliases/RequestResultFor.md)\<`Name`\>\>\>

按模块名或模块动作名请求禅道 API。

选项优先级为：本次调用 options > 全局 options > 客户端默认值。
当响应 `status` 为 `"fail"` 时，默认按原样返回；若 `options.throwOnFail`
或全局 `throwOnFail` 为真，则改为抛出 `E_API_FAILED`。

对 `update` 动作，当 `options.autoFill` 或全局 `autoFill` 为真时，会先 GET 当前对象，
用现值补齐用户未显式传入的 body 字段后再 PUT，避免禅道覆盖未提交字段。详见 [RequestOptions.autoFill](../interfaces/RequestOptions.md#property-autofill)。

### Type Parameters

| Type Parameter |
| ------ |
| `Name` *extends* [`BuiltinRequestName`](../type-aliases/BuiltinRequestName.md) |

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name` | `Name` | 请求名，例如 `product`、`product/list` 或 `product/1`。 |
| `params?` | [`RequestParamsFor`](../type-aliases/RequestParamsFor.md)\<`Name`\> | 请求参数。 |
| `options?` | [`RequestOptions`](../interfaces/RequestOptions.md) & `object` | 请求选项。 |

### Returns

`Promise`\<[`ResponseData`](../interfaces/ResponseData.md)\<[`RequestResultFor`](../type-aliases/RequestResultFor.md)\<`Name`\>\>\>

默认返回归一化后的禅道 API 响应；`options.raw` 为 true 时返回未经归一化的原始响应。

### Throws

传输层错误、参数缺失或 `throwOnFail` 启用时的业务失败。

## Call Signature

> **request**\<`T`\>(`name`, `params?`, `options?`): `Promise`\<[`ResponseData`](../interfaces/ResponseData.md)\<`T`\>\>

按模块名或模块动作名请求禅道 API。

选项优先级为：本次调用 options > 全局 options > 客户端默认值。
当响应 `status` 为 `"fail"` 时，默认按原样返回；若 `options.throwOnFail`
或全局 `throwOnFail` 为真，则改为抛出 `E_API_FAILED`。

对 `update` 动作，当 `options.autoFill` 或全局 `autoFill` 为真时，会先 GET 当前对象，
用现值补齐用户未显式传入的 body 字段后再 PUT，避免禅道覆盖未提交字段。详见 [RequestOptions.autoFill](../interfaces/RequestOptions.md#property-autofill)。

### Type Parameters

| Type Parameter | Default type | Description |
| ------ | ------ | ------ |
| `T` | `unknown` | 归一化响应中期望的 `data` 字段类型；不传时为 `unknown`，调用方需要自行收窄。 |

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name` | `string` | 请求名，例如 `product`、`product/list` 或 `product/1`。 |
| `params?` | `Record`\<`string`, `unknown`\> | 请求参数。 |
| `options?` | [`RequestOptions`](../interfaces/RequestOptions.md) & `object` | 请求选项。 |

### Returns

`Promise`\<[`ResponseData`](../interfaces/ResponseData.md)\<`T`\>\>

默认返回归一化后的禅道 API 响应；`options.raw` 为 true 时返回未经归一化的原始响应。

### Throws

传输层错误、参数缺失或 `throwOnFail` 启用时的业务失败。

## Call Signature

> **request**(`name`, `params?`, `options?`): `Promise`\<`unknown`\>

按模块名或模块动作名请求禅道 API。

选项优先级为：本次调用 options > 全局 options > 客户端默认值。
当响应 `status` 为 `"fail"` 时，默认按原样返回；若 `options.throwOnFail`
或全局 `throwOnFail` 为真，则改为抛出 `E_API_FAILED`。

对 `update` 动作，当 `options.autoFill` 或全局 `autoFill` 为真时，会先 GET 当前对象，
用现值补齐用户未显式传入的 body 字段后再 PUT，避免禅道覆盖未提交字段。详见 [RequestOptions.autoFill](../interfaces/RequestOptions.md#property-autofill)。

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name` | `string` | 请求名，例如 `product`、`product/list` 或 `product/1`。 |
| `params?` | `Record`\<`string`, `unknown`\> | 请求参数。 |
| `options?` | [`RequestOptions`](../interfaces/RequestOptions.md) | 请求选项。 |

### Returns

`Promise`\<`unknown`\>

默认返回归一化后的禅道 API 响应；`options.raw` 为 true 时返回未经归一化的原始响应。

### Throws

传输层错误、参数缺失或 `throwOnFail` 启用时的业务失败。
