[zentao-api](../index.md) / iteratePages

# Function: iteratePages()

> **iteratePages**\<`Row`\>(`name`, `params?`, `options?`): `AsyncGenerator`\<[`ListPage`](../interfaces/ListPage.md)\<`Row`\>, `void`, `void`\>

按需读取列表，从指定页码（默认 1）开始，每次迭代请求一页。退出循环即停止取页。
每页沿用 [request](request.md) 的本地处理选项，筛选后为空的页也会交付。是否翻页依据服务端 pager。

## Type Parameters

| Type Parameter | Default type | Description |
| ------ | ------ | ------ |
| `Row` | [`DataRecord`](../type-aliases/DataRecord.md) | 每条记录的类型。 |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |
| `params` | `Record`\<`string`, `unknown`\> |
| `options` | `Omit`\<[`RequestOptions`](../interfaces/RequestOptions.md), `"raw"` \| `"throwOnFail"`\> |

## Returns

`AsyncGenerator`\<[`ListPage`](../interfaces/ListPage.md)\<`Row`\>, `void`, `void`\>

## Throws

业务失败时抛出 E_API_FAILED。分页信息缺失、页码不匹配或服务端空页仍有后页时抛出 E_PAGINATION_INCOMPLETE。
