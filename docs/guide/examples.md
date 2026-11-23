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

## 按需翻页

`request()` 读取指定的一页。`iteratePages()` 默认从第 1 页开始，第一次进入循环才发送请求。下面的查询在找到第一个名称含“发布”的仓库时结束。

```ts
import { iteratePages } from 'zentao-api';

async function findReleaseRepo(spaceID: number) {
  for await (const page of iteratePages<{ id: number; name: string }>(
    'repo/list',
    { spaceID, recPerPage: 20, orderBy: 'id_asc' },
    { search: ['发布'], searchFields: ['name'] },
  )) {
    if (page.data.length) return page.data[0];
  }
}
```

用 `pageID` 指定起始页，支持 `page` 别名。筛选、搜索、排序和 `limit` 都作用于当前页。即使本地匹配数为零，只要服务端分页信息显示还有记录，继续迭代就会请求下一页。退出循环后停止取页。

迭代器交付的每页都有 `data` 和 `pager`。缺少有效分页信息、服务端回传的页码与请求不符，或服务端返回空列表却声明还有后页时，本次迭代抛出 `E_PAGINATION_INCOMPLETE`。业务失败沿用 `E_API_FAILED`。

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
const me = await request('my/profile');
console.log(me.data?.account, me.data?.realname);
```

返回字段为 `id、dept、account、realname、nickname、avatar、role、type`，其中 `avatar` 可为空字符串或 `null`。

## 上传附件与下载二进制

Node.js/Bun 中，高阶 `request()` 可以直接读取本地文件路径并按 `multipart/form-data` 上传。单个文件的默认大小上限为 50 MiB，可通过 `maxUploadBytes` 调整。

不关联业务对象时，可省略 `objectType` 和 `objectID`。

`file/create` 将回执里的有效文件 ID 统一放在 `data.id`，类型为数字。支持直接返回 ID、顶层 `id`、`data.id`，以及 `data` 本身为 ID 的回执。

`file/create` 和 `file/delete` 会检查回执顶层和 `data` 中的 `status`、`result`。若一层明确失败，归一化响应返回 `status: 'fail'` 和 `writeOutcome: 'rejected'`，并优先采用失败层的消息。设置 `throwOnFail: true` 时抛出 `E_API_FAILED`。

直接删除和富文本附件自动清理都以顶层成功标记确认删除。若回执只有文件 ID，`file/delete` 的 `writeOutcome` 为 `unknown`，自动清理会记录 `cleanup` 警告。

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

`file/update` 用于修改文件名称，要求 `fileID` 和 `fileName`，最低版本为 `22.5 / biz13.5 / max8.5 / ipd5.5`：

```ts
await request('file/update', { fileID: 42, fileName: 'report.pdf' });
```

要为同一对象预上传图片，给 `file/create` 传入唯一的 `uid`。随后用同一客户端和 Token 保存对象，在保存参数中传入相同的值。以下 Node.js 示例把预上传的图片显示在 Bug 步骤里。

```ts
import { randomUUID } from 'node:crypto';

const uid = randomUUID();
const uploaded = await request('file/create', { uid, file: '/tmp/screenshot.png' }, { client, throwOnFail: true });
await request('bug/update', {
  id: 46,
  uid,
  steps: `<img src="file:${uploaded.data!.id}" alt="复现截图">`,
}, { client });
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

## 用 Markdown 写入富文本

`request()` 接受应用提供的 `renderMarkdown` 回调，可以同步或异步返回 HTML。例如，使用应用里的 Marked 渲染需求描述：

```ts
import { marked } from 'marked';
import { request } from 'zentao-api';

await request('story/change', {
  id: 1001,
  title: '登录需求',
  data: { spec: '**验收条件**：用户可以登录', verify: '' },
}, {
  renderMarkdown: markdown => marked.parse(markdown),
});
```

SDK 只将本次 POST / PUT 显式提交的顶层富文本字段传给回调，第二个参数包含 `module`、`action` 和 `field`。`params.data` 支持对象和 JSON 字符串，同名字段优先于平铺参数。空字符串可清空字段，空白和已有 HTML 保留原文。渲染完成后才执行 `autoFill` 预读、`beforeRequest` 和 HTML 图片处理。渲染失败会中止本次写入。

