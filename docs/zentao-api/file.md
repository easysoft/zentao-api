# 附件 (file)

附件管理，支持上传附件，使用【表单formdata】方式提交，不支持json、编辑附件，修改附件的名称、删除附件

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `create` | 上传附件，使用【表单formdata】方式提交，不支持json | `POST` | `/files` |
| `update` | 编辑附件，修改附件的名称 | `PUT` | `/files/{fileID}` |
| `delete` | 删除附件 | `DELETE` | `/files/{fileID}` |

## 上传附件，使用【表单formdata】方式提交，不支持json

- SDK 调用：`request("file/create", params)`
- HTTP：`POST /files`
- 动作类型：`create`

### 路径参数

无路径参数。

### 查询参数

无查询参数。

### 请求体

请求体必填：是
请求媒体类型：`multipart/form-data`

Schema:

```json
{
  "type": "object",
  "properties": {
    "file": {
      "type": "string",
      "format": "binary",
      "description": "待上传文件；Node.js/Bun 可传本地文件路径，浏览器传 File 或 Blob"
    },
    "objectType": {
      "type": "string",
      "description": "关联对象类型(bug 缺陷 | story 需求 | task 任务 | testcase 用例)"
    },
    "objectID": {
      "type": "integer",
      "description": "关联对象ID",
      "format": "int32"
    }
  },
  "required": [
    "file",
    "objectType",
    "objectID"
  ]
}
```

示例:

```json
{
  "file": "/path/to/file",
  "objectType": "<string>",
  "objectID": 1
}
```

### 返回值

- 返回形态：`object`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("file/create", {
  "file": "/path/to/file",
  "objectType": "<string>",
  "objectID": 1
});
```
## 编辑附件，修改附件的名称

- SDK 调用：`request("file/update", params)`
- HTTP：`PUT /files/{fileID}`
- 动作类型：`update`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `fileID` | 附件ID |

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

const result = await request("file/update", {
  "fileID": 1,
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
