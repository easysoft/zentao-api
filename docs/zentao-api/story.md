# 需求 (story)

需求管理，支持获取需求列表，支持获取项目/产品/执行下的需求、产品的需求模块树、创建需求、获取需求详情、修改需求、修改需求模块、删除需求、删除需求模块、激活需求、变更需求、关闭需求

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取需求列表，支持获取项目/产品/执行下的需求 | `GET` | `/{scope}/{scopeID}/stories` |
| `modules` | 产品的需求模块树 | `GET` | `/products/{productID}/story/modules` |
| `create` | 创建需求 | `POST` | `/stories` |
| `get` | 获取需求详情 | `GET` | `/stories/{storyID}` |
| `update` | 修改需求 | `PUT` | `/stories/{storyID}` |
| `updateModule` | 修改需求模块 | `PUT` | `/story/modules/{moduleID}` |
| `delete` | 删除需求 | `DELETE` | `/stories/{storyID}` |
| `deleteModule` | 删除需求模块 | `DELETE` | `/story/modules/{moduleID}` |
| `activate` | 激活需求 | `PUT` | `/stories/{storyID}/activate` |
| `change` | 变更需求 | `PUT` | `/stories/{storyID}/change` |
| `close` | 关闭需求 | `PUT` | `/stories/{storyID}/close` |
| `getGrades` | 获取需求层级选项 | `GET` | `/storygrades` |

## 获取需求列表，支持获取项目/产品/执行下的需求

