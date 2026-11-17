# 机会 (opportunity)

机会管理，支持获取机会列表，支持获取项目/执行下的机会、创建项目机会、批量创建项目机会、获取机会详情、编辑机会、删除机会

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取机会列表，支持获取项目/执行下的机会 | `GET` | `/{scope}/{scopeID}/opportunities` |
| `create` | 创建项目机会 | `POST` | `/projects/{projectID}/opportunities` |
| `batchCreate` | 批量创建项目机会 | `POST` | `/projects/{projectID}/opportunities/batch` |
| `get` | 获取机会详情 | `GET` | `/opportunities/{opportunityID}` |
| `update` | 编辑机会 | `PUT` | `/opportunities/{opportunityID}` |
| `delete` | 删除机会 | `DELETE` | `/opportunities/{opportunityID}` |

## 获取机会列表，支持获取项目/执行下的机会

- SDK 调用：`request("opportunity/list", params)`
- HTTP：`GET /{scope}/{scopeID}/opportunities`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `scope` | 机会所属范围 |
| `scopeID` | 所属范围ID |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `all` | 筛选类型，默认 all<br>`all` 全部<br>`active` 开放<br>`assignTo` 指派给我<br>`closed` 已关闭<br>`hangup` 已挂起<br>`canceled` 已取消<br>`review` 待评审<br>`bysearch` 搜索 |
| `param` | string | 否 |  | 搜索参数；browseType=bysearch 时使用。 |
| `orderBy` | string | 否 | `id_desc` | 排序字段，默认 id_desc。 |
| `recPerPage` | number | 否 | `20` | 每页数量，默认 20。 |
| `pageID` | number | 否 | `1` | 页码，默认 1。 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activatedBy,actualClosedDate,assignedTo,canceledBy,chance,createdBy,createdDate,desc,editedBy,editedDate,hangupedBy,id,identifiedDate,impact,lastCheckedBy,name,plannedClosedDate,prevention,pri,ratio,resolution,resolvedBy,source,status,strategy,type |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 对象类型：`opportunity`
- 结果字段：`opportunities`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("opportunity/list", {
  "scope": "<string>",
  "scopeID": 1,
  "browseType": "all",
  "param": "<string>",
  "orderBy": "id_desc",
  "recPerPage": "20",
  "pageID": "1",
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 创建项目机会

- SDK 调用：`request("opportunity/create", params)`
- HTTP：`POST /projects/{projectID}/opportunities`
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
    "name": {
      "type": "string",
      "description": "机会名称。"
    },
    "source": {
      "type": "string",
      "description": "机会来源。"
    },
    "execution": {
      "type": "integer",
      "description": "所属执行 ID，项目级机会传 0；传执行 ID 时机会同时归属项目和执行。",
      "format": "int32"
    },
    "type": {
      "type": "string",
      "description": "机会类型。"
    },
    "strategy": {
      "type": "string",
      "description": "机会应对策略。"
    },
    "impact": {
      "type": "integer",
      "description": "影响程度，1-5。",
      "format": "int32"
    },
    "chance": {
      "type": "integer",
      "description": "发生概率，1-5。",
      "format": "int32"
    },
    "ratio": {
      "type": "integer",
      "description": "机会系数，通常为 impact * chance。",
      "format": "int32"
    },
    "pri": {
      "type": "integer",
      "description": "优先级，1 高、2 中、3 低。",
      "format": "int32"
    },
    "identifiedDate": {
      "type": "string",
      "description": "机会识别日期。"
    },
    "plannedClosedDate": {
      "type": "string",
      "description": "计划关闭日期。"
    },
    "assignedTo": {
      "type": "string",
      "description": "指派人账号。"
    },
    "desc": {
      "type": "string",
      "description": "机会描述。"
    },
    "prevention": {
      "type": "string",
      "description": "应对措施。"
    }
  },
  "required": [
    "name"
  ]
}
```

示例:

```json
{
  "name": "API 创建机会",
  "source": "business",
  "execution": 3,
  "type": "technical",
  "strategy": "monitor",
  "impact": 3,
  "chance": 3,
  "ratio": 9,
  "pri": 2,
  "identifiedDate": "2026-10-16",
  "plannedClosedDate": "2026-11-05",
  "assignedTo": "admin",
  "desc": "<p>发现可复用的项目机会。</p>",
  "prevention": "<p>持续跟踪并推进机会落地。</p>"
}
```

### 返回值

- 返回形态：`object`
- 对象类型：`opportunity`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("opportunity/create", {
  "projectID": 1,
  "name": "<string>",
  "source": "<string>",
  "execution": 1,
  "type": "<string>",
  "strategy": "<string>",
  "impact": 1,
  "chance": 1,
  "ratio": 1,
  "pri": 1,
  "identifiedDate": "<string>",
  "plannedClosedDate": "<string>",
  "assignedTo": "<string>",
  "desc": "<string>",
  "prevention": "<string>"
});
```
## 批量创建项目机会

