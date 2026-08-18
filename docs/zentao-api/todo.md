# 待办 (todo)

待办管理，支持创建待办、编辑待办、删除待办

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `create` | 创建待办 | `POST` | `/todos` |
| `update` | 编辑待办 | `PUT` | `/todos/{todoID}` |
| `delete` | 删除待办 | `DELETE` | `/todos/{todoID}` |

## 创建待办

- SDK 调用：`request("todo/create", params)`
- HTTP：`POST /todos`
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
    "date": {
      "type": "string",
      "description": "日期"
    },
    "type": {
      "type": "string",
      "description": "类型：custom 自定义 | task 任务 | bug 缺陷 | story 研发需求 | epic 业务需求 | requirement 用户需求 | testtask 测试单"
    },
    "name": {
      "type": "string",
      "description": "待办名称，type为custom时必填；type为非custom时由关联对象的名称或标题自动生成"
    },
    "objectID": {
      "type": "integer",
      "description": "关联对象ID，type为非custom时必填，必须是type对应对象的ID",
      "format": "int32"
    },
    "begin": {
      "type": "string",
      "description": "开始时间，使用小时+分钟拼接"
    },
    "end": {
      "type": "string",
      "description": "结束时间，使用小时+分钟拼接"
    },
    "assignedTo": {
      "type": "string",
      "description": "指派给"
    },
    "desc": {
      "type": "string",
      "description": "待办详情"
    }
  },
  "required": [
    "date",
    "type"
  ]
}
```

示例:

```json
{
  "date": "<string>",
  "type": "<string>",
  "name": "<string>",
  "objectID": 1,
  "begin": "<string>",
  "end": "<string>",
  "assignedTo": "<string>",
  "desc": "<string>"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("todo/create", {
  "date": "<string>",
  "type": "<string>",
  "name": "<string>",
  "objectID": 1,
  "begin": "<string>",
  "end": "<string>",
  "assignedTo": "<string>",
  "desc": "<string>"
});
```
## 编辑待办

- SDK 调用：`request("todo/update", params)`
- HTTP：`PUT /todos/{todoID}`
- 动作类型：`update`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `todoID` | 待办ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "date": {
      "type": "string",
      "description": "日期"
    },
    "type": {
      "type": "string",
      "description": "类型：custom 自定义 | task 任务 | bug 缺陷 | story 研发需求 | epic 业务需求 | requirement 用户需求 | testtask 测试单"
    },
    "name": {
      "type": "string",
      "description": "待办名称，type为custom时必填；type为非custom时由关联对象的名称或标题自动生成"
    },
    "objectID": {
      "type": "integer",
      "description": "关联对象ID，type为非custom时必填，必须是type对应对象的ID",
      "format": "int32"
    },
    "begin": {
      "type": "string",
      "description": "开始时间，使用小时+分钟拼接"
    },
    "end": {
      "type": "string",
      "description": "结束时间，使用小时+分钟拼接"
    },
    "assignedTo": {
      "type": "string",
      "description": "指派给"
    },
    "desc": {
      "type": "string",
      "description": "待办详情"
    }
  },
  "required": [
    "date",
    "type"
  ]
}
```

示例:

```json
{
  "date": "<string>",
  "type": "<string>",
  "name": "<string>",
  "objectID": 1,
  "begin": "<string>",
  "end": "<string>",
  "assignedTo": "<string>",
  "desc": "<string>"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("todo/update", {
  "todoID": 1,
  "date": "<string>",
  "type": "<string>",
  "name": "<string>",
  "objectID": 1,
  "begin": "<string>",
  "end": "<string>",
  "assignedTo": "<string>",
  "desc": "<string>"
});
```
## 删除待办

- SDK 调用：`request("todo/delete", params)`
- HTTP：`DELETE /todos/{todoID}`
- 动作类型：`delete`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `todoID` | 待办ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("todo/delete", {
  "todoID": 1
});
```
