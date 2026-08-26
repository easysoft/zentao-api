# 文档 (doc)

文档管理，支持获取我的文档空间列表、获取团队文档空间列表、获取产品文档空间列表、获取项目文档空间列表、获取我的文档库列表、获取团队文档库列表、获取产品文档库列表、获取项目文档库列表、获取我的文档列表、获取团队文档列表、获取产品文档列表、获取项目文档列表、获取我的文档库目录列表、获取团队文档库目录列表、获取产品文档库目录列表、获取项目文档库目录列表、创建我的文档空间、创建团队文档空间、创建我的文档库、创建团队文档库、创建产品文档库、创建项目文档库、创建我的文档、创建团队文档、创建产品文档、创建项目文档、创建我的文档库目录、创建团队文档库目录、创建产品文档库目录、创建项目文档库目录、获取文档空间详情、获取文档库详情、获取文档详情、修改文档空间、修改文档库、修改文档、修改文档库目录、删除文档空间、删除文档库、删除文档、删除文档库目录

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `mySpaces` | 获取我的文档空间列表 | `GET` | `/doc/my/spaces` |
| `teamSpaces` | 获取团队文档空间列表 | `GET` | `/doc/team/spaces` |
| `productSpaces` | 获取产品文档空间列表 | `GET` | `/doc/product/spaces` |
| `projectSpaces` | 获取项目文档空间列表 | `GET` | `/doc/project/spaces` |
| `myLibs` | 获取我的文档库列表 | `GET` | `/doc/my/spaces/{spaceID}/libs` |
| `teamLibs` | 获取团队文档库列表 | `GET` | `/doc/team/spaces/{spaceID}/libs` |
| `productLibs` | 获取产品文档库列表 | `GET` | `/doc/product/spaces/{productID}/libs` |
| `projectLibs` | 获取项目文档库列表 | `GET` | `/doc/project/spaces/{projectID}/libs` |
| `myDocs` | 获取我的文档列表 | `GET` | `/doc/my/spaces/{spaceID}/libs/{libID}/docs` |
| `teamDocs` | 获取团队文档列表 | `GET` | `/doc/team/spaces/{spaceID}/libs/{libID}/docs` |
| `productDocs` | 获取产品文档列表 | `GET` | `/doc/product/spaces/{productID}/libs/{libID}/docs` |
| `projectDocs` | 获取项目文档列表 | `GET` | `/doc/project/spaces/{projectID}/libs/{libID}/docs` |
| `myModules` | 获取我的文档库目录列表 | `GET` | `/doc/my/spaces/{spaceID}/libs/{libID}/modules` |
| `teamModules` | 获取团队文档库目录列表 | `GET` | `/doc/team/spaces/{spaceID}/libs/{libID}/modules` |
| `productModules` | 获取产品文档库目录列表 | `GET` | `/doc/product/spaces/{productID}/libs/{libID}/modules` |
| `projectModules` | 获取项目文档库目录列表 | `GET` | `/doc/project/spaces/{projectID}/libs/{libID}/modules` |
| `createMySpace` | 创建我的文档空间 | `POST` | `/doc/my/spaces` |
| `createTeamSpace` | 创建团队文档空间 | `POST` | `/doc/team/spaces` |
| `createMyLib` | 创建我的文档库 | `POST` | `/doc/my/spaces/{spaceID}/libs` |
| `createTeamLib` | 创建团队文档库 | `POST` | `/doc/team/spaces/{spaceID}/libs` |
| `createProductLib` | 创建产品文档库 | `POST` | `/doc/product/spaces/{productID}/libs` |
| `createProjectLib` | 创建项目文档库 | `POST` | `/doc/project/spaces/{projectID}/libs` |
| `createMyDoc` | 创建我的文档 | `POST` | `/doc/my/spaces/{spaceID}/libs/{libID}/docs` |
| `createTeamDoc` | 创建团队文档 | `POST` | `/doc/team/spaces/{spaceID}/libs/{libID}/docs` |
| `createProductDoc` | 创建产品文档 | `POST` | `/doc/product/spaces/{productID}/libs/{libID}/docs` |
| `createProjectDoc` | 创建项目文档 | `POST` | `/doc/project/spaces/{projectID}/libs/{libID}/docs` |
| `createMyModule` | 创建我的文档库目录 | `POST` | `/doc/my/spaces/{spaceID}/libs/{libID}/modules` |
| `createTeamModule` | 创建团队文档库目录 | `POST` | `/doc/team/spaces/{spaceID}/libs/{libID}/modules` |
| `createProductModule` | 创建产品文档库目录 | `POST` | `/doc/product/spaces/{productID}/libs/{libID}/modules` |
| `createProjectModule` | 创建项目文档库目录 | `POST` | `/doc/project/spaces/{projectID}/libs/{libID}/modules` |
| `getSpace` | 获取文档空间详情 | `GET` | `/doc/spaces/{spaceID}` |
| `getLib` | 获取文档库详情 | `GET` | `/doc/libs/{libID}` |
| `get` | 获取文档详情 | `GET` | `/doc/docs/{docID}` |
| `updateSpace` | 修改文档空间 | `PUT` | `/doc/spaces/{spaceID}` |
| `updateLib` | 修改文档库 | `PUT` | `/doc/libs/{libID}` |
| `update` | 修改文档 | `PUT` | `/doc/docs/{docID}` |
| `updateModule` | 修改文档库目录 | `PUT` | `/doc/modules/{moduleID}` |
| `deleteSpace` | 删除文档空间 | `DELETE` | `/doc/spaces/{spaceID}` |
| `deleteLib` | 删除文档库 | `DELETE` | `/doc/libs/{libID}` |
| `delete` | 删除文档 | `DELETE` | `/doc/docs/{docID}` |
| `deleteModule` | 删除文档库目录 | `DELETE` | `/doc/modules/{moduleID}` |

