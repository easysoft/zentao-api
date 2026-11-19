[zentao-api](../index.md) / MarkdownRenderer

# Type Alias: MarkdownRenderer

> **MarkdownRenderer** = (`markdown`, `context`) => `string` \| `Promise`\<`string`\>

将一个显式提交的 Markdown 字段渲染为 HTML。上下文给出注册表中的模块、动作和字段名。

## Parameters

| Parameter | Type |
| ------ | ------ |
| `markdown` | `string` |
| `context` | \{ `action`: `string`; `field`: `string`; `module`: `string`; \} |
| `context.action` | `string` |
| `context.field` | `string` |
| `context.module` | `string` |

## Returns

`string` \| `Promise`\<`string`\>
