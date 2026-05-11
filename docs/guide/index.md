# 快速开始

`zentao-api` 是一个面向禅道 API v2 的 JavaScript/TypeScript SDK，可在 Node.js 18+、Bun、浏览器打包工具和 CDN/script 标签场景中使用。

SDK 提供两层调用方式：

- `ZentaoClient`：直接调用禅道 REST 路径，例如 `client.get('/products')`。
- `request("module/action")`：基于内置模块注册表调用常见禅道 API，例如 `request('product/list')`。

## 安装

::: code-group

```sh [npm]
npm install zentao-api
```

```sh [bun]
bun add zentao-api
```

```sh [pnpm]
pnpm add zentao-api
```

:::

## 创建客户端

```ts
import { ZentaoClient } from 'zentao-api';

const client = new ZentaoClient({
  baseUrl: 'https://zentao.example.com',
  token: 'your-token',
});

const products = await client.get('/products');
```

`baseUrl` 是禅道站点根地址，SDK 会自动拼接 `/api.php/v2`。

## 使用账号密码登录

```ts
import { ZentaoClient } from 'zentao-api';

const client = new ZentaoClient('https://zentao.example.com');
const token = await client.login('admin', 'password');
```

登录成功后，返回的 token 会写入当前客户端实例，后续请求会自动携带 `Token` 请求头。

## 使用模块请求

```ts
import { ZentaoClient, request, setGlobalOptions } from 'zentao-api';

ZentaoClient.init({
  baseUrl: 'https://zentao.example.com',
  token: 'your-token',
});

setGlobalOptions({ recPerPage: '50' });

const result = await request('product/list', {});
```

模块请求的名称固定为 `"module/action"`。可用模块和动作见 [ZenTao API](/zentao-api/)。

## 下一步

- 阅读 [安装与配置](./installation.md) 了解客户端选项。
- 阅读 [运行环境](./environments.md) 了解 Node.js、Bun 和浏览器差异。
- 阅读 [常见 API 示例](./examples.md) 直接套用常见调用方式。
