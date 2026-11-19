[zentao-api](../index.md) / supportsFileBinding

# Function: supportsFileBinding()

> **supportsFileBinding**(`options?`): `Promise`\<`boolean` \| `undefined`\>

判断当前禅道版本是否支持用 uid 将编辑器附件绑定到对象。版本门槛与实际保存共用。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`FileBindingOptions`](../type-aliases/FileBindingOptions.md) | 可传已知版本或客户端。默认使用全局版本，缺省时读取客户端的站点配置。 |

## Returns

`Promise`\<`boolean` \| `undefined`\>

已知版本返回布尔值。配置获取失败且允许跳过版本检查时返回 `undefined`。

## Throws

版本格式非法或无法获取所需配置时抛出对应的 SDK 错误。