协同文档的 `content` 默认按 Markdown 提交，包括正文里的图片示例。要把它渲染为 HTML，在创建或更新文档时显式传入 `contentType: 'html'`。应用也可以用 `setGlobalOptions({ renderMarkdown })` 配置默认回调，单次传 `renderMarkdown: false` 可关闭。

<a id="html-富文本文件"></a>

## HTML 富文本图片

`request()` 仅处理请求体中描述以 `(HTML)` 结尾或 `textType: 'html'` 的顶层字符串字段。SDK 在 `beforeRequest` 后识别 `<img src>`。`<a>` 的属性和文字原样提交，链接内的图片也会处理。

Node.js/Bun 可以在 HTML 中使用本地文件 URL：

```ts
const result = await request('story/change', {
  id: 1001,
  title: '登录需求',
  spec: '<img src="file:///tmp/screenshot.png" alt="screenshot.png">'
    + '<img src="file:42" alt="existing.png">',
});

console.log(result.fileWarnings);
```

`file:///tmp/screenshot.png` 表示绝对路径，`file://path/to/screenshot.png` 表示相对当前工作目录的路径。SDK 将上传返回的 `url` 写入图片 `src`，保留部署子目录和查询参数。对于 `file:42` 或仅返回 ID 的上传响应，SDK 按服务器路由配置生成站内链接，例如 `/file-read-42.png`。

只需解析 URL 时，可从 `zentao-api/url` 导入工具，无需加载 HTTP 客户端或 HTML 解析器。主入口也导出相同的函数。用 `extractFileIdFromUrl` 从图片 `src` 或附件下载链接提取文件 ID。相对路径可直接传入。带域名的 URL 还需传入禅道站点地址（含安装目录），站点或文件路由不匹配时返回 `undefined`。

```ts
import { extractFileIdFromUrl, parseFileUrl } from 'zentao-api/url';

extractFileIdFromUrl('/sub-path/file-read-298.png'); // 298
extractFileIdFromUrl('/sub-path/file-download-298-left.html'); // 298
extractFileIdFromUrl(
  'https://example.com/sub-path/?module=file&amp;method=read&amp;fileID=298',
  'https://example.com/sub-path',
); // 298

parseFileUrl('/sub-path/file-read-298.WEBP'); // { fileID: 298, method: 'read', extension: 'webp' }
parseFileUrl('/file-download-298-left.html'); // { fileID: 298, method: 'download' }
```

用 `readImageFile` 读取当前站点的图片，可传 URL、同站点的解析结果或数字 ID。路径带已知图片后缀时直接调用 `file/read`。数字 ID 和无后缀的读取链接先查 `file/get`，以 `extension` 为准，缺省时取 `title` 后缀。查询式链接中的 `t=png` 等视图参数可能是默认值。

下载链接、有歧义的查询和非图片路径会在请求前返回 `undefined`。元数据表明附件不是图片或读取到空内容时也返回 `undefined`，请求错误会抛出。

```ts
import { readImageFile } from 'zentao-api';

const image = await readImageFile('/sub-path/index.php?m=file&f=read&fileID=298&t=png', { client });
if (image) {
  // 若附件元数据的 extension 是 webp，文件名为 298.webp，MIME 类型为 image/webp。
  const { filename, contentType, data } = image;
  console.log(filename, contentType, data.byteLength);
}
```

用 `extractFileIdsFromHtml(html, siteUrl)` 处理整段富文本。它按 `<img>` 的出现顺序返回匹配的 `[imgSrc, zentaoFileID]`，保留重复引用。返回的 `src` 是 HTML 实体解码后的属性值。没有匹配图片时返回 `[]`。

```ts
import { extractFileIdsFromHtml } from 'zentao-api';

const html = '<img src="/file-read-298.png"><img src="/?m=file&amp;f=read&amp;fileID=42">';
const images = extractFileIdsFromHtml(html, 'https://example.com/zentao');
// [['/file-read-298.png', 298], ['/?m=file&f=read&fileID=42', 42]]
```

浏览器通过解析器提供用户选中的 File 或 Blob：

```ts
const file = fileInput.files![0];
await request('story/change', {
  id: 1001,
  title: '登录需求',
  spec: '<img src="image-1" alt="screenshot.png">',
}, {
  fileResolver: { 'image-1': { blob: file, name: 'screenshot.png' } },
});
```

解析器也可以是同步或异步函数，接收 `{path, name}`，返回字符串路径、`{path, name?}`、`{blob, name?}` 或 `{url, name?}`。例如：

