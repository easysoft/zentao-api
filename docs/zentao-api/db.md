# 数据库 (db)



## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `query` | 执行 SQL 查询 | `POST` | `/db/query` |
| `tables` | 获取数据库表列表 | `GET` | `/db/tables` |
| `table` | 获取数据库表结构 | `GET` | `/db/tables/{table}` |

## 执行 SQL 查询

返回查询结果行及分页；使用 raw: true 可获取原始响应中的 SQL、列信息和执行耗时。

- SDK 调用：`request("db/query", params)`
- HTTP：`POST /db/query`
- 动作类型：`list`
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
  "required": [
    "sql"
  ],
  "properties": {
    "sql": {
      "type": "string",
      "description": "SQL 查询语句"
    },
    "page": {
      "type": "integer",
      "description": "页码，默认 1"
    },
    "limit": {
      "type": "integer",
      "description": "每页记录数，默认 100"
    }
  }
}
```

示例:

```json
{
  "sql": "select * from zt_config",
  "page": 4,
  "limit": 3
}
```

### 返回值

- 返回形态：`list`
- 结果字段：`rows`
- 分页字段：`custom`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("db/query", {
  "sql": "<string>",
  "page": 1,
  "limit": 1
});
```
## 获取数据库表列表

- SDK 调用：`request("db/tables", params)`
- HTTP：`GET /db/tables`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`tables`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("db/tables");
```
## 获取数据库表结构

meta 返回表信息、主键和列定义；sql 返回包含表信息、dialect 和建表 SQL 的对象。

- SDK 调用：`request("db/table", params)`
- HTTP：`GET /db/tables/{table}`
- 动作类型：`get`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `table` | 数据库表名，例如 zt_config |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `type` | string | 否 | `meta` | 表结构返回格式<br>`meta` 元数据<br>`sql` 建表 SQL |

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 结果字段：`custom`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("db/table", {
  "table": "<string>",
  "type": "meta"
});
```
