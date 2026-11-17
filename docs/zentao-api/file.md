# 附件 (file)

附件管理，支持上传附件，使用【表单formdata】方式提交，不支持json、编辑附件，修改附件的名称、删除附件

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `create` | 上传附件，使用【表单formdata】方式提交，不支持json | `POST` | `/files` |
| `update` | 编辑附件，修改附件的名称 | `PUT` | `/files/{fileID}` |
| `delete` | 删除附件 | `DELETE` | `/files/{fileID}` |
| `get` | 获取附件信息 | `GET` | `/files/{fileID}` |
| `read` | 读取附件内容 | `GET` | `/files/{fileID}/read` |

## 上传附件，使用【表单formdata】方式提交，不支持json

- SDK 调用：`request("file/create", params)`
- HTTP：`POST /files`
- 动作类型：`create`
- 最低禅道版本：`22.0` / `biz13.0` / `max8.0` / `ipd5.0`

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
      "description": "本地文件路径，将按 multipart/form-data 上传",
      "format": "binary"
    },
    "objectType": {
      "type": "string",
      "description": "关联对象类型(bug 缺陷 | story 需求 | task 任务 | testcase 用例)",
      "required": false
    },
    "objectID": {
      "type": "integer",
      "description": "关联对象ID",
      "format": "int32",
      "required": false
    },
    "extra": {
      "type": "string",
      "defaultValue": "editor",
      "description": "附件标记，默认 editor（文档编辑器图片），23.0 / biz14.0 / max9.0 / ipd6.0 起支持；显式空字符串用于普通附件，其他值由服务端按空字符串处理",
      "options": [
        {
          "value": "",
          "label": "普通附件"
        },
        {
          "value": "editor",
          "label": "文档编辑器图片"
        }
      ]
    }
  },
  "required": [
    "file"
  ]
}
```

示例:

```json
{
  "file": "/tmp/zentao-apidoc-test.txt",
  "objectType": "story",
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
  "objectID": 1,
  "extra": "<string>"
});
```
## 编辑附件，修改附件的名称

- SDK 调用：`request("file/update", params)`
- HTTP：`PUT /files/{fileID}`
- 动作类型：`update`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

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
  "fileName": "test2.txt"
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
- 最低禅道版本：`22.0` / `biz13.0` / `max8.0` / `ipd5.0`

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
## 获取附件信息

查询附件元数据；fileID 支持数字 ID 或既有 Base64 编码 gid。读取文件内容请使用 file/read。

- SDK 调用：`request("file/get", params)`
- HTTP：`GET /files/{fileID}`
- 动作类型：`get`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `fileID` | 附件 ID 或 Base64 编码 gid |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 结果字段：`file`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("file/get", {
  "fileID": 1
});
```
## 读取附件内容

默认返回 ArrayBuffer；stream=1 返回 Base64 字符串。两种模式均完整载入内存，大文件流式读取可使用底层客户端的 responseType: response。

- SDK 调用：`request("file/read", params)`
- HTTP：`GET /files/{fileID}/read`
- 动作类型：`get`
- 最低禅道版本：`23.0` / `biz14.0` / `max9.0` / `ipd6.0`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `fileID` | 附件数字 ID |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `stream` | number | 否 | `0` | 返回格式<br>`0` 原始文件内容<br>`1` Base64 文本 |

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 结果字段：`custom`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("file/read", {
  "fileID": 1,
  "stream": 0
});
```
