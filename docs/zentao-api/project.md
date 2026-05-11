# 项目 (project)

项目管理，支持获取项目列表、创建项目、修改项目、删除项目

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取项目列表 | `GET` | `/projects` |
| `create` | 创建项目 | `POST` | `/projects` |
| `update` | 修改项目 | `PUT` | `/projects/{projectID}` |
| `delete` | 删除项目 | `DELETE` | `/projects/{projectID}` |

## 获取项目列表

- SDK 调用：`request("project/list", params)`
- HTTP：`GET /projects`
- 动作类型：`list`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `undone` | 项目状态，默认是undone<br>`all` 全部<br>`undone` 未完成<br>`wait` 未开始<br>`doing` 进行中 |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`name_asc` 名称 升序<br>`name_desc` 名称 降序<br>`begin_asc` 计划开始 升序<br>`begin_desc` 计划开始 降序<br>`end_asc` 计划结束 升序<br>`end_desc` 计划结束 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`projects`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("project/list", {
  "browseType": "undone",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1
});
```
## 创建项目

- SDK 调用：`request("project/create", params)`
- HTTP：`POST /projects`
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
      "description": "项目名称"
    },
    "model": {
      "type": "string",
      "description": "项目管理方式(scrum 敏捷 | waterfall 瀑布 | kanban 看板 | agileplus 融合敏捷 | waterfallplus 融合瀑布)"
    },
    "begin": {
      "type": "string",
      "description": "开始日期"
    },
    "end": {
      "type": "string",
      "description": "结束日期"
    },
    "products": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "关联产品"
    },
    "parent": {
      "type": "integer",
      "description": "所属项目集",
      "format": "int32"
    },
    "workflowGroup": {
      "type": "integer",
      "description": "项目流程，付费版功能，开源版可以不填",
      "format": "int32"
    },
    "PM": {
      "type": "string",
      "description": "项目负责人"
    }
  },
  "required": [
    "name",
    "model",
    "begin",
    "end",
    "workflowGroup"
  ]
}
```

示例:

```json
{
  "name": "<string>",
  "model": "<string>",
  "begin": "<string>",
  "end": "<string>",
  "products": [
    "<string>"
  ],
  "parent": 1,
  "workflowGroup": 1,
  "PM": "<string>"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("project/create", {
  "name": "<string>",
  "model": "<string>",
  "begin": "<string>",
  "end": "<string>",
  "products": [
    "<string>"
  ],
  "parent": 1,
  "workflowGroup": 1,
  "PM": "<string>"
});
```
## 修改项目

- SDK 调用：`request("project/update", params)`
- HTTP：`PUT /projects/{projectID}`
- 动作类型：`update`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `projectID` | 项目ID |

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
      "description": "项目名称"
    },
    "model": {
      "type": "string",
      "description": "项目管理方式(scrum 敏捷 | waterfall 瀑布 | kanban 看板 | agileplus 融合敏捷 | waterfallplus 融合瀑布)"
    },
    "begin": {
      "type": "string",
      "description": "开始日期"
    },
    "end": {
      "type": "string",
      "description": "结束日期"
    },
    "products": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "关联产品"
    },
    "parent": {
      "type": "integer",
      "description": "所属项目集",
      "format": "int32"
    },
    "workflowGroup": {
      "type": "integer",
      "description": "项目流程，付费版功能，开源版可以不填",
      "format": "int32"
    },
    "PM": {
      "type": "string",
      "description": "项目负责人"
    }
  },
  "required": [
    "name",
    "model",
    "begin",
    "end",
    "workflowGroup"
  ]
}
```

示例:

```json
{
  "name": "<string>",
  "model": "<string>",
  "begin": "<string>",
  "end": "<string>",
  "products": [
    "<string>"
  ],
  "parent": 1,
  "workflowGroup": 1,
  "PM": "<string>"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("project/update", {
  "projectID": 1,
  "name": "<string>",
  "model": "<string>",
  "begin": "<string>",
  "end": "<string>",
  "products": [
    "<string>"
  ],
  "parent": 1,
  "workflowGroup": 1,
  "PM": "<string>"
});
```
## 删除项目

- SDK 调用：`request("project/delete", params)`
- HTTP：`DELETE /projects/{projectID}`
- 动作类型：`delete`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `projectID` | 项目ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("project/delete", {
  "projectID": 1
});
```
