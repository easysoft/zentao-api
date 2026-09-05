# 版本 (build)

版本管理，支持获取版本列表，支持获取项目/执行下的版本、创建版本/构建、修改版本、删除版本

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取版本列表，支持获取项目/执行下的版本 | `GET` | `/{scope}/{scopeID}/builds` |
| `create` | 创建版本/构建 | `POST` | `/builds` |
| `update` | 修改版本 | `PUT` | `/builds/{buildID}` |
| `delete` | 删除版本 | `DELETE` | `/builds/{buildID}` |

## 获取版本列表，支持获取项目/执行下的版本

- SDK 调用：`request("build/list", params)`
- HTTP：`GET /{scope}/{scopeID}/builds`
- 动作类型：`list`
- 最低禅道版本：`22.0` / `biz13.0` / `max8.0` / `ipd5.0`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `scope` | 版本所属范围 |
| `scopeID` | 所属范围ID |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `all` | 状态，默认是all<br>`all` 全部<br>`active` 有效<br>`closed` 已关闭 |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`name_asc` 名称 升序<br>`name_desc` 名称 降序<br>`date_asc` 日期 升序<br>`date_desc` 日期 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：name(名称，示例：关键字)；system(所属应用，示例：all)；id(ID，示例：1)；product(所属产品，产品，示例：1)；scmPath(源代码地址，示例：关键字)；filePath(下载地址，示例：关键字)；date(打包日期，示例：2026-01-01)；builder(构建者，用户，示例：admin)；desc(描述，示例：关键字) |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`builds`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("build/list", {
  "scope": "<string>",
  "scopeID": 1,
  "browseType": "all",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 创建版本/构建

- SDK 调用：`request("build/create", params)`
- HTTP：`POST /builds`
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
    "executionID": {
      "type": "integer",
      "description": "所属执行/迭代",
      "format": "int32"
    },
    "product": {
      "type": "integer",
      "description": "所属产品",
      "format": "int32"
    },
    "name": {
      "type": "string",
      "description": "构建名称"
    },
    "system": {
      "type": "integer",
      "description": "所属应用",
      "format": "int32"
    },
    "builder": {
      "type": "string",
      "description": "构建者"
    },
    "date": {
      "type": "string",
      "description": "打包日期"
    },
    "scmPath": {
      "type": "string",
      "description": "源代码地址"
    },
    "filePath": {
      "type": "string",
      "description": "下载地址"
    },
    "desc": {
      "type": "string",
      "description": "描述"
    }
  },
  "required": [
    "executionID",
    "product",
    "name",
    "system",
    "builder",
    "date"
  ]
}
```

示例:

```json
{
  "executionID": 3,
  "product": 1,
  "name": "v1.0",
  "system": 1,
  "builder": "admin",
  "date": "2026-01-01",
  "scmPath": "http://test.com/git",
  "filePath": "http://test.com/download",
  "desc": "test"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("build/create", {
  "executionID": 1,
  "product": 1,
  "name": "<string>",
  "system": 1,
  "builder": "<string>",
  "date": "<string>",
  "scmPath": "<string>",
  "filePath": "<string>",
  "desc": "<string>"
});
```
## 修改版本

- SDK 调用：`request("build/update", params)`
- HTTP：`PUT /builds/{buildID}`
- 动作类型：`update`
- 最低禅道版本：`22.0` / `biz13.0` / `max8.0` / `ipd5.0`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `buildID` | 版本ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "execution": {
      "type": "integer",
      "description": "所属执行/迭代",
      "format": "int32"
    },
    "product": {
      "type": "integer",
      "description": "所属产品",
      "format": "int32"
    },
    "name": {
      "type": "string",
      "description": "构建名称"
    },
    "system": {
      "type": "integer",
      "description": "所属应用",
      "format": "int32"
    },
    "builder": {
      "type": "string",
      "description": "构建者"
    },
    "date": {
      "type": "string",
      "description": "打包日期"
    },
    "scmPath": {
      "type": "string",
      "description": "源代码地址"
    },
    "filePath": {
      "type": "string",
      "description": "下载地址"
    },
    "desc": {
      "type": "string",
      "description": "描述"
    }
  },
  "required": [
    "execution",
    "product",
    "name",
    "system",
    "builder",
    "date"
  ]
}
```

示例:

```json
{
  "execution": 3,
  "product": 1,
  "name": "版本v1.0",
  "system": 1,
  "builder": "admin",
  "date": "2026-01-01",
  "scmPath": "http://test.com/git",
  "filePath": "http://test.com/download",
  "desc": "test"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("build/update", {
  "buildID": 1,
  "execution": 1,
  "product": 1,
  "name": "<string>",
  "system": 1,
  "builder": "<string>",
  "date": "<string>",
  "scmPath": "<string>",
  "filePath": "<string>",
  "desc": "<string>"
});
```
## 删除版本

- SDK 调用：`request("build/delete", params)`
- HTTP：`DELETE /builds/{buildID}`
- 动作类型：`delete`
- 最低禅道版本：`22.0` / `biz13.0` / `max8.0` / `ipd5.0`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `buildID` | 版本ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("build/delete", {
  "buildID": 1
});
```
