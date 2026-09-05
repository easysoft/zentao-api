# 测试用例 (testcase)

测试用例管理，支持获取测试用例列表，支持获取产品/项目/执行下的测试用例、产品的用例模块树、创建测试用例、获取测试用例详情、修改测试用例、修改用例模块、删除测试用例、删除用例模块

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取测试用例列表，支持获取产品/项目/执行下的测试用例 | `GET` | `/{scope}/{scopeID}/testcases` |
| `modules` | 产品的用例模块树 | `GET` | `/products/{productID}/testcase/modules` |
| `create` | 创建测试用例 | `POST` | `/testcases` |
| `get` | 获取测试用例详情 | `GET` | `/testcases/{caseID}` |
| `update` | 修改测试用例 | `PUT` | `/testcases/{caseID}` |
| `updateModule` | 修改用例模块 | `PUT` | `/testcase/modules/{moduleID}` |
| `delete` | 删除测试用例 | `DELETE` | `/testcases/{caseID}` |
| `deleteModule` | 删除用例模块 | `DELETE` | `/testcase/modules/{moduleID}` |

## 获取测试用例列表，支持获取产品/项目/执行下的测试用例

- SDK 调用：`request("testcase/list", params)`
- HTTP：`GET /{scope}/{scopeID}/testcases`
- 动作类型：`list`
- 最低禅道版本：`22.0` / `biz13.0` / `max8.0` / `ipd5.0`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `scope` | 测试用例所属范围 |
| `scopeID` | 所属范围ID |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `all` | 状态，默认是all<br>`all` 全部<br>`wait` 未关闭<br>`needconfirm` 需求变动 |
| `orderBy` | string | 否 |  | 排序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(用例名称，示例：关键字)；story(关联需求，示例：all)；id(用例编号，示例：1)；keywords(关键词，示例：关键字)；lastEditedBy(修改者，用户，示例：admin)；type(用例类型，枚举：unit 单元测试 \| interface 接口测试 \| feature 功能测试 \| install 安装部署 \| config 配置相关 \| performance 性能测试 \| security 安全相关 \| other 其他)；auto(自动化，枚举：auto 是 \| no 否)；openedBy(由谁创建，用户，示例：admin)；status(用例状态，枚举：wait 待评审 \| normal 正常 \| blocked 被阻塞 \| investigate 研究中)；product(所属产品，示例：all)；branch(branch，示例：all)；stage(适用环节，枚举：unittest 单元测试环节 \| feature 功能测试环节 \| intergrate 集成测试环节 \| system 系统测试环节 \| smoke 冒烟测试环节 \| bvt 版本验证环节)；module(所属模块，模块，示例：0)；pri(优先级，枚举：3 \| 1 \| 2 \| 4)；lib(所属库，示例：all)；lastRunner(执行人，用户，示例：admin)；lastRunResult(结果，枚举：pass 通过 \| fail 失败 \| blocked 阻塞 \| null 未执行)；lastRunDate(执行时间，示例：2026-01-01)；openedDate(创建日期，示例：2026-01-01)；lastEditedDate(修改日期，示例：2026-01-01)；scene(所属场景，示例：all) |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

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
  "orderBy": "<string>",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 产品的用例模块树

- SDK 调用：`request("testcase/modules", params)`
- HTTP：`GET /products/{productID}/testcase/modules`
- 动作类型：`list`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `productID` | 产品ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`tree`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("testcase/modules", {
  "productID": 1
});
```
## 创建测试用例

- SDK 调用：`request("testcase/create", params)`
- HTTP：`POST /testcases`
- 动作类型：`create`
- 最低禅道版本：`22.0` / `biz13.0` / `max8.0` / `ipd5.0`

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
      "description": "用例步骤, 如果是嵌套用例，可以通过key表示嵌套关系 {\"1\": \"分组1\", \"1.1\": \"子分组1.1\", \"1.1.1\": \"步骤1.1.1\"}"
    },
    "expects": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "用例步骤期望, 如果是嵌套用例步骤，可以通过key表示嵌套关系 {\"1\": \"\", \"1.1\": \"\", \"1.1.1\": \"步骤1.1.1的期望\"}"
    },
    "stepType": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "用例步骤类型(step 步骤 | group 父级步骤), 如果是嵌套用例步骤，可以通过key表示嵌套关系 {\"1\": \"group\", \"1.1\": \"group\", \"1.1.1\": \"step\"}"
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
  "title": "测试压敏模块显示是否正常",
  "module": 0,
  "story": 0,
  "pri": 3,
  "type": "feature",
  "steps": [
    "步骤1",
    "步骤2"
  ],
  "expects": [
    "期望1",
    "期望2"
  ],
  "stepType": [
    "step",
    "step"
  ],
  "project": 2,
  "execution": 3
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
- 最低禅道版本：`22.0` / `biz13.0` / `max8.0` / `ipd5.0`

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
- HTTP：`PUT /testcases/{caseID}`
- 动作类型：`update`
- 最低禅道版本：`22.0` / `biz13.0` / `max8.0` / `ipd5.0`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `caseID` | 测试用例ID |

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
      "description": "用例步骤, 如果是嵌套用例，可以通过key表示嵌套关系 {\"1\": \"分组1\", \"1.1\": \"子分组1.1\", \"1.1.1\": \"步骤1.1.1\"}"
    },
    "expects": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "用例步骤期望, 如果是嵌套用例步骤，可以通过key表示嵌套关系 {\"1\": \"\", \"1.1\": \"\", \"1.1.1\": \"步骤1.1.1的期望\"}"
    },
    "stepType": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "用例步骤类型(step 步骤 | group 父级步骤), 如果是嵌套用例步骤，可以通过key表示嵌套关系 {\"1\": \"group\", \"1.1\": \"group\", \"1.1.1\": \"step\"}"
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
  "title": "测试光敏模块显示是否正常",
  "module": 0,
  "story": 0,
  "pri": 3,
  "type": "feature",
  "steps": [
    "步骤1",
    "步骤2"
  ],
  "expects": [
    "期望1",
    "期望2"
  ],
  "stepType": [
    "step",
    "step"
  ]
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("testcase/update", {
  "caseID": 1,
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
  ]
});
```
## 修改用例模块

- SDK 调用：`request("testcase/updateModule", params)`
- HTTP：`PUT /testcase/modules/{moduleID}`
- 动作类型：`update`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `moduleID` | 模块ID |

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
      "description": "模块名称"
    },
    "parent": {
      "type": "integer",
      "description": "父模块",
      "format": "int32"
    }
  }
}
```

示例:

```json
{
  "name": "用例新模块",
  "parent": "0"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("testcase/updateModule", {
  "moduleID": 1,
  "name": "<string>",
  "parent": 1
});
```
## 删除测试用例

- SDK 调用：`request("testcase/delete", params)`
- HTTP：`DELETE /testcases/{caseID}`
- 动作类型：`delete`
- 最低禅道版本：`22.0` / `biz13.0` / `max8.0` / `ipd5.0`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `caseID` | 测试用例ID |

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
  "caseID": 1
});
```
## 删除用例模块

- SDK 调用：`request("testcase/deleteModule", params)`
- HTTP：`DELETE /testcase/modules/{moduleID}`
- 动作类型：`delete`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `moduleID` | 模块ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("testcase/deleteModule", {
  "moduleID": 1
});
```
