# Bug (bug)

Bug管理，支持获取Bug列表，支持获取项目/产品/执行下的Bug、产品的Bug模块树、创建Bug、获取Bug详情、修改Bug、修改Bug模块、删除Bug、删除Bug模块、激活Bug、关闭Bug、确认Bug、解决Bug

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取Bug列表，支持获取项目/产品/执行下的Bug | `GET` | `/{scope}/{scopeID}/bugs` |
| `modules` | 产品的Bug模块树 | `GET` | `/products/{productID}/bug/modules` |
| `create` | 创建Bug | `POST` | `/bugs` |
| `get` | 获取Bug详情 | `GET` | `/bugs/{bugID}` |
| `update` | 修改Bug | `PUT` | `/bugs/{bugID}` |
| `updateModule` | 修改Bug模块 | `PUT` | `/bug/modules/{moduleID}` |
| `delete` | 删除Bug | `DELETE` | `/bugs/{bugID}` |
| `deleteModule` | 删除Bug模块 | `DELETE` | `/bug/modules/{moduleID}` |
| `activate` | 激活Bug | `PUT` | `/bugs/{bugID}/activate` |
| `close` | 关闭Bug | `PUT` | `/bugs/{bugID}/close` |
| `confirm` | 确认Bug | `PUT` | `/bugs/{bugID}/confirm` |
| `resolve` | 解决Bug | `PUT` | `/bugs/{bugID}/resolve` |

## 获取Bug列表，支持获取项目/产品/执行下的Bug

- SDK 调用：`request("bug/list", params)`
- HTTP：`GET /{scope}/{scopeID}/bugs`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `scope` | Bug所属范围 |
| `scopeID` | 所属范围ID |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 |  | 状态 |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`title_asc` 标题 升序<br>`title_desc` 标题 降序<br>`status_asc` 状态 升序<br>`status_desc` 状态 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(Bug标题，示例：关键字)；module(所属模块，模块，示例：0)；keywords(关键词，示例：关键字)；steps(重现步骤，示例：关键字)；assignedTo(指派给，用户，示例：admin)；resolvedBy(解决者，用户，示例：admin)；status(Bug状态，枚举：active 激活 \| resolved 已解决 \| closed 已关闭)；confirmed(是否确认，枚举：1 已确认 \| 0 未确认)；story(相关需求，示例：关键字)；project(所属项目，示例：all)；product(所属产品，示例：all)；branch(branch，示例：all)；plan(所属计划，示例：all)；id(Bug编号，示例：1)；execution(所属执行，执行，示例：3)；severity(严重程度，枚举：1 \| 2 \| 3 \| 4)；pri(优先级，枚举：1 \| 2 \| 3 \| 4)；type(Bug类型，枚举：codeerror 代码错误 \| config 配置相关 \| install 安装部署 \| security 安全相关 \| performance 性能问题 \| standard 标准规范 \| automation 测试脚本 \| designdefect 设计缺陷 \| codeimprovement 代码改进 \| others 其他)；os(操作系统，枚举：all 全部 \| windows Windows \| win11 Windows 11 \| win10 Windows 10 \| win8 Windows 8 \| win7 Windows 7 \| winxp Windows XP \| osx Mac OS \| android Android \| ios IOS \| linux Linux \| ubuntu Ubuntu \| chromeos Chrome OS \| fedora Fedora \| unix Unix \| others 其他)；browser(浏览器，枚举：all 全部 \| chrome Chrome \| edge Edge \| ie IE系列 \| ie11 IE11 \| ie10 IE10 \| ie9 IE9 \| ie8 IE8 \| firefox firefox系列 \| opera Opera系列 \| safari \| 360 360浏览器 \| qq QQ浏览器 \| other 其他)；resolution(解决方案，枚举：bydesign 设计如此 \| duplicate 重复Bug \| external 外部原因 \| fixed 已解决 \| notrepro 无法重现 \| postponed 延期处理 \| willnotfix 不予解决 \| tostory 转为用户故事)；activatedCount(激活次数，示例：关键字)；toTask(转任务，示例：关键字)；toStory(转用户故事，示例：关键字)；openedBy(由谁创建，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedBy(修改者，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；openedBuild(影响版本，示例：builds)；resolvedBuild(解决版本，示例：builds)；openedDate(创建日期，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；resolvedDate(解决日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(修改日期，示例：2026-01-01)；deadline(截止日期，示例：2026-01-01)；activatedDate(激活时间，示例：2026-01-01) |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

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
  "browseType": "<string>",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 产品的Bug模块树

- SDK 调用：`request("bug/modules", params)`
- HTTP：`GET /products/{productID}/bug/modules`
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

const result = await request("bug/modules", {
  "productID": 1
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
    },
    "assignedTo": {
      "type": "string",
      "description": "指派给"
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
  "title": "压敏元件显示错误",
  "openedBuild": [
    "trunk"
  ],
  "project": 2,
  "execution": 3,
  "severity": 3,
  "pri": 3,
  "type": "codeerror",
  "steps": "[步骤] [结果] [期望]",
  "story": 0,
  "assignedTo": "admin"
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
  "story": 1,
  "assignedTo": "<string>"
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
    },
    "assignedTo": {
      "type": "string",
      "description": "指派给"
    }
  }
}
```

示例:

```json
{
  "title": "光敏元件显示错误",
  "severity": 3,
  "pri": 3,
  "type": "codeerror",
  "openedBuild": [
    "trunk"
  ],
  "steps": "[步骤] [结果] [期望]",
  "project": 2,
  "execution": 3,
  "story": 0,
  "assignedTo": "admin"
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
  "story": 1,
  "assignedTo": "<string>"
});
```
## 修改Bug模块

- SDK 调用：`request("bug/updateModule", params)`
- HTTP：`PUT /bug/modules/{moduleID}`
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
  "name": "Bug新模块",
  "parent": "0"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("bug/updateModule", {
  "moduleID": 1,
  "name": "<string>",
  "parent": 1
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
## 删除Bug模块

- SDK 调用：`request("bug/deleteModule", params)`
- HTTP：`DELETE /bug/modules/{moduleID}`
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

const result = await request("bug/deleteModule", {
  "moduleID": 1
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
    "trunk"
  ],
  "assignedTo": "admin"
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
## 确认Bug

- SDK 调用：`request("bug/confirm", params)`
- HTTP：`PUT /bugs/{bugID}/confirm`
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
    "assignedTo": {
      "type": "string",
      "description": "指派给"
    },
    "type": {
      "type": "string",
      "description": "Bug类型(codeerror 代码错误 | config 配置相关 | install 安装部署 | security 安全相关 | performance 性能问题 | standard 标准规范 | automation 测试脚本 | designdefect 设计缺陷 | others 其他)"
    },
    "pri": {
      "type": "integer",
      "description": "优先级，默认是3",
      "format": "int32"
    },
    "deadline": {
      "type": "string",
      "description": "截止日期"
    },
    "status": {
      "type": "string",
      "description": "状态"
    },
    "mailto": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "抄送给"
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
  "assignedTo": "admin",
  "type": "codeerror",
  "pri": 3,
  "deadline": "2025-12-12",
  "mailto": [
    "admin"
  ]
}
```

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("bug/confirm", {
  "bugID": 1,
  "assignedTo": "<string>",
  "type": "<string>",
  "pri": 1,
  "deadline": "<string>",
  "status": "<string>",
  "mailto": [
    "<string>"
  ],
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
  "resolution": "fixed",
  "resolvedDate": "2025-12-12",
  "resolvedBuild": "trunk",
  "assignedTo": "admin"
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
