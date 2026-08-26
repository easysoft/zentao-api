# 执行 (execution)

执行管理，支持获取执行列表、获取项目的执行列表、获取执行团队列表、获取执行成员列表、创建执行（迭代/阶段/看板）、关闭执行、创建执行的任务模块、获取执行详情、修改执行、删除执行、维护执行成员

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取执行列表 | `GET` | `/executions` |
| `projectExecutions` | 获取项目的执行列表 | `GET` | `/projects/{projectID}/executions` |
| `team` | 获取执行团队列表 | `GET` | `/executions/team` |
| `executionMembers` | 获取执行成员列表 | `GET` | `/executions/{executionID}/members` |
| `create` | 创建执行（迭代/阶段/看板） | `POST` | `/executions` |
| `close` | 关闭执行 | `POST` | `/executions/{executionID}/close` |
| `createTaskModule` | 创建执行的任务模块 | `POST` | `/executions/{executionID}/task/modules` |
| `get` | 获取执行详情 | `GET` | `/executions/{executionID}` |
| `update` | 修改执行 | `PUT` | `/executions/{executionID}` |
| `delete` | 删除执行 | `DELETE` | `/executions/{executionID}` |
| `members` | 维护执行成员 | `PUT` | `/executions/{executionID}/members` |

## 获取执行列表

