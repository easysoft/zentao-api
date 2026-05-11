# 常见 API 示例

本页示例使用高阶 `request("module/action")`。可用模块和动作来自 SDK 模块注册表，完整列表见 [ZenTao API](/zentao-api/)。

## 获取产品列表

```ts
import { ZentaoClient, request } from 'zentao-api';

ZentaoClient.init({
  baseUrl: 'https://zentao.example.com',
  token: 'your-token',
});

const result = await request('product/list', {
  recPerPage: 20,
  pageID: 1,
});

console.log(result.data);
console.log(result.pager);
```

## 获取 Bug 列表

Bug 列表支持按产品、项目或执行范围查询。传入对应范围 ID 后，SDK 会根据模块动作定义组装路径。

```ts
const bugs = await request('bug/list', {
  productID: 1,
  status: 'active',
  recPerPage: 20,
});
```

## 解决 Bug

```ts
const result = await request('bug/resolve', {
  bugID: 1001,
  resolution: 'fixed',
  resolvedBuild: 12,
});

console.log(result.status);
```

## 创建任务

```ts
const task = await request('task/create', {
  execution: 1,
  name: '实现文档站',
  type: 'devel',
  assignedTo: 'dev1',
});
```

## 直接调用 REST 路径

当你需要调用尚未注册到模块系统的接口时，可以使用底层 `ZentaoClient.request()`。

```ts
import { ZentaoClient } from 'zentao-api';

const client = new ZentaoClient({
  baseUrl: 'https://zentao.example.com',
  token: 'your-token',
});

const raw = await client.request('/products/1', {
  method: 'GET',
});
```

## 限制返回列表数量

`limit` 只影响 SDK 归一化后的 `data` 数组，不改变服务端返回页大小。

```ts
const bugs = await request(
  'bug/list',
  { productID: 1, recPerPage: 100 },
  { limit: '10' },
);

console.log(bugs.data);
```
