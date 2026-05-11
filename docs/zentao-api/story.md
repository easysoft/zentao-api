# 需求 (story)

需求管理，支持获取需求列表，支持获取产品/项目/执行下的需求、创建需求、获取需求详情、修改需求、删除需求、激活需求、变更需求、关闭需求

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取需求列表，支持获取产品/项目/执行下的需求 | `GET` | `/{scope}/{scopeID}/stories` |
| `create` | 创建需求 | `POST` | `/stories` |
| `get` | 获取需求详情 | `GET` | `/stories/{storyID}` |
| `update` | 修改需求 | `PUT` | `/stories/{storyID}` |
| `delete` | 删除需求 | `DELETE` | `/stories/{storyID}` |
| `activate` | 激活需求 | `PUT` | `/stories/{storyID}/activate` |
| `change` | 变更需求 | `PUT` | `/stories/{storyID}/change` |
| `close` | 关闭需求 | `PUT` | `/stories/{storyID}/close` |

## 获取需求列表，支持获取产品/项目/执行下的需求

- SDK 调用：`request("story/list", params)`
- HTTP：`GET /{scope}/{scopeID}/stories`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `scope` | 需求范围 |
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
- 结果字段：`stories`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("story/list", {
  "scope": "<string>",
  "scopeID": 1,
  "browseType": "unclosed",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1
});
```
## 创建需求

- SDK 调用：`request("story/create", params)`
- HTTP：`POST /stories`
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
      "description": "父需求",
      "format": "int32"
    },
    "estimate": {
      "type": "number",
      "description": "预计工时",
      "format": "float"
    },
    "spec": {
      "type": "string",
      "description": "需求描述"
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
    },
    "project": {
      "type": "integer",
      "description": "所属项目",
      "format": "int32"
    },
    "execution": {
      "type": "integer",
      "description": "所属执行",
      "format": "int32"
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
  ],
  "project": 1,
  "execution": 1
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("story/create", {
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
  ],
  "project": 1,
  "execution": 1
});
```
## 获取需求详情

- SDK 调用：`request("story/get", params)`
- HTTP：`GET /stories/{storyID}`
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
- 结果字段：`story`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("story/get", {
  "storyID": 1
});
```
## 修改需求

- SDK 调用：`request("story/update", params)`
- HTTP：`PUT /stories/{storyID}`
- 动作类型：`update`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `storyID` | 需求ID |

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
      "description": "父需求",
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

const result = await request("story/update", {
  "storyID": 1,
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
## 删除需求

- SDK 调用：`request("story/delete", params)`
- HTTP：`DELETE /stories/{storyID}`
- 动作类型：`delete`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `storyID` | 需求ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("story/delete", {
  "storyID": 1
});
```
## 激活需求

- SDK 调用：`request("story/activate", params)`
- HTTP：`PUT /stories/{storyID}/activate`
- 动作类型：`action`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `storyID` | 需求ID |

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

const result = await request("story/activate", {
  "storyID": 1,
  "assignedTo": "<string>",
  "comment": "<string>"
});
```
## 变更需求

- SDK 调用：`request("story/change", params)`
- HTTP：`PUT /stories/{storyID}/change`
- 动作类型：`action`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `storyID` | 需求ID |

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

const result = await request("story/change", {
  "storyID": 1,
  "title": "<string>",
  "reviewer": [
    "<string>"
  ],
  "spec": "<string>",
  "verify": "<string>"
});
```
## 关闭需求

- SDK 调用：`request("story/close", params)`
- HTTP：`PUT /stories/{storyID}/close`
- 动作类型：`action`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `storyID` | 需求ID |

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

const result = await request("story/close", {
  "storyID": 1,
  "closedReason": "<string>",
  "comment": "<string>"
});
```
