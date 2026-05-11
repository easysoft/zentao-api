# 产品 (product)

产品管理，支持获取产品列表、创建产品、获取产品详情、修改产品、删除产品

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取产品列表 | `GET` | `/products` |
| `create` | 创建产品 | `POST` | `/products` |
| `get` | 获取产品详情 | `GET` | `/products/{productID}` |
| `update` | 修改产品 | `PUT` | `/products/{productID}` |
| `delete` | 删除产品 | `DELETE` | `/products/{productID}` |

## 获取产品列表

- SDK 调用：`request("product/list", params)`
- HTTP：`GET /products`
- 动作类型：`list`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 |  | 浏览类型<br>`all` 全部<br>`noclosed` 未关闭<br>`closed` 已结束 |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`title_asc` 名称 升序<br>`title_desc` 名称 降序<br>`begin_asc` 计划开始 升序<br>`begin_desc` 计划开始 降序<br>`end_asc` 计划结束 升序<br>`end_desc` 计划结束 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`products`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("product/list", {
  "browseType": "all",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1
});
```
## 创建产品

- SDK 调用：`request("product/create", params)`
- HTTP：`POST /products`
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
    "name": {
      "type": "string",
      "description": "产品名称"
    },
    "program": {
      "type": "integer",
      "description": "所属项目集",
      "format": "int32"
    },
    "line": {
      "type": "integer",
      "description": "所属产品线",
      "format": "int32"
    },
    "type": {
      "type": "string",
      "description": "类型(normal 正常 | branch 多分支 | platform 多平台)"
    },
    "PO": {
      "type": "string",
      "description": "产品负责人"
    },
    "reviewer": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "评审人"
    },
    "desc": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "产品描述"
    },
    "QD": {
      "type": "string",
      "description": "测试负责人"
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
    "name"
  ]
}
```

示例:

```json
{
  "name": "<string>",
  "program": 1,
  "line": 1,
  "type": "<string>",
  "PO": "<string>",
  "reviewer": [
    "<string>"
  ],
  "desc": [
    "<string>"
  ],
  "QD": "<string>",
  "RD": "<string>",
  "acl": "<string>"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("product/create", {
  "name": "<string>",
  "program": 1,
  "line": 1,
  "type": "<string>",
  "PO": "<string>",
  "reviewer": [
    "<string>"
  ],
  "desc": [
    "<string>"
  ],
  "QD": "<string>",
  "RD": "<string>",
  "acl": "<string>"
});
```
## 获取产品详情

- SDK 调用：`request("product/get", params)`
- HTTP：`GET /products/{productID}`
- 动作类型：`get`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `productID` | 产品ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 结果字段：`product`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("product/get", {
  "productID": 1
});
```
## 修改产品

- SDK 调用：`request("product/update", params)`
- HTTP：`PUT /products/{productID}`
- 动作类型：`update`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `productID` | 产品ID |

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
      "description": "产品名称"
    },
    "program": {
      "type": "integer",
      "description": "所属项目集",
      "format": "int32"
    },
    "line": {
      "type": "integer",
      "description": "所属产品线",
      "format": "int32"
    },
    "type": {
      "type": "string",
      "description": "类型(normal 正常 | branch 多分支 | platform 多平台)"
    },
    "PO": {
      "type": "string",
      "description": "产品负责人"
    },
    "reviewer": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "评审人"
    },
    "desc": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "产品描述"
    },
    "QD": {
      "type": "string",
      "description": "测试负责人"
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
    "name"
  ]
}
```

示例:

```json
{
  "name": "<string>",
  "program": 1,
  "line": 1,
  "type": "<string>",
  "PO": "<string>",
  "reviewer": [
    "<string>"
  ],
  "desc": [
    "<string>"
  ],
  "QD": "<string>",
  "RD": "<string>",
  "acl": "<string>"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("product/update", {
  "productID": 1,
  "name": "<string>",
  "program": 1,
  "line": 1,
  "type": "<string>",
  "PO": "<string>",
  "reviewer": [
    "<string>"
  ],
  "desc": [
    "<string>"
  ],
  "QD": "<string>",
  "RD": "<string>",
  "acl": "<string>"
});
```
## 删除产品

- SDK 调用：`request("product/delete", params)`
- HTTP：`DELETE /products/{productID}`
- 动作类型：`delete`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `productID` | 产品ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("product/delete", {
  "productID": 1
});
```
