# 工作流 (workflow)

工作流管理，支持获取工作流数据列表(以合同为例)、获取工作流数据详情(以合同为例)、创建工作流数据(以合同为例)、修改工作流数据(以合同为例)、删除工作流事项(以合同为例)

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取工作流数据列表(以合同为例) | `GET` | `/workflow/contract` |
| `getContract` | 获取工作流数据详情(以合同为例) | `GET` | `/workflow/contract/1` |
| `create` | 创建工作流数据(以合同为例) | `POST` | `/workflow/contract` |
| `update` | 修改工作流数据(以合同为例) | `PUT` | `/workflow/contract/{contractID}` |
| `delete` | 删除工作流事项(以合同为例) | `DELETE` | `/workflow/contract/{contractID}` |

## 获取工作流数据列表(以合同为例)

- SDK 调用：`request("workflow/list", params)`
- HTTP：`GET /workflow/contract`
- 动作类型：`list`

### 路径参数

无路径参数。

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`dataList`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/list");
```
## 获取工作流数据详情(以合同为例)

- SDK 调用：`request("workflow/getContract", params)`
- HTTP：`GET /workflow/contract/1`
- 动作类型：`get`

### 路径参数

无路径参数。

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 结果字段：`data`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/getContract");
```
## 创建工作流数据(以合同为例)

- SDK 调用：`request("workflow/create", params)`
- HTTP：`POST /workflow/contract`
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
      "description": "合同名称"
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
  "name": "test"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/create", {
  "name": "<string>"
});
```
## 修改工作流数据(以合同为例)

- SDK 调用：`request("workflow/update", params)`
- HTTP：`PUT /workflow/contract/{contractID}`
- 动作类型：`update`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `contractID` | 合同ID |

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
      "description": "合同名称"
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
  "name": "contract1"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/update", {
  "contractID": 1,
  "name": "<string>"
});
```
## 删除工作流事项(以合同为例)

- SDK 调用：`request("workflow/delete", params)`
- HTTP：`DELETE /workflow/contract/{contractID}`
- 动作类型：`delete`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `contractID` | 合同ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/delete", {
  "contractID": 1
});
```
