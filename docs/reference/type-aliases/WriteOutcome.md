[zentao-api](../index.md) / WriteOutcome

# Type Alias: WriteOutcome

> **WriteOutcome** = `"not-sent"` \| `"rejected"` \| `"unknown"` \| `"confirmed"`

目标对象的写入结果。

- `not-sent` 表示目标写请求尚未发起，例如更新前读取旧值失败。
- `rejected` 表示服务端明确拒绝目标写请求。
- `unknown` 表示回执不足以判定结果，需要回读对象确认。
- `confirmed` 表示收到了成功回执。