## 获取我的文档空间列表

- SDK 调用：`request("doc/mySpaces", params)`
- HTTP：`GET /doc/my/spaces`
- 动作类型：`list`

### 路径参数

无路径参数。

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`spaces`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/mySpaces");
```
## 获取团队文档空间列表

- SDK 调用：`request("doc/teamSpaces", params)`
- HTTP：`GET /doc/team/spaces`
- 动作类型：`list`

### 路径参数

无路径参数。

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`spaces`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/teamSpaces");
```
## 获取产品文档空间列表

- SDK 调用：`request("doc/productSpaces", params)`
- HTTP：`GET /doc/product/spaces`
- 动作类型：`list`

### 路径参数

无路径参数。

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`spaces`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/productSpaces");
```
## 获取项目文档空间列表

- SDK 调用：`request("doc/projectSpaces", params)`
- HTTP：`GET /doc/project/spaces`
- 动作类型：`list`

### 路径参数

无路径参数。

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`spaces`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/projectSpaces");
```
## 获取我的文档库列表

- SDK 调用：`request("doc/myLibs", params)`
- HTTP：`GET /doc/my/spaces/{spaceID}/libs`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `spaceID` | 空间ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`libs`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/myLibs", {
  "spaceID": 1
});
```
## 获取团队文档库列表

- SDK 调用：`request("doc/teamLibs", params)`
- HTTP：`GET /doc/team/spaces/{spaceID}/libs`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `spaceID` | 空间ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`libs`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/teamLibs", {
  "spaceID": 1
});
```
## 获取产品文档库列表

- SDK 调用：`request("doc/productLibs", params)`
- HTTP：`GET /doc/product/spaces/{productID}/libs`
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
- 结果字段：`libs`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/productLibs", {
  "productID": 1
});
```
## 获取项目文档库列表

- SDK 调用：`request("doc/projectLibs", params)`
- HTTP：`GET /doc/project/spaces/{projectID}/libs`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `projectID` | 项目ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`libs`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/projectLibs", {
  "projectID": 1
});
```
## 获取我的文档列表

