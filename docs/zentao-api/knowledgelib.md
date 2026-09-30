# 知识库 (knowledgelib)

需部署商业知识库扩展，仅返回已发布且当前用户可访问的知识库。

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取知识库列表 | `GET` | `/ai/knowledgelibs` |

## 获取知识库列表

- SDK 调用：`request("knowledgelib/list", params)`
- HTTP：`GET /ai/knowledgelibs`
- 动作类型：`list`
- 最低禅道版本：`biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `type` | string | 否 |  | 库类型，省略或空字符串时合并两类可见库<br>`my` 我的知识库<br>`team` 组织知识库 |
| `keyword` | string | 否 |  | 知识库名称或描述关键词，首尾空白会被移除 |
| `pageID` | number | 否 | `1` | 页码，从 1 开始的正整数 |
| `recPerPage` | number | 否 | `20` | 每页条数，范围 1～100 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`data`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("knowledgelib/list", {
  "type": "my",
  "keyword": "<string>",
  "pageID": 1,
  "recPerPage": 20
});
```
