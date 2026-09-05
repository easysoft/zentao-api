[zentao-api](../index.md) / addProfile

# Function: addProfile()

> **addProfile**(`profile`): `Promise`\<[`ZentaoProfileRecord`](../interfaces/ZentaoProfileRecord.md)\>

添加或覆盖一个本地 profile，并把它设置为当前使用的 profile。

行为细节：
- 同 key（`account@server`）已存在时会**整体覆盖**而非合并字段。
- 写入时会自动补齐 `loginTime` 与 `lastUsedTime`（若调用方未提供则使用当前 ISO 时间）。
- Node.js 通过文件锁保护同主机本地文件系统的 read-modify-write；浏览器在支持 Web Locks 时保护同源上下文，其他环境仅保证实例内串行。
- 跨进程或上下文等待锁超过约 5 秒时抛出存储不可用错误，不修改 profile 数据。
- 实际写入使用临时文件 + `rename` 的原子方式，并将文件与目录权限收紧到 `0600`/`0700`（Node.js 下）。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `profile` | [`ZentaoProfile`](../interfaces/ZentaoProfile.md) | 要写入的 profile，必须至少包含 `server`、`account`、`token`。 |

## Returns

`Promise`\<[`ZentaoProfileRecord`](../interfaces/ZentaoProfileRecord.md)\>

实际写入并附带 `key` 字段的 profile 记录。

## Throws

`E_INVALID_PROFILE`（必填字段缺失或 token 为空白）、
  `E_INVALID_BASE_URL`、`E_PROFILE_STORAGE_INVALID`、`E_PROFILE_STORAGE_UNAVAILABLE`。
