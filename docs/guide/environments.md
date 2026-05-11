# 运行环境

`zentao-api` 支持服务端运行时、浏览器打包工具和 script 标签引入。不同环境的主要差异在于跨域、安全和本地 profile 存储。

## Node.js 18+

Node.js 18+ 已内置 `fetch`，可以直接使用 SDK。

```ts
import { ZentaoClient } from 'zentao-api';

const client = new ZentaoClient({
  baseUrl: 'https://zentao.example.com',
  token: process.env.ZENTAO_TOKEN,
});

const projects = await client.get('/projects');
```

在 Node.js 中，`insecure: true` 可用于连接使用自签名证书的测试环境。

```ts
const client = new ZentaoClient({
  baseUrl: 'https://zentao.example.com',
  token: process.env.ZENTAO_TOKEN,
  insecure: true,
});
```

## Bun

Bun 项目可以使用同样的 ESM 导入方式。

```ts
import { ZentaoClient, request } from 'zentao-api';

ZentaoClient.init({
  baseUrl: Bun.env.ZENTAO_URL!,
  token: Bun.env.ZENTAO_TOKEN!,
});

const products = await request('product/list');
```

## 浏览器打包工具

在 Vite、Webpack、Rspack 等浏览器打包工具中，从包根导入即可。

```ts
import { ZentaoClient } from 'zentao-api';

const client = new ZentaoClient({
  baseUrl: 'https://zentao.example.com',
  token: 'browser-token',
});
```

浏览器直接请求禅道服务端时，服务端必须允许 CORS。浏览器代码也会暴露 token；如果 token 不能暴露给前端，请通过后端代理转发请求。

## CDN/script 标签

浏览器构建包会把 API 暴露到 `window.ZentaoAPI`。

```html
<script src="https://cdn.jsdelivr.net/npm/zentao-api@latest/dist/browser/zentao-api.global.js"></script>
<script>
  const client = new window.ZentaoAPI.ZentaoClient('https://zentao.example.com');
  console.log(window.ZentaoAPI.VERSION);
</script>
```

## Profile 存储位置

启用 `persistProfiles` 后，登录信息会持久化到当前运行时可用的本地存储。

| 环境 | 存储位置 |
| --- | --- |
| Node.js / Bun | `~/.config/zentao/zentao.json` |
| 浏览器 | `localStorage` |

浏览器隐私模式、受限 iframe 或无持久化文件系统的运行时可能无法保存 profile。
