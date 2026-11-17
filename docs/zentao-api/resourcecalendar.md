# 人力资源日历 (resourcecalendar)

人力资源日历管理，支持查询人力资源日历

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `get` | 查询人力资源日历 | `GET` | `/resourcecalendars` |

## 查询人力资源日历

- SDK 调用：`request("resourcecalendar/get", params)`
- HTTP：`GET /resourcecalendars`
- 动作类型：`get`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `type` | string | 否 | `company` | 日历维度，默认 company<br>`company` 按部门<br>`person` 按人员 |
| `mode` | string | 否 | `wait` | 统计模式，默认 wait<br>`wait` 待处理<br>`done` 已完成 |
| `accounts` | string | 否 |  | 逗号分隔的用户账号；结果会继续按部门、项目和用户权限过滤。 |
| `projectID` | number | 否 |  | 项目 ID；传入后仅查询该项目成员的日历数据。 |
| `depts` | string | 否 |  | 逗号分隔的部门 ID；仅拥有查看所有人权限时生效。 |

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 对象类型：无统一对象类型
- 结果字段：`resourceCalendars`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("resourcecalendar/get", {
  "type": "company",
  "mode": "wait",
  "accounts": "<string>",
  "projectID": 1,
  "depts": "<string>"
});
```
