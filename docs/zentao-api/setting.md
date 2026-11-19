# 系统设置 (setting)



## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `workHours` | 获取工时设置 | `GET` | `/settings/workhours` |

## 获取工时设置

dailyWorkHours 是每日可用工时，单位为小时。effortUnit 是工时展示单位，day 表示日，hour 表示小时。

- SDK 调用：`request("setting/workHours", params)`
- HTTP：`GET /settings/workhours`
- 动作类型：`get`
- 最低禅道版本：`23.0` / `biz14.0` / `max9.0` / `ipd6.0`

### 路径参数

无路径参数。

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 对象类型：无统一对象类型
- 结果字段：`custom`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("setting/workHours");
```
