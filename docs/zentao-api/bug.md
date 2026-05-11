# Bug (bug)

Bug管理，支持获取Bug列表，支持获取产品/项目/执行下的Bug、创建Bug、获取Bug详情、修改Bug、删除Bug、激活Bug、关闭Bug、解决Bug

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取Bug列表，支持获取产品/项目/执行下的Bug | `GET` | `/{scope}/{scopeID}/bugs` |
| `create` | 创建Bug | `POST` | `/bugs` |
| `get` | 获取Bug详情 | `GET` | `/bugs/{bugID}` |
| `update` | 修改Bug | `PUT` | `/bugs/{bugID}` |
| `delete` | 删除Bug | `DELETE` | `/bugs/{bugID}` |
| `activate` | 激活Bug | `PUT` | `/bugs/{bugID}/activate` |
| `close` | 关闭Bug | `PUT` | `/bugs/{bugID}/close` |
| `resolve` | 解决Bug | `PUT` | `/bugs/{bugID}/resolve` |

## 获取Bug列表，支持获取产品/项目/执行下的Bug

- SDK 调用：`request("bug/list", params)`
- HTTP：`GET /{scope}/{scopeID}/bugs`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `scope` | Bug范围 |
| `scopeID` | 范围ID |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `unclosed` | 状态，默认是unclosed<br>`all` 全部<br>`unclosed` 未关闭<br>`assignedtome` 指派给我<br>`openedbyme` 我创建<br>`assignedbyme` 由我指派 |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`title_asc` 标题 升序<br>`title_desc` 标题 降序<br>`status_asc` 状态 升序<br>`status_desc` 状态 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`bugs`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("bug/list", {
  "scope": "<string>",
  "scopeID": 1,
  "browseType": "unclosed",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1
});
```
## 创建Bug

- SDK 调用：`request("bug/create", params)`
- HTTP：`POST /bugs`
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
      "description": "影响版本,主干是trunk，其他版本使用版本ID"
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
    "severity": {
      "type": "integer",
      "description": "严重程度，默认是3",
      "format": "int32"
    },
    "pri": {
      "type": "integer",
      "description": "优先级，默认是3",
      "format": "int32"
    },
    "type": {
      "type": "string",
      "description": "Bug类型(codeerror 代码错误 | config 配置相关 | install 安装部署 | security 安全相关 | performance 性能问题 | standard 标准规范 | automation 测试脚本 | designdefect 设计缺陷 | others 其他)"
    },
    "steps": {
      "type": "string",
      "description": "重现步骤"
    },
    "story": {
      "type": "integer",
      "description": "相关需求",
      "format": "int32"
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
  "title": "<string>",
  "openedBuild": [
    "<string>"
  ],
  "project": 1,
  "execution": 1,
  "severity": 1,
  "pri": 1,
  "type": "<string>",
  "steps": "<string>",
  "story": 1
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("bug/create", {
  "productID": 1,
  "title": "<string>",
  "openedBuild": [
    "<string>"
  ],
  "project": 1,
  "execution": 1,
  "severity": 1,
  "pri": 1,
  "type": "<string>",
  "steps": "<string>",
  "story": 1
});
```
## 获取Bug详情

- SDK 调用：`request("bug/get", params)`
- HTTP：`GET /bugs/{bugID}`
- 动作类型：`get`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `bugID` | Bug ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 结果字段：`bug`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("bug/get", {
  "bugID": 1
});
```
## 修改Bug

- SDK 调用：`request("bug/update", params)`
- HTTP：`PUT /bugs/{bugID}`
- 动作类型：`update`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `bugID` | Bug ID |

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
      "description": "Bug标题"
    },
    "severity": {
      "type": "integer",
      "description": "严重程度，默认是3",
      "format": "int32"
    },
    "pri": {
      "type": "integer",
      "description": "优先级，默认是3",
      "format": "int32"
    },
    "type": {
      "type": "string",
      "description": "Bug类型(codeerror 代码错误 | config 配置相关 | install 安装部署 | security 安全相关 | performance 性能问题 | standard 标准规范 | automation 测试脚本 | designdefect 设计缺陷 | others 其他)"
    },
    "openedBuild": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "影响版本,主干是trunk，其他版本使用版本ID"
    },
    "steps": {
      "type": "string",
      "description": "重现步骤"
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
    "story": {
      "type": "integer",
      "description": "相关需求",
      "format": "int32"
    }
  }
}
```

示例:

```json
{
  "title": "<string>",
  "severity": 1,
  "pri": 1,
  "type": "<string>",
  "openedBuild": [
    "<string>"
  ],
  "steps": "<string>",
  "project": 1,
  "execution": 1,
  "story": 1
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("bug/update", {
  "bugID": 1,
  "title": "<string>",
  "severity": 1,
  "pri": 1,
  "type": "<string>",
  "openedBuild": [
    "<string>"
  ],
  "steps": "<string>",
  "project": 1,
  "execution": 1,
  "story": 1
});
```
## 删除Bug

- SDK 调用：`request("bug/delete", params)`
- HTTP：`DELETE /bugs/{bugID}`
- 动作类型：`delete`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `bugID` | Bug ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("bug/delete", {
  "bugID": 1
});
```
## 激活Bug

- SDK 调用：`request("bug/activate", params)`
- HTTP：`PUT /bugs/{bugID}/activate`
- 动作类型：`action`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `bugID` | Bug ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "openedBuild": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "影响版本, trunk为主干"
    },
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
  "openedBuild": [
    "<string>"
  ],
  "assignedTo": "<string>",
  "comment": "<string>"
}
```

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("bug/activate", {
  "bugID": 1,
  "openedBuild": [
    "<string>"
  ],
  "assignedTo": "<string>",
  "comment": "<string>"
});
```
## 关闭Bug

- SDK 调用：`request("bug/close", params)`
- HTTP：`PUT /bugs/{bugID}/close`
- 动作类型：`action`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `bugID` | Bug ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
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
  "comment": "<string>"
}
```

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("bug/close", {
  "bugID": 1,
  "comment": "<string>"
});
```
## 解决Bug

- SDK 调用：`request("bug/resolve", params)`
- HTTP：`PUT /bugs/{bugID}/resolve`
- 动作类型：`action`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `bugID` | Bug ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "resolution": {
      "type": "string",
      "description": "fixed 已解决 | notrepro 无法重现 | bydesign 设计如此 | duplicate 重复Bug | external 外部原因| postponed 延期处理 | willnotfix 不予解决 | tostory 转为需求"
    },
    "resolvedDate": {
      "type": "string",
      "description": "解决日期，默认今天"
    },
    "resolvedBuild": {
      "type": "string",
      "description": "解决版本, trunk为主干"
    },
    "assignedTo": {
      "type": "string",
      "description": "指派给"
    },
    "comment": {
      "type": "string",
      "description": "备注"
    }
  },
  "required": [
    "resolution"
  ]
}
```

示例:

```json
{
  "resolution": "<string>",
  "resolvedDate": "<string>",
  "resolvedBuild": "<string>",
  "assignedTo": "<string>",
  "comment": "<string>"
}
```

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("bug/resolve", {
  "bugID": 1,
  "resolution": "<string>",
  "resolvedDate": "<string>",
  "resolvedBuild": "<string>",
  "assignedTo": "<string>",
  "comment": "<string>"
});
```