- SDK 调用：`request("execution/list", params)`
- HTTP：`GET /executions`
- 动作类型：`list`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `undone` | 执行状态，默认是undone<br>`all` 全部<br>`undone` 未完成<br>`wait` 未开始<br>`doing` 进行中 |
| `orderBy` | string | 否 |  | 排序<br>`rawID_asc` RAWID 升序<br>`rawID_desc` RAWID 降序<br>`nameCol_asc` 名称 升序<br>`nameCol_desc` 名称 降序<br>`begin_asc` 计划开始 升序<br>`begin_desc` 计划开始 降序<br>`end_asc` 计划结束 升序<br>`end_desc` 计划结束 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activatedDate,assignedDate,assignedTo,canceledBy,canceledDate,closedBy,closedDate,closedReason,consumed,deadline,desc,estStarted,estimate,execution,finishedBy,finishedDate,fromBug,id,keywords,lastEditedBy,lastEditedDate,left,mailto,module,name,openedBy,openedDate,pri,project,realStarted,status,story,type |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`executions`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("execution/list", {
  "browseType": "undone",
  "orderBy": "rawID_asc",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 获取项目的执行列表

- SDK 调用：`request("execution/projectExecutions", params)`
- HTTP：`GET /projects/{projectID}/executions`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `projectID` | 项目ID |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `undone` | 执行状态，默认是undone<br>`all` 全部<br>`undone` 未完成<br>`wait` 未开始<br>`doing` 进行中 |
| `orderBy` | string | 否 |  | 排序<br>`rawID_asc` RAWID 升序<br>`rawID_desc` RAWID 降序<br>`nameCol_asc` 名称 升序<br>`nameCol_desc` 名称 降序<br>`begin_asc` 计划开始 升序<br>`begin_desc` 计划开始 降序<br>`end_asc` 计划结束 升序<br>`end_desc` 计划结束 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`executions`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("execution/projectExecutions", {
  "projectID": 1,
  "browseType": "undone",
  "orderBy": "rawID_asc",
  "recPerPage": 1,
  "pageID": 1
});
```
## 获取执行团队列表

- SDK 调用：`request("execution/team", params)`
- HTTP：`GET /executions/team`
- 动作类型：`list`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `executionID` | number | 是 |  | 执行ID |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`members`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("execution/team", {
  "executionID": 1
});
```
## 获取执行成员列表

- SDK 调用：`request("execution/executionMembers", params)`
- HTTP：`GET /executions/{executionID}/members`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `executionID` | 执行ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`members`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("execution/executionMembers", {
  "executionID": 1
});
```
## 创建执行（迭代/阶段/看板）

- SDK 调用：`request("execution/create", params)`
- HTTP：`POST /executions`
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
    "name": {
      "type": "string",
      "description": "迭代/阶段名称"
    },
    "type": {
      "type": "string",
      "description": "类型(sprint 迭代 | stage 阶段 | kanban 看板)。默认按项目模型推导：scrum→sprint、kanban→kanban、waterfall/waterfallplus→stage；IPD 项目创建阶段时必须显式传 stage"
    },
    "parent": {
      "type": "integer",
      "description": "父执行/父阶段ID；创建子阶段时传父阶段ID，不传为顶层阶段",
      "format": "int32"
    },
    "attribute": {
      "type": "string",
      "description": "阶段类型(mix 综合 | request 需求 | design 设计 | dev 开发 | qa 测试 | release 发布 | review 总结评审 | other 其他；IPD: concept 概念 | plan 计划 | develop 开发 | qualify 验证 | launch 发布)。不传为空，有 parent 时继承父阶段"
    },
    "lifetime": {
      "type": "string",
      "description": "周期(short 短期，迭代 | long 长期，阶段 | ops 运维)"
    },
    "begin": {
      "type": "string",
      "description": "开始日期"
    },
    "end": {
      "type": "string",
      "description": "结束日期"
    },
    "days": {
      "type": "integer",
      "description": "可用工作日",
      "format": "int32"
    },
    "products": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "关联产品；waterfall/waterfallplus 项目创建阶段时必填"
    },
    "plans": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "关联计划，必须是产品+planID的二维数组"
    },
    "PO": {
      "type": "string",
      "description": "产品负责人"
    },
    "QD": {
      "type": "string",
      "description": "测试负责人"
    },
    "PM": {
      "type": "string",
      "description": "执行负责人"
    },
    "RD": {
      "type": "string",
      "description": "发布负责人"
    },
    "acl": {
      "type": "string",
      "description": "访问控制(open 公开 | private 私有)",
      "defaultValue": "open"
    },
    "milestone": {
      "type": "integer",
      "description": "是否里程碑(0 否| 1 是)",
      "format": "int32"
    }
  },
  "required": [
    "project",
    "name",
    "begin",
    "end",
    "products"
  ]
}
```

示例:

```json
{
  "project": 2,
  "name": "智能设备研发3.1版本开发",
  "type": "sprint",
  "parent": 0,
  "lifetime": "short",
  "begin": "2026-01-01",
  "end": "2026-01-21",
  "days": 16,
  "products": [
    1
  ],
  "plans": {
    "1": [
      0
    ]
  },
  "PO": "productManager",
  "QD": "testManager",
  "PM": "executionManager",
  "RD": "productManager",
  "acl": "open"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("execution/create", {
  "project": 1,
  "name": "<string>",
  "type": "<string>",
  "parent": 1,
  "attribute": "<string>",
  "lifetime": "<string>",
  "begin": "<string>",
  "end": "<string>",
  "days": 1,
  "products": [
    "<string>"
  ],
  "plans": [
    "<string>"
  ],
  "PO": "<string>",
  "QD": "<string>",
  "PM": "<string>",
  "RD": "<string>",
  "acl": "<string>",
  "milestone": 1
});
```
## 关闭执行

- SDK 调用：`request("execution/close", params)`
- HTTP：`POST /executions/{executionID}/close`
- 动作类型：`action`

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
    "realEnd": {
      "type": "string",
      "description": "实际完成日期"
    },
    "comment": {
      "type": "string",
      "description": "备注"
    }
  },
  "required": [
    "realEnd"
  ]
}
```

示例:

```json
{
  "realEnd": "2026-01-21"
}
```

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("execution/close", {
  "executionID": 1,
  "realEnd": "<string>",
  "comment": "<string>"
});
```
## 创建执行的任务模块

