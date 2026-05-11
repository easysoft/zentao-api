# 测试用例 (testcase)

测试用例管理，支持获取测试用例列表，支持获取产品/项目/执行下的测试用例、创建测试用例、获取测试用例详情、修改测试用例、删除测试用例

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取测试用例列表，支持获取产品/项目/执行下的测试用例 | `GET` | `/{scope}/{scopeID}/testcases` |
| `create` | 创建测试用例 | `POST` | `/testcases` |
| `get` | 获取测试用例详情 | `GET` | `/testcases/{caseID}` |
| `update` | 修改测试用例 | `PUT` | `/testcases/{testcasID}` |
| `delete` | 删除测试用例 | `DELETE` | `/testcases/{testcasID}` |

## 获取测试用例列表，支持获取产品/项目/执行下的测试用例

- SDK 调用：`request("testcase/list", params)`
- HTTP：`GET /{scope}/{scopeID}/testcases`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `scope` | 测试用例范围 |
| `scopeID` | 范围ID |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `all` | 状态，默认是all<br>`all` 全部<br>`wait` 未关闭<br>`needconfirm` 需求变动 |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`title_asc` 标题 升序<br>`title_desc` 标题 降序<br>`status_asc` 状态 升序<br>`status_desc` 状态 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`testcases`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("testcase/list", {
  "scope": "<string>",
  "scopeID": 1,
  "browseType": "all",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1
});
```
## 创建测试用例

- SDK 调用：`request("testcase/create", params)`
- HTTP：`POST /testcases`
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
    "title": {
      "type": "string",
      "description": "用例标题"
    },
    "module": {
      "type": "integer",
      "description": "所属模块",
      "format": "int32"
    },
    "story": {
      "type": "integer",
      "description": "相关需求",
      "format": "int32"
    },
    "pri": {
      "type": "integer",
      "description": "优先级",
      "format": "int32"
    },
    "type": {
      "type": "string",
      "description": "用例类型(unit 单元测试 | interface 接口测试 | feature 功能测试 | install 安装部署 | config 配置相关 | performance 性能测试 | security 安全相关 | other 其他)"
    },
    "precondition": {
      "type": "string",
      "description": "前置条件"
    },
    "steps": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "用例步骤"
    },
    "expects": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "用例步骤期望"
    },
    "stepType": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "用例步骤类型(step 步骤 | group 父级步骤)"
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
  "module": 1,
  "story": 1,
  "pri": 1,
  "type": "<string>",
  "precondition": "<string>",
  "steps": [
    "<string>"
  ],
  "expects": [
    "<string>"
  ],
  "stepType": [
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

const result = await request("testcase/create", {
  "productID": 1,
  "title": "<string>",
  "module": 1,
  "story": 1,
  "pri": 1,
  "type": "<string>",
  "precondition": "<string>",
  "steps": [
    "<string>"
  ],
  "expects": [
    "<string>"
  ],
  "stepType": [
    "<string>"
  ],
  "project": 1,
  "execution": 1
});
```
## 获取测试用例详情

- SDK 调用：`request("testcase/get", params)`
- HTTP：`GET /testcases/{caseID}`
- 动作类型：`get`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `caseID` | 测试用例ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 结果字段：`testcase`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("testcase/get", {
  "caseID": 1
});
```
## 修改测试用例

- SDK 调用：`request("testcase/update", params)`
- HTTP：`PUT /testcases/{testcasID}`
- 动作类型：`update`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `testcasID` | 测试用例ID |

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
      "description": "用例标题"
    },
    "moudule": {
      "type": "integer",
      "description": "所属模块",
      "format": "int32"
    },
    "story": {
      "type": "integer",
      "description": "相关需求",
      "format": "int32"
    },
    "pri": {
      "type": "integer",
      "description": "优先级",
      "format": "int32"
    },
    "type": {
      "type": "string",
      "description": "用例类型(unit 单元测试 | interface 接口测试 | feature 功能测试 | install 安装部署 | config 配置相关 | performance 性能测试 | security 安全相关 | other 其他)"
    },
    "precondition": {
      "type": "string",
      "description": "前置条件"
    },
    "steps": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "用例步骤"
    },
    "expects": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "用例步骤期望"
    },
    "stepType": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "用例步骤类型(step 步骤 | group 父级步骤)"
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
  "moudule": 1,
  "story": 1,
  "pri": 1,
  "type": "<string>",
  "precondition": "<string>",
  "steps": [
    "<string>"
  ],
  "expects": [
    "<string>"
  ],
  "stepType": [
    "<string>"
  ]
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("testcase/update", {
  "testcasID": 1,
  "title": "<string>",
  "moudule": 1,
  "story": 1,
  "pri": 1,
  "type": "<string>",
  "precondition": "<string>",
  "steps": [
    "<string>"
  ],
  "expects": [
    "<string>"
  ],
  "stepType": [
    "<string>"
  ]
});
```
## 删除测试用例

- SDK 调用：`request("testcase/delete", params)`
- HTTP：`DELETE /testcases/{testcasID}`
- 动作类型：`delete`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `testcasID` | 测试用例ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("testcase/delete", {
  "testcasID": 1
});
```
