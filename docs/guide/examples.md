# 常见 API 示例

本页示例使用高阶 `request()`。请求名可以写成 `module`（默认列表）、`module/action` 或 `module/<objectID>`（详情快捷写法）。可用模块和动作来自 SDK 模块注册表，完整列表见 [ZenTao API](/zentao-api/)。

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

也可以省略 `/list`，直接使用模块名：

```ts
const result = await request('product', {
  recPerPage: 20,
});
```

## 获取产品详情

详情接口可以使用完整动作名，也可以把对象 ID 写在请求名里。

```ts
const product = await request('product/1');
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

## 上传附件与下载二进制

Node.js/Bun 中，高阶 `request()` 可以直接读取本地文件路径并按 `multipart/form-data` 上传。单个文件的默认大小上限为 50 MiB，可通过 `maxUploadBytes` 调整。

```ts
await request('file/create', {
  file: '/tmp/zentao-api-upload.txt',
  objectType: 'story',
  objectID: 1001,
}, {
  maxUploadBytes: 10 * 1024 * 1024,
});
```

浏览器不能读取本地路径，需要传入用户选择的 `File` 或 `Blob`：

```ts
await request('file/create', {
  file: fileInput.files![0],
  objectType: 'bug',
  objectID: 1001,
});
```

也可以直接使用底层客户端。它会自动识别 `FormData`、`Blob`、`ArrayBuffer`、`URLSearchParams` 等原生请求体；普通对象默认按 JSON 发送。

```ts
const form = new FormData();
form.set('file', file);
form.set('objectType', 'bug');
form.set('objectID', '1001');

await client.request('/files', {
  method: 'POST',
  body: form,
});
```

需要下载文件或其他二进制内容时，指定 `responseType`：

```ts
const bytes = await client.request<ArrayBuffer>('/files/42', {
  responseType: 'arrayBuffer',
});
```

## 限制返回列表数量

`limit` 只影响 SDK 归一化后的 `data` 数组，不改变服务端返回页大小。

```ts
const bugs = await request(
  'bug/list',
  { productID: 1, recPerPage: 100 },
  { limit: 10 },
);

console.log(bugs.data);
```

## 把服务端失败响应转为异常

`request()` 默认按原样返回 `{ status: "fail" }` 响应；启用 `throwOnFail` 后会抛出 `E_API_FAILED`。

```ts
import { request, ZentaoError } from 'zentao-api';

try {
  await request('bug/resolve', { bugID: 1001, resolution: 'fixed' }, { throwOnFail: true });
} catch (error) {
  if (error instanceof ZentaoError && error.code === 'E_API_FAILED') {
    console.error(error.message);
    console.error(error.details); // 原始归一化响应
  }
}
```

## 收窄响应数据类型

`request<T>()` 的泛型参数会落到 `ResponseData<T>.data`，可在调用点直接收窄业务字段类型。

```ts
interface ProductSummary {
  id: number;
  name: string;
}

const result = await request<ProductSummary[]>('product/list', {});
result.data?.forEach((product) => console.log(product.name));
```
