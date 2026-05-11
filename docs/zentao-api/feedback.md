# 反馈 (feedback)

反馈管理，支持获取反馈列表，支持获取产品下的反馈、创建反馈、获取反馈详情、修改反馈、删除反馈、激活反馈、关闭反馈

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取反馈列表，支持获取产品下的反馈 | `GET` | `/{scope}/{scopeID}/feedbacks` |
| `create` | 创建反馈 | `POST` | `/feedbacks` |
| `get` | 获取反馈详情 | `GET` | `/feedbacks/{feedbackID}` |
| `update` | 修改反馈 | `PUT` | `/feedbacks/{feedbackID}` |
| `delete` | 删除反馈 | `DELETE` | `/feedbacks/{feedbackID}` |
| `activate` | 激活反馈 | `PUT` | `/feedbacks/{feedbackID}/activate` |
| `close` | 关闭反馈 | `PUT` | `/feedbacks/{feedbackID}/close` |

## 获取反馈列表，支持获取产品下的反馈

- SDK 调用：`request("feedback/list", params)`
- HTTP：`GET /{scope}/{scopeID}/feedbacks`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `scope` | 反馈范围 |
| `scopeID` | 范围ID |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `wait` | 状态，默认是wait<br>`all` 全部<br>`wait` 待处理<br>`doing` 处理中<br>`toclosed` 待关闭<br>`review` 待评审<br>`assigntome` 指派给我<br>`openedbyme` 由我反馈 |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`title_asc` 标题 升序<br>`title_desc` 标题 降序<br>`status_asc` 状态 升序<br>`status_desc` 状态 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`feedbacks`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("feedback/list", {
  "scope": "<string>",
  "scopeID": 1,
  "browseType": "wait",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1
});
```
## 创建反馈

- SDK 调用：`request("feedback/create", params)`
- HTTP：`POST /feedbacks`
- 动作类型：`create`

### 路径参数

无路径参数。

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "product": {
      "type": "integer",
      "description": "所属产品",
      "format": "int32"
    },
    "title": {
      "type": "string",
      "description": "标题"
    },
    "module": {
      "type": "integer",
      "description": "所属模块",
      "format": "int32"
    },
    "type": {
      "type": "string",
      "description": "类型(story 需求 | task 任务 | bug Bug | todo 待办 | advice 建议 | issue 问题 | risk 风险 | opportunity 机会)"
    },
    "desc": {
      "type": "string",
      "description": "描述"
    },
    "feedbackBy": {
      "type": "string",
      "description": "反馈者"
    },
    "source": {
      "type": "string",
      "description": "来源"
    }
  },
  "required": [
    "product",
    "title"
  ]
}
```

示例:

```json
{
  "product": 1,
  "title": "<string>",
  "module": 1,
  "type": "<string>",
  "desc": "<string>",
  "feedbackBy": "<string>",
  "source": "<string>"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("feedback/create", {
  "product": 1,
  "title": "<string>",
  "module": 1,
  "type": "<string>",
  "desc": "<string>",
  "feedbackBy": "<string>",
  "source": "<string>"
});
```
## 获取反馈详情

- SDK 调用：`request("feedback/get", params)`
- HTTP：`GET /feedbacks/{feedbackID}`
- 动作类型：`get`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `feedbackID` | 反馈ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 结果字段：`feedback`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("feedback/get", {
  "feedbackID": 1
});
```
## 修改反馈

- SDK 调用：`request("feedback/update", params)`
- HTTP：`PUT /feedbacks/{feedbackID}`
- 动作类型：`update`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `feedbackID` | 反馈ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "product": {
      "type": "integer",
      "description": "所属产品",
      "format": "int32"
    },
    "module": {
      "type": "integer",
      "description": "所属模块",
      "format": "int32"
    },
    "title": {
      "type": "string",
      "description": "标题"
    },
    "type": {
      "type": "string",
      "description": "类型(story 需求 | task 任务 | bug Bug | todo 待办 | advice 建议 | issue 问题 | risk 风险 | opportunity 机会)"
    },
    "desc": {
      "type": "string",
      "description": "描述"
    },
    "feedbackBy": {
      "type": "string",
      "description": "反馈者"
    },
    "source": {
      "type": "string",
      "description": "来源"
    }
  },
  "required": [
    "product",
    "title"
  ]
}
```

示例:

```json
{
  "product": 1,
  "module": 1,
  "title": "<string>",
  "type": "<string>",
  "desc": "<string>",
  "feedbackBy": "<string>",
  "source": "<string>"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("feedback/update", {
  "feedbackID": 1,
  "product": 1,
  "module": 1,
  "title": "<string>",
  "type": "<string>",
  "desc": "<string>",
  "feedbackBy": "<string>",
  "source": "<string>"
});
```
## 删除反馈

- SDK 调用：`request("feedback/delete", params)`
- HTTP：`DELETE /feedbacks/{feedbackID}`
- 动作类型：`delete`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `feedbackID` | 反馈ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("feedback/delete", {
  "feedbackID": 1
});
```
## 激活反馈

- SDK 调用：`request("feedback/activate", params)`
- HTTP：`PUT /feedbacks/{feedbackID}/activate`
- 动作类型：`action`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `feedbackID` | 反馈ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "assignedTo": {
      "type": "string",
      "description": "指派给"
    },
    "comment": {
      "type": "string",
      "description": "备注"
    }
  }
}
```

示例:

```json
{
  "assignedTo": "<string>",
  "comment": "<string>"
}
```

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("feedback/activate", {
  "feedbackID": 1,
  "assignedTo": "<string>",
  "comment": "<string>"
});
```
## 关闭反馈

- SDK 调用：`request("feedback/close", params)`
- HTTP：`PUT /feedbacks/{feedbackID}/close`
- 动作类型：`action`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `feedbackID` | 反馈ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "closedReason": {
      "type": "string",
      "description": "关闭原因(commented 已处理 | repeat 重复 | refuse 不予采纳)"
    },
    "comment": {
      "type": "string",
      "description": "备注"
    }
  },
  "required": [
    "closedReason"
  ]
}
```

示例:

```json
{
  "closedReason": "<string>",
  "comment": "<string>"
}
```

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("feedback/close", {
  "feedbackID": 1,
  "closedReason": "<string>",
  "comment": "<string>"
});
```