- SDK 调用：`request("doc/myDocs", params)`
- HTTP：`GET /doc/my/spaces/{spaceID}/libs/{libID}/docs`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `spaceID` | 空间ID |
| `libID` | 文档库ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`docs`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/myDocs", {
  "spaceID": 1,
  "libID": 1
});
```
## 获取团队文档列表

- SDK 调用：`request("doc/teamDocs", params)`
- HTTP：`GET /doc/team/spaces/{spaceID}/libs/{libID}/docs`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `spaceID` | 空间ID |
| `libID` | 文档库ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`docs`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/teamDocs", {
  "spaceID": 1,
  "libID": 1
});
```
## 获取产品文档列表

- SDK 调用：`request("doc/productDocs", params)`
- HTTP：`GET /doc/product/spaces/{productID}/libs/{libID}/docs`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `productID` | 产品ID |
| `libID` | 文档库ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`docs`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/productDocs", {
  "productID": 1,
  "libID": 1
});
```
## 获取项目文档列表

- SDK 调用：`request("doc/projectDocs", params)`
- HTTP：`GET /doc/project/spaces/{projectID}/libs/{libID}/docs`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `projectID` | 项目ID |
| `libID` | 文档库ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`docs`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/projectDocs", {
  "projectID": 1,
  "libID": 1
});
```
## 获取我的文档库目录列表

- SDK 调用：`request("doc/myModules", params)`
- HTTP：`GET /doc/my/spaces/{spaceID}/libs/{libID}/modules`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `spaceID` | 空间ID |
| `libID` | 文档库ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`modules`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/myModules", {
  "spaceID": 1,
  "libID": 1
});
```
## 获取团队文档库目录列表

- SDK 调用：`request("doc/teamModules", params)`
- HTTP：`GET /doc/team/spaces/{spaceID}/libs/{libID}/modules`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `spaceID` | 空间ID |
| `libID` | 文档库ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`modules`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/teamModules", {
  "spaceID": 1,
  "libID": 1
});
```
## 获取产品文档库目录列表

- SDK 调用：`request("doc/productModules", params)`
- HTTP：`GET /doc/product/spaces/{productID}/libs/{libID}/modules`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `productID` | 产品ID |
| `libID` | 文档库ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`modules`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/productModules", {
  "productID": 1,
  "libID": 1
});
```
## 获取项目文档库目录列表

- SDK 调用：`request("doc/projectModules", params)`
- HTTP：`GET /doc/project/spaces/{projectID}/libs/{libID}/modules`
- 动作类型：`list`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `projectID` | 项目ID |
| `libID` | 文档库ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`modules`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/projectModules", {
  "projectID": 1,
  "libID": 1
});
```
## 创建我的文档空间

- SDK 调用：`request("doc/createMySpace", params)`
- HTTP：`POST /doc/my/spaces`
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
      "description": "文档空间名称"
    }
  },
  "required": [
    "name"
  ]
}
```

示例:

```json
{
  "name": "我的文档空间"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/createMySpace", {
  "name": "<string>"
});
```
## 创建团队文档空间

- SDK 调用：`request("doc/createTeamSpace", params)`
- HTTP：`POST /doc/team/spaces`
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
      "description": "文档空间名称"
    }
  },
  "required": [
    "name"
  ]
}
```

示例:

```json
{
  "name": "团队文档空间"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/createTeamSpace", {
  "name": "<string>"
});
```
## 创建我的文档库

