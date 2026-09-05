# 项目集 (program)

项目集管理，支持获取项目集列表、创建项目集、获取项目集详情、修改项目集、删除项目集

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取项目集列表 | `GET` | `/programs` |
| `create` | 创建项目集 | `POST` | `/programs` |
| `get` | 获取项目集详情 | `GET` | `/programs/{programID}` |
| `update` | 修改项目集 | `PUT` | `/programs/{programID}` |
| `delete` | 删除项目集 | `DELETE` | `/programs/{programID}` |

## 获取项目集列表

- SDK 调用：`request("program/list", params)`
- HTTP：`GET /programs`
- 动作类型：`list`
- 最低禅道版本：`22.0` / `biz13.0` / `max8.0` / `ipd5.0`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 |  | 浏览类型<br>`all` 全部<br>`unclosed` 未关闭<br>`wait` 未开始<br>`doing` 进行中<br>`suspended` 已挂起<br>`delayed` 已延期<br>`closed` 已关闭 |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`name_asc` 名称 升序<br>`name_desc` 名称 降序<br>`begin_asc` 计划开始 升序<br>`begin_desc` 计划开始 降序<br>`end_asc` 计划结束 升序<br>`end_desc` 计划结束 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：name(项目集名称，示例：关键字)；PM(负责人，用户，示例：admin)；openedDate(创建时间，示例：2026-01-01)；status(状态，枚举：wait 未开始 \| doing 进行中 \| suspended 已挂起 \| closed 已关闭)；openedBy(创建者，用户，示例：admin)；begin(计划开始，示例：2026-01-01)；end(计划完成，示例：2026-01-01)；realBegan(实际开始，示例：2026-01-01)；realEnd(实际完成，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(最后编辑日期，示例：2026-01-01)；desc(项目集描述，示例：关键字) |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`programs`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("program/list", {
  "browseType": "all",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 创建项目集

- SDK 调用：`request("program/create", params)`
- HTTP：`POST /programs`
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
    "name": {
      "type": "string",
      "description": "项目集名称"
    },
    "begin": {
      "type": "string",
      "description": "计划开始日期"
    },
    "end": {
      "type": "string",
      "description": "计划完成日期"
    },
    "PM": {
      "type": "string",
      "description": "计划完成日期"
    },
    "desc": {
      "type": "string",
      "description": "项目集描述"
    }
  },
  "required": [
    "name",
    "begin",
    "end"
  ]
}
```

示例:

```json
{
  "name": "智能睡眠",
  "begin": "2025-01-01",
  "end": "2026-12-01",
  "PM": "productManager",
  "desc": "智能家居项目集"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("program/create", {
  "name": "<string>",
  "begin": "<string>",
  "end": "<string>",
  "PM": "<string>",
  "desc": "<string>"
});
```
## 获取项目集详情

- SDK 调用：`request("program/get", params)`
- HTTP：`GET /programs/{programID}`
- 动作类型：`get`
- 最低禅道版本：`22.0` / `biz13.0` / `max8.0` / `ipd5.0`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `programID` | 项目集ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 结果字段：`program`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("program/get", {
  "programID": 1
});
```
## 修改项目集

- SDK 调用：`request("program/update", params)`
- HTTP：`PUT /programs/{programID}`
- 动作类型：`update`
- 最低禅道版本：`22.0` / `biz13.0` / `max8.0` / `ipd5.0`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `programID` | 项目集ID |

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
      "description": "项目集名称"
    },
    "begin": {
      "type": "string",
      "description": "计划开始日期"
    },
    "end": {
      "type": "string",
      "description": "计划完成日期"
    },
    "PM": {
      "type": "string",
      "description": "计划完成日期"
    },
    "desc": {
      "type": "string",
      "description": "项目集描述"
    }
  },
  "required": [
    "name",
    "begin",
    "end"
  ]
}
```

示例:

```json
{
  "name": "智能家居",
  "begin": "2025-01-01",
  "end": "2026-12-01",
  "PM": "productManager",
  "desc": "智能家居项目集"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("program/update", {
  "programID": 1,
  "name": "<string>",
  "begin": "<string>",
  "end": "<string>",
  "PM": "<string>",
  "desc": "<string>"
});
```
## 删除项目集

- SDK 调用：`request("program/delete", params)`
- HTTP：`DELETE /programs/{programID}`
- 动作类型：`delete`
- 最低禅道版本：`22.0` / `biz13.0` / `max8.0` / `ipd5.0`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `programID` | 项目集ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("program/delete", {
  "programID": 1
});
```
