[zentao-api](../index.md) / switchProfile

# Function: switchProfile()

> **switchProfile**(`profileKey?`): `Promise`\<[`ZentaoProfileRecord`](../interfaces/ZentaoProfileRecord.md)\>

切换当前使用的 profile，并刷新最后使用时间；不传 key 时使用当前 profile。

## Parameters

| Parameter | Type |
| ------ | ------ |
| `profileKey?` | `string` |

## Returns

`Promise`\<[`ZentaoProfileRecord`](../interfaces/ZentaoProfileRecord.md)\>
