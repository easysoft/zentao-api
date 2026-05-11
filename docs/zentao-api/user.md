# 用户 (user)

用户管理，支持获取用户列表、创建用户、获取用户详情、修改用户信息、删除用户

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取用户列表 | `GET` | `/users` |
| `create` | 创建用户 | `POST` | `/users` |
| `get` | 获取用户详情 | `GET` | `/users/{userID}` |
| `update` | 修改用户信息 | `PUT` | `/users/{userID}` |
| `delete` | 删除用户 | `DELETE` | `/users/{userID}` |

## 获取用户列表

- SDK 调用：`request("user/list", params)`
- HTTP：`GET /users`
- 动作类型：`list`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 |  | 浏览类型<br>`inside` 内部用户<br>`outside` 内部用户 |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`realname_asc` 姓名 升序<br>`realname_desc` 姓名 降序<br>`account_asc` 用户名 升序<br>`account_desc` 用户名 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`users`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("user/list", {
  "browseType": "inside",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1
});
```
## 创建用户

- SDK 调用：`request("user/create", params)`
- HTTP：`POST /users`
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
    "account": {
      "type": "string",
      "description": "登录名"
    },
    "realname": {
      "type": "string",
      "description": "姓名"
    },
    "password": {
      "type": "string",
      "description": "密码"
    }
  },
  "required": [
    "account",
    "realname",
    "password"
  ]
}
```

示例:

```json
{
  "account": "<string>",
  "realname": "<string>",
  "password": "<string>"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("user/create", {
  "account": "<string>",
  "realname": "<string>",
  "password": "<string>"
});
```
## 获取用户详情

- SDK 调用：`request("user/get", params)`
- HTTP：`GET /users/{userID}`
- 动作类型：`get`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `userID` | 用户ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 结果字段：`user`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("user/get", {
  "userID": 1
});
```
## 修改用户信息

- SDK 调用：`request("user/update", params)`
- HTTP：`PUT /users/{userID}`
- 动作类型：`update`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `userID` | 用户ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "realname": {
      "type": "string",
      "description": "真实姓名"
    },
    "dept": {
      "type": "integer",
      "description": "部门",
      "format": "int32"
    },
    "join": {
      "type": "string",
      "description": "入职日期"
    },
    "group": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "权限分组"
    },
    "email": {
      "type": "string",
      "description": "邮箱"
    },
    "visions": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "界面类型(研发综合界面 rnd | 运营管理界面 lite)"
    },
    "mobile": {
      "type": "string",
      "description": "手机"
    },
    "weixin": {
      "type": "string",
      "description": "微信"
    },
    "password": {
      "type": "string",
      "description": "密码"
    }
  }
}
```

示例:

```json
{
  "realname": "<string>",
  "dept": 1,
  "join": "<string>",
  "group": [
    "<string>"
  ],
  "email": "<string>",
  "visions": [
    "<string>"
  ],
  "mobile": "<string>",
  "weixin": "<string>",
  "password": "<string>"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("user/update", {
  "userID": 1,
  "realname": "<string>",
  "dept": 1,
  "join": "<string>",
  "group": [
    "<string>"
  ],
  "email": "<string>",
  "visions": [
    "<string>"
  ],
  "mobile": "<string>",
  "weixin": "<string>",
  "password": "<string>"
});
```
## 删除用户

- SDK 调用：`request("user/delete", params)`
- HTTP：`DELETE /users/{userID}`
- 动作类型：`delete`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `userID` | 用户ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("user/delete", {
  "userID": 1
});
```