- SDK 调用：`request("doc/createMyLib", params)`
- HTTP：`POST /doc/my/spaces/{spaceID}/libs`
- 动作类型：`create`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `spaceID` | 空间ID |

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
      "description": "文档库名称"
    }
  },
  "required": [
    "name"
  ]
}
```

示例:

```json
{
  "name": "新增我的文档库"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/createMyLib", {
  "spaceID": 1,
  "name": "<string>"
});
```
## 创建团队文档库

- SDK 调用：`request("doc/createTeamLib", params)`
- HTTP：`POST /doc/team/spaces/{spaceID}/libs`
- 动作类型：`create`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `spaceID` | 空间ID |

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
      "description": "文档库名称"
    },
    "acl": {
      "type": "string",
      "description": "open 公开 | private 私有，默认是open"
    },
    "groups": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "如果acl=private,可以设置哪些权限分组可以访问"
    },
    "users": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "如果acl=private,可以设置哪些用户可以访问"
    }
  },
  "required": [
    "name"
  ]
}
```

示例:

```json
{
  "name": "新增团队文档库",
  "acl": "open",
  "groups": [
    1
  ],
  "users": [
    "admin"
  ]
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/createTeamLib", {
  "spaceID": 1,
  "name": "<string>",
  "acl": "<string>",
  "groups": [
    "<string>"
  ],
  "users": [
    "<string>"
  ]
});
```
## 创建产品文档库

- SDK 调用：`request("doc/createProductLib", params)`
- HTTP：`POST /doc/product/spaces/{productID}/libs`
- 动作类型：`create`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `productID` | 产品ID |

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
      "description": "文档库名称"
    },
    "acl": {
      "type": "string",
      "description": "default 默认产品权限 | private 私有"
    },
    "groups": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "如果acl=private,可以设置哪些权限分组可以访问"
    },
    "users": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "如果acl=private,可以设置哪些用户可以访问"
    }
  },
  "required": [
    "name"
  ]
}
```

示例:

```json
{
  "name": "新增产品文档库",
  "acl": "default",
  "groups": [
    1
  ],
  "users": [
    "admin"
  ]
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/createProductLib", {
  "productID": 1,
  "name": "<string>",
  "acl": "<string>",
  "groups": [
    "<string>"
  ],
  "users": [
    "<string>"
  ]
});
```
## 创建项目文档库

- SDK 调用：`request("doc/createProjectLib", params)`
- HTTP：`POST /doc/project/spaces/{projectID}/libs`
- 动作类型：`create`

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
      "description": "文档库名称"
    },
    "acl": {
      "type": "string",
      "description": "default 默认项目权限 | private 私有"
    },
    "groups": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "如果acl=private,可以设置哪些权限分组可以访问"
    },
    "users": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "如果acl=private,可以设置哪些用户可以访问"
    }
  },
  "required": [
    "name"
  ]
}
```

示例:

```json
{
  "name": "新增项目文档库",
  "acl": "default",
  "groups": [
    1
  ],
  "users": [
    "admin"
  ]
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/createProjectLib", {
  "projectID": 1,
  "name": "<string>",
  "acl": "<string>",
  "groups": [
    "<string>"
  ],
  "users": [
    "<string>"
  ]
});
```
## 创建我的文档

