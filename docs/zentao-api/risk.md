# 风险 (risk)

风险管理，支持获取风险列表、获取项目风险列表、获取执行风险列表、创建风险、获取风险详情、修改风险

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取风险列表 | `GET` | `/risks` |
| `projectRisks` | 获取项目风险列表 | `GET` | `/projects/{projectID}/risks` |
| `executionRisks` | 获取执行风险列表 | `GET` | `/executions/{executionID}/risks` |
| `create` | 创建风险 | `POST` | `/risks` |
| `get` | 获取风险详情 | `GET` | `/risks/{riskID}` |
| `update` | 修改风险 | `PUT` | `/risks/{riskID}` |

## 获取风险列表

- SDK 调用：`request("risk/list", params)`
- HTTP：`GET /risks`
- 动作类型：`list`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `all` | 状态，默认是all<br>`all` 全部<br>`active` 开放<br>`assignTo` 指派给我<br>`assignBy` 由我指派<br>`closed` 已关闭<br>`hangup` 已挂起<br>`canceled` 已取消 |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`name_asc` 名称 升序<br>`name_desc` 名称 降序<br>`status_asc` 状态 升序<br>`status_desc` 状态 降序<br>`pri_asc` 优先级 升序<br>`pri_desc` 优先级 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activateBy,actualClosedDate,assignedTo,cancelBy,category,createdBy,createdDate,editedBy,editedDate,hangupBy,id,identifiedDate,impact,name,plannedClosedDate,prevention,pri,probability,project,rate,remedy,resolution,resolvedBy,source,status,strategy,trackedBy |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`risks`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("risk/list", {
  "browseType": "all",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 获取项目风险列表

- SDK 调用：`request("risk/projectRisks", params)`
- HTTP：`GET /projects/{projectID}/risks`
- 动作类型：`list`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `projectID` | 项目ID |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `all` | 状态，默认是all<br>`all` 全部<br>`active` 开放<br>`assignTo` 指派给我<br>`assignBy` 由我指派<br>`closed` 已关闭<br>`hangup` 已挂起<br>`canceled` 已取消 |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`name_asc` 名称 升序<br>`name_desc` 名称 降序<br>`status_asc` 状态 升序<br>`status_desc` 状态 降序<br>`pri_asc` 优先级 升序<br>`pri_desc` 优先级 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activateBy,actualClosedDate,assignedTo,cancelBy,category,createdBy,createdDate,editedBy,editedDate,hangupBy,id,identifiedDate,impact,name,plannedClosedDate,prevention,pri,probability,project,rate,remedy,resolution,resolvedBy,source,status,strategy,trackedBy |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`risks`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("risk/projectRisks", {
  "projectID": 1,
  "browseType": "all",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 获取执行风险列表

- SDK 调用：`request("risk/executionRisks", params)`
- HTTP：`GET /executions/{executionID}/risks`
- 动作类型：`list`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `executionID` | 执行ID |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `all` | 状态，默认是all<br>`all` 全部<br>`active` 开放<br>`assignTo` 指派给我<br>`assignBy` 由我指派<br>`closed` 已关闭<br>`hangup` 已挂起<br>`canceled` 已取消 |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`name_asc` 名称 升序<br>`name_desc` 名称 降序<br>`status_asc` 状态 升序<br>`status_desc` 状态 降序<br>`pri_asc` 优先级 升序<br>`pri_desc` 优先级 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activateBy,actualClosedDate,assignedTo,cancelBy,category,createdBy,createdDate,editedBy,editedDate,hangupBy,id,identifiedDate,impact,name,plannedClosedDate,prevention,pri,probability,project,rate,remedy,resolution,resolvedBy,source,status,strategy,trackedBy |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`risks`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("risk/executionRisks", {
  "executionID": 1,
  "browseType": "all",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 创建风险

- SDK 调用：`request("risk/create", params)`
- HTTP：`POST /risks`
- 动作类型：`create`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

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
    "name": {
      "type": "string",
      "description": "风险名称"
    },
    "execution": {
      "type": "integer",
      "description": "所属执行",
      "format": "int32"
    },
    "source": {
      "type": "string",
      "description": "来源(business 业务部门 | team 项目组 | logistic 项目保障科室 | manage 管理层 | sourcing 供应商-采购 | outsourcing 供应商-外包 | customer 外部客户 | others 其他)"
    },
    "category": {
      "type": "string",
      "description": "类型(technical 技术类 | manage 管理类 | business 业务类 | requirement 需求类 | resource 资源类 | others 其他)"
    },
    "strategy": {
      "type": "string",
      "description": "策略(avoidance 规避 | mitigation 缓解 | transference 转移 | acceptance 接受)"
    },
    "impact": {
      "type": "integer",
      "description": "影响程度(1-5)",
      "format": "int32"
    },
    "probability": {
      "type": "integer",
      "description": "发生概率(1-5)",
      "format": "int32"
    },
    "rate": {
      "type": "integer",
      "description": "风险系数",
      "format": "int32"
    },
    "pri": {
      "type": "integer",
      "description": "优先级(1 高 | 2 中 | 3 低)",
      "format": "int32"
    },
    "identifiedDate": {
      "type": "string",
      "description": "识别日期"
    },
    "plannedClosedDate": {
      "type": "string",
      "description": "计划关闭日期"
    },
    "assignedTo": {
      "type": "string",
      "description": "指派给"
    },
    "prevention": {
      "type": "string",
      "description": "应对措施"
    },
    "remedy": {
      "type": "string",
      "description": "响应措施"
    }
  },
  "required": [
    "project",
    "name",
    "impact",
    "probability",
    "pri"
  ]
}
```

示例:

```json
{
  "project": 2,
  "name": "关键路径延期",
  "execution": 3,
  "source": "business",
  "category": "technical",
  "strategy": "avoidance",
  "impact": 3,
  "probability": 3,
  "rate": 9,
  "pri": 2,
  "identifiedDate": "2026-01-01",
  "plannedClosedDate": "2026-03-01",
  "assignedTo": "admin"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("risk/create", {
  "project": 1,
  "name": "<string>",
  "execution": 1,
  "source": "<string>",
  "category": "<string>",
  "strategy": "<string>",
  "impact": 1,
  "probability": 1,
  "rate": 1,
  "pri": 1,
  "identifiedDate": "<string>",
  "plannedClosedDate": "<string>",
  "assignedTo": "<string>",
  "prevention": "<string>",
  "remedy": "<string>"
});
```
## 获取风险详情

- SDK 调用：`request("risk/get", params)`
- HTTP：`GET /risks/{riskID}`
- 动作类型：`get`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `riskID` | 风险ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 结果字段：`risk`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("risk/get", {
  "riskID": 1
});
```
## 修改风险

- SDK 调用：`request("risk/update", params)`
- HTTP：`PUT /risks/{riskID}`
- 动作类型：`update`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `riskID` | 风险ID |

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
      "description": "风险名称"
    },
    "source": {
      "type": "string",
      "description": "来源(business 业务部门 | team 项目组 | logistic 项目保障科室 | manage 管理层 | sourcing 供应商-采购 | outsourcing 供应商-外包 | customer 外部客户 | others 其他)"
    },
    "category": {
      "type": "string",
      "description": "类型(technical 技术类 | manage 管理类 | business 业务类 | requirement 需求类 | resource 资源类 | others 其他)"
    },
    "strategy": {
      "type": "string",
      "description": "策略(avoidance 规避 | mitigation 缓解 | transference 转移 | acceptance 接受)"
    },
    "impact": {
      "type": "integer",
      "description": "影响程度(1-5)",
      "format": "int32"
    },
    "probability": {
      "type": "integer",
      "description": "发生概率(1-5)",
      "format": "int32"
    },
    "rate": {
      "type": "integer",
      "description": "风险系数",
      "format": "int32"
    },
    "pri": {
      "type": "integer",
      "description": "优先级(1 高 | 2 中 | 3 低)",
      "format": "int32"
    },
    "identifiedDate": {
      "type": "string",
      "description": "识别日期"
    },
    "plannedClosedDate": {
      "type": "string",
      "description": "计划关闭日期"
    },
    "assignedTo": {
      "type": "string",
      "description": "指派给"
    },
    "prevention": {
      "type": "string",
      "description": "应对措施"
    },
    "remedy": {
      "type": "string",
      "description": "响应措施"
    },
    "resolution": {
      "type": "string",
      "description": "解决措施"
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
  "name": "关键路径延期",
  "source": "business",
  "category": "technical",
  "strategy": "avoidance",
  "impact": 3,
  "probability": 3,
  "rate": 9,
  "pri": 2,
  "identifiedDate": "2026-01-01",
  "plannedClosedDate": "2026-03-01",
  "assignedTo": "admin"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("risk/update", {
  "riskID": 1,
  "name": "<string>",
  "source": "<string>",
  "category": "<string>",
  "strategy": "<string>",
  "impact": 1,
  "probability": 1,
  "rate": 1,
  "pri": 1,
  "identifiedDate": "<string>",
  "plannedClosedDate": "<string>",
  "assignedTo": "<string>",
  "prevention": "<string>",
  "remedy": "<string>",
  "resolution": "<string>"
});
```
