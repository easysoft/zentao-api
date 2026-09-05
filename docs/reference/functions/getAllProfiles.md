[zentao-api](../index.md) / getAllProfiles

# Function: getAllProfiles()

> **getAllProfiles**(): `Promise`\<[`ZentaoProfileRecord`](../interfaces/ZentaoProfileRecord.md)[]\>

列出本地保存的所有 profile。

Node.js 下从 `~/.config/zentao/zentao.json` 读取；浏览器下从 `localStorage` 读取。
读取过程不会写回存储；存储中无法解析的条目会被静默忽略，不会影响其余 profile。

## Returns

`Promise`\<[`ZentaoProfileRecord`](../interfaces/ZentaoProfileRecord.md)[]\>

当前存储中的所有 profile（带 `key` 字段），文件不存在时返回空数组。

## Throws

`E_PROFILE_STORAGE_INVALID`（存储内容不是合法 JSON 或根结构不合法）或
  `E_PROFILE_STORAGE_UNAVAILABLE`（运行时无法访问存储）。