- SDK 调用：`request("execution/createTaskModule", params)`
- HTTP：`POST /executions/{executionID}/task/modules`
- 动作类型：`create`

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
    "name": {
      "type": "string",
      "description": "模块名称"
    },
    "parentID": {
      "type": "integer",
      "description": "父模块",
      "format": "int32"
    }
  }
}
```

示例:

```json
{
  "name": "任务模块",
  "parentID": "0"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("execution/createTaskModule", {
  "executionID": 1,
  "name": "<string>",
  "parentID": 1
});
```
## 获取执行详情

- SDK 调用：`request("execution/get", params)`
- HTTP：`GET /executions/{executionID}`
- 动作类型：`get`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `executionID` | 执行ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 结果字段：`execution`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("execution/get", {
  "executionID": 1
});
```
## 修改执行

- SDK 调用：`request("execution/update", params)`
- HTTP：`PUT /executions/{executionID}`
- 动作类型：`update`

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
    "project": {
      "type": "integer",
      "description": "所属项目",
      "format": "int32"
    },
    "name": {
      "type": "string",
      "description": "迭代名称"
    },
    "lifetime": {
      "type": "string",
      "description": "执行类型(short 短期 | long 长期 | ops 运维)"
    },
    "begin": {
      "type": "string",
      "description": "开始日期"
    },
    "end": {
      "type": "string",
      "description": "结束日期"
    },
    "days": {
      "type": "integer",
      "description": "可用工作日",
      "format": "int32"
    },
    "products": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "关联产品"
    },
    "plans": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "关联计划，必须是产品+planID的二维数组"
    },
    "PO": {
      "type": "string",
      "description": "产品负责人"
    },
    "QD": {
      "type": "string",
      "description": "测试负责人"
    },
    "PM": {
      "type": "string",
      "description": "执行负责人"
    },
    "RD": {
      "type": "string",
      "description": "发布负责人"
    },
    "acl": {
      "type": "string",
      "description": "访问控制(open 公开 | private 私有)",
      "defaultValue": "open"
    }
  },
  "required": [
    "name",
    "begin",
    "end"
  ]
}
```

示例:

```json
{
  "project": 2,
  "name": "智能设备研发3.2版本开发",
  "lifetime": "short",
  "begin": "2026-01-01",
  "end": "2026-01-21",
  "days": 16,
  "products": [
    1
  ],
  "plans": {
    "1": [
      1
    ]
  },
  "PO": "productManager",
  "QD": "testManager",
  "PM": "executionManager",
  "RD": "productManager",
  "acl": "open"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("execution/update", {
  "executionID": 1,
  "project": 1,
  "name": "<string>",
  "lifetime": "<string>",
  "begin": "<string>",
  "end": "<string>",
  "days": 1,
  "products": [
    "<string>"
  ],
  "plans": [
    "<string>"
  ],
  "PO": "<string>",
  "QD": "<string>",
  "PM": "<string>",
  "RD": "<string>",
  "acl": "<string>"
});
```
## 删除执行

- SDK 调用：`request("execution/delete", params)`
- HTTP：`DELETE /executions/{executionID}`
- 动作类型：`delete`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `executionID` | 执行ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("execution/delete", {
  "executionID": 1
});
```
## 维护执行成员

- SDK 调用：`request("execution/members", params)`
- HTTP：`PUT /executions/{executionID}/members`
- 动作类型：`action`

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
    "account": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "成员账号，多人时按顺序设置。例如 account=[\"admin\",\"dev1\"] 时，role[0] 对应 admin，role[1] 对应 dev1"
    },
    "role": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "成员角色，与account顺序一一对应"
    },
    "days": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "可用工作日，与account顺序一一对应"
    },
    "hours": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "每日工时，与account顺序一一对应"
    },
    "limited": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "是否限制日期，与account顺序一一对应"
    }
  },
  "required": [
    "account"
  ]
}
```

示例:

```json
{
  "account": [
    "admin",
    "dev1"
  ],
  "role": [
    "PM",
    "dev"
  ],
  "days": [
    5,
    3
  ],
  "hours": [
    7,
    7
  ],
  "limited": [
    "no",
    "no"
  ]
}
```

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("execution/members", {
  "executionID": 1,
  "account": [
    "<string>"
  ],
  "role": [
    "<string>"
  ],
  "days": [
    "<string>"
  ],
  "hours": [
    "<string>"
  ],
  "limited": [
    "<string>"
  ]
});
```
