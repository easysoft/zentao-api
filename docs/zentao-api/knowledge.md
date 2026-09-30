# 知识 (knowledge)

需部署商业知识库扩展，支持浏览知识、向量搜索和读取已保存正文。

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取知识库内知识列表 | `GET` | `/ai/knowledgelibs/{libID}/knowledges` |
| `search` | 多知识库向量搜索 | `POST` | `/ai/knowledges/search` |
| `get` | 获取知识详细内容 | `GET` | `/ai/knowledges/{knowledgeID}` |

## 获取知识库内知识列表

返回当前用户可见的知识条目，按本地 ID 降序排列；不支持标题关键词查询。

- SDK 调用：`request("knowledge/list", params)`
- HTTP：`GET /ai/knowledgelibs/{libID}/knowledges`
- 动作类型：`list`
- 最低禅道版本：`biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `libID` | 本地知识库 ID，正整数 |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `type` | string | 否 |  | 知识类型，省略或空字符串表示不限；text/file 不可与非空 objectType 同时使用。<br>`object` 对象知识<br>`text` 文本知识<br>`file` 文件知识 |
| `objectType` | string | 否 |  | 来源对象类型；单独指定时按 type=object 筛选，每次只接受一个编码。<br>`story` 需求<br>`task` 任务<br>`case` 测试用例<br>`bug` Bug<br>`plan` 产品计划<br>`release` 发布<br>`feedback` 反馈<br>`ticket` 工单<br>`doc` 文档（含接口文档）<br>`issue` 问题<br>`risk` 风险<br>`opportunity` 机会<br>`practice` 最佳实践<br>`component` 组件 |
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

const result = await request("knowledge/list", {
  "libID": 1,
  "type": "object",
  "objectType": "story",
  "pageID": 1,
  "recPerPage": 20
});
```
## 多知识库向量搜索

仅检索已有索引，需 ai.searchknowledgelib 权限。按匹配度降序返回片段，不分页；用 knowledgeID 获取完整正文，chunkID 仅标识片段。

- SDK 调用：`request("knowledge/search", params)`
- HTTP：`POST /ai/knowledges/search`
- 动作类型：`list`
- 最低禅道版本：`biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

无查询参数。

### 请求体

请求体必填：是
请求媒体类型：`application/json`

Schema:

```json
{
  "type": "object",
  "required": [
    "keyword",
    "libIDs"
  ],
  "example": {
    "keyword": "如何处理接口请求超时",
    "libIDs": [
      12,
      18
    ],
    "minSimilarity": 0.7,
    "limit": 5
  },
  "properties": {
    "keyword": {
      "type": "string",
      "minLength": 1,
      "description": "搜索问题或关键词，去除首尾空白后不能为空"
    },
    "libIDs": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "integer",
        "minimum": 1
      },
      "description": "本地知识库 ID 的非空正整数数组，例如 [12,18]；不接受字符串元素，重复 ID 自动去重"
    },
    "type": {
      "type": "string",
      "description": "知识类型，省略或空字符串表示不限；text/file 不可与非空 objectType 同时使用。",
      "options": [
        {
          "value": "object",
          "label": "对象知识"
        },
        {
          "value": "text",
          "label": "文本知识"
        },
        {
          "value": "file",
          "label": "文件知识"
        }
      ]
    },
    "objectType": {
      "type": "string",
      "description": "来源对象类型；单独指定时按 type=object 筛选，每次只接受一个编码。",
      "options": [
        {
          "value": "story",
          "label": "需求"
        },
        {
          "value": "task",
          "label": "任务"
        },
        {
          "value": "case",
          "label": "测试用例"
        },
        {
          "value": "bug",
          "label": "Bug"
        },
        {
          "value": "plan",
          "label": "产品计划"
        },
        {
          "value": "release",
          "label": "发布"
        },
        {
          "value": "feedback",
          "label": "反馈"
        },
        {
          "value": "ticket",
          "label": "工单"
        },
        {
          "value": "doc",
          "label": "文档（含接口文档）"
        },
        {
          "value": "issue",
          "label": "问题"
        },
        {
          "value": "risk",
          "label": "风险"
        },
        {
          "value": "opportunity",
          "label": "机会"
        },
        {
          "value": "practice",
          "label": "最佳实践"
        },
        {
          "value": "component",
          "label": "组件"
        }
      ]
    },
    "minSimilarity": {
      "type": "number",
      "minimum": 0,
      "maximum": 1,
      "defaultValue": 0.5,
      "description": "最小匹配度，范围 [0,1]"
    },
    "limit": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100,
      "defaultValue": 5,
      "description": "整次多库搜索最多返回的片段数，范围 1～100"
    }
  }
}
```

示例:

```json
{
  "keyword": "如何处理接口请求超时",
  "libIDs": [
    12,
    18
  ],
  "minSimilarity": 0.7,
  "limit": 5
}
```

### 返回值

- 返回形态：`list`
- 结果字段：`data`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("knowledge/search", {
  "keyword": "如何处理接口请求超时",
  "libIDs": [
    12,
    18
  ],
  "minSimilarity": 0.7,
  "limit": 5
});
```
## 获取知识详细内容

返回已保存的完整正文及来源信息，不触发文件提取、知识同步或索引更新。按 contentType 解释正文，尚未保存正文时 content 可为空。

- SDK 调用：`request("knowledge/get", params)`
- HTTP：`GET /ai/knowledges/{knowledgeID}`
- 动作类型：`get`
- 最低禅道版本：`biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `knowledgeID` | 本地知识条目 ID，正整数；不可使用 chunkID 或来源对象 objectID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 结果字段：`data`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("knowledge/get", {
  "knowledgeID": 1
});
```
