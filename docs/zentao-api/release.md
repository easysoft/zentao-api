# 发布 (release)

发布管理，支持获取发布列表，支持获取产品下的发布、创建发布、修改发布、删除发布

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取发布列表，支持获取产品下的发布 | `GET` | `/{scope}/{scopeID}/releases` |
| `create` | 创建发布 | `POST` | `/releases` |
| `update` | 修改发布 | `PUT` | `/releases/{releasID}` |
| `delete` | 删除发布 | `DELETE` | `/releases/{releasID}` |

## 获取发布列表，支持获取产品下的发布

- SDK 调用：`request("release/list", params)`
- HTTP：`GET /{scope}/{scopeID}/releases`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `scope` | 发布范围 |
| `scopeID` | 范围ID |

### 查询参数

无查询参数。

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
  "scope": "<string>",
  "scopeID": 1
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
  "name": "<string>",
  "build": [
    "<string>"
  ],
  "status": "<string>",
  "date": "<string>",
  "desc": "<string>"
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
- HTTP：`PUT /releases/{releasID}`
- 动作类型：`update`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `releasID` | 发布ID |

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
  "name": "<string>",
  "build": [
    "<string>"
  ],
  "status": "<string>",
  "date": "<string>",
  "desc": "<string>"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("release/update", {
  "releasID": 1,
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
- HTTP：`DELETE /releases/{releasID}`
- 动作类型：`delete`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `releasID` | 发布ID |

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
  "releasID": 1
});
```
