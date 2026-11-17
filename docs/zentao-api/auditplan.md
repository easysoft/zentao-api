# 质量保证计划 (auditplan)

质量保证计划管理，支持获取质量保证计划列表，支持获取项目/执行下的质量保证计划、新增质量保证计划、检查质量保证计划、批量新增项目质量保证计划、获取质量保证详情、编辑质量保证计划、删除质量保证计划

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取质量保证计划列表，支持获取项目/执行下的质量保证计划 | `GET` | `/{scope}/{scopeID}/auditplans` |
| `create` | 新增质量保证计划 | `POST` | `/auditplans` |
| `check` | 检查质量保证计划 | `POST` | `/auditplans/{auditplanID}/check` |
| `batchCreate` | 批量新增项目质量保证计划 | `POST` | `/projects/{projectID}/auditplans/batch` |
| `get` | 获取质量保证详情 | `GET` | `/auditplans/{auditplanID}` |
| `update` | 编辑质量保证计划 | `PUT` | `/auditplans/{auditplanID}` |
| `delete` | 删除质量保证计划 | `DELETE` | `/auditplans/{auditplanID}` |

## 获取质量保证计划列表，支持获取项目/执行下的质量保证计划

- SDK 调用：`request("auditplan/list", params)`
- HTTP：`GET /{scope}/{scopeID}/auditplans`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `scope` | 质量保证计划所属范围 |
| `scopeID` | 所属范围ID |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `all` | 筛选类型，默认 all<br>`all` 全部<br>`wait` 待检查<br>`checking` 检查中<br>`checked` 已检查<br>`assignto` 指派给我<br>`delay` 已延期<br>`today` 今天<br>`yesterday` 昨天<br>`lastmonth` 上月<br>`month` 本月<br>`nextmonth` 下月<br>`iscycle` 周期计划 |
| `param` | number | 否 |  | 筛选参数。browseType=bysearch 时传查询 ID；按过程筛选时传过程 ID；按执行筛选时传执行 ID。 |
| `orderBy` | string | 否 | `id_desc` | 排序字段，默认 id_desc。 |
| `recPerPage` | number | 否 | `20` | 每页数量，默认 20。 |
| `pageID` | number | 否 | `1` | 页码，默认 1。 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：assignedTo,checkDate,checkedBy,createdBy,createdDate,execution,id,objectID,process,realCheckDate,status |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 对象类型：`auditplan`
- 结果字段：`auditplans`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("auditplan/list", {
  "scope": "<string>",
  "scopeID": 1,
  "browseType": "all",
  "param": 1,
  "orderBy": "id_desc",
  "recPerPage": "20",
  "pageID": "1",
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 新增质量保证计划

- SDK 调用：`request("auditplan/create", params)`
- HTTP：`POST /auditplans`
- 动作类型：`create`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

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
    "projectID": {
      "type": "integer",
      "description": "所属项目或执行 ID",
      "format": "int32"
    },
    "execution": {
      "type": "integer",
      "description": "所属执行 ID，项目级计划传 0；敏捷多执行项目下需要传执行 ID",
      "format": "int32"
    },
    "process": {
      "type": "integer",
      "description": "所属过程 ID",
      "format": "int32"
    },
    "objectID": {
      "type": "integer",
      "description": "检查对象 ID（活动或交付物 ID）",
      "format": "int32"
    },
    "objectType": {
      "type": "string",
      "description": "检查对象类型(activity 活动 | zoutput 交付物)"
    },
    "status": {
      "type": "string",
      "description": "状态(wait 待检查 | checking 检查中 | checked 已检查)"
    },
    "isCycle": {
      "type": "integer",
      "description": "是否周期计划(0 否 | 1 是)",
      "format": "int32"
    },
    "checkDateList": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "计划检查日期列表"
    },
    "assignedToList": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "检查人账号列表"
    }
  },
  "required": [
    "projectID",
    "process",
    "objectID"
  ]
}
```

示例:

```json
{
  "projectID": 2,
  "execution": 3,
  "process": 117,
  "objectID": 475,
  "objectType": "activity",
  "status": "wait",
  "isCycle": 0,
  "checkDateList": [
    "2026-10-17"
  ],
  "assignedToList": [
    "admin"
  ]
}
```

### 返回值

- 返回形态：`object`
- 对象类型：`auditplan`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("auditplan/create", {
  "projectID": 1,
  "execution": 1,
  "process": 1,
  "objectID": 1,
  "objectType": "<string>",
  "status": "<string>",
  "isCycle": 1,
  "checkDateList": [
    "<string>"
  ],
  "assignedToList": [
    "<string>"
  ]
});
```
## 检查质量保证计划