- SDK 调用：`request("doc/createMyDoc", params)`
- HTTP：`POST /doc/my/spaces/{spaceID}/libs/{libID}/docs`
- 动作类型：`create`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `spaceID` | 空间ID |
| `libID` | 文档库ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "moduleID": {
      "type": "integer",
      "description": "所属目录",
      "format": "int32"
    },
    "title": {
      "type": "string",
      "description": "文档标题"
    },
    "content": {
      "type": "string",
      "description": "文档正文，使用Markdown格式；系统会转换为块编辑器内容并生成HTML快照"
    },
    "contentType": {
      "type": "string",
      "description": "文档格式(doc 按Markdown处理，支持团队协同编辑 | html 旧格式，直接保存HTML，不支持团队协同编辑)"
    }
  },
  "required": [
    "title",
    "content"
  ]
}
```

示例:

```json
{
  "moduleID": 1,
  "title": "演示文档",
  "content": "# 演示文档\n\n**这是文章正文**",
  "contentType": "doc"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/createMyDoc", {
  "spaceID": 1,
  "libID": 1,
  "moduleID": 1,
  "title": "<string>",
  "content": "<string>",
  "contentType": "<string>"
});
```
## 创建团队文档

- SDK 调用：`request("doc/createTeamDoc", params)`
- HTTP：`POST /doc/team/spaces/{spaceID}/libs/{libID}/docs`
- 动作类型：`create`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `spaceID` | 空间ID |
| `libID` | 文档库ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "moduleID": {
      "type": "integer",
      "description": "所属目录",
      "format": "int32"
    },
    "title": {
      "type": "string",
      "description": "文档标题"
    },
    "content": {
      "type": "string",
      "description": "文档正文，使用Markdown格式；系统会转换为块编辑器内容并生成HTML快照"
    },
    "contentType": {
      "type": "string",
      "description": "文档格式(doc 按Markdown处理，支持团队协同编辑 | html 旧格式，直接保存HTML，不支持团队协同编辑)"
    }
  },
  "required": [
    "title",
    "content"
  ]
}
```

示例:

```json
{
  "moduleID": 1,
  "title": "演示文档",
  "content": "# 演示文档\n\n**这是文章正文**",
  "contentType": "doc"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/createTeamDoc", {
  "spaceID": 1,
  "libID": 1,
  "moduleID": 1,
  "title": "<string>",
  "content": "<string>",
  "contentType": "<string>"
});
```
## 创建产品文档

- SDK 调用：`request("doc/createProductDoc", params)`
- HTTP：`POST /doc/product/spaces/{productID}/libs/{libID}/docs`
- 动作类型：`create`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `productID` | 产品ID |
| `libID` | 文档库ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "moduleID": {
      "type": "integer",
      "description": "所属目录",
      "format": "int32"
    },
    "title": {
      "type": "string",
      "description": "文档标题"
    },
    "content": {
      "type": "string",
      "description": "文档正文，使用Markdown格式；系统会转换为块编辑器内容并生成HTML快照"
    },
    "contentType": {
      "type": "string",
      "description": "文档格式(doc 按Markdown处理，支持团队协同编辑 | html 旧格式，直接保存HTML，不支持团队协同编辑)"
    }
  },
  "required": [
    "title",
    "content"
  ]
}
```

示例:

```json
{
  "moduleID": 1,
  "title": "演示文档",
  "content": "# 演示文档\n\n**这是文章正文**",
  "contentType": "doc"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/createProductDoc", {
  "productID": 1,
  "libID": 1,
  "moduleID": 1,
  "title": "<string>",
  "content": "<string>",
  "contentType": "<string>"
});
```
## 创建项目文档

- SDK 调用：`request("doc/createProjectDoc", params)`
- HTTP：`POST /doc/project/spaces/{projectID}/libs/{libID}/docs`
- 动作类型：`create`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `projectID` | 项目ID |
| `libID` | 文档库ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "moduleID": {
      "type": "integer",
      "description": "所属目录",
      "format": "int32"
    },
    "title": {
      "type": "string",
      "description": "文档标题"
    },
    "content": {
      "type": "string",
      "description": "文档正文，使用Markdown格式；系统会转换为块编辑器内容并生成HTML快照"
    },
    "contentType": {
      "type": "string",
      "description": "文档格式(doc 按Markdown处理，支持团队协同编辑 | html 旧格式，直接保存HTML，不支持团队协同编辑)"
    }
  },
  "required": [
    "title",
    "content"
  ]
}
```

示例:

```json
{
  "moduleID": 1,
  "title": "演示文档",
  "content": "# 演示文档\n\n**这是文章正文**",
  "contentType": "doc"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/createProjectDoc", {
  "projectID": 1,
  "libID": 1,
  "moduleID": 1,
  "title": "<string>",
  "content": "<string>",
  "contentType": "<string>"
});
```
## 创建我的文档库目录

