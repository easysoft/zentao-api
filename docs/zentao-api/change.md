# 项目变更 (change)

项目变更管理，支持获取项目变更列表，支持获取项目下的项目变更、创建项目变更、获取变更详情、编辑项目变更、删除项目变更

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取项目变更列表，支持获取项目下的项目变更 | `GET` | `/projects/{projectID}/changes` |
| `create` | 创建项目变更 | `POST` | `/projects/{projectID}/changes` |
| `get` | 获取变更详情 | `GET` | `/changes/{changeID}` |
| `update` | 编辑项目变更 | `PUT` | `/changes/{changeID}` |
| `delete` | 删除项目变更 | `DELETE` | `/changes/{changeID}` |

## 获取项目变更列表，支持获取项目下的项目变更

- SDK 调用：`request("change/list", params)`
- HTTP：`GET /projects/{projectID}/changes`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `projectID` | 所属项目ID |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `all` | 变更状态筛选，默认 all<br>`all` 全部<br>`wait` 待提交<br>`reviewing` 评审中<br>`pass` 已通过<br>`reject` 已拒绝<br>`reverting` 撤销中 |
| `orderBy` | string | 否 | `id_desc` | 排序字段，默认 id_desc。 |
| `recPerPage` | number | 否 | `20` | 每页数量，默认 20。 |
| `pageID` | number | 否 | `1` | 页码，默认 1。 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 对象类型：`change`
- 结果字段：`projectchanges`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("change/list", {
  "projectID": 1,
  "browseType": "all",
  "orderBy": "id_desc",
  "recPerPage": "20",
  "pageID": "1"
});
```
## 创建项目变更

- SDK 调用：`request("change/create", params)`
- HTTP：`POST /projects/{projectID}/changes`
- 动作类型：`create`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `projectID` | 项目ID |

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
      "description": "变更名称。"
    },
    "urgency": {
      "type": "string",
      "description": "紧急程度。"
    },
    "type": {
      "type": "string",
      "description": "变更类型。"
    },
    "owner": {
      "type": "string",
      "description": "变更负责人。"
    },
    "reason": {
      "type": "string",
      "description": "变更原因。"
    },
    "desc": {
      "type": "string",
      "description": "变更描述。"
    }
  },
  "required": [
    "name",
    "urgency",
    "type",
    "owner",
    "reason",
    "desc"
  ]
}
```

示例:

```json
{
  "name": "API 变更",
  "urgency": "urgent",
  "type": "dev",
  "owner": "admin",
  "reason": "需求变化",
  "desc": "<p>API 创建的变更。</p>"
}
```

### 返回值

- 返回形态：`object`
- 对象类型：无统一对象类型

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("change/create", {
  "projectID": 1,
  "name": "<string>",
  "urgency": "<string>",
  "type": "<string>",
  "owner": "<string>",
  "reason": "<string>",
  "desc": "<string>"
});
```
## 获取变更详情

- SDK 调用：`request("change/get", params)`
- HTTP：`GET /changes/{changeID}`
- 动作类型：`get`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `changeID` | changeID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 对象类型：`change`
- 结果字段：`projectchange`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("change/get", {
  "changeID": 1
});
```
## 编辑项目变更

- SDK 调用：`request("change/update", params)`
- HTTP：`PUT /changes/{changeID}`
- 动作类型：`update`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `changeID` | changeID |

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
      "description": "变更名称。"
    },
    "urgency": {
      "type": "string",
      "description": "紧急程度。"
    },
    "type": {
      "type": "string",
      "description": "变更类型。"
    },
    "owner": {
      "type": "string",
      "description": "变更负责人。"
    },
    "reason": {
      "type": "string",
      "description": "变更原因。"
    },
    "desc": {
      "type": "string",
      "description": "变更描述。"
    }
  },
  "required": [
    "name",
    "urgency",
    "type",
    "owner",
    "reason",
    "desc"
  ]
}
```

示例:

```json
{
  "name": "API 变更（已编辑）",
  "urgency": "normal",
  "type": "dev",
  "owner": "admin",
  "reason": "需求调整",
  "desc": "<p>更新后的变更描述。</p>"
}
```

### 返回值

- 返回形态：`object`
- 对象类型：无统一对象类型

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("change/update", {
  "changeID": 1,
  "name": "<string>",
  "urgency": "<string>",
  "type": "<string>",
  "owner": "<string>",
  "reason": "<string>",
  "desc": "<string>"
});
```
## 删除项目变更

- SDK 调用：`request("change/delete", params)`
- HTTP：`DELETE /changes/{changeID}`
- 动作类型：`delete`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `changeID` | changeID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`
- 对象类型：无统一对象类型

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("change/delete", {
  "changeID": 1
});
```
