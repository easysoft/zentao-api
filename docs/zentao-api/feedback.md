# 反馈 (feedback)

反馈管理，支持获取反馈列表，支持获取产品下的反馈、创建反馈、反馈转Bug、反馈转工单、反馈转待办、反馈转需求、反馈转任务、获取反馈详情、修改反馈、删除反馈、激活反馈、关闭反馈

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取反馈列表，支持获取产品下的反馈 | `GET` | `/products/{productID}/feedbacks` |
| `create` | 创建反馈 | `POST` | `/feedbacks` |
| `createBug` | 反馈转Bug | `POST` | `/feedbacks/{feedbackID}/bugs` |
| `createTicket` | 反馈转工单 | `POST` | `/feedbacks/{feedbackID}/tickets` |
| `createTodo` | 反馈转待办 | `POST` | `/feedbacks/{feedbackID}/todos` |
| `createStory` | 反馈转需求 | `POST` | `/feedbacks/{feedbackID}/stories` |
| `createTask` | 反馈转任务 | `POST` | `/feedbacks/{feedbackID}/tasks` |
| `get` | 获取反馈详情 | `GET` | `/feedbacks/{feedbackID}` |
| `update` | 修改反馈 | `PUT` | `/feedbacks/{feedbackID}` |
| `delete` | 删除反馈 | `DELETE` | `/feedbacks/{feedbackID}` |
| `activate` | 激活反馈 | `PUT` | `/feedbacks/{feedbackID}/activate` |
| `close` | 关闭反馈 | `PUT` | `/feedbacks/{feedbackID}/close` |

## 获取反馈列表，支持获取产品下的反馈

