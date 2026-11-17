# 项目流程 (workflowgroup)

项目流程管理，支持获取项目流程列表

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取项目流程列表 | `GET` | `/workflowgroups` |

## 获取项目流程列表

- SDK 调用：`request("workflowgroup/list", params)`
- HTTP：`GET /workflowgroups`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `all` | 项目流程状态筛选，默认 all<br>`all` 全部<br>`normal` 正常<br>`pause` 已停用 |
| `orderBy` | string | 否 |  | 排序字段。 |
| `recPerPage` | number | 否 |  | 每页数量。 |
| `pageID` | number | 否 |  | 页码。 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 对象类型：`workflowgroup`
- 结果字段：`groups`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflowgroup/list", {
  "browseType": "all",
  "orderBy": "<string>",
  "recPerPage": 1,
  "pageID": 1
});
```
