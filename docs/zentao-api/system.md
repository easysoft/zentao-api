# 应用 (system)

应用管理，支持获取应用列表，支持获取产品下的应用、创建应用、修改应用

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取应用列表，支持获取产品下的应用 | `GET` | `/{scope}/{scopeID}/systems` |
| `create` | 创建应用 | `POST` | `/systems` |
| `update` | 修改应用 | `PUT` | `/systems/{systemID}` |

## 获取应用列表，支持获取产品下的应用

- SDK 调用：`request("system/list", params)`
- HTTP：`GET /{scope}/{scopeID}/systems`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `scope` | 应用范围 |
| `scopeID` | 范围ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("system/list", {
  "scope": "<string>",
  "scopeID": 1
});
```
## 创建应用

- SDK 调用：`request("system/create", params)`
- HTTP：`POST /systems`
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
    "integrated": {
      "type": "integer",
      "description": "是否集成应用(0 否| 1 是)",
      "format": "int32"
    },
    "children": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "集成应用需要包含其他应用，非集成应用传空数组[]"
    },
    "name": {
      "type": "string",
      "description": "应用名称"
    },
    "desc": {
      "type": "string",
      "description": "描述"
    }
  },
  "required": [
    "productID",
    "integrated",
    "children",
    "name"
  ]
}
```

示例:

```json
{
  "productID": 1,
  "integrated": 1,
  "children": [
    "<string>"
  ],
  "name": "<string>",
  "desc": "<string>"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("system/create", {
  "productID": 1,
  "integrated": 1,
  "children": [
    "<string>"
  ],
  "name": "<string>",
  "desc": "<string>"
});
```
## 修改应用

- SDK 调用：`request("system/update", params)`
- HTTP：`PUT /systems/{systemID}`
- 动作类型：`update`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `systemID` | 应用ID |

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
      "description": "应用名称"
    },
    "children": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "集成应用需要包含其他应用，非集成应用传空数组[]"
    },
    "desc": {
      "type": "string",
      "description": "描述"
    }
  },
  "required": [
    "name",
    "children"
  ]
}
```

示例:

```json
{
  "name": "<string>",
  "children": [
    "<string>"
  ],
  "desc": "<string>"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("system/update", {
  "systemID": 1,
  "name": "<string>",
  "children": [
    "<string>"
  ],
  "desc": "<string>"
});
```
