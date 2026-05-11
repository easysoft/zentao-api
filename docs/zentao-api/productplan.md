# 产品计划 (productplan)

产品计划管理，支持获取产品计划列表，支持获取产品下的产品计划、创建产品计划、获取产品计划详情、修改产品计划、删除产品计划

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取产品计划列表，支持获取产品下的产品计划 | `GET` | `/{scope}/{scopeID}/productplans` |
| `create` | 创建产品计划 | `POST` | `/productplans` |
| `get` | 获取产品计划详情 | `GET` | `/productplans/{planID}` |
| `update` | 修改产品计划 | `PUT` | `/productplans/{productplanID}` |
| `delete` | 删除产品计划 | `DELETE` | `/productplans/{productplanID}` |

## 获取产品计划列表，支持获取产品下的产品计划

- SDK 调用：`request("productplan/list", params)`
- HTTP：`GET /{scope}/{scopeID}/productplans`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `scope` | 产品计划范围 |
| `scopeID` | 范围ID |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `undone` | 执行状态，默认是undone<br>`all` 全部<br>`undone` 未完成<br>`wait` 未开始<br>`doing` 进行中 |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`title_asc` 名称 升序<br>`title_desc` 名称 降序<br>`begin_asc` 开始日期 升序<br>`begin_desc` 开始日期 降序<br>`end_asc` 结束日期 升序<br>`end_desc` 结束日期 降序<br>`status_asc` 状态 升序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`productplans`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("productplan/list", {
  "scope": "<string>",
  "scopeID": 1,
  "browseType": "undone",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1
});
```
## 创建产品计划

- SDK 调用：`request("productplan/create", params)`
- HTTP：`POST /productplans`
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
      "type": "string",
      "description": "计划名称"
    },
    "parent": {
      "type": "integer",
      "description": "父计划ID",
      "format": "int32"
    },
    "begin": {
      "type": "string",
      "description": "开始日期"
    },
    "end": {
      "type": "string",
      "description": "结束日期"
    },
    "branchID": {
      "type": "integer",
      "description": "分支ID",
      "format": "int32"
    },
    "desc": {
      "type": "string",
      "description": "计划描述"
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
  "parent": 1,
  "begin": "<string>",
  "end": "<string>",
  "branchID": 1,
  "desc": "<string>"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("productplan/create", {
  "productID": 1,
  "title": "<string>",
  "parent": 1,
  "begin": "<string>",
  "end": "<string>",
  "branchID": 1,
  "desc": "<string>"
});
```
## 获取产品计划详情

- SDK 调用：`request("productplan/get", params)`
- HTTP：`GET /productplans/{planID}`
- 动作类型：`get`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `planID` | 产品计划ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 结果字段：`productplan`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("productplan/get", {
  "planID": 1
});
```
## 修改产品计划

- SDK 调用：`request("productplan/update", params)`
- HTTP：`PUT /productplans/{productplanID}`
- 动作类型：`update`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `productplanID` | 产品计划ID |

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
      "description": "计划名称"
    },
    "parent": {
      "type": "integer",
      "description": "父计划",
      "format": "int32"
    },
    "begin": {
      "type": "string",
      "description": "开始日期"
    },
    "end": {
      "type": "string",
      "description": "结束日期"
    },
    "branchID": {
      "type": "integer",
      "description": "分支ID",
      "format": "int32"
    },
    "desc": {
      "type": "string",
      "description": "计划描述"
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
  "parent": 1,
  "begin": "<string>",
  "end": "<string>",
  "branchID": 1,
  "desc": "<string>"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("productplan/update", {
  "productplanID": 1,
  "title": "<string>",
  "parent": 1,
  "begin": "<string>",
  "end": "<string>",
  "branchID": 1,
  "desc": "<string>"
});
```
## 删除产品计划

- SDK 调用：`request("productplan/delete", params)`
- HTTP：`DELETE /productplans/{productplanID}`
- 动作类型：`delete`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `productplanID` | 产品计划ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("productplan/delete", {
  "productplanID": 1
});
```
