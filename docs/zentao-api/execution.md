# 执行 (execution)

执行管理，支持获取执行列表、创建执行、获取执行详情、修改执行、删除执行

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取执行列表 | `GET` | `/executions` |
| `create` | 创建执行 | `POST` | `/executions` |
| `get` | 获取执行详情 | `GET` | `/executions/{executionID}` |
| `update` | 修改执行 | `PUT` | `/executions/{executionID}` |
| `delete` | 删除执行 | `DELETE` | `/executions/{executionID}` |

## 获取执行列表

- SDK 调用：`request("execution/list", params)`
- HTTP：`GET /executions`
- 动作类型：`list`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `status` | string | 否 | `undone` | 执行状态，默认是undone<br>`all` 全部<br>`undone` 未完成<br>`wait` 未开始<br>`doing` 进行中 |
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

const result = await request("execution/list", {
  "status": "undone",
  "orderBy": "rawID_asc",
  "recPerPage": 1,
  "pageID": 1
});
```
## 创建执行

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
      "description": "访问控制(open 公开 | private 私有)"
    }
  },
  "required": [
    "project",
    "name",
    "begin",
    "end"
  ]
}
```

示例:

```json
{
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
      "description": "访问控制(open 公开 | private 私有)"
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
