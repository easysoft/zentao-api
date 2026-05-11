# 版本 (build)

版本管理，支持获取版本列表，支持获取项目/执行下的版本、创建版本/构建、修改版本、删除版本

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取版本列表，支持获取项目/执行下的版本 | `GET` | `/{scope}/{scopeID}/builds` |
| `create` | 创建版本/构建 | `POST` | `/builds` |
| `update` | 修改版本 | `PUT` | `/builds/{buildID}` |
| `delete` | 删除版本 | `DELETE` | `/builds/{buildID}` |

## 获取版本列表，支持获取项目/执行下的版本

- SDK 调用：`request("build/list", params)`
- HTTP：`GET /{scope}/{scopeID}/builds`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `scope` | 版本范围 |
| `scopeID` | 范围ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`builds`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("build/list", {
  "scope": "<string>",
  "scopeID": 1
});
```
## 创建版本/构建

- SDK 调用：`request("build/create", params)`
- HTTP：`POST /builds`
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
    "executionID": {
      "type": "integer",
      "description": "所属执行/迭代",
      "format": "int32"
    },
    "product": {
      "type": "integer",
      "description": "所属产品",
      "format": "int32"
    },
    "name": {
      "type": "string",
      "description": "构建名称"
    },
    "system": {
      "type": "integer",
      "description": "所属应用",
      "format": "int32"
    },
    "builder": {
      "type": "string",
      "description": "构建者"
    },
    "date": {
      "type": "string",
      "description": "打包日期"
    },
    "scmPath": {
      "type": "string",
      "description": "源代码地址"
    },
    "filePath": {
      "type": "string",
      "description": "下载地址"
    },
    "desc": {
      "type": "string",
      "description": "描述"
    }
  },
  "required": [
    "executionID",
    "product",
    "name",
    "system",
    "builder",
    "date"
  ]
}
```

示例:

```json
{
  "executionID": 1,
  "product": 1,
  "name": "<string>",
  "system": 1,
  "builder": "<string>",
  "date": "<string>",
  "scmPath": "<string>",
  "filePath": "<string>",
  "desc": "<string>"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("build/create", {
  "executionID": 1,
  "product": 1,
  "name": "<string>",
  "system": 1,
  "builder": "<string>",
  "date": "<string>",
  "scmPath": "<string>",
  "filePath": "<string>",
  "desc": "<string>"
});
```
## 修改版本

- SDK 调用：`request("build/update", params)`
- HTTP：`PUT /builds/{buildID}`
- 动作类型：`update`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `buildID` | 版本ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "execution": {
      "type": "integer",
      "description": "所属执行/迭代",
      "format": "int32"
    },
    "product": {
      "type": "integer",
      "description": "所属产品",
      "format": "int32"
    },
    "name": {
      "type": "string",
      "description": "构建名称"
    },
    "system": {
      "type": "integer",
      "description": "所属应用",
      "format": "int32"
    },
    "builder": {
      "type": "string",
      "description": "构建者"
    },
    "date": {
      "type": "string",
      "description": "打包日期"
    },
    "scmPath": {
      "type": "string",
      "description": "源代码地址"
    },
    "filePath": {
      "type": "string",
      "description": "下载地址"
    },
    "desc": {
      "type": "string",
      "description": "描述"
    }
  },
  "required": [
    "execution",
    "product",
    "name",
    "system",
    "builder",
    "date"
  ]
}
```

示例:

```json
{
  "execution": 1,
  "product": 1,
  "name": "<string>",
  "system": 1,
  "builder": "<string>",
  "date": "<string>",
  "scmPath": "<string>",
  "filePath": "<string>",
  "desc": "<string>"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("build/update", {
  "buildID": 1,
  "execution": 1,
  "product": 1,
  "name": "<string>",
  "system": 1,
  "builder": "<string>",
  "date": "<string>",
  "scmPath": "<string>",
  "filePath": "<string>",
  "desc": "<string>"
});
```
## 删除版本

- SDK 调用：`request("build/delete", params)`
- HTTP：`DELETE /builds/{buildID}`
- 动作类型：`delete`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `buildID` | 版本ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("build/delete", {
  "buildID": 1
});
```
