# 项目 (project)

项目管理，支持获取项目列表、获取项目集的项目列表、获取项目团队列表、获取项目成员列表、创建项目、关闭项目、创建项目需求、创建项目Bug、创建项目任务、修改项目、删除项目、维护项目成员

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取项目列表 | `GET` | `/projects` |
| `programProjects` | 获取项目集的项目列表 | `GET` | `/programs/{programID}/projects` |
| `team` | 获取项目团队列表 | `GET` | `/projects/team` |
| `projectMembers` | 获取项目成员列表 | `GET` | `/projects/{projectID}/members` |
| `create` | 创建项目 | `POST` | `/projects` |
| `close` | 关闭项目 | `POST` | `/projects/{projectID}/close` |
| `createStory` | 创建项目需求 | `POST` | `/projects/{projectID}/stories` |
| `createBug` | 创建项目Bug | `POST` | `/projects/{projectID}/bugs` |
| `createTask` | 创建项目任务 | `POST` | `/projects/{projectID}/tasks` |
| `update` | 修改项目 | `PUT` | `/projects/{projectID}` |
| `delete` | 删除项目 | `DELETE` | `/projects/{projectID}` |
| `members` | 维护项目成员 | `PUT` | `/projects/{projectID}/members` |

## 获取项目列表

- SDK 调用：`request("project/list", params)`
- HTTP：`GET /projects`
- 动作类型：`list`
- 最低禅道版本：`22.0` / `biz13.0` / `max8.0` / `ipd5.0`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `undone` | 项目状态，默认是undone<br>`all` 全部<br>`undone` 未完成<br>`wait` 未开始<br>`doing` 进行中 |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`name_asc` 名称 升序<br>`name_desc` 名称 降序<br>`begin_asc` 计划开始 升序<br>`begin_desc` 计划开始 降序<br>`end_asc` 计划结束 升序<br>`end_desc` 计划结束 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：name(项目名称，示例：关键字)；code(项目代号，示例：关键字)；id(项目ID，示例：1)；model(项目管理方式，枚举：scrum Scrum \| waterfall 瀑布 \| kanban 看板 \| agileplus 融合敏捷 \| waterfallplus 融合瀑布)；hasProduct(项目类型，枚举：1 产品型 \| 0 项目型)；parent(所属项目集，示例：all)；status(状态，枚举：wait 未开始 \| doing 进行中 \| suspended 已挂起 \| closed 已关闭 \| delay 已延期)；desc(项目描述，示例：关键字)；PM(负责人，用户，示例：admin)；openedDate(创建日期，示例：2026-01-01)；begin(计划开始，示例：2026-01-01)；end(计划完成，示例：2026-01-01)；realBegan(实际开始，示例：2026-01-01)；realEnd(实际完成，示例：2026-01-01)；openedBy(由谁创建，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedDate(最后编辑日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01) |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

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
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 获取项目集的项目列表

- SDK 调用：`request("project/programProjects", params)`
- HTTP：`GET /programs/{programID}/projects`
- 动作类型：`list`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `programID` | 项目集ID |

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

const result = await request("project/programProjects", {
  "programID": 1,
  "browseType": "undone",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1
});
```
## 获取项目团队列表

- SDK 调用：`request("project/team", params)`
- HTTP：`GET /projects/team`
- 动作类型：`list`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `projectID` | number | 是 |  | 项目ID |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`members`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("project/team", {
  "projectID": 1
});
```
## 获取项目成员列表

- SDK 调用：`request("project/projectMembers", params)`
- HTTP：`GET /projects/{projectID}/members`
- 动作类型：`list`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `projectID` | 项目ID |

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

const result = await request("project/projectMembers", {
  "projectID": 1
});
```
## 创建项目

- SDK 调用：`request("project/create", params)`
- HTTP：`POST /projects`
- 动作类型：`create`
- 最低禅道版本：`22.0` / `biz13.0` / `max8.0` / `ipd5.0`

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
  "name": "智能设备研发",
  "model": "scrum",
  "begin": "2025-01-01",
  "end": "2026-10-01",
  "products": [
    1
  ],
  "parent": 1,
  "workflowGroup": 13,
  "PM": "projectManager"
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
## 关闭项目

- SDK 调用：`request("project/close", params)`
- HTTP：`POST /projects/{projectID}/close`
- 动作类型：`action`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

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
  "realEnd": "2026-08-19"
}
```

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("project/close", {
  "projectID": 1,
  "realEnd": "<string>",
  "comment": "<string>"
});
```
## 创建项目需求

- SDK 调用：`request("project/createStory", params)`
- HTTP：`POST /projects/{projectID}/stories`
- 动作类型：`create`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

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
    "productID": {
      "type": "integer",
      "description": "所属产品；项目型项目可不传，产品型项目必须传",
      "format": "int32"
    },
    "title": {
      "type": "string",
      "description": "需求标题"
    },
    "spec": {
      "type": "string",
      "description": "需求描述"
    },
    "pri": {
      "type": "integer",
      "description": "优先级",
      "format": "int32"
    },
    "category": {
      "type": "string",
      "description": "类别"
    },
    "reviewer": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "评审人"
    }
  },
  "required": [
    "title"
  ]
}
```

示例:

```json
{
  "productID": 1,
  "title": "项目型项目的需求",
  "spec": "需求描述",
  "pri": 3,
  "category": "feature",
  "reviewer": [
    "productManager"
  ]
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("project/createStory", {
  "projectID": 1,
  "productID": 1,
  "title": "<string>",
  "spec": "<string>",
  "pri": 1,
  "category": "<string>",
  "reviewer": [
    "<string>"
  ]
});
```
## 创建项目Bug

- SDK 调用：`request("project/createBug", params)`
- HTTP：`POST /projects/{projectID}/bugs`
- 动作类型：`create`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

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
    "productID": {
      "type": "integer",
      "description": "所属产品；项目型项目可不传，产品型项目必须传",
      "format": "int32"
    },
    "title": {
      "type": "string",
      "description": "Bug标题"
    },
    "openedBuild": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "影响版本，主干是trunk，其他版本使用版本ID"
    },
    "severity": {
      "type": "integer",
      "description": "严重程度",
      "format": "int32"
    },
    "pri": {
      "type": "integer",
      "description": "优先级",
      "format": "int32"
    },
    "type": {
      "type": "string",
      "description": "Bug类型"
    },
    "steps": {
      "type": "string",
      "description": "重现步骤"
    }
  },
  "required": [
    "title",
    "openedBuild"
  ]
}
```

示例:

```json
{
  "productID": 1,
  "title": "项目型项目的Bug",
  "openedBuild": [
    "trunk"
  ],
  "severity": 3,
  "pri": 3,
  "type": "codeerror"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("project/createBug", {
  "projectID": 1,
  "productID": 1,
  "title": "<string>",
  "openedBuild": [
    "<string>"
  ],
  "severity": 1,
  "pri": 1,
  "type": "<string>",
  "steps": "<string>"
});
```
## 创建项目任务

- SDK 调用：`request("project/createTask", params)`
- HTTP：`POST /projects/{projectID}/tasks`
- 动作类型：`create`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

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
      "description": "任务名称"
    },
    "executionID": {
      "type": "integer",
      "description": "所属执行；无执行项目可不传，有执行项目必须传",
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
    "name"
  ]
}
```

示例:

```json
{
  "name": "无执行项目任务",
  "executionID": 3,
  "type": "devel",
  "assignedTo": "admin",
  "estStarted": "2026-01-01",
  "deadline": "2026-01-10",
  "pri": 1,
  "estimate": 1,
  "module": 0,
  "story": 0
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("project/createTask", {
  "projectID": 1,
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
## 修改项目

- SDK 调用：`request("project/update", params)`
- HTTP：`PUT /projects/{projectID}`
- 动作类型：`update`
- 最低禅道版本：`22.0` / `biz13.0` / `max8.0` / `ipd5.0`

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
  "name": "智能设备研发",
  "model": "scrum",
  "begin": "2025-01-01",
  "end": "2026-10-01",
  "products": [
    1
  ],
  "parent": 1,
  "workflowGroup": 13,
  "PM": "projectManager"
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
- 最低禅道版本：`22.0` / `biz13.0` / `max8.0` / `ipd5.0`

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
## 维护项目成员

- SDK 调用：`request("project/members", params)`
- HTTP：`PUT /projects/{projectID}/members`
- 动作类型：`action`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

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

const result = await request("project/members", {
  "projectID": 1,
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