- SDK 调用：`request("auditplan/check", params)`
- HTTP：`POST /auditplans/{auditplanID}/check`
- 动作类型：`action`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `auditplanID` | auditplanID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "listID": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "检查清单项 ID 列表"
    },
    "result": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "检查结果列表(pass 通过 | fail 不通过)"
    },
    "status": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "结果状态列表(normal 正式提交 | draft 草稿)"
    }
  },
  "required": [
    "listID",
    "result"
  ]
}
```

示例:

```json
{
  "listID": [
    1
  ],
  "result": [
    "pass"
  ],
  "status": [
    "normal"
  ]
}
```

### 返回值

- 返回形态：`text`
- 对象类型：无统一对象类型

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("auditplan/check", {
  "auditplanID": 1,
  "listID": [
    "<string>"
  ],
  "result": [
    "<string>"
  ],
  "status": [
    "<string>"
  ]
});
```
## 批量新增项目质量保证计划

- SDK 调用：`request("auditplan/batchCreate", params)`
- HTTP：`POST /projects/{projectID}/auditplans/batch`
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
    "process": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "过程 ID 列表"
    },
    "execution": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "执行 ID 列表，项目级计划传 0"
    },
    "objectID": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "检查对象 ID 列表"
    },
    "objectType": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "对象类型列表(activity 活动 | zoutput 交付物)"
    },
    "checkDate": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "计划检查日期列表"
    },
    "assignedTo": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "指派人账号列表"
    },
    "status": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "状态列表(wait 待检查 | checking 检查中 | checked 已检查)"
    }
  },
  "required": [
    "process",
    "objectID",
    "checkDate"
  ]
}
```

示例:

```json
{
  "process": [
    117
  ],
  "execution": [
    3
  ],
  "objectID": [
    475
  ],
  "objectType": [
    "activity"
  ],
  "checkDate": [
    "2026-10-18"
  ],
  "assignedTo": [
    "admin"
  ],
  "status": [
    "wait"
  ]
}
```

### 返回值

- 返回形态：`text`
- 对象类型：`auditplan`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("auditplan/batchCreate", {
  "projectID": 1,
  "process": [
    "<string>"
  ],
  "execution": [
    "<string>"
  ],
  "objectID": [
    "<string>"
  ],
  "objectType": [
    "<string>"
  ],
  "checkDate": [
    "<string>"
  ],
  "assignedTo": [
    "<string>"
  ],
  "status": [
    "<string>"
  ]
});
```
## 获取质量保证详情

- SDK 调用：`request("auditplan/get", params)`
- HTTP：`GET /auditplans/{auditplanID}`
- 动作类型：`get`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `auditplanID` | auditplanID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 对象类型：`auditplan`
- 结果字段：`auditplan`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("auditplan/get", {
  "auditplanID": 1
});
```
## 编辑质量保证计划

- SDK 调用：`request("auditplan/update", params)`
- HTTP：`PUT /auditplans/{auditplanID}`
- 动作类型：`update`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `auditplanID` | auditplanID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "execution": {
      "type": "integer",
      "description": "所属执行 ID，项目级计划传 0。",
      "format": "int32"
    },
    "process": {
      "type": "integer",
      "description": "所属过程 ID。",
      "format": "int32"
    },
    "objectID": {
      "type": "integer",
      "description": "检查对象 ID。",
      "format": "int32"
    },
    "objectType": {
      "type": "string",
      "description": "检查对象类型(activity 活动 | zoutput 交付物)"
    },
    "status": {
      "type": "string",
      "description": "状态(wait 待检查 | checking 检查中 | checked 已检查)"
    },
    "assignedTo": {
      "type": "string",
      "description": "指派人账号。"
    },
    "comment": {
      "type": "string",
      "description": "编辑备注。"
    }
  }
}
```

示例:

```json
{
  "execution": 3,
  "process": 117,
  "objectID": 475,
  "objectType": "activity",
  "status": "wait",
  "assignedTo": "admin",
  "comment": "通过 API 编辑"
}
```

### 返回值

- 返回形态：`object`
- 对象类型：`auditplan`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("auditplan/update", {
  "auditplanID": 1,
  "execution": 1,
  "process": 1,
  "objectID": 1,
  "objectType": "<string>",
  "status": "<string>",
  "assignedTo": "<string>",
  "comment": "<string>"
});
```
## 删除质量保证计划

- SDK 调用：`request("auditplan/delete", params)`
- HTTP：`DELETE /auditplans/{auditplanID}`
- 动作类型：`delete`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `auditplanID` | auditplanID |

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

const result = await request("auditplan/delete", {
  "auditplanID": 1
});
```
