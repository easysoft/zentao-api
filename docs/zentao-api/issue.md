# 问题 (issue)

问题管理，支持获取问题列表、获取项目问题列表、获取执行问题列表、创建问题、获取问题详情

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取问题列表 | `GET` | `/issues` |
| `projectIssues` | 获取项目问题列表 | `GET` | `/projects/{projectID}/issues` |
| `executionIssues` | 获取执行问题列表 | `GET` | `/executions/{executionID}/issues` |
| `create` | 创建问题 | `POST` | `/issues` |
| `get` | 获取问题详情 | `GET` | `/issues/{issueID}` |

## 获取问题列表

- SDK 调用：`request("issue/list", params)`
- HTTP：`GET /issues`
- 动作类型：`list`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `all` | 状态，默认是all<br>`all` 全部<br>`open` 开放<br>`assignto` 指派给我<br>`assignby` 由我指派<br>`closed` 已关闭<br>`resolved` 已解决<br>`canceled` 已取消 |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`title_asc` 标题 升序<br>`title_desc` 标题 降序<br>`severity_asc` 严重程度 升序<br>`severity_desc` 严重程度 降序<br>`status_asc` 状态 升序<br>`status_desc` 状态 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | string | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：assignedDate,assignedTo,closedBy,closedDate,createdBy,createdDate,editedBy,editedDate,execution,id,pri,project,severity,status,title,type |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`issues`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("issue/list", {
  "browseType": "all",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 获取项目问题列表

- SDK 调用：`request("issue/projectIssues", params)`
- HTTP：`GET /projects/{projectID}/issues`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `projectID` | 项目ID |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `all` | 状态，默认是all<br>`all` 全部<br>`open` 开放<br>`assignto` 指派给我<br>`assignby` 由我指派<br>`closed` 已关闭<br>`resolved` 已解决<br>`canceled` 已取消 |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`title_asc` 标题 升序<br>`title_desc` 标题 降序<br>`severity_asc` 严重程度 升序<br>`severity_desc` 严重程度 降序<br>`status_asc` 状态 升序<br>`status_desc` 状态 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | string | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：assignedDate,assignedTo,closedBy,closedDate,createdBy,createdDate,editedBy,editedDate,execution,id,pri,project,severity,status,title,type |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`issues`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("issue/projectIssues", {
  "projectID": 1,
  "browseType": "all",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 获取执行问题列表

- SDK 调用：`request("issue/executionIssues", params)`
- HTTP：`GET /executions/{executionID}/issues`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `executionID` | 执行ID |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `all` | 状态，默认是all<br>`all` 全部<br>`open` 开放<br>`assignto` 指派给我<br>`assignby` 由我指派<br>`closed` 已关闭<br>`resolved` 已解决<br>`canceled` 已取消 |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`title_asc` 标题 升序<br>`title_desc` 标题 降序<br>`severity_asc` 严重程度 升序<br>`severity_desc` 严重程度 降序<br>`status_asc` 状态 升序<br>`status_desc` 状态 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | string | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：assignedDate,assignedTo,closedBy,closedDate,createdBy,createdDate,editedBy,editedDate,execution,id,pri,project,severity,status,title,type |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`issues`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("issue/executionIssues", {
  "executionID": 1,
  "browseType": "all",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 创建问题

- SDK 调用：`request("issue/create", params)`
- HTTP：`POST /issues`
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
    "objectID": {
      "type": "integer",
      "description": "所属项目",
      "format": "int32"
    },
    "from": {
      "type": "integer",
      "description": "来源，0 表示直接创建",
      "format": "int32"
    },
    "title": {
      "type": "string",
      "description": "问题名称"
    },
    "type": {
      "type": "string",
      "description": "类型(design 设计问题 | code 程序缺陷 | performance 性能问题 | version 版本控制 | storyadd 需求新增 | storychanged 需求修改 | storyremoved 需求删除 | data 数据问题)"
    },
    "severity": {
      "type": "integer",
      "description": "严重程度(1 严重 | 2 较严重 | 3 较小 | 4 建议)",
      "format": "int32"
    },
    "pri": {
      "type": "integer",
      "description": "优先级(1-4)",
      "format": "int32"
    },
    "execution": {
      "type": "integer",
      "description": "所属执行",
      "format": "int32"
    },
    "assignedTo": {
      "type": "string",
      "description": "指派给"
    },
    "owner": {
      "type": "string",
      "description": "提出人"
    },
    "deadline": {
      "type": "string",
      "description": "计划解决日期"
    },
    "desc": {
      "type": "string",
      "description": "描述"
    }
  },
  "required": [
    "objectID",
    "title",
    "type",
    "severity"
  ]
}
```

示例:

```json
{
  "objectID": 1,
  "from": 1,
  "title": "<string>",
  "type": "<string>",
  "severity": 1,
  "pri": 1,
  "execution": 1,
  "assignedTo": "<string>",
  "owner": "<string>",
  "deadline": "<string>",
  "desc": "<string>"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("issue/create", {
  "objectID": 1,
  "from": 1,
  "title": "<string>",
  "type": "<string>",
  "severity": 1,
  "pri": 1,
  "execution": 1,
  "assignedTo": "<string>",
  "owner": "<string>",
  "deadline": "<string>",
  "desc": "<string>"
});
```
## 获取问题详情

- SDK 调用：`request("issue/get", params)`
- HTTP：`GET /issues/{issueID}`
- 动作类型：`get`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `issueID` | 问题ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 结果字段：`issue`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("issue/get", {
  "issueID": 1
});
```
