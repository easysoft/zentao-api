# 项目周报 (weekly)

项目周报管理，支持获取项目周报列表、创建项目周报、获取项目周报详情、编辑项目周报、删除项目周报

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取项目周报列表 | `GET` | `/weeklies` |
| `create` | 创建项目周报 | `POST` | `/weeklies` |
| `get` | 获取项目周报详情 | `GET` | `/weeklies/{reportID}` |
| `update` | 编辑项目周报 | `PUT` | `/weeklies/{reportID}` |
| `delete` | 删除项目周报 | `DELETE` | `/weeklies/{reportID}` |

## 获取项目周报列表

- SDK 调用：`request("weekly/list", params)`
- HTTP：`GET /weeklies`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `projectID` | number | 是 |  | 项目 ID。 |
| `browseType` | string | 否 | `all` | 筛选类型，默认 all<br>`all` 全部<br>`bymodule` 按目录<br>`bysearch` 搜索 |
| `param` | string | 否 |  | browseType=bymodule 时传目录 ID，browseType=bysearch 时传查询 ID。 |
| `orderBy` | string | 否 |  | 排序字段。 |
| `recPerPage` | number | 否 |  | 每页数量。 |
| `pageID` | number | 否 |  | 页码。 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 对象类型：`weekly`
- 结果字段：`reports`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("weekly/list", {
  "projectID": 1,
  "browseType": "all",
  "param": "<string>",
  "orderBy": "<string>",
  "recPerPage": 1,
  "pageID": 1
});
```
## 创建项目周报

- SDK 调用：`request("weekly/create", params)`
- HTTP：`POST /weeklies`
- 动作类型：`create`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

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
    "projectID": {
      "type": "integer",
      "description": "项目 ID。",
      "format": "int32"
    },
    "reportModule": {
      "type": "string",
      "description": "项目周报分类 ID，没有分类时可传 0。"
    },
    "title": {
      "type": "string",
      "description": "周报标题。"
    },
    "templateID": {
      "type": "integer",
      "description": "报告模板 ID，不使用模板时传 0。",
      "format": "int32"
    },
    "templateDesc": {
      "type": "string",
      "description": "周报描述。"
    },
    "acl": {
      "type": "string",
      "description": "访问控制(open 公开 | private 私有)。"
    },
    "status": {
      "type": "string",
      "description": "周报状态(draft 草稿 | normal 正常)。"
    }
  },
  "required": [
    "projectID"
  ]
}
```

示例:

```json
{
  "projectID": 2,
  "reportModule": "0",
  "title": "API 创建项目周报",
  "templateID": 0,
  "templateDesc": "通过 API 创建的项目周报",
  "acl": "open",
  "status": "draft"
}
```

### 返回值

- 返回形态：`object`
- 对象类型：`weekly`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("weekly/create", {
  "projectID": 1,
  "reportModule": "<string>",
  "title": "<string>",
  "templateID": 1,
  "templateDesc": "<string>",
  "acl": "<string>",
  "status": "<string>"
});
```
## 获取项目周报详情

- SDK 调用：`request("weekly/get", params)`
- HTTP：`GET /weeklies/{reportID}`
- 动作类型：`get`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `reportID` | reportID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 对象类型：`weekly`
- 结果字段：`report`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("weekly/get", {
  "reportID": 1
});
```
## 编辑项目周报

- SDK 调用：`request("weekly/update", params)`
- HTTP：`PUT /weeklies/{reportID}`
- 动作类型：`update`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `reportID` | reportID |

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
      "description": "周报标题。"
    },
    "status": {
      "type": "string",
      "description": "周报状态。"
    },
    "contentType": {
      "type": "string",
      "description": "内容类型，默认 doc。"
    },
    "type": {
      "type": "string",
      "description": "文档类型，默认 text。"
    },
    "content": {
      "type": "string",
      "description": "周报 HTML 内容。"
    },
    "rawContent": {
      "type": "string",
      "description": "周报原始内容。"
    },
    "comment": {
      "type": "string",
      "description": "编辑备注。"
    }
  }
}
```

示例:

```json
{
  "title": "API 编辑项目周报",
  "status": "normal",
  "contentType": "doc",
  "type": "text",
  "content": "<p>本周项目进展正常。</p>",
  "comment": "通过 API 编辑"
}
```

### 返回值

- 返回形态：`object`
- 对象类型：无统一对象类型

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("weekly/update", {
  "reportID": 1,
  "title": "<string>",
  "status": "<string>",
  "contentType": "<string>",
  "type": "<string>",
  "content": "<string>",
  "rawContent": "<string>",
  "comment": "<string>"
});
```
## 删除项目周报

- SDK 调用：`request("weekly/delete", params)`
- HTTP：`DELETE /weeklies/{reportID}`
- 动作类型：`delete`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `reportID` | reportID |

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

const result = await request("weekly/delete", {
  "reportID": 1
});
```