- SDK 调用：`request("opportunity/batchCreate", params)`
- HTTP：`POST /projects/{projectID}/opportunities/batch`
- 动作类型：`action`
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
    "name": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "机会名称列表"
    },
    "source": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "机会来源列表"
    },
    "execution": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "所属执行 ID 列表，项目级机会传 0"
    },
    "impact": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "影响程度列表，1-5"
    },
    "chance": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "发生概率列表，1-5"
    },
    "pri": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "优先级列表，1 高、2 中、3 低"
    },
    "desc": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "机会描述列表"
    }
  },
  "required": [
    "name"
  ]
}
```

示例:

```json
{
  "name": [
    "API 批量创建机会 1",
    "API 批量创建机会 2"
  ],
  "source": [
    "business",
    "team"
  ],
  "execution": [
    0,
    0
  ],
  "impact": [
    4,
    3
  ],
  "chance": [
    3,
    5
  ],
  "pri": [
    2,
    1
  ],
  "desc": [
    "<p>第一条机会。</p>",
    "<p>第二条机会。</p>"
  ]
}
```

### 返回值

- 返回形态：`text`
- 对象类型：`opportunity`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("opportunity/batchCreate", {
  "projectID": 1,
  "name": [
    "<string>"
  ],
  "source": [
    "<string>"
  ],
  "execution": [
    "<string>"
  ],
  "impact": [
    "<string>"
  ],
  "chance": [
    "<string>"
  ],
  "pri": [
    "<string>"
  ],
  "desc": [
    "<string>"
  ]
});
```
## 获取机会详情

- SDK 调用：`request("opportunity/get", params)`
- HTTP：`GET /opportunities/{opportunityID}`
- 动作类型：`get`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `opportunityID` | opportunityID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 对象类型：`opportunity`
- 结果字段：`opportunity`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("opportunity/get", {
  "opportunityID": 1
});
```
## 编辑机会

- SDK 调用：`request("opportunity/update", params)`
- HTTP：`PUT /opportunities/{opportunityID}`
- 动作类型：`update`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `opportunityID` | opportunityID |

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
      "description": "机会名称。"
    },
    "source": {
      "type": "string",
      "description": "机会来源。"
    },
    "execution": {
      "type": "integer",
      "description": "所属执行 ID，项目级机会传 0。",
      "format": "int32"
    },
    "type": {
      "type": "string",
      "description": "机会类型。"
    },
    "strategy": {
      "type": "string",
      "description": "机会应对策略。"
    },
    "status": {
      "type": "string",
      "description": "机会状态(active 开放 | closed 已关闭 | hangup 已挂起 | canceled 已取消)"
    },
    "impact": {
      "type": "integer",
      "description": "影响程度，1-5。",
      "format": "int32"
    },
    "chance": {
      "type": "integer",
      "description": "发生概率，1-5。",
      "format": "int32"
    },
    "pri": {
      "type": "integer",
      "description": "优先级，1 高、2 中、3 低。",
      "format": "int32"
    },
    "assignedTo": {
      "type": "string",
      "description": "指派人账号。"
    },
    "desc": {
      "type": "string",
      "description": "机会描述。"
    },
    "prevention": {
      "type": "string",
      "description": "应对措施。"
    }
  }
}
```

示例:

```json
{
  "name": "API 编辑机会",
  "source": "business",
  "execution": 0,
  "type": "technical",
  "strategy": "monitor",
  "status": "active",
  "impact": 4,
  "chance": 3,
  "pri": 2,
  "assignedTo": "admin",
  "desc": "<p>更新后的机会描述。</p>",
  "prevention": "<p>更新后的应对措施。</p>"
}
```

### 返回值

- 返回形态：`object`
- 对象类型：`opportunity`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("opportunity/update", {
  "opportunityID": 1,
  "name": "<string>",
  "source": "<string>",
  "execution": 1,
  "type": "<string>",
  "strategy": "<string>",
  "status": "<string>",
  "impact": 1,
  "chance": 1,
  "pri": 1,
  "assignedTo": "<string>",
  "desc": "<string>",
  "prevention": "<string>"
});
```
## 删除机会

- SDK 调用：`request("opportunity/delete", params)`
- HTTP：`DELETE /opportunities/{opportunityID}`
- 动作类型：`delete`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `opportunityID` | opportunityID |

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

const result = await request("opportunity/delete", {
  "opportunityID": 1
});
```
