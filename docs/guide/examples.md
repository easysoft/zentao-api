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

## 确认 Bug

```ts
await request('bug/confirm', { bugID: 1001, comment: '已确认问题' });
```

省略 `status`、`assignedTo`、`type`、`pri`、`deadline` 或 `mailto` 时，SDK 会先读取当前 Bug，再补齐这些字段，避免服务端将缺省字段重置。显式传入的值（包括 `data` 中的值）保持优先级；全部提供时不额外读取详情。预读失败或状态为空时终止写入，此行为不依赖 `autoFill`。

已关闭 Bug 的指派人可能是特殊值 `closed`，不能作为账号回传。确认这类 Bug 时请明确提供有效的 `assignedTo`；省略 `status` 会保留其已关闭状态。

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

## 在请求发送前调整请求数据

通过 `extendModuleAction()` 为动作设置 `beforeRequest`。SDK 会等待回调完成，再准备请求体并发送请求。

```ts
import { extendModuleAction, request } from 'zentao-api';

extendModuleAction('product', 'list', {
  beforeRequest: async (command) => ({
    query: { ...command.query, recPerPage: 50 },
  }),
});

const products = await request('product');
```

回调可以直接修改解析后的请求，也可以返回 `path`、`query`、`data`、`params`、`id` 的部分字段作为补丁。返回值浅合并到请求描述中，同名字段以返回值为准，`query`、`data`、`params` 等对象字段整体替换，需要保留原字段时可像上例一样展开。自定义 `ModuleAction.request` 也会收到合并后的请求。回调报错会终止本次请求，错误原样传递。

回调执行时，版本检查、`autoFill` 和参数解析已经完成，补丁不会重新执行这些步骤。修改 `params` 会影响后续结果和分页 getter 的入参；调整实际发送的路径、查询参数或请求体，应分别返回 `path`、`query` 或 `data`。超时、客户端、响应处理等选项仍通过 `request()` 的第三个参数传入。

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

## 当前用户基础资料

禅道 `23.0 / biz14.0 / max9.0 / ipd6.0` 起，可以查询当前 Token 对应用户的基础资料：

```ts
const me = await request('my/info');
console.log(me.data?.account, me.data?.realname);
```

返回字段为 `id、dept、account、realname、nickname、avatar、role、type`，其中 `avatar` 可为空字符串或 `null`。

## 上传附件与下载二进制

Node.js/Bun 中，高阶 `request()` 可以直接读取本地文件路径并按 `multipart/form-data` 上传。单个文件的默认大小上限为 50 MiB，可通过 `maxUploadBytes` 调整。

不关联业务对象时，可省略 `objectType` 和 `objectID`。

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

禅道 `23.0 / biz14.0 / max9.0 / ipd6.0` 起，上传文档编辑器图片可增加可选的 `extra`：

```ts
await request('file/create', {
  file: '/tmp/editor-image.png',
  extra: 'editor',
});
```

`extra` 也可放在 `params.data` 中，优先于平铺参数。省略时默认发送 `'editor'`，普通附件可显式传 `extra: ''`。上传接口的最低版本保持不变；该字段仅用于上传。

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

查询附件元数据使用 `file/get`，最低版本为 `22.5 / biz13.5 / max8.5 / ipd5.5`：

```ts
const attachment = await request('file/get', { fileID: 42 });
const sameAttachment = await request('file/42');
// fileID 也接受既有 Base64 编码 gid，按原值传入，由 SDK 编码路径段。
```

禅道 `23.0 / biz14.0 / max9.0 / ipd6.0` 起，使用 `file/read` 读取内容：

```ts
const content = await request('file/read', { fileID: 42 });
if (content.data instanceof ArrayBuffer) {
  const bytes = new Uint8Array(content.data);
  console.log(bytes.byteLength);
}

const base64 = await request('file/read', { fileID: 42, stream: 1 });
console.log(base64.data); // Base64 字符串
```

`stream` 默认为 `0`，也接受字符串 `"0"`、`"1"`。静态结果类型为 `ArrayBuffer | string`；`raw: true` 直接返回内容。两种模式都完整载入内存，HTTP 错误沿用 `E_HTTP_ERROR`，错误正文保留在 `details.body`。

也可以通过底层客户端选择响应类型；`/files/42` 返回元数据，`/files/42/read` 返回文件内容：

```ts
const bytes = await client.request('/files/42/read', {
  responseType: 'arrayBuffer',
});
```

大文件需要流式读取时，使用 `responseType: 'response'` 并消费返回的 `response.body`。

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

`product/create`、`product/update`、`feedback/close`、`bug/confirm` 还会校验响应 JSON。即使 HTTP 为 200，PHP 警告、SQL 错误文本或空响应也会返回失败；原始文本保存在 `raw.responseText`，使用 `raw: true` 时位于返回对象的 `responseText`。异常响应可能发生在部分字段已写入之后，应先回读对象再决定是否重试。

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
