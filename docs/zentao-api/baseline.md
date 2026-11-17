# 基线 (baseline)

基线管理，支持获取基线列表，支持获取项目下的基线、创建项目基线、获取基线详情、编辑项目基线、删除项目基线

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取基线列表，支持获取项目下的基线 | `GET` | `/projects/{projectID}/baselines` |
| `create` | 创建项目基线 | `POST` | `/projects/{projectID}/baselines` |
| `get` | 获取基线详情 | `GET` | `/baselines/{baselineID}` |
| `update` | 编辑项目基线 | `PUT` | `/baselines/{baselineID}` |
| `delete` | 删除项目基线 | `DELETE` | `/baselines/{baselineID}` |

## 获取基线列表，支持获取项目下的基线

- SDK 调用：`request("baseline/list", params)`
- HTTP：`GET /projects/{projectID}/baselines`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `projectID` | 所属项目ID |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `all` | 基线状态筛选，默认 all<br>`all` 全部<br>`wait` 待提交<br>`reviewing` 评审中<br>`pass` 已通过<br>`reject` 已拒绝 |
| `orderBy` | string | 否 | `id_desc` | 排序字段，默认 id_desc。 |
| `recPerPage` | number | 否 | `20` | 每页数量，默认 20。 |
| `pageID` | number | 否 | `1` | 页码，默认 1。 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 对象类型：`baseline`
- 结果字段：`baselines`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("baseline/list", {
  "projectID": 1,
  "browseType": "all",
  "orderBy": "id_desc",
  "recPerPage": "20",
  "pageID": "1"
});
```
## 创建项目基线

- SDK 调用：`request("baseline/create", params)`
- HTTP：`POST /projects/{projectID}/baselines`
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
    "title": {
      "type": "string",
      "description": "基线名称。"
    },
    "version": {
      "type": "string",
      "description": "基线版本。"
    },
    "category": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "纳入基线的交付物 ID 列表。"
    },
    "type": {
      "type": "string",
      "description": "基线类型。"
    },
    "status": {
      "type": "string",
      "description": "基线状态。"
    }
  },
  "required": [
    "title",
    "version",
    "category"
  ]
}
```

示例:

```json
{
  "title": "API 基线",
  "version": "V1.0",
  "category": [
    1
  ],
  "type": "taged",
  "status": "wait"
}
```

### 返回值

- 返回形态：`object`
- 对象类型：无统一对象类型

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("baseline/create", {
  "projectID": 1,
  "title": "<string>",
  "version": "<string>",
  "category": [
    "<string>"
  ],
  "type": "<string>",
  "status": "<string>"
});
```
## 获取基线详情

- SDK 调用：`request("baseline/get", params)`
- HTTP：`GET /baselines/{baselineID}`
- 动作类型：`get`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `baselineID` | baselineID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 对象类型：`baseline`
- 结果字段：`baseline`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("baseline/get", {
  "baselineID": 1
});
```
## 编辑项目基线

- SDK 调用：`request("baseline/update", params)`
- HTTP：`PUT /baselines/{baselineID}`
- 动作类型：`update`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `baselineID` | baselineID |

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
      "description": "基线名称。"
    },
    "version": {
      "type": "string",
      "description": "基线版本。"
    },
    "category": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "纳入基线的交付物 ID 列表。"
    },
    "comment": {
      "type": "string",
      "description": "编辑备注。"
    }
  },
  "required": [
    "title",
    "version",
    "category"
  ]
}
```

示例:

```json
{
  "title": "API 基线（已编辑）",
  "version": "V1.1",
  "category": [
    1
  ],
  "comment": "通过 API 编辑"
}
```

### 返回值

- 返回形态：`object`
- 对象类型：无统一对象类型

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("baseline/update", {
  "baselineID": 1,
  "title": "<string>",
  "version": "<string>",
  "category": [
    "<string>"
  ],
  "comment": "<string>"
});
```
## 删除项目基线

- SDK 调用：`request("baseline/delete", params)`
- HTTP：`DELETE /baselines/{baselineID}`
- 动作类型：`delete`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `baselineID` | baselineID |

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

const result = await request("baseline/delete", {
  "baselineID": 1
});
```
