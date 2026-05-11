# 附件 (file)

附件管理，支持编辑附件，修改附件的名称、删除附件

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `create` | 编辑附件，修改附件的名称 | `POST` | `/files` |
| `delete` | 删除附件 | `DELETE` | `/files/{fileID}` |

## 编辑附件，修改附件的名称

- SDK 调用：`request("file/create", params)`
- HTTP：`POST /files`
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
    "fileName": {
      "type": "string",
      "description": "附件名称"
    }
  },
  "required": [
    "fileName"
  ]
}
```

示例:

```json
{
  "fileName": "<string>"
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("file/create", {
  "fileName": "<string>"
});
```
## 删除附件

- SDK 调用：`request("file/delete", params)`
- HTTP：`DELETE /files/{fileID}`
- 动作类型：`delete`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `fileID` | 附件ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("file/delete", {
  "fileID": 1
});
```
