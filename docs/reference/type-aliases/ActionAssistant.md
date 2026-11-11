[zentao-api](../index.md) / ActionAssistant

# Type Alias: ActionAssistant

> **ActionAssistant** = `string` \| \{ `info?`: `string`; `name`: `string`; \}

操作辅助工具标记，对应 `ZenTao-Action-Assistant` 请求头。
字符串直接作为头值；对象去除字段首尾空白后序列化为 `name <info>`，没有详情时只发送名称。
对象名称不能为空，名称和详情不能包含尖括号或控制字符；最终头值仍须符合原生 Headers 的限制。
空字符串表示关闭标记；配置仅运行时有效，不保存到 profile。
