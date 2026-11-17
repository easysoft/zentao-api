# 代码库空间 (space)

需部署代码库 API 2.0 实现，仅返回当前用户可访问的未删除空间。

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取代码库空间列表 | `GET` | `/spaces` |

## 获取代码库空间列表

需 space.browse 权限，按空间 ID 降序排列；先按当前用户权限过滤，再分页。

- SDK 调用：`request("space/list", params)`
- HTTP：`GET /spaces`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `pageID` | number | 否 | `1` | 页码，从 1 开始的正整数 |
| `recPerPage` | number | 否 | `20` | 每页条数，范围 1～100 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 对象类型：`space`
- 结果字段：`spaces`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("space/list", {
  "pageID": 1,
  "recPerPage": 20
});
```
