# 业务需求 (epic)

业务需求管理，支持获取业务需求列表，支持获取产品下的业务需求、创建业务需求、获取业务需求详情、修改业务需求、删除业务需求、激活业务需求、变更业务需求、关闭业务需求

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取业务需求列表，支持获取产品下的业务需求 | `GET` | `/{scope}/{scopeID}/epics` |
| `create` | 创建业务需求 | `POST` | `/epics` |
| `get` | 获取业务需求详情 | `GET` | `/epics/{storyID}` |
| `update` | 修改业务需求 | `PUT` | `/epics/{epicID}` |
| `delete` | 删除业务需求 | `DELETE` | `/epics/{epicID}` |
| `activate` | 激活业务需求 | `PUT` | `/epics/{epicID}/activate` |
| `change` | 变更业务需求 | `PUT` | `/epics/{epicID}/change` |
| `close` | 关闭业务需求 | `PUT` | `/epics/{epicID}/close` |

## 获取业务需求列表，支持获取产品下的业务需求

- SDK 调用：`request("epic/list", params)`
- HTTP：`GET /{scope}/{scopeID}/epics`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `scope` | 业务需求范围 |
| `scopeID` | 范围ID |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `unclosed` | 状态，默认是unclosed<br>`allstory` 全部<br>`assignedtome` 指派给我<br>`openedbyme` 我创建<br>`reviewbyme` 待我评审<br>`draftstory` 草稿 |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`title_asc` 标题 升序<br>`title_desc` 标题 降序<br>`status_asc` 状态 升序<br>`status_desc` 状态 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`epics`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("epic/list", {
  "scope": "<string>",
  "scopeID": 1,
  "browseType": "unclosed",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1
});
```
## 创建业务需求

- SDK 调用：`request("epic/create", params)`
- HTTP：`POST /epics`
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
    "productID": {
      "type": "integer",
      "description": "产品ID",
      "format": "int32"
    },
    "title": {
      "type": "string"
    },
    "pri": {
      "type": "integer",
      "description": "优先级，默认是3",
      "format": "int32"
    },
    "module": {
      "type": "integer",
      "description": "所属模块",
      "format": "int32"
    },
    "parent": {
      "type": "integer",
      "description": "父业务需求",
      "format": "int32"
    },
    "estimate": {
      "type": "number",
      "description": "预计工时",
      "format": "float"
    },
    "spec": {
      "type": "string",
      "description": "业务需求描述"
    },
    "category": {
      "type": "integer",
      "description": "类别(feature 功能 | interface 接口 | performance 性能 | safe 安全 | experience 体验 | improve 改进 | other 其他)",
      "format": "int32"
    },
    "source": {
      "type": "string",
      "description": "来源(customer 客户 | user 用户 | po 产品经理 | market 市场 | service 客服 | operation 运营 | support 技术支持 | competitor 竞争对手 | partner 合作伙伴 | dev 开发人员 | tester 测试人员 | bug Bug | forum 论坛 | other 其他)"
    },
    "verify": {
      "type": "string",
      "description": "验收标准"
    },
    "assignedTo": {
      "type": "string",
      "description": "指派给"
    },
    "reviewer": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "评审人，如果设置必须评审，必须填写"
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
  "title": "<string>",
  "pri": 1,
  "module": 1,
  "parent": 1,
  "estimate": 1,
  "spec": "<string>",
  "category": 1,
  "source": "<string>",
  "verify": "<string>",
  "assignedTo": "<string>",
  "reviewer": [
    "<string>"
  ]
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("epic/create", {
  "productID": 1,
  "title": "<string>",
  "pri": 1,
  "module": 1,
  "parent": 1,
  "estimate": 1,
  "spec": "<string>",
  "category": 1,
  "source": "<string>",
  "verify": "<string>",
  "assignedTo": "<string>",
  "reviewer": [
    "<string>"
  ]
});
```
## 获取业务需求详情

