# 发布 (release)

发布管理，支持获取发布列表，支持获取产品下的发布、创建发布、修改发布、删除发布

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取发布列表，支持获取产品下的发布 | `GET` | `/products/{productID}/releases` |
| `create` | 创建发布 | `POST` | `/releases` |
| `update` | 修改发布 | `PUT` | `/releases/{releaseID}` |
| `delete` | 删除发布 | `DELETE` | `/releases/{releaseID}` |

## 获取发布列表，支持获取产品下的发布

- SDK 调用：`request("release/list", params)`
- HTTP：`GET /products/{productID}/releases`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `productID` | 所属产品ID |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `all` | 状态，默认是all<br>`all` 全部<br>`wait` 未开始<br>`normal` 已发布<br>`fail` 发布失败<br>`terminate` 停止维护 |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`name_asc` 名称 升序<br>`name_desc` 名称 降序<br>`date_asc` 日期 升序<br>`date_desc` 日期 降序<br>`status_asc` 状态 升序<br>`status_desc` 状态 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：name(应用版本号，示例：关键字)；branch(平台/分支，示例：all)；id(ID，示例：1)；build(包含构建，示例：all)；status(发布状态，枚举：wait 未开始 \| normal 已发布 \| fail 发布失败 \| terminate 停止维护)；date(计划发布日期，示例：2026-01-01)；marker(里程碑，枚举：1 是 \| 0 否) |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`releases`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("release/list", {
  "productID": 1,
  "browseType": "all",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 创建发布

- SDK 调用：`request("release/create", params)`
- HTTP：`POST /releases`
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
      "description": "所属产品",
      "format": "int32"
    },
    "system": {
      "type": "integer",
      "description": "所属应用",
      "format": "int32"
    },
    "name": {
      "type": "string",
      "description": "应用版本号"
    },
    "build": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "包含构建"
    },
    "status": {
      "type": "string",
      "description": "状态(wait 未开始 | normal 已发布 | fail 发布失败 | terminate 停止维护)"
    },
    "date": {
      "type": "string",
      "description": "计划发布日期"
    },
    "desc": {
      "type": "string",
      "description": "描述"
    }
  },
  "required": [
    "productID",
    "system",
    "name",
    "build",
    "date"
  ]
}
```

示例:

```json
{
  "productID": 1,
  "system": 1,
  "name": "v1",
  "build": [
    1
  ],
  "status": "wait",
  "date": "2026-02-10",
  "desc": "release 1.0"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("release/create", {
  "productID": 1,
  "system": 1,
  "name": "<string>",
  "build": [
    "<string>"
  ],
  "status": "<string>",
  "date": "<string>",
  "desc": "<string>"
});
```
## 修改发布

- SDK 调用：`request("release/update", params)`
- HTTP：`PUT /releases/{releaseID}`
- 动作类型：`update`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `releaseID` | 发布ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "system": {
      "type": "integer",
      "description": "所属应用",
      "format": "int32"
    },
    "name": {
      "type": "string",
      "description": "应用版本号"
    },
    "build": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "包含构建"
    },
    "status": {
      "type": "string",
      "description": "状态(wait 未开始 | normal 已发布 | fail 发布失败 | terminate 停止维护)"
    },
    "date": {
      "type": "string",
      "description": "计划发布日期"
    },
    "desc": {
      "type": "string",
      "description": "描述"
    }
  },
  "required": [
    "system",
    "name",
    "build",
    "date"
  ]
}
```

示例:

```json
{
  "system": 1,
  "name": "v1.0",
  "build": [
    1
  ],
  "status": "wait",
  "date": "2026-02-10",
  "desc": "release 1.0"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("release/update", {
  "releaseID": 1,
  "system": 1,
  "name": "<string>",
  "build": [
    "<string>"
  ],
  "status": "<string>",
  "date": "<string>",
  "desc": "<string>"
});
```
## 删除发布

- SDK 调用：`request("release/delete", params)`
- HTTP：`DELETE /releases/{releaseID}`
- 动作类型：`delete`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `releaseID` | 发布ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("release/delete", {
  "releaseID": 1
});
```
