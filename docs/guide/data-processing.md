# 本地数据处理

`request()` 在归一化服务端响应后，可对返回的列表（或单条对象）做本地处理：**过滤、模糊搜索、排序、限制数量、字段摘取**。这些处理在 SDK 内存中完成，不改变服务端请求参数或返回的页大小。

处理按固定顺序执行：

> 过滤 `filter` → 搜索 `search` → 排序 `sort` → 限制数量 `limit` → 摘取 `pick`

所有选项都通过 `request()` 的第三个参数传入。为方便 CLI 透传，`limit` 以字符串形式表示。

```ts
const bugs = await request(
  'bug/list',
  { productID: 1, recPerPage: 100 },
  {
    filter: ['status=active', 'pri>=2'],
    search: ['登录'],
    sort: 'pri:desc,id:asc',
    limit: '10',
    pick: ['id', 'title', 'pri'],
  },
);
```

## 过滤 filter

`filter` 是一组过滤表达式，多条之间按 **AND** 组合。表达式格式为 `字段 运算符 值`，字段名支持用 `.` 访问子字段。

```ts
const result = await request(
  'bug/list',
  { productID: 1 },
  { filter: ['status=active', 'pri>=2', 'assignedTo.id=5'] },
);
```

支持的运算符：

| 运算符 | 含义 | 示例 |
| --- | --- | --- |
| `=` / `!=` | 等于 / 不等于 | `status=active` |
| `>` / `<` / `>=` / `<=` | 数值或字符串比较 | `pri>=2` |
| `~` / `!~` | 包含 / 不包含（大小写不敏感） | `title~登录` |

值会被自动转换类型：`true` / `false` 转布尔，纯数字转数字，`[a,b,c]` 形式转为数组。数组值配合 `=`/`!=`/`~`/`!~` 表示「任一命中 / 全不命中」。

```ts
// status 为 active 或 resolved 之一
{ filter: ['status=[active,resolved]'] }
```

数值比较对两端都可转为数字的值按数字比较，否则按字符串 `localeCompare`。

## 模糊搜索 search

`search` 对记录做大小写不敏感的关键词匹配。每个元素是一个关键词串，**组内以空白分隔为 OR**，**多组之间按 AND 组合**。

```ts
// （登录 或 注册）且 超时
{ search: ['登录 注册', '超时'] }
```

缺省搜索全部字段。可用 `searchFields` 限定参与搜索的字段（同样支持 `.` 子字段）：

```ts
{ search: ['登录'], searchFields: ['title', 'steps'] }
```

## 排序 sort

`sort` 为单个字符串，多个排序字段以英文逗号分隔，按先后顺序生效。每个字段格式为 `字段:asc|desc`，省略方向时默认 `asc`。

```ts
// 先按优先级降序，优先级相同再按 id 升序
{ sort: 'pri:desc,id:asc' }
```

数值字段按数字比较，否则按字符串 `localeCompare`。排序返回新数组，不修改原数据。

## 限制数量 limit

`limit` 在排序之后、摘取之前截断列表，只影响 SDK 返回的 `data` 数组，不改变服务端返回的页大小。

```ts
const bugs = await request(
  'bug/list',
  { productID: 1, recPerPage: 100 },
  { limit: '10' },
);
```

取值为非负整数（字符串形式）；为空、非数字或负数时忽略（不限制）。本次调用的 `limit` 优先，缺省时回落到全局默认 `limit`（见 [全局选项](/guide/installation)）。

对非对象数组（例如 ID 列表）只有 `limit` 生效，其余处理不适用。

## 字段摘取 pick

`pick` 只保留指定字段，支持 `.` 访问子字段并保留嵌套结构。处理列表时返回列表，处理单条对象时返回单条对象。

```ts
// 列表：每条只保留 id、title 和 assignedTo.realname
const bugs = await request(
  'bug/list',
  { productID: 1 },
  { pick: ['id', 'title', 'assignedTo.realname'] },
);

// 单条：bug/123 等价于 bug/get，pick 同样生效
const bug = await request('bug/123', {}, { pick: ['id', 'title'] });
```

## 跳过处理：原始响应 raw

传入 `raw: true` 时，`request()` 直接返回服务端响应体，**跳过归一化与上述全部本地处理**（`filter` / `search` / `sort` / `limit` / `pick` 均不生效），也不会触发 `throwOnFail`。适合需要拿到未经加工的原始数据、自行解析分页或调试接口返回的场景。

```ts
// 返回原始响应体，不做任何处理
const raw = await request('bug/list', { productID: 1 }, { raw: true });
```

缺省为 `false`。

## 直接调用处理函数

上述能力也以独立函数形式导出，可脱离 `request()` 对任意数据使用。详细签名见 [Reference](/reference/)。

```ts
import { processData, filterData, searchData, sortData, pickFields } from 'zentao-api';

const list = [
  { id: 1, title: '登录失败', pri: 3, status: 'active' },
  { id: 2, title: '注册超时', pri: 1, status: 'resolved' },
];

// 串联编排，等价于 request 内部按固定顺序的处理
const result = processData(list, {
  filter: ['status=active'],
  sort: 'pri:desc',
  pick: ['id', 'title'],
});
```

`processData` 处理单条对象时仅支持 `pick`；`filterData` / `searchData` / `sortData` 等单步函数则提供更细粒度的入参（如条件组、自定义比较函数），适合需要程序化构造处理逻辑的场景。
