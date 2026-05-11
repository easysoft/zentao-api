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

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `status` | string | 否 |  | 状态<br>`all` 全部<br>`unclosed` 未关闭<br>`wait` 未开始<br>`doing` 进行中<br>`suspended` 已挂起<br>`delayed` 已延期<br>`closed` 已关闭 |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`name_asc` 名称 升序<br>`name_desc` 名称 降序<br>`begin_asc` 计划开始 升序<br>`begin_desc` 计划开始 降序<br>`end_asc` 计划结束 升序<br>`end_desc` 计划结束 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |

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
  "status": "all",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1
});
```
## 创建项目集

- SDK 调用：`request("program/create", params)`
- HTTP：`POST /programs`
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
  "name": "<string>",
  "begin": "<string>",
  "end": "<string>",
  "PM": "<string>",
  "desc": "<string>"
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
  "name": "<string>",
  "begin": "<string>",
  "end": "<string>",
  "PM": "<string>",
  "desc": "<string>"
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
