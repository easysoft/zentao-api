[zentao-api](../index.md) / getProfile

# Function: getProfile()

> **getProfile**(`profileKey?`): `Promise`\<[`ZentaoProfileRecord`](../interfaces/ZentaoProfileRecord.md) \| `undefined`\>

Defined in: [src/profiles/index.ts:177](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/profiles/index.ts#L177)

获取指定 profile；不传 key 时返回上次使用的 profile。

## Parameters

| Parameter | Type |
| ------ | ------ |
| `profileKey?` | `string` |

## Returns

`Promise`\<[`ZentaoProfileRecord`](../interfaces/ZentaoProfileRecord.md) \| `undefined`\>
