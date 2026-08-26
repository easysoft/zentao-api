# 工单 (ticket)

工单管理，支持获取工单列表，支持获取产品下的工单、创建工单、工单转需求、工单转Bug、获取工单详情、修改工单、删除工单、激活工单、关闭工单

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取工单列表，支持获取产品下的工单 | `GET` | `/products/{productID}/tickets` |
| `create` | 创建工单 | `POST` | `/tickets` |
| `createStory` | 工单转需求 | `POST` | `/tickets/{ticketID}/stories` |
| `createBug` | 工单转Bug | `POST` | `/tickets/{ticketID}/bugs` |
| `get` | 获取工单详情 | `GET` | `/tickets/{ticketID}` |
| `update` | 修改工单 | `PUT` | `/tickets/{ticketID}` |
| `delete` | 删除工单 | `DELETE` | `/tickets/{ticketID}` |
| `activate` | 激活工单 | `PUT` | `/tickets/{ticketID}/activate` |
| `close` | 关闭工单 | `PUT` | `/tickets/{ticketID}/close` |

## 获取工单列表，支持获取产品下的工单

- SDK 调用：`request("ticket/list", params)`
- HTTP：`GET /products/{productID}/tickets`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `productID` | 所属产品ID |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `wait` | 状态，默认是wait<br>`all` 全部<br>`unclosed` 未关闭<br>`wait` 待处理<br>`doing` 处理中<br>`done` 待关闭<br>`finishedbyme` 由我解决<br>`assigntome` 指派给我<br>`openedbyme` 由我创建 |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`title_asc` 标题 升序<br>`title_desc` 标题 降序<br>`status_asc` 状态 升序<br>`status_desc` 状态 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activatedBy,activatedCount,activatedDate,assignedTo,closedBy,closedDate,closedReason,contact,customer,deadline,desc,editedBy,editedDate,feedback,id,keywords,mailto,module,notifyEmail,openedBuild,openedBy,openedDate,pri,product,resolution,resolvedBy,resolvedDate,startedBy,startedDate,status,title,type |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`tickets`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("ticket/list", {
  "productID": 1,
  "browseType": "wait",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 创建工单

- SDK 调用：`request("ticket/create", params)`
- HTTP：`POST /tickets`
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
    "product": {
      "type": "integer",
      "description": "所属产品",
      "format": "int32"
    },
    "module": {
      "type": "integer",
      "description": "所属模块",
      "format": "int32"
    },
    "title": {
      "type": "string",
      "description": "标题"
    },
    "type": {
      "type": "string",
      "description": "类型(code 程序报错 | data 数据错误 | stuck 流程卡断 | security 安全问题 | affair 事务)"
    },
    "desc": {
      "type": "string",
      "description": "描述"
    },
    "assignedTo": {
      "type": "string",
      "description": "指派给"
    },
    "deadline": {
      "type": "string",
      "description": "截止日期"
    },
    "openedBuild": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "影响版本"
    }
  },
  "required": [
    "product",
    "title"
  ]
}
```

示例:

```json
{
  "product": 1,
  "module": 1,
  "title": "电容压力监测灵敏度不够",
  "type": "code",
  "desc": "监测灵敏度不够",
  "assignedTo": "admin",
  "deadline": "2026-01-10",
  "openedBuild": [
    "trunk"
  ]
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("ticket/create", {
  "product": 1,
  "module": 1,
  "title": "<string>",
  "type": "<string>",
  "desc": "<string>",
  "assignedTo": "<string>",
  "deadline": "<string>",
  "openedBuild": [
    "<string>"
  ]
});
```
## 工单转需求

- SDK 调用：`request("ticket/createStory", params)`
- HTTP：`POST /tickets/{ticketID}/stories`
- 动作类型：`create`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `ticketID` | 工单ID |

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
      "description": "所属产品",
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
    }
  },
  "required": [
    "productID",
    "title"
  ]
}
```

示例:

```json
{
  "productID": 1,
  "title": "从工单创建的需求",
  "spec": "工单转需求",
  "pri": 3,
  "category": "feature"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("ticket/createStory", {
  "ticketID": 1,
  "productID": 1,
  "title": "<string>",
  "spec": "<string>",
  "pri": 1,
  "category": "<string>"
});
```
## 工单转Bug

- SDK 调用：`request("ticket/createBug", params)`
- HTTP：`POST /tickets/{ticketID}/bugs`
- 动作类型：`create`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `ticketID` | 工单ID |

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
      "description": "所属产品",
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
      "description": "严重程度(1-4)",
      "format": "int32"
    },
    "pri": {
      "type": "integer",
      "description": "优先级",
      "format": "int32"
    },
    "type": {
      "type": "string",
      "description": "Bug类型(codeerror 代码错误 | config 配置相关 | install 安装部署 | security 安全相关 | performance 性能问题 | standard 标准规范 | automation 测试脚本 | designdefect 设计缺陷 | others 其他)"
    },
    "steps": {
      "type": "string",
      "description": "重现步骤"
    }
  },
  "required": [
    "productID",
    "title",
    "openedBuild"
  ]
}
```

示例:

```json
{
  "productID": 1,
  "title": "从工单创建的Bug",
  "openedBuild": [
    "trunk"
  ],
  "severity": 3,
  "pri": 3,
  "type": "codeerror",
  "steps": "工单转Bug"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("ticket/createBug", {
  "ticketID": 1,
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
## 获取工单详情

- SDK 调用：`request("ticket/get", params)`
- HTTP：`GET /tickets/{ticketID}`
- 动作类型：`get`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `ticketID` | 工单ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 结果字段：`ticket`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("ticket/get", {
  "ticketID": 1
});
```
## 修改工单

- SDK 调用：`request("ticket/update", params)`
- HTTP：`PUT /tickets/{ticketID}`
- 动作类型：`update`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `ticketID` | 工单ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "product": {
      "type": "integer",
      "description": "所属产品",
      "format": "int32"
    },
    "module": {
      "type": "integer",
      "description": "所属模块",
      "format": "int32"
    },
    "title": {
      "type": "string",
      "description": "标题"
    },
    "type": {
      "type": "string",
      "description": "类型(code 程序报错 | data 数据错误 | stuck 流程卡断 | security 安全问题 | affair 事务)"
    },
    "desc": {
      "type": "string",
      "description": "描述"
    },
    "assignedTo": {
      "type": "string",
      "description": "指派给"
    },
    "deadline": {
      "type": "string",
      "description": "截止日期"
    },
    "openedBuild": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "影响版本"
    }
  }
}
```

示例:

```json
{
  "product": 1,
  "module": 1,
  "title": "电容压力监测灵敏度不够",
  "type": "code",
  "desc": "监测灵敏度不够",
  "assignedTo": "admin",
  "deadline": "2026-01-10",
  "openedBuild": [
    "trunk"
  ]
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("ticket/update", {
  "ticketID": 1,
  "product": 1,
  "module": 1,
  "title": "<string>",
  "type": "<string>",
  "desc": "<string>",
  "assignedTo": "<string>",
  "deadline": "<string>",
  "openedBuild": [
    "<string>"
  ]
});
```
## 删除工单

- SDK 调用：`request("ticket/delete", params)`
- HTTP：`DELETE /tickets/{ticketID}`
- 动作类型：`delete`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `ticketID` | 工单ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("ticket/delete", {
  "ticketID": 1
});
```
## 激活工单

- SDK 调用：`request("ticket/activate", params)`
- HTTP：`PUT /tickets/{ticketID}/activate`
- 动作类型：`action`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `ticketID` | 工单ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "assignedTo": {
      "type": "string",
      "description": "指派给"
    },
    "comment": {
      "type": "string",
      "description": "备注"
    }
  }
}
```

示例:

```json
{
  "assignedTo": "admin"
}
```

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("ticket/activate", {
  "ticketID": 1,
  "assignedTo": "<string>",
  "comment": "<string>"
});
```
## 关闭工单

- SDK 调用：`request("ticket/close", params)`
- HTTP：`PUT /tickets/{ticketID}/close`
- 动作类型：`action`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `ticketID` | 工单ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "closedReason": {
      "type": "string",
      "description": "关闭原因(commented 已处理 | repeat 重复 | refuse 不予处理)"
    },
    "comment": {
      "type": "string",
      "description": "备注"
    }
  },
  "required": [
    "closedReason",
    "comment"
  ]
}
```

示例:

```json
{
  "closedReason": "done"
}
```

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("ticket/close", {
  "ticketID": 1,
  "closedReason": "<string>",
  "comment": "<string>"
});
```
