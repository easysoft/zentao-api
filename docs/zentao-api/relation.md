# 对象关联 (relation)

对象关联管理，支持关联对象、查询可关联对象、查询关联对象、删除关联关系

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `link` | 关联对象 | `POST` | `/relations/{objectType}/{objectID}/{relatedObjectType}` |
| `candidates` | 查询可关联对象 | `GET` | `/relations/{objectType}/{objectID}/candidates/{relatedObjectType}` |
| `list` | 查询关联对象 | `GET` | `/relations/{objectType}/{objectID}` |
| `unlink` | 删除关联关系 | `DELETE` | `/relations/{relationID}` |

## 关联对象

- SDK 调用：`request("relation/link", params)`
- HTTP：`POST /relations/{objectType}/{objectID}/{relatedObjectType}`
- 动作类型：`action`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `objectType` | objectType |
| `objectID` | objectID |
| `relatedObjectType` | relatedObjectType |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "relation": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "被关联对象 ID 与关系 key 的映射，键为候选接口返回的 objects[].id，值为 relationPairs 返回的 key。"
    }
  },
  "required": [
    "relation"
  ]
}
```

示例:

```json
{
  "relation": {
    "1": 1
  }
}
```

### 返回值

- 返回形态：`text`
- 对象类型：无统一对象类型

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("relation/link", {
  "objectType": "<string>",
  "objectID": 1,
  "relatedObjectType": "<string>",
  "relation": [
    "<string>"
  ]
});
```
## 查询可关联对象

- SDK 调用：`request("relation/candidates", params)`
- HTTP：`GET /relations/{objectType}/{objectID}/candidates/{relatedObjectType}`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `objectType` | objectType |
| `objectID` | objectID |
| `relatedObjectType` | relatedObjectType |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 |  | 候选对象筛选类型。 |
| `orderBy` | string | 否 |  | 排序字段。 |
| `recPerPage` | number | 否 |  | 每页数量。 |
| `pageID` | number | 否 |  | 页码。 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 对象类型：读取调用参数 `params["relatedObjectType"]`
- 类型映射：`{"projectdeliverable":"deliverable"}`；未命中时保留参数值
- 结果字段：`objects`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("relation/candidates", {
  "objectType": "<string>",
  "objectID": 1,
  "relatedObjectType": "<string>",
  "browseType": "<string>",
  "orderBy": "<string>",
  "recPerPage": 1,
  "pageID": 1
});
```
## 查询关联对象

- SDK 调用：`request("relation/list", params)`
- HTTP：`GET /relations/{objectType}/{objectID}`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `objectType` | objectType |
| `objectID` | objectID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 对象类型：无统一对象类型
- 结果字段：`relations`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("relation/list", {
  "objectType": "<string>",
  "objectID": 1
});
```
## 删除关联关系

根据关系记录 ID 删除自定义关联关系。relationID 从查询关联对象接口返回的 relations[].relationID 字段获取，只有 relationType 为 custom 的自定义关系可以删除。

- SDK 调用：`request("relation/unlink", params)`
- HTTP：`DELETE /relations/{relationID}`
- 动作类型：`delete`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `relationID` | relationID |

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

const result = await request("relation/unlink", {
  "relationID": 1
});
```
