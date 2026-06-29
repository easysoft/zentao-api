# 任务 (task)

任务管理，支持获取任务列表，支持获取执行下的任务、创建任务、获取任务详情、修改任务、删除任务、激活任务、关闭任务、完成任务、启动任务

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取任务列表，支持获取执行下的任务 | `GET` | `/executions/{executionID}/tasks` |
| `create` | 创建任务 | `POST` | `/tasks` |
| `get` | 获取任务详情 | `GET` | `/tasks/{taskID}` |
| `update` | 修改任务 | `PUT` | `/tasks/{taskID}` |
| `delete` | 删除任务 | `DELETE` | `/tasks/{taskID}` |
| `activate` | 激活任务 | `PUT` | `/tasks/{taskID}/activate` |
| `close` | 关闭任务 | `PUT` | `/tasks/{taskID}/close` |
| `finish` | 完成任务 | `PUT` | `/tasks/{taskID}/finish` |
| `start` | 启动任务 | `PUT` | `/tasks/{taskID}/start` |

## 获取任务列表，支持获取执行下的任务

- SDK 调用：`request("task/list", params)`
- HTTP：`GET /executions/{executionID}/tasks`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `executionID` | 执行ID |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `status` | string | 否 | `unclosed` | 状态，默认是unclosed<br>`all` 全部<br>`unclosed` 未关闭<br>`assignedtome` 指派给我<br>`assignedtome` 指派给我<br>`myinvolved` 由我参与<br>`assignedbyme` 由我指派 |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`name_asc` 名称 升序<br>`name_desc` 名称 降序<br>`status_asc` 状态 升序<br>`status_desc` 状态 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`tasks`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("task/list", {
  "executionID": 1,
  "status": "unclosed",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1
});
```
## 创建任务

- SDK 调用：`request("task/create", params)`
- HTTP：`POST /tasks`
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
    "name": {
      "type": "string",
      "description": "任务名称"
    },
    "executionID": {
      "type": "integer",
      "description": "所属执行",
      "format": "int32"
    },
    "type": {
      "type": "string",
      "description": "任务类型"
    },
    "assignedTo": {
      "type": "string",
      "description": "指派给"
    },
    "estStarted": {
      "type": "string",
      "description": "预计开始"
    },
    "deadline": {
      "type": "string",
      "description": "截止日期"
    },
    "pri": {
      "type": "integer",
      "description": "优先级",
      "format": "int32"
    },
    "estimate": {
      "type": "number",
      "description": "预计工时",
      "format": "float"
    },
    "module": {
      "type": "integer",
      "description": "所属模块",
      "format": "int32"
    },
    "story": {
      "type": "integer",
      "description": "相关需求",
      "format": "int32"
    },
    "desc": {
      "type": "string",
      "description": "任务描述"
    }
  },
  "required": [
    "name",
    "executionID"
  ]
}
```

示例:

```json
{
  "name": "<string>",
  "executionID": 1,
  "type": "<string>",
  "assignedTo": "<string>",
  "estStarted": "<string>",
  "deadline": "<string>",
  "pri": 1,
  "estimate": 1,
  "module": 1,
  "story": 1,
  "desc": "<string>"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("task/create", {
  "name": "<string>",
  "executionID": 1,
  "type": "<string>",
  "assignedTo": "<string>",
  "estStarted": "<string>",
  "deadline": "<string>",
  "pri": 1,
  "estimate": 1,
  "module": 1,
  "story": 1,
  "desc": "<string>"
});
```
## 获取任务详情

- SDK 调用：`request("task/get", params)`
- HTTP：`GET /tasks/{taskID}`
- 动作类型：`get`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `taskID` | 任务ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("task/get", {
  "taskID": 1
});
```
## 修改任务

- SDK 调用：`request("task/update", params)`
- HTTP：`PUT /tasks/{taskID}`
- 动作类型：`update`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `taskID` | 任务ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "任务名称"
    },
    "type": {
      "type": "string",
      "description": "任务类型"
    },
    "assignedTo": {
      "type": "string",
      "description": "指派给"
    },
    "estStarted": {
      "type": "string",
      "description": "预计开始"
    },
    "deadline": {
      "type": "string",
      "description": "截止日期"
    },
    "pri": {
      "type": "integer",
      "description": "优先级",
      "format": "int32"
    },
    "estimate": {
      "type": "number",
      "description": "预计工时",
      "format": "float"
    },
    "module": {
      "type": "integer",
      "description": "所属模块",
      "format": "int32"
    },
    "story": {
      "type": "integer",
      "description": "相关需求",
      "format": "int32"
    },
    "desc": {
      "type": "string",
      "description": "任务描述"
    }
  }
}
```

