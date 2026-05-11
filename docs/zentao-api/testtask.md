# 测试单 (testtask)

测试单管理，支持获取测试单列表，支持获取产品/项目/执行下的测试单、创建测试单、修改测试单、删除测试单

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取测试单列表，支持获取产品/项目/执行下的测试单 | `GET` | `/{scope}/{scopeID}/testtasks` |
| `create` | 创建测试单 | `POST` | `/testtasks` |
| `update` | 修改测试单 | `PUT` | `/testtasks/{testtaskID}` |
| `delete` | 删除测试单 | `DELETE` | `/testtasks/{testtaskID}` |

## 获取测试单列表，支持获取产品/项目/执行下的测试单

- SDK 调用：`request("testtask/list", params)`
- HTTP：`GET /{scope}/{scopeID}/testtasks`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `scope` | 测试单范围 |
| `scopeID` | 范围ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`testtasks`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("testtask/list", {
  "scope": "<string>",
  "scopeID": 1
});
```
## 创建测试单

- SDK 调用：`request("testtask/create", params)`
- HTTP：`POST /testtasks`
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
      "description": "所属产品ID",
      "format": "int32"
    },
    "name": {
      "type": "string",
      "description": "测试单名称"
    },
    "build": {
      "type": "integer",
      "description": "提测构建/版本",
      "format": "int32"
    },
    "execution": {
      "type": "integer",
      "description": "所属执行",
      "format": "int32"
    },
    "type": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "类型(integrate 集成测试 | system 系统测试 | acceptance 验收测试 | performance 性能测试 | safety 安全测试)"
    },
    "owner": {
      "type": "string",
      "description": "负责人"
    },
    "status": {
      "type": "string",
      "description": "状态(wait 未开始 | doing 进行中 | done 已关闭 | blocked 被阻塞)"
    },
    "begin": {
      "type": "string",
      "description": "开始日期"
    },
    "end": {
      "type": "string",
      "description": "结束日期"
    },
    "desc": {
      "type": "string",
      "description": "描述"
    }
  },
  "required": [
    "productID",
    "name",
    "build",
    "begin",
    "end"
  ]
}
```

示例:

```json
{
  "productID": 1,
  "name": "<string>",
  "build": 1,
  "execution": 1,
  "type": [
    "<string>"
  ],
  "owner": "<string>",
  "status": "<string>",
  "begin": "<string>",
  "end": "<string>",
  "desc": "<string>"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("testtask/create", {
  "productID": 1,
  "name": "<string>",
  "build": 1,
  "execution": 1,
  "type": [
    "<string>"
  ],
  "owner": "<string>",
  "status": "<string>",
  "begin": "<string>",
  "end": "<string>",
  "desc": "<string>"
});
```
## 修改测试单

- SDK 调用：`request("testtask/update", params)`
- HTTP：`PUT /testtasks/{testtaskID}`
- 动作类型：`update`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `testtaskID` | 测试单ID |

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
      "description": "测试单名称"
    },
    "build": {
      "type": "integer",
      "description": "提测构建/版本",
      "format": "int32"
    },
    "execution": {
      "type": "integer",
      "description": "所属执行",
      "format": "int32"
    },
    "type": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "类型(integrate 集成测试 | system 系统测试 | acceptance 验收测试 | performance 性能测试 | safety 安全测试)"
    },
    "owner": {
      "type": "string",
      "description": "负责人"
    },
    "status": {
      "type": "string",
      "description": "状态(wait 未开始 | doing 进行中 | done 已关闭 | blocked 被阻塞)"
    },
    "begin": {
      "type": "string",
      "description": "开始日期"
    },
    "end": {
      "type": "string",
      "description": "结束日期"
    },
    "desc": {
      "type": "string",
      "description": "描述"
    }
  },
  "required": [
    "name",
    "build",
    "begin",
    "end"
  ]
}
```

示例:

```json
{
  "name": "<string>",
  "build": 1,
  "execution": 1,
  "type": [
    "<string>"
  ],
  "owner": "<string>",
  "status": "<string>",
  "begin": "<string>",
  "end": "<string>",
  "desc": "<string>"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("testtask/update", {
  "testtaskID": 1,
  "name": "<string>",
  "build": 1,
  "execution": 1,
  "type": [
    "<string>"
  ],
  "owner": "<string>",
  "status": "<string>",
  "begin": "<string>",
  "end": "<string>",
  "desc": "<string>"
});
```
## 删除测试单

- SDK 调用：`request("testtask/delete", params)`
- HTTP：`DELETE /testtasks/{testtaskID}`
- 动作类型：`delete`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `testtaskID` | 测试单ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("testtask/delete", {
  "testtaskID": 1
});
```
