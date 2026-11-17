# 不符合项 (nc)

不符合项管理，支持获取不符合项列表，支持获取项目/执行下的不符合项、新建项目不符合项、新建执行不符合项、获取不符合项详情、编辑不符合项、删除不符合项

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取不符合项列表，支持获取项目/执行下的不符合项 | `GET` | `/{scope}/{scopeID}/ncs` |
| `createProject` | 新建项目不符合项 | `POST` | `/projects/{projectID}/ncs` |
| `createExecution` | 新建执行不符合项 | `POST` | `/executions/{executionID}/ncs` |
| `get` | 获取不符合项详情 | `GET` | `/ncs/{ncID}` |
| `update` | 编辑不符合项 | `PUT` | `/ncs/{ncID}` |
| `delete` | 删除不符合项 | `DELETE` | `/ncs/{ncID}` |

## 获取不符合项列表，支持获取项目/执行下的不符合项

- SDK 调用：`request("nc/list", params)`
- HTTP：`GET /{scope}/{scopeID}/ncs`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `scope` | 不符合项所属范围 |
| `scopeID` | 所属范围ID |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `unclosed` | 筛选类型，默认 unclosed<br>`all` 全部<br>`unclosed` 未关闭<br>`assignedtome` 指派给我<br>`assignedbyme` 由我指派<br>`bysearch` 搜索 |
| `param` | string | 否 |  | browseType=bysearch 时传查询 ID。 |
| `orderBy` | string | 否 | `id_desc` | 排序字段，默认 id_desc。 |
| `recPerPage` | number | 否 | `20` | 每页数量，默认 20。 |
| `pageID` | number | 否 | `1` | 页码，默认 1。 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 对象类型：`nc`
- 结果字段：`ncs`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("nc/list", {
  "scope": "<string>",
  "scopeID": 1,
  "browseType": "unclosed",
  "param": "<string>",
  "orderBy": "id_desc",
  "recPerPage": "20",
  "pageID": "1"
});
```
## 新建项目不符合项

- SDK 调用：`request("nc/createProject", params)`
- HTTP：`POST /projects/{projectID}/ncs`
- 动作类型：`create`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

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
    "objectType": {
      "type": "string",
      "description": "不符合项对象类型(auditplan 质量保证计划 | deliverable 交付物)"
    },
    "title": {
      "type": "string",
      "description": "不符合项名称"
    },
    "execution": {
      "type": "integer",
      "description": "所属执行 ID，项目级不符合项传 0",
      "format": "int32"
    },
    "auditplan": {
      "type": "integer",
      "description": "质量保证计划 ID，objectType=auditplan 时必填",
      "format": "int32"
    },
    "listID": {
      "type": "integer",
      "description": "检查清单项 ID，objectType=auditplan 时必填",
      "format": "int32"
    },
    "severity": {
      "type": "integer",
      "description": "严重程度(1 严重 | 2 中等 | 3 轻微)",
      "format": "int32"
    },
    "type": {
      "type": "string",
      "description": "不符合项分类"
    }
  },
  "required": [
    "objectType",
    "title",
    "severity"
  ]
}
```

示例:

```json
{
  "objectType": "auditplan",
  "title": "检查记录不完整",
  "execution": 0,
  "auditplan": 1,
  "listID": 1,
  "severity": 2,
  "type": "process"
}
```

### 返回值

- 返回形态：`object`
- 对象类型：`nc`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("nc/createProject", {
  "projectID": 1,
  "objectType": "<string>",
  "title": "<string>",
  "execution": 1,
  "auditplan": 1,
  "listID": 1,
  "severity": 1,
  "type": "<string>"
});
```
## 新建执行不符合项

- SDK 调用：`request("nc/createExecution", params)`
- HTTP：`POST /executions/{executionID}/ncs`
- 动作类型：`create`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `executionID` | 执行ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "objectType": {
      "type": "string",
      "description": "不符合项对象类型(auditplan 质量保证计划 | deliverable 交付物)"
    },
    "title": {
      "type": "string",
      "description": "不符合项名称"
    },
    "auditplan": {
      "type": "integer",
      "description": "质量保证计划 ID，objectType=auditplan 时必填",
      "format": "int32"
    },
    "listID": {
      "type": "integer",
      "description": "检查清单项 ID，objectType=auditplan 时必填",
      "format": "int32"
    },
    "severity": {
      "type": "integer",
      "description": "严重程度(1 严重 | 2 中等 | 3 轻微)",
      "format": "int32"
    },
    "type": {
      "type": "string",
      "description": "不符合项分类"
    }
  },
  "required": [
    "objectType",
    "title",
    "severity"
  ]
}
```

示例:

```json
{
  "objectType": "auditplan",
  "title": "执行检查记录不完整",
  "auditplan": 1,
  "listID": 1,
  "severity": 2,
  "type": "process"
}
```

### 返回值

- 返回形态：`object`
- 对象类型：`nc`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("nc/createExecution", {
  "executionID": 1,
  "objectType": "<string>",
  "title": "<string>",
  "auditplan": 1,
  "listID": 1,
  "severity": 1,
  "type": "<string>"
});
```
## 获取不符合项详情

- SDK 调用：`request("nc/get", params)`
- HTTP：`GET /ncs/{ncID}`
- 动作类型：`get`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `ncID` | ncID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 对象类型：`nc`
- 结果字段：`nc`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("nc/get", {
  "ncID": 1
});
```
## 编辑不符合项

- SDK 调用：`request("nc/update", params)`
- HTTP：`PUT /ncs/{ncID}`
- 动作类型：`update`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `ncID` | ncID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "不符合项名称"
    },
    "type": {
      "type": "string",
      "description": "不符合项分类"
    },
    "execution": {
      "type": "integer",
      "description": "所属执行 ID，项目级不符合项传 0。",
      "format": "int32"
    },
    "auditplan": {
      "type": "integer",
      "description": "质量保证计划 ID，基于质量保证计划的不符合项必填。",
      "format": "int32"
    },
    "listID": {
      "type": "integer",
      "description": "检查清单项 ID，基于质量保证计划的不符合项必填。",
      "format": "int32"
    },
    "severity": {
      "type": "integer",
      "description": "严重程度(1 严重 | 2 中等 | 3 轻微)",
      "format": "int32"
    },
    "assignedTo": {
      "type": "string",
      "description": "指派人账号。"
    },
    "deadline": {
      "type": "string",
      "description": "计划解决日期。"
    },
    "desc": {
      "type": "string",
      "description": "完成情况说明。"
    }
  },
  "required": [
    "title",
    "severity"
  ]
}
```

示例:

```json
{
  "title": "检查记录不完整-已编辑",
  "type": "process",
  "execution": 0,
  "auditplan": 1,
  "listID": 1,
  "severity": 2,
  "assignedTo": "admin",
  "deadline": "2026-10-23",
  "desc": "<p>补充检查记录。</p>"
}
```

### 返回值

- 返回形态：`object`
- 对象类型：`nc`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("nc/update", {
  "ncID": 1,
  "title": "<string>",
  "type": "<string>",
  "execution": 1,
  "auditplan": 1,
  "listID": 1,
  "severity": 1,
  "assignedTo": "<string>",
  "deadline": "<string>",
  "desc": "<string>"
});
```
## 删除不符合项

- SDK 调用：`request("nc/delete", params)`
- HTTP：`DELETE /ncs/{ncID}`
- 动作类型：`delete`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `ncID` | ncID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`
- 对象类型：无统一对象类型

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("nc/delete", {
  "ncID": 1
});
```