- SDK 调用：`request("story/list", params)`
- HTTP：`GET /{scope}/{scopeID}/stories`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `scope` | 需求所属范围 |
| `scopeID` | 所属范围ID |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 |  | 状态<br>`allstory` 全部<br>`assignedtome` 指派给我<br>`openedbyme` 我创建<br>`reviewbyme` 待我评审<br>`draftstory` 草稿 |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`title_asc` 标题 升序<br>`title_desc` 标题 降序<br>`status_asc` 状态 升序<br>`status_desc` 状态 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(需求名称，示例：关键字)；id(编号，示例：1)；keywords(关键词，示例：关键字)；status(当前状态，枚举：draft 草稿 \| reviewing 评审中 \| active 激活 \| changing 变更中 \| closed 已关闭)；pri(优先级，枚举：1 \| 2 \| 3 \| 4)；module(所属模块，示例：all)；stage(所处阶段，枚举：wait 未开始 \| planned 已计划 \| projected 研发立项 \| designing 设计中 \| designed 设计完毕 \| developing 研发中 \| developed 研发完毕 \| testing 测试中 \| tested 测试完毕 \| verified 已验收 \| rejected 验收失败 \| delivering 交付中 \| delivered 已交付 \| released 已发布 \| closed 已关闭)；product(所属产品，示例：all)；branch(branch，示例：all)；grade(需求层级，示例：all)；plan(所属计划，示例：all)；estimate(预计小时，示例：关键字)；source(来源，枚举：customer 客户 \| user 用户 \| po 产品经理 \| market 市场 \| service 客服 \| operation 运营 \| support 技术支持 \| competitor 竞争对手 \| partner 合作伙伴 \| dev 开发人员 \| tester 测试人员 \| bug Bug \| forum 论坛 \| other 其他)；sourceNote(来源备注，示例：关键字)；fromBug(来源Bug，示例：关键字)；category(类别，枚举：feature 功能 \| interface 接口 \| performance 性能 \| safe 安全 \| experience 体验 \| improve 改进 \| other 其他)；openedBy(由谁创建，用户，示例：admin)；reviewedBy(已评审人，用户，示例：admin)；result(评审结果，枚举：pass 确认通过 \| revert 撤销变更 \| clarify 有待明确 \| reject 拒绝)；assignedTo(指派给，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedBy(最后修改，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；closedReason(关闭原因，枚举：done 已完成 \| subdivided 已拆分 \| duplicate 重复 \| postponed 延期 \| willnotdo 不做 \| cancel 已取消 \| bydesign 设计如此)；version(版本号，示例：关键字)；openedDate(创建日期，示例：2026-01-01)；reviewedDate(评审时间，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(最后修改日期，示例：2026-01-01)；activatedDate(激活日期，示例：2026-01-01) |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`stories`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("story/list", {
  "scope": "<string>",
  "scopeID": 1,
  "browseType": "allstory",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 产品的需求模块树

- SDK 调用：`request("story/modules", params)`
- HTTP：`GET /products/{productID}/story/modules`
- 动作类型：`list`

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

const result = await request("story/modules", {
  "productID": 1
});
```
## 创建需求

- SDK 调用：`request("story/create", params)`
- HTTP：`POST /stories`
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
      "type": "string"
    },
    "pri": {
      "type": "integer",
      "description": "优先级，默认是3",
      "format": "int32"
    },
    "module": {
      "type": "integer",
      "description": "所属模块",
      "format": "int32"
    },
    "parent": {
      "type": "integer",
      "description": "父需求",
      "format": "int32"
    },
    "estimate": {
      "type": "number",
      "description": "预计工时",
      "format": "float"
    },
    "spec": {
      "type": "string",
      "description": "需求描述"
    },
    "category": {
      "type": "integer",
      "description": "类别(feature 功能 | interface 接口 | performance 性能 | safe 安全 | experience 体验 | improve 改进 | other 其他)",
      "format": "int32"
    },
    "source": {
      "type": "string",
      "description": "来源(customer 客户 | user 用户 | po 产品经理 | market 市场 | service 客服 | operation 运营 | support 技术支持 | competitor 竞争对手 | partner 合作伙伴 | dev 开发人员 | tester 测试人员 | bug Bug | forum 论坛 | other 其他)"
    },
    "verify": {
      "type": "string",
      "description": "验收标准"
    },
    "assignedTo": {
      "type": "string",
      "description": "指派给"
    },
    "reviewer": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "评审人，如果设置必须评审，必须填写"
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
    },
    "grade": {
      "type": "integer",
      "description": "需求层级，可用的需求层级可以通过 story-getGrades 操作获取"
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
  "title": "智能头枕的压敏单元设计",
  "pri": 3,
  "module": 0,
  "parent": 0,
  "estimate": 1,
  "category": "feature",
  "source": "customer",
  "assignedTo": "admin",
  "reviewer": [
    "productManager"
  ],
  "project": 2,
  "execution": 0
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("story/create", {
  "productID": 1,
  "title": "<string>",
  "pri": 1,
  "module": 1,
  "parent": 1,
  "estimate": 1,
  "spec": "<string>",
  "category": 1,
  "source": "<string>",
  "verify": "<string>",
  "assignedTo": "<string>",
  "reviewer": [
    "<string>"
  ],
  "project": 1,
  "execution": 1,
  "grade": 1
});
```
## 获取需求详情

- SDK 调用：`request("story/get", params)`
- HTTP：`GET /stories/{storyID}`
- 动作类型：`get`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `storyID` | 需求ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 结果字段：`story`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("story/get", {
  "storyID": 1
});
```
## 修改需求

- SDK 调用：`request("story/update", params)`
- HTTP：`PUT /stories/{storyID}`
- 动作类型：`update`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `storyID` | 需求ID |

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
      "type": "string"
    },
    "pri": {
      "type": "integer",
      "description": "优先级，默认是3",
      "format": "int32"
    },
    "module": {
      "type": "integer",
      "description": "所属模块",
      "format": "int32"
    },
    "parent": {
      "type": "integer",
      "description": "父需求",
      "format": "int32"
    },
    "estimate": {
      "type": "number",
      "description": "预计工时",
      "format": "float"
    },
    "category": {
      "type": "string",
      "description": "类别"
    },
    "source": {
      "type": "string",
      "description": "来源(customer 客户 | user 用户 | po 产品经理 | market 市场 | service 客服 | operation 运营 | support 技术支持 | competitor 竞争对手 | partner 合作伙伴 | dev 开发人员 | tester 测试人员 | bug Bug | forum 论坛 | other 其他)"
    },
    "assignedTo": {
      "type": "string",
      "description": "指派给"
    },
    "plan": {
      "type": "integer",
      "description": "所属计划",
      "format": "int32"
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
  "title": "智能照明的光敏单元设计",
  "pri": 3,
  "module": 0,
  "parent": 0,
  "estimate": 1,
  "category": "feature",
  "source": "customer",
  "assignedTo": "admin"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("story/update", {
  "storyID": 1,
  "title": "<string>",
  "pri": 1,
  "module": 1,
  "parent": 1,
  "estimate": 1,
  "category": "<string>",
  "source": "<string>",
  "assignedTo": "<string>",
  "plan": 1
});
```
## 修改需求模块

- SDK 调用：`request("story/updateModule", params)`
- HTTP：`PUT /story/modules/{moduleID}`
- 动作类型：`update`

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
  "name": "需求新模块",
  "parent": "0"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("story/updateModule", {
  "moduleID": 1,
  "name": "<string>",
  "parent": 1
});
```
## 删除需求

- SDK 调用：`request("story/delete", params)`
- HTTP：`DELETE /stories/{storyID}`
- 动作类型：`delete`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `storyID` | 需求ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("story/delete", {
  "storyID": 1
});
```
## 删除需求模块

- SDK 调用：`request("story/deleteModule", params)`
- HTTP：`DELETE /story/modules/{moduleID}`
- 动作类型：`delete`

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

const result = await request("story/deleteModule", {
  "moduleID": 1
});
```
## 激活需求

- SDK 调用：`request("story/activate", params)`
- HTTP：`PUT /stories/{storyID}/activate`
- 动作类型：`action`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `storyID` | 需求ID |

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

const result = await request("story/activate", {
  "storyID": 1,
  "assignedTo": "<string>",
  "comment": "<string>"
});
```
## 变更需求

- SDK 调用：`request("story/change", params)`
- HTTP：`PUT /stories/{storyID}/change`
- 动作类型：`action`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `storyID` | 需求ID |

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
      "description": "需求名称"
    },
    "reviewer": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "评审人员"
    },
    "spec": {
      "type": "string",
      "description": "需求描述"
    },
    "verify": {
      "type": "string",
      "description": "验收标准"
    }
  },
  "required": [
    "reviewer"
  ]
}
```

示例:

```json
{
  "title": "智能照明的定时",
  "reviewer": [
    "admin"
  ],
  "spec": "描述",
  "verify": "验收标准"
}
```

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("story/change", {
  "storyID": 1,
  "title": "<string>",
  "reviewer": [
    "<string>"
  ],
  "spec": "<string>",
  "verify": "<string>"
});
```
## 关闭需求

- SDK 调用：`request("story/close", params)`
- HTTP：`PUT /stories/{storyID}/close`
- 动作类型：`action`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `storyID` | 需求ID |

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
      "description": "关闭原因(done 已完成 | subdivided 已拆分 | duplicate 重复 | postponed 延期 | willnotdo 不做 | cancel 已取消 | bydesign 设计如此)"
    },
    "comment": {
      "type": "string",
      "description": "备注"
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
  "closedReason": "done"
}
```

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("story/close", {
  "storyID": 1,
  "closedReason": "<string>",
  "comment": "<string>"
});
```
## 获取需求层级选项

- SDK 调用：`request("story/getGrades", params)`
- HTTP：`GET /storygrades`
- 动作类型：`list`

### 路径参数

无路径参数。

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`grades`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("story/getGrades");
```
