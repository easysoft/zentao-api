# 代码库 (repo)

需部署代码库 API 2.0 实现，支持查询空间代码库和创建 GitFox 代码库。

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取空间下的代码库列表 | `GET` | `/spaces/{spaceID}/repos` |
| `create` | 创建代码库 | `POST` | `/repos` |

## 获取空间下的代码库列表

需 repo.maintain 权限及空间访问权限，独立授权空间另需空间内的 repo.maintain 权限。仅返回未删除、非导入中且当前用户可访问的代码库；url.http、url.ssh 可能缺省，克隆地址保持服务端原值。

- SDK 调用：`request("repo/list", params)`
- HTTP：`GET /spaces/{spaceID}/repos`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `spaceID` | 代码库空间 ID，正整数 |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `pageID` | number | 否 | `1` | 页码，从 1 开始的正整数 |
| `recPerPage` | number | 否 | `20` | 每页条数，范围 1～100 |
| `orderBy` | string | 否 | `id_desc` | 排序方式<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`name_asc` 名称升序<br>`name_desc` 名称降序 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 对象类型：`repo`
- 结果字段：`repos`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("repo/list", {
  "spaceID": 1,
  "pageID": 1,
  "recPerPage": 20,
  "orderBy": "id_desc"
});
```
## 创建代码库

需配置 GitFox，具备 repo.createRepo 全局权限、空间及关联产品访问权限；私有空间或独立授权空间另需空间内的 repo.create 权限，独立授权空间还需 repo.createRepo 权限。以当前 Token 用户创建，默认 main 分支并初始化 README；返回 id，不返回克隆地址。超时或后续步骤失败时远端代码库可能已创建，重试前应查询目标空间核对。

- SDK 调用：`request("repo/create", params)`
- HTTP：`POST /repos`
- 动作类型：`create`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

无查询参数。

### 请求体

请求体必填：是
请求媒体类型：`application/json`

Schema:

```json
{
  "type": "object",
  "required": [
    "space",
    "product",
    "name"
  ],
  "example": {
    "space": 10,
    "product": [
      12
    ],
    "name": "demo"
  },
  "properties": {
    "space": {
      "type": "integer",
      "minimum": 1,
      "description": "代码库空间 ID，使用 JSON 数字；字段名为 space"
    },
    "product": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "integer",
        "minimum": 1
      },
      "description": "关联产品 ID 的非空正整数数组，例如 [12]；不接受字符串元素或逗号分隔字符串"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "pattern": "^[A-Za-z_][A-Za-z0-9_.-]*$",
      "description": "去除首尾空白后，以英文字母或下划线开头，后续仅允许英文字母、数字、下划线、连字符和点"
    },
    "desc": {
      "type": "string",
      "defaultValue": "",
      "description": "代码库描述；可选字段使用默认值时应省略，不传 null"
    },
    "acl": {
      "type": "string",
      "defaultValue": "open",
      "options": [
        {
          "value": "open",
          "label": "公开"
        },
        {
          "value": "private",
          "label": "私有"
        }
      ],
      "description": "访问权限，private 时 members 必须非空"
    },
    "members": {
      "type": "array",
      "defaultValue": [],
      "items": {
        "type": "string",
        "minLength": 1
      },
      "description": "成员账号数组，账号须存在、未删除且未关闭；acl=private 时必填且非空，服务端自动加入当前创建者"
    }
  }
}
```

示例:

```json
{
  "space": 10,
  "product": [
    12
  ],
  "name": "demo"
}
```

### 返回值

- 返回形态：`object`
- 对象类型：`repo`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("repo/create", {
  "space": 10,
  "product": [
    12
  ],
  "name": "demo"
});
```
