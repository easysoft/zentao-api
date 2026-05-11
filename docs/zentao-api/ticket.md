# 工单 (ticket)

工单管理，支持获取工单列表，支持获取产品下的工单、创建工单、获取工单详情、修改工单、删除工单、激活工单、关闭工单

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取工单列表，支持获取产品下的工单 | `GET` | `/{scope}/{scopeID}/tickets` |
| `create` | 创建工单 | `POST` | `/tickets` |
| `get` | 获取工单详情 | `GET` | `/tickets/{ticketID}` |
| `update` | 修改工单 | `PUT` | `/tickets/{ticketID}` |
| `delete` | 删除工单 | `DELETE` | `/tickets/{ticketID}` |
| `activate` | 激活工单 | `PUT` | `/tickets/{ticketID}/activate` |
| `close` | 关闭工单 | `PUT` | `/tickets/{ticketID}/close` |

## 获取工单列表，支持获取产品下的工单

- SDK 调用：`request("ticket/list", params)`
- HTTP：`GET /{scope}/{scopeID}/tickets`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `scope` | 工单范围 |
| `scopeID` | 范围ID |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `wait` | 状态，默认是wait<br>`all` 全部<br>`unclosed` 未关闭<br>`wait` 待处理<br>`doing` 处理中<br>`done` 待关闭<br>`finishedbyme` 由我解决<br>`assigntome` 指派给我<br>`openedbyme` 由我创建 |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`title_asc` 标题 升序<br>`title_desc` 标题 降序<br>`status_asc` 状态 升序<br>`status_desc` 状态 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |

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
  "scope": "<string>",
  "scopeID": 1,
  "browseType": "wait",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1
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
  "title": "<string>",
  "type": "<string>",
  "desc": "<string>",
  "assignedTo": "<string>",
  "deadline": "<string>",
  "openedBuild": [
    "<string>"
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
  "title": "<string>",
  "type": "<string>",
  "desc": "<string>",
  "assignedTo": "<string>",
  "deadline": "<string>",
  "openedBuild": [
    "<string>"
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
  "assignedTo": "<string>",
  "comment": "<string>"
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
  "closedReason": "<string>",
  "comment": "<string>"
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