- SDK 调用：`request("epic/get", params)`
- HTTP：`GET /epics/{storyID}`
- 动作类型：`get`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `storyID` | 需求ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 结果字段：`epic`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("epic/get", {
  "storyID": 1
});
```
## 修改业务需求

- SDK 调用：`request("epic/update", params)`
- HTTP：`PUT /epics/{epicID}`
- 动作类型：`update`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `epicID` | 业务需求ID |

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
      "description": "需求名称"
    },
    "pri": {
      "type": "integer",
      "description": "优先级，默认是3",
      "format": "int32"
    },
    "module": {
      "type": "integer",
      "description": "所属模块",
      "format": "int32"
    },
    "parent": {
      "type": "integer",
      "description": "父业务需求",
      "format": "int32"
    },
    "estimate": {
      "type": "number",
      "description": "预计工时",
      "format": "float"
    },
    "category": {
      "type": "integer",
      "description": "类别(feature 功能 | interface 接口 | performance 性能 | safe 安全 | experience 体验 | improve 改进 | other 其他)",
      "format": "int32"
    },
    "source": {
      "type": "string",
      "description": "来源(customer 客户 | user 用户 | po 产品经理 | market 市场 | service 客服 | operation 运营 | support 技术支持 | competitor 竞争对手 | partner 合作伙伴 | dev 开发人员 | tester 测试人员 | bug Bug | forum 论坛 | other 其他)"
    },
    "assignedTo": {
      "type": "string",
      "description": "指派给"
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
  "title": "<string>",
  "pri": 1,
  "module": 1,
  "parent": 1,
  "estimate": 1,
  "category": 1,
  "source": "<string>",
  "assignedTo": "<string>"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("epic/update", {
  "epicID": 1,
  "title": "<string>",
  "pri": 1,
  "module": 1,
  "parent": 1,
  "estimate": 1,
  "category": 1,
  "source": "<string>",
  "assignedTo": "<string>"
});
```
## 删除业务需求

- SDK 调用：`request("epic/delete", params)`
- HTTP：`DELETE /epics/{epicID}`
- 动作类型：`delete`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `epicID` | 业务需求ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("epic/delete", {
  "epicID": 1
});
```
## 激活业务需求

- SDK 调用：`request("epic/activate", params)`
- HTTP：`PUT /epics/{epicID}/activate`
- 动作类型：`action`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `epicID` | 业务需求ID |

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

const result = await request("epic/activate", {
  "epicID": 1,
  "assignedTo": "<string>",
  "comment": "<string>"
});
```
## 变更业务需求

- SDK 调用：`request("epic/change", params)`
- HTTP：`PUT /epics/{epicID}/change`
- 动作类型：`action`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `epicID` | 业务需求ID |

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
      "description": "需求名称"
    },
    "reviewer": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "评审人员"
    },
    "spec": {
      "type": "string",
      "description": "需求描述"
    },
    "verify": {
      "type": "string",
      "description": "验收标准"
    }
  },
  "required": [
    "reviewer"
  ]
}
```

示例:

```json
{
  "title": "<string>",
  "reviewer": [
    "<string>"
  ],
  "spec": "<string>",
  "verify": "<string>"
}
```

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("epic/change", {
  "epicID": 1,
  "title": "<string>",
  "reviewer": [
    "<string>"
  ],
  "spec": "<string>",
  "verify": "<string>"
});
```
## 关闭业务需求

- SDK 调用：`request("epic/close", params)`
- HTTP：`PUT /epics/{epicID}/close`
- 动作类型：`action`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `epicID` | 业务需求ID |

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
      "description": "关闭原因(done 已完成 | subdivided 已拆分 | duplicate 重复 | postponed 延期 | willnotdo 不做 | cancel 已取消 | bydesign 设计如此)"
    },
    "comment": {
      "type": "string",
      "description": "备注"
    }
  },
  "required": [
    "closedReason"
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

const result = await request("epic/close", {
  "epicID": 1,
  "closedReason": "<string>",
  "comment": "<string>"
});
```
