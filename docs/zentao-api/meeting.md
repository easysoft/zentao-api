# 会议 (meeting)

会议管理，支持获取会议列表、获取项目会议列表、获取执行会议列表、创建会议、获取会议详情、修改会议、删除会议、编辑会议纪要

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取会议列表 | `GET` | `/meetings` |
| `projectMeetings` | 获取项目会议列表 | `GET` | `/projects/{projectID}/meetings` |
| `executionMeetings` | 获取执行会议列表 | `GET` | `/executions/{executionID}/meetings` |
| `create` | 创建会议 | `POST` | `/meetings` |
| `get` | 获取会议详情 | `GET` | `/meetings/{meetingID}` |
| `update` | 修改会议 | `PUT` | `/meetings/{meetingID}` |
| `delete` | 删除会议 | `DELETE` | `/meetings/{meetingID}` |
| `minutes` | 编辑会议纪要 | `PUT` | `/meetings/{meetingID}/minutes` |

## 获取会议列表

- SDK 调用：`request("meeting/list", params)`
- HTTP：`GET /meetings`
- 动作类型：`list`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `all` | 状态，默认是all<br>`all` 全部<br>`booked` 我预约的<br>`participate` 我参加的 |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`name_asc` 名称 升序<br>`name_desc` 名称 降序<br>`date_asc` 日期 升序<br>`date_desc` 日期 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | string | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：begin,createdBy,createdDate,date,dept,editedBy,editedDate,end,execution,host,id,minutedBy,minutedDate,mode,name,project,room |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`meetings`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("meeting/list", {
  "browseType": "all",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 获取项目会议列表

- SDK 调用：`request("meeting/projectMeetings", params)`
- HTTP：`GET /projects/{projectID}/meetings`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `projectID` | 项目ID |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `all` | 状态，默认是all<br>`all` 全部<br>`booked` 我预约的<br>`participate` 我参加的 |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`name_asc` 名称 升序<br>`name_desc` 名称 降序<br>`date_asc` 日期 升序<br>`date_desc` 日期 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | string | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：begin,createdBy,createdDate,date,dept,editedBy,editedDate,end,execution,host,id,minutedBy,minutedDate,mode,name,project,room |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`meetings`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("meeting/projectMeetings", {
  "projectID": 1,
  "browseType": "all",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 获取执行会议列表

- SDK 调用：`request("meeting/executionMeetings", params)`
- HTTP：`GET /executions/{executionID}/meetings`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `executionID` | 执行ID |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `all` | 状态，默认是all<br>`all` 全部<br>`booked` 我预约的<br>`participate` 我参加的 |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`name_asc` 名称 升序<br>`name_desc` 名称 降序<br>`date_asc` 日期 升序<br>`date_desc` 日期 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | string | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：begin,createdBy,createdDate,date,dept,editedBy,editedDate,end,execution,host,id,minutedBy,minutedDate,mode,name,project,room |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`meetings`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("meeting/executionMeetings", {
  "executionID": 1,
  "browseType": "all",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 创建会议

- SDK 调用：`request("meeting/create", params)`
- HTTP：`POST /meetings`
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
    "project": {
      "type": "integer",
      "description": "所属项目",
      "format": "int32"
    },
    "execution": {
      "type": "integer",
      "description": "所属执行",
      "format": "int32"
    },
    "name": {
      "type": "string",
      "description": "会议名称"
    },
    "begin": {
      "type": "string",
      "description": "开始时间"
    },
    "end": {
      "type": "string",
      "description": "结束时间"
    },
    "mode": {
      "type": "string",
      "description": "会议模式(online 线上 | outline 线下 | both 线上+线下)"
    },
    "host": {
      "type": "string",
      "description": "主持人"
    },
    "participant": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "参会人员"
    },
    "room": {
      "type": "integer",
      "description": "会议室",
      "format": "int32"
    },
    "dept": {
      "type": "integer",
      "description": "所属部门",
      "format": "int32"
    },
    "objectType": {
      "type": "string",
      "description": "关联类型(story | task | bug | issue | risk | opportunity)"
    },
    "objectID": {
      "type": "integer",
      "description": "关联对象",
      "format": "int32"
    }
  },
  "required": [
    "project",
    "name",
    "begin",
    "end",
    "mode",
    "host",
    "participant"
  ]
}
```

示例:

```json
{
  "project": 1,
  "execution": 1,
  "name": "<string>",
  "begin": "<string>",
  "end": "<string>",
  "mode": "<string>",
  "host": "<string>",
  "participant": [
    "<string>"
  ],
  "room": 1,
  "dept": 1,
  "objectType": "<string>",
  "objectID": 1
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("meeting/create", {
  "project": 1,
  "execution": 1,
  "name": "<string>",
  "begin": "<string>",
  "end": "<string>",
  "mode": "<string>",
  "host": "<string>",
  "participant": [
    "<string>"
  ],
  "room": 1,
  "dept": 1,
  "objectType": "<string>",
  "objectID": 1
});
```
## 获取会议详情

- SDK 调用：`request("meeting/get", params)`
- HTTP：`GET /meetings/{meetingID}`
- 动作类型：`get`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `meetingID` | 会议ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 结果字段：`meeting`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("meeting/get", {
  "meetingID": 1
});
```
## 修改会议

- SDK 调用：`request("meeting/update", params)`
- HTTP：`PUT /meetings/{meetingID}`
- 动作类型：`update`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `meetingID` | 会议ID |

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
      "description": "会议名称"
    },
    "begin": {
      "type": "string",
      "description": "开始时间"
    },
    "end": {
      "type": "string",
      "description": "结束时间"
    },
    "mode": {
      "type": "string",
      "description": "会议模式(online 线上 | outline 线下 | both 线上+线下)"
    },
    "host": {
      "type": "string",
      "description": "主持人"
    },
    "participant": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "参会人员"
    },
    "room": {
      "type": "integer",
      "description": "会议室",
      "format": "int32"
    },
    "dept": {
      "type": "integer",
      "description": "所属部门",
      "format": "int32"
    },
    "objectType": {
      "type": "string",
      "description": "关联类型(story | task | bug | issue | risk | opportunity)"
    },
    "objectID": {
      "type": "integer",
      "description": "关联对象",
      "format": "int32"
    }
  },
  "required": [
    "name",
    "begin",
    "end",
    "mode",
    "host",
    "participant"
  ]
}
```

示例:

```json
{
  "name": "<string>",
  "begin": "<string>",
  "end": "<string>",
  "mode": "<string>",
  "host": "<string>",
  "participant": [
    "<string>"
  ],
  "room": 1,
  "dept": 1,
  "objectType": "<string>",
  "objectID": 1
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("meeting/update", {
  "meetingID": 1,
  "name": "<string>",
  "begin": "<string>",
  "end": "<string>",
  "mode": "<string>",
  "host": "<string>",
  "participant": [
    "<string>"
  ],
  "room": 1,
  "dept": 1,
  "objectType": "<string>",
  "objectID": 1
});
```
## 删除会议

- SDK 调用：`request("meeting/delete", params)`
- HTTP：`DELETE /meetings/{meetingID}`
- 动作类型：`delete`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `meetingID` | 会议ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("meeting/delete", {
  "meetingID": 1
});
```
## 编辑会议纪要

- SDK 调用：`request("meeting/minutes", params)`
- HTTP：`PUT /meetings/{meetingID}/minutes`
- 动作类型：`action`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `meetingID` | 会议ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "minutes": {
      "type": "string",
      "description": "会议纪要"
    }
  }
}
```

示例:

```json
{
  "minutes": "<string>"
}
```

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("meeting/minutes", {
  "meetingID": 1,
  "minutes": "<string>"
});
```
