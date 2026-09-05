[zentao-api](../index.md) / deleteProfile

# Function: deleteProfile()

> **deleteProfile**(`profileKey`): `Promise`\<`boolean`\>

删除指定 profile。

若被删除的是当前 profile，会回退为最近添加且仍保留的 profile；覆盖或切换已有记录不改变添加顺序。若已无任何 profile，
当前 profile 会被清空。操作同样通过进程内串行锁保护。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `profileKey` | `string` | 要删除的 profile key。 |

## Returns

`Promise`\<`boolean`\>

当且仅当确实删除了某条记录时返回 `true`；key 不存在时返回 `false` 且不会写盘。

## Throws

`E_PROFILE_STORAGE_INVALID` / `E_PROFILE_STORAGE_UNAVAILABLE`。