```ts
import { setGlobalOptions, type FileResolver } from 'zentao-api';

const fileResolver: FileResolver = async ({ path, name }) => {
  const blob = await loadLocalAttachment(path);
  return { blob, name };
};

setGlobalOptions({
  fileResolver,
  continueOnFileResolveError: true,
  onFileError: warning => console.warn(warning.stage, warning.field, warning.path, warning.message),
});
```

`loadLocalAttachment` 由应用提供。单次请求的同名选项覆盖全局配置，解析器对象整体替换。SDK 按引用逐个调用解析器，在首次上传前完成解析。

文件名优先取图片的 `alt`，再取来源路径中的文件名。映射依次按引用路径、文件名查找自身属性；映射值为字符串时用命中的 key 作文件名。函数返回值或对象值未指定名称时沿用输入名称。

HTTP(S)、协议相对 URL 和已有禅道图片链接直接保留。没有解析器时，`image-1`、`images/a.png`、`/uploads/a.png` 等原始引用按原样提交。解析器也可以返回网络 URL 直接替换图片地址。

### 上传与对象保存

有图片需要上传时，SDK 为本次保存生成一个随机 `uid`。同一对象的各个富文本字段共用这个值。每张新图片通过 `POST /files?uid=X&extra=editor` 的 multipart 字段 `file` 上传，随后对象写请求在 JSON 体中提交同一个 `uid`。服务端在保存对象时绑定整批图片。相同来源和文件名在一次请求中只上传一次，各图片依次上传，沿用 `maxUploadBytes` 的单文件限制。

手动预上传的图片可以与自动上传的图片共用同一批次。`params.data.uid` 优先于 `params.uid`。显式值只接受字母、数字、下划线和连字符，`0`、`1`、`apiv2` 和 `used` 为保留值。每个对象使用独立的值，上传和保存期间使用同一个 Token。已有图片 URL 或文件 ID 也可以配合显式 `uid` 保存。

`uid` 绑定要求 `23.0 / biz14.0 / max9.0 / ipd6.0` 或更新版本，并且部署须包含服务端提交 `0a4de3a66f5` 或等效修复。较早构建会覆盖客户端提供的 `uid`。服务端按批次绑定全部上传，只有需要归属到该对象的图片才应使用这个值。

调用方可在读取本地或会话图片之前查询版本能力。已知版本可直接传入，缺省时使用全局版本或客户端的站点配置缓存。`forceRefreshConfig: true` 使用实际站点版本。配置读取失败默认抛错，显式允许 `skipVersionCheckOnConfigError` 时返回 `undefined`，表示版本未知。

```ts
import { supportsFileBinding } from 'zentao-api';

const canBind = await supportsFileBinding({ client });
const ipdSupported = await supportsFileBinding({ version: 'ipd6.0' }); // true，无需请求
```

### 失败与恢复

- 解析器抛错、映射未命中或返回无效来源时，默认在首次上传前抛出 `E_FILE_RESOLVE_FAILED`。设置 `continueOnFileResolveError: true` 后，仅将失败的 `<img>` 替换为原 `alt` 的纯文本，缺少说明时使用原路径。文本会按 HTML 转义，其余图片继续处理。例如 `spec` 中的 `<img src="chat/login.png" alt="登录截图">` 会保存为“登录截图”，对应警告带有 `stage: 'resolve'`、`field: 'spec'` 和 `path: 'chat/login.png'`。
- 上传或读取本地图片失败时，默认保留原 `src`，把错误写入 `alt` 并继续保存。设置 `continueOnFileUploadError: false` 可中止保存。
- 提交前中止，或服务端明确拒绝保存时，SDK 清理本次请求新上传的图片。预上传图片和已有文件 ID 由调用方管理。清理失败时，`cleanup` 警告包含 `uid`、原始图片路径和已知的文件 ID。
- 传输中断、超时或保存响应无法确认时，SDK 保留图片。异常的 `details.uid` 和 `details.fileIDs` 可用于查询对象状态及文件归属，再决定是否重试或清理。使用 `raw: true` 时，已收到的回执原样返回，通过 `onWriteOutcome` 区分写入结果。

普通响应通过 `fileWarnings` 提供警告。`onFileError` 可用于普通请求和 `raw: true` 的请求，接收 `resolve`、`upload` 和 `cleanup` 阶段的通知。

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
