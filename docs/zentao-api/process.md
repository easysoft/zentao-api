# 过程裁剪 (process)

过程裁剪管理，支持获取过程裁剪列表，支持获取项目/执行下的过程裁剪、提交项目过程裁剪结果、提交执行过程裁剪结果

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取过程裁剪列表，支持获取项目/执行下的过程裁剪 | `GET` | `/{scope}/{scopeID}/processes` |
| `setProject` | 提交项目过程裁剪结果 | `POST` | `/projects/{projectID}/processes` |
| `setExecution` | 提交执行过程裁剪结果 | `POST` | `/executions/{executionID}/processes` |

## 获取过程裁剪列表，支持获取项目/执行下的过程裁剪

- SDK 调用：`request("process/list", params)`
- HTTP：`GET /{scope}/{scopeID}/processes`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `scope` | 过程裁剪所属范围 |
| `scopeID` | 所属范围ID |

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `wait` | 过程裁剪筛选类型，默认 wait<br>`wait` 待裁剪<br>`yes` 已裁剪适用<br>`no` 已裁剪不适用 |
| `moduleID` | number | 否 | `0` | 过程 ID，用于只查询指定过程下的活动和交付物；默认 0。 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 对象类型：`process`
- 结果字段：`processList`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("process/list", {
  "scope": "<string>",
  "scopeID": 1,
  "browseType": "wait",
  "moduleID": "0"
});
```
## 提交项目过程裁剪结果

- SDK 调用：`request("process/setProject", params)`
- HTTP：`POST /projects/{projectID}/processes`
- 动作类型：`action`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

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
    "items": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "裁剪结果列表，每项包含 type(activity 活动 | deliverable 交付物)、id(对象ID)、result(yes 适用 | no 不适用)"
    }
  },
  "required": [
    "items"
  ]
}
```

示例:

```json
{
  "items": [
    {
      "type": "activity",
      "id": 475,
      "result": "yes"
    }
  ]
}
```

### 返回值

- 返回形态：`text`
- 对象类型：无统一对象类型

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("process/setProject", {
  "projectID": 1,
  "items": [
    "<string>"
  ]
});
```
## 提交执行过程裁剪结果

- SDK 调用：`request("process/setExecution", params)`
- HTTP：`POST /executions/{executionID}/processes`
- 动作类型：`action`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `executionID` | 执行ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "items": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "裁剪结果列表，每项包含 type(activity 活动 | deliverable 交付物)、id(对象ID)、result(yes 适用 | no 不适用)"
    }
  },
  "required": [
    "items"
  ]
}
```

示例:

```json
{
  "items": [
    {
      "type": "activity",
      "id": 475,
      "result": "yes"
    }
  ]
}
```

### 返回值

- 返回形态：`text`
- 对象类型：无统一对象类型

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("process/setExecution", {
  "executionID": 1,
  "items": [
    "<string>"
  ]
});
```