示例:

```json
{
  "name": "<string>",
  "type": "<string>",
  "assignedTo": "<string>",
  "estStarted": "<string>",
  "deadline": "<string>",
  "pri": 1,
  "estimate": 1,
  "module": 1,
  "story": 1,
  "desc": "<string>"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("task/update", {
  "taskID": 1,
  "name": "<string>",
  "type": "<string>",
  "assignedTo": "<string>",
  "estStarted": "<string>",
  "deadline": "<string>",
  "pri": 1,
  "estimate": 1,
  "module": 1,
  "story": 1,
  "desc": "<string>"
});
```
## 删除任务

- SDK 调用：`request("task/delete", params)`
- HTTP：`DELETE /tasks/{taskID}`
- 动作类型：`delete`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `taskID` | 任务ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("task/delete", {
  "taskID": 1
});
```
## 激活任务

- SDK 调用：`request("task/activate", params)`
- HTTP：`PUT /tasks/{taskID}/activate`
- 动作类型：`action`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `taskID` | 任务ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "left": {
      "type": "number",
      "description": "预计剩余",
      "format": "float"
    },
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
  "left": 1,
  "assignedTo": "<string>",
  "comment": "<string>"
}
```

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("task/activate", {
  "taskID": 1,
  "left": 1,
  "assignedTo": "<string>",
  "comment": "<string>"
});
```
## 关闭任务

- SDK 调用：`request("task/close", params)`
- HTTP：`PUT /tasks/{taskID}/close`
- 动作类型：`action`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `taskID` | 任务ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
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
  "comment": "<string>"
}
```

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("task/close", {
  "taskID": 1,
  "comment": "<string>"
});
```
## 完成任务

- SDK 调用：`request("task/finish", params)`
- HTTP：`PUT /tasks/{taskID}/finish`
- 动作类型：`action`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `taskID` | 任务ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "currentConsumed": {
      "type": "number",
      "description": "本次消耗",
      "format": "float"
    },
    "assignedTo": {
      "type": "string",
      "description": "任务名称"
    },
    "consumed": {
      "type": "number",
      "description": "总计消耗",
      "format": "float"
    },
    "realStarted": {
      "type": "string",
      "description": "实际开始"
    },
    "finishedDate": {
      "type": "string",
      "description": "实际完成"
    },
    "comment": {
      "type": "string",
      "description": "备注"
    }
  },
  "required": [
    "currentConsumed",
    "realStarted",
    "finishedDate"
  ]
}
```

示例:

```json
{
  "currentConsumed": 1,
  "assignedTo": "<string>",
  "consumed": 1,
  "realStarted": "<string>",
  "finishedDate": "<string>",
  "comment": "<string>"
}
```

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("task/finish", {
  "taskID": 1,
  "currentConsumed": 1,
  "assignedTo": "<string>",
  "consumed": 1,
  "realStarted": "<string>",
  "finishedDate": "<string>",
  "comment": "<string>"
});
```
## 启动任务

- SDK 调用：`request("task/start", params)`
- HTTP：`PUT /tasks/{taskID}/start`
- 动作类型：`action`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `taskID` | 任务ID |

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
      "description": "任务名称"
    },
    "realStarted": {
      "type": "string",
      "description": "实际开始"
    },
    "consumed": {
      "type": "number",
      "description": "总计消耗",
      "format": "float"
    },
    "left": {
      "type": "number",
      "description": "预计剩余",
      "format": "float"
    },
    "comment": {
      "type": "string",
      "description": "备注"
    }
  },
  "required": [
    "realStarted"
  ]
}
```

示例:

```json
{
  "assignedTo": "<string>",
  "realStarted": "<string>",
  "consumed": 1,
  "left": 1,
  "comment": "<string>"
}
```

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("task/start", {
  "taskID": 1,
  "assignedTo": "<string>",
  "realStarted": "<string>",
  "consumed": 1,
  "left": 1,
  "comment": "<string>"
});
```
