[zentao-api](../index.md) / ModuleActionGetterFn

# Type Alias: ModuleActionGetterFn\<T, O\>

> **ModuleActionGetterFn**\<`T`, `O`\> = (`data`, `params`, `options?`) => `T`

从原始响应中提取数据时使用的函数形态。

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | - |
| `O` | [`RequestProcessOptions`](RequestProcessOptions.md) |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | `unknown` | 原始响应对象。 |
| `params` | `Record`\<`string`, `unknown`\> | 触发本次请求的原始调用参数。 |
| `options?` | `O` | 本次请求的数据处理选项；直接调用 getter 时可以省略。 |

## Returns

`T`