- SDK 调用：`request("doc/createMyModule", params)`
- HTTP：`POST /doc/my/spaces/{spaceID}/libs/{libID}/modules`
- 动作类型：`create`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `spaceID` | 空间ID |
| `libID` | 文档库ID |

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
      "description": "文档库目录"
    },
    "parentID": {
      "type": "integer",
      "description": "父目录ID，必须属于当前文档库",
      "format": "int32"
    }
  },
  "required": [
    "name"
  ]
}
```

示例:

```json
{
  "name": "CMMI资料",
  "parentID": "0"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/createMyModule", {
  "spaceID": 1,
  "libID": 1,
  "name": "<string>",
  "parentID": 1
});
```
## 创建团队文档库目录

- SDK 调用：`request("doc/createTeamModule", params)`
- HTTP：`POST /doc/team/spaces/{spaceID}/libs/{libID}/modules`
- 动作类型：`create`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `spaceID` | 空间ID |
| `libID` | 文档库ID |

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
      "description": "文档库目录"
    },
    "parentID": {
      "type": "integer",
      "description": "父目录ID，必须属于当前文档库",
      "format": "int32"
    }
  },
  "required": [
    "name"
  ]
}
```

示例:

```json
{
  "name": "CMMI资料",
  "parentID": "0"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/createTeamModule", {
  "spaceID": 1,
  "libID": 1,
  "name": "<string>",
  "parentID": 1
});
```
## 创建产品文档库目录

- SDK 调用：`request("doc/createProductModule", params)`
- HTTP：`POST /doc/product/spaces/{productID}/libs/{libID}/modules`
- 动作类型：`create`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `productID` | 产品ID |
| `libID` | 文档库ID |

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
      "description": "文档库目录"
    },
    "parentID": {
      "type": "integer",
      "description": "父目录ID，必须属于当前文档库",
      "format": "int32"
    }
  },
  "required": [
    "name"
  ]
}
```

示例:

```json
{
  "name": "CMMI资料",
  "parentID": "0"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/createProductModule", {
  "productID": 1,
  "libID": 1,
  "name": "<string>",
  "parentID": 1
});
```
## 创建项目文档库目录

- SDK 调用：`request("doc/createProjectModule", params)`
- HTTP：`POST /doc/project/spaces/{projectID}/libs/{libID}/modules`
- 动作类型：`create`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `projectID` | 项目ID |
| `libID` | 文档库ID |

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
      "description": "文档库目录"
    },
    "parentID": {
      "type": "integer",
      "description": "父目录ID，必须属于当前文档库",
      "format": "int32"
    }
  },
  "required": [
    "name"
  ]
}
```

示例:

```json
{
  "name": "CMMI资料",
  "parentID": "0"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/createProjectModule", {
  "projectID": 1,
  "libID": 1,
  "name": "<string>",
  "parentID": 1
});
```
## 获取文档空间详情

- SDK 调用：`request("doc/getSpace", params)`
- HTTP：`GET /doc/spaces/{spaceID}`
- 动作类型：`get`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `spaceID` | 空间ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 结果字段：`space`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/getSpace", {
  "spaceID": 1
});
```
## 获取文档库详情

- SDK 调用：`request("doc/getLib", params)`
- HTTP：`GET /doc/libs/{libID}`
- 动作类型：`get`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `libID` | 文档库ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 结果字段：`lib`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/getLib", {
  "libID": 1
});
```
## 获取文档详情