- SDK 调用：`request("feedback/list", params)`
- HTTP：`GET /products/{productID}/feedbacks`
- 动作类型：`list`
- 最低禅道版本：`22.0` / `biz13.0` / `max8.0` / `ipd5.0`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `productID` | 所属产品ID |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `wait` | 状态，默认是wait<br>`all` 全部<br>`wait` 待处理<br>`doing` 处理中<br>`toclosed` 待关闭<br>`review` 待评审<br>`assigntome` 指派给我<br>`openedbyme` 由我反馈 |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`title_asc` 标题 升序<br>`title_desc` 标题 降序<br>`status_asc` 状态 升序<br>`status_desc` 状态 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activatedBy,activatedDate,assignedTo,closedBy,closedDate,closedReason,desc,feedbackBy,id,keywords,mailto,module,notifyEmail,openedBy,openedDate,pri,processedBy,processedDate,product,public,reviewedBy,solution,source,status,title,type |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`feedbacks`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("feedback/list", {
  "productID": 1,
  "browseType": "wait",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 创建反馈

- SDK 调用：`request("feedback/create", params)`
- HTTP：`POST /feedbacks`
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
    "product": {
      "type": "integer",
      "description": "所属产品",
      "format": "int32"
    },
    "title": {
      "type": "string",
      "description": "标题"
    },
    "module": {
      "type": "integer",
      "description": "所属模块",
      "format": "int32"
    },
    "type": {
      "type": "string",
      "description": "类型(story 需求 | task 任务 | bug Bug | todo 待办 | advice 建议 | issue 问题 | risk 风险 | opportunity 机会)"
    },
    "desc": {
      "type": "string",
      "description": "描述"
    },
    "feedbackBy": {
      "type": "string",
      "description": "反馈者"
    },
    "source": {
      "type": "string",
      "description": "来源"
    }
  },
  "required": [
    "product",
    "title"
  ]
}
```

示例:

```json
{
  "product": 1,
  "title": "电容压力监测灵敏度不够",
  "module": 0,
  "type": "story",
  "desc": "监测灵敏度不够",
  "feedbackBy": "客户对接人",
  "source": "XX技术有限公司"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("feedback/create", {
  "product": 1,
  "title": "<string>",
  "module": 1,
  "type": "<string>",
  "desc": "<string>",
  "feedbackBy": "<string>",
  "source": "<string>"
});
```
## 反馈转Bug

- SDK 调用：`request("feedback/createBug", params)`
- HTTP：`POST /feedbacks/{feedbackID}/bugs`
- 动作类型：`create`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `feedbackID` | 反馈ID |

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
      "description": "Bug标题"
    },
    "openedBuild": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "影响版本，主干是trunk，其他版本使用版本ID"
    },
    "severity": {
      "type": "integer",
      "description": "严重程度(1-4)",
      "format": "int32"
    },
    "pri": {
      "type": "integer",
      "description": "优先级",
      "format": "int32"
    },
    "type": {
      "type": "string",
      "description": "Bug类型(codeerror 代码错误 | config 配置相关 | install 安装部署 | security 安全相关 | performance 性能问题 | standard 标准规范 | automation 测试脚本 | designdefect 设计缺陷 | others 其他)"
    },
    "steps": {
      "type": "string",
      "description": "重现步骤"
    }
  },
  "required": [
    "productID",
    "title",
    "openedBuild"
  ]
}
```

示例:

```json
{
  "productID": 1,
  "title": "从反馈创建的Bug",
  "openedBuild": [
    "trunk"
  ],
  "severity": 3,
  "pri": 3,
  "type": "codeerror",
  "steps": "反馈转Bug"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("feedback/createBug", {
  "feedbackID": 1,
  "productID": 1,
  "title": "<string>",
  "openedBuild": [
    "<string>"
  ],
  "severity": 1,
  "pri": 1,
  "type": "<string>",
  "steps": "<string>"
});
```
## 反馈转工单

- SDK 调用：`request("feedback/createTicket", params)`
- HTTP：`POST /feedbacks/{feedbackID}/tickets`
- 动作类型：`create`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `feedbackID` | 反馈ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "product": {
      "type": "integer",
      "description": "所属产品",
      "format": "int32"
    },
    "module": {
      "type": "integer",
      "description": "所属模块",
      "format": "int32"
    },
    "title": {
      "type": "string",
      "description": "工单标题"
    },
    "type": {
      "type": "string",
      "description": "类型(code 程序报错 | data 数据错误 | stuck 流程卡断 | security 安全问题 | affair 事务)"
    },
    "desc": {
      "type": "string",
      "description": "工单描述"
    }
  },
  "required": [
    "product",
    "module",
    "title"
  ]
}
```

示例:

```json
{
  "product": 1,
  "module": 1,
  "title": "从反馈创建的工单",
  "type": "code",
  "desc": "反馈转工单"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("feedback/createTicket", {
  "feedbackID": 1,
  "product": 1,
  "module": 1,
  "title": "<string>",
  "type": "<string>",
  "desc": "<string>"
});
```
## 反馈转待办

- SDK 调用：`request("feedback/createTodo", params)`
- HTTP：`POST /feedbacks/{feedbackID}/todos`
- 动作类型：`create`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `feedbackID` | 反馈ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "date": {
      "type": "string",
      "description": "日期"
    },
    "name": {
      "type": "string",
      "description": "待办名称"
    }
  },
  "required": [
    "date",
    "name"
  ]
}
```

示例:

```json
{
  "date": "2026-08-19",
  "name": "从反馈创建的待办"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("feedback/createTodo", {
  "feedbackID": 1,
  "date": "<string>",
  "name": "<string>"
});
```
## 反馈转需求

- SDK 调用：`request("feedback/createStory", params)`
- HTTP：`POST /feedbacks/{feedbackID}/stories`
- 动作类型：`create`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `feedbackID` | 反馈ID |

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
      "description": "需求标题"
    },
    "spec": {
      "type": "string",
      "description": "需求描述"
    },
    "pri": {
      "type": "integer",
      "description": "优先级",
      "format": "int32"
    },
    "category": {
      "type": "string",
      "description": "类别"
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
  "title": "从反馈创建的需求",
  "spec": "反馈转需求",
  "pri": 3,
  "category": "feature"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("feedback/createStory", {
  "feedbackID": 1,
  "productID": 1,
  "title": "<string>",
  "spec": "<string>",
  "pri": 1,
  "category": "<string>"
});
```
## 反馈转任务

- SDK 调用：`request("feedback/createTask", params)`
- HTTP：`POST /feedbacks/{feedbackID}/tasks`
- 动作类型：`create`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `feedbackID` | 反馈ID |

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
      "description": "所属执行",
      "format": "int32"
    },
    "name": {
      "type": "string",
      "description": "任务名称"
    },
    "type": {
      "type": "string",
      "description": "任务类型"
    },
    "assignedTo": {
      "type": "string",
      "description": "指派给"
    },
    "estStarted": {
      "type": "string",
      "description": "预计开始"
    },
    "deadline": {
      "type": "string",
      "description": "截止日期"
    },
    "desc": {
      "type": "string",
      "description": "任务描述"
    }
  },
  "required": [
    "executionID",
    "name"
  ]
}
```

示例:

```json
{
  "executionID": 3,
  "name": "从反馈创建的任务",
  "type": "devel",
  "assignedTo": "admin",
  "estStarted": "2026-01-01",
  "deadline": "2026-01-10",
  "desc": "反馈转任务"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("feedback/createTask", {
  "feedbackID": 1,
  "executionID": 1,
  "name": "<string>",
  "type": "<string>",
  "assignedTo": "<string>",
  "estStarted": "<string>",
  "deadline": "<string>",
  "desc": "<string>"
});
```
## 获取反馈详情

- SDK 调用：`request("feedback/get", params)`
- HTTP：`GET /feedbacks/{feedbackID}`
- 动作类型：`get`
- 最低禅道版本：`22.0` / `biz13.0` / `max8.0` / `ipd5.0`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `feedbackID` | 反馈ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 结果字段：`feedback`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("feedback/get", {
  "feedbackID": 1
});
```
## 修改反馈

- SDK 调用：`request("feedback/update", params)`
- HTTP：`PUT /feedbacks/{feedbackID}`
- 动作类型：`update`
- 最低禅道版本：`22.0` / `biz13.0` / `max8.0` / `ipd5.0`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `feedbackID` | 反馈ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "product": {
      "type": "integer",
      "description": "所属产品",
      "format": "int32"
    },
    "module": {
      "type": "integer",
      "description": "所属模块",
      "format": "int32"
    },
    "title": {
      "type": "string",
      "description": "标题"
    },
    "type": {
      "type": "string",
      "description": "类型(story 需求 | task 任务 | bug Bug | todo 待办 | advice 建议 | issue 问题 | risk 风险 | opportunity 机会)"
    },
    "desc": {
      "type": "string",
      "description": "描述"
    },
    "feedbackBy": {
      "type": "string",
      "description": "反馈者"
    },
    "source": {
      "type": "string",
      "description": "来源"
    }
  },
  "required": [
    "product",
    "title"
  ]
}
```

示例:

```json
{
  "product": 1,
  "module": 0,
  "title": "光敏元件灵敏度不够",
  "type": "story",
  "desc": "监测灵敏度不够",
  "feedbackBy": "客户对接人",
  "source": "XX技术有限公司"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("feedback/update", {
  "feedbackID": 1,
  "product": 1,
  "module": 1,
  "title": "<string>",
  "type": "<string>",
  "desc": "<string>",
  "feedbackBy": "<string>",
  "source": "<string>"
});
```
## 删除反馈

- SDK 调用：`request("feedback/delete", params)`
- HTTP：`DELETE /feedbacks/{feedbackID}`
- 动作类型：`delete`
- 最低禅道版本：`22.0` / `biz13.0` / `max8.0` / `ipd5.0`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `feedbackID` | 反馈ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("feedback/delete", {
  "feedbackID": 1
});
```
## 激活反馈

- SDK 调用：`request("feedback/activate", params)`
- HTTP：`PUT /feedbacks/{feedbackID}/activate`
- 动作类型：`action`
- 最低禅道版本：`22.0` / `biz13.0` / `max8.0` / `ipd5.0`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `feedbackID` | 反馈ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "assignedTo": {
      "type": "string",
      "description": "指派给"
    },
    "comment": {
      "type": "string",
      "description": "备注"
    }
  }
}
```

示例:

```json
{
  "assignedTo": "admin"
}
```

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("feedback/activate", {
  "feedbackID": 1,
  "assignedTo": "<string>",
  "comment": "<string>"
});
```
## 关闭反馈

- SDK 调用：`request("feedback/close", params)`
- HTTP：`PUT /feedbacks/{feedbackID}/close`
- 动作类型：`action`
- 最低禅道版本：`22.0` / `biz13.0` / `max8.0` / `ipd5.0`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `feedbackID` | 反馈ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "closedReason": {
      "type": "string",
      "description": "关闭原因(commented 已处理 | repeat 重复 | refuse 不予采纳)"
    },
    "comment": {
      "type": "string",
      "description": "备注"
    },
    "confirmClose": {
      "type": "string",
      "description": "存在未关闭转化对象时是否强制关闭"
    }
  },
  "required": [
    "closedReason"
  ]
}
```

示例:

```json
{
  "closedReason": "done",
  "confirmClose": "yes"
}
```

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("feedback/close", {
  "feedbackID": 1,
  "closedReason": "<string>",
  "comment": "<string>",
  "confirmClose": "<string>"
});
```
