[zentao-api](../index.md) / switchProfile

# Function: switchProfile()

> **switchProfile**(`profileKey?`): `Promise`\<[`ZentaoProfileRecord`](../interfaces/ZentaoProfileRecord.md)\>

Defined in: [src/profiles/index.ts:221](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/profiles/index.ts#L221)

切换当前使用的 profile，并刷新最后使用时间；不传 key 时使用当前 profile。

## Parameters

| Parameter | Type |
| ------ | ------ |
| `profileKey?` | `string` |

## Returns

`Promise`\<[`ZentaoProfileRecord`](../interfaces/ZentaoProfileRecord.md)\>