- SDK 调用：`request("doc/get", params)`
- HTTP：`GET /doc/docs/{docID}`
- 动作类型：`get`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `docID` | 文档ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 结果字段：`custom`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/get", {
  "docID": 1
});
```
## 修改文档空间

- SDK 调用：`request("doc/updateSpace", params)`
- HTTP：`PUT /doc/spaces/{spaceID}`
- 动作类型：`update`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `spaceID` | 空间ID |

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
      "description": "文档空间名称"
    }
  },
  "required": [
    "name"
  ]
}
```

示例:

```json
{
  "name": "新的空间"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/updateSpace", {
  "spaceID": 1,
  "name": "<string>"
});
```
## 修改文档库

- SDK 调用：`request("doc/updateLib", params)`
- HTTP：`PUT /doc/libs/{libID}`
- 动作类型：`update`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `libID` | 文档库ID |

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
      "description": "文档库名称"
    },
    "acl": {
      "type": "string",
      "description": "open 公开(适用于团队文档库) | default 默认权限(适用于产品、项目文档库) | private 私有(适用于所有类型文档库)"
    },
    "groups": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "如果acl=private,可以设置哪些权限分组可以访问"
    },
    "users": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "如果acl=private,可以设置哪些用户可以访问"
    }
  },
  "required": [
    "name"
  ]
}
```

示例:

```json
{
  "name": "新文档库",
  "acl": "default",
  "groups": [
    1
  ],
  "users": [
    "admin"
  ]
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/updateLib", {
  "libID": 1,
  "name": "<string>",
  "acl": "<string>",
  "groups": [
    "<string>"
  ],
  "users": [
    "<string>"
  ]
});
```
## 修改文档

- SDK 调用：`request("doc/update", params)`
- HTTP：`PUT /doc/docs/{docID}`
- 动作类型：`update`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `docID` | 文档ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "moduleID": {
      "type": "integer",
      "description": "所属目录",
      "format": "int32"
    },
    "title": {
      "type": "string",
      "description": "文档标题"
    },
    "content": {
      "type": "string",
      "description": "文档正文，使用Markdown格式；系统会转换为块编辑器内容并生成HTML快照"
    },
    "contentType": {
      "type": "string",
      "description": "文档格式(doc 按Markdown处理，支持团队协同编辑 | html 旧格式，直接保存HTML，不支持团队协同编辑)"
    }
  },
  "required": [
    "title",
    "content"
  ]
}
```

示例:

```json
{
  "moduleID": 1,
  "title": "API修改演示文档",
  "content": "**这是修改后的文章正文**",
  "contentType": "doc"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/update", {
  "docID": 1,
  "moduleID": 1,
  "title": "<string>",
  "content": "<string>",
  "contentType": "<string>"
});
```
## 修改文档库目录

- SDK 调用：`request("doc/updateModule", params)`
- HTTP：`PUT /doc/modules/{moduleID}`
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
      "description": "文档库目录名称"
    }
  },
  "required": [
    "name"
  ]
}
```

示例:

```json
{
  "name": "文档目录1"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/updateModule", {
  "moduleID": 1,
  "name": "<string>"
});
```
## 删除文档空间

- SDK 调用：`request("doc/deleteSpace", params)`
- HTTP：`DELETE /doc/spaces/{spaceID}`
- 动作类型：`delete`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `spaceID` | 空间ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/deleteSpace", {
  "spaceID": 1
});
```
## 删除文档库

- SDK 调用：`request("doc/deleteLib", params)`
- HTTP：`DELETE /doc/libs/{libID}`
- 动作类型：`delete`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `libID` | 文档库ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/deleteLib", {
  "libID": 1
});
```
## 删除文档

- SDK 调用：`request("doc/delete", params)`
- HTTP：`DELETE /doc/docs/{docID}`
- 动作类型：`delete`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `docID` | 文档ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("doc/delete", {
  "docID": 1
});
```
## 删除文档库目录

- SDK 调用：`request("doc/deleteModule", params)`
- HTTP：`DELETE /doc/modules/{moduleID}`
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

const result = await request("doc/deleteModule", {
  "moduleID": 1
});
```
