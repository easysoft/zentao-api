# Profile 与错误处理

## 持久化登录信息

启用 `persistProfiles` 后，`login()` 成功时会保存站点、账号、token、客户端配置，以及服务器配置 `serverConfig` 和获取时间 `serverConfigFetchedAt`。

```ts
import { ZentaoClient, setGlobalOptions } from 'zentao-api';

setGlobalOptions({ persistProfiles: true });

const client = new ZentaoClient('https://zentao.example.com');
await client.login('admin', 'password');
```

后续可以从当前 profile 恢复客户端：

```ts
const client = await ZentaoClient.fromProfile();
```

也可以指定 profile key：

```ts
const client = await ZentaoClient.fromProfile('admin@https://zentao.example.com');
```

## 服务器配置与版本检查

登录验证成功后会请求一次站点根地址的 `/?mode=getconfig`，即使已经设置全局 `version`。配置成功获取后才更新登录状态；失败时默认抛错，全局 `skipVersionCheckOnConfigError: true` 可允许登录继续。

```ts
import { request } from 'zentao-api';

const config = await client.getZentaoConfig();
const freshConfig = await client.getZentaoConfig({ forceRefresh: true, timeout: 5000 });

setGlobalOptions({ client, version: 'biz13.5' });
await request('story/getGrades');
await request('story/getGrades', {}, { forceRefreshConfig: true });
```

高阶请求先检查 Action 的最低版本。版本来源依次为强制刷新后的实际版本、全局 `version`、有效缓存、新获取的配置。强制刷新不会改写全局设置；`autoFill` 预读复用本次解析的版本。底层 `client.get/post/request` 不做版本检查。

配置缓存的有效期为 24 小时，恰好 24 小时仍有效。旧 profile 没有获取时间，或时间无效、处于未来时，需要重新获取。获取失败不延长缓存期限。`fromProfile()` 恢复缓存；启用 `persistProfiles` 后，刷新仅更新绑定 profile 的配置和时间，不切换当前账号或覆盖其他字段。未启用持久化或没有绑定 profile 时只使用实例内存缓存。

四个系列分别比较数字段：`22.5 = 22.5.0`、`biz13.10 > biz13.5`。不支持预发布后缀或未知系列前缀，非法格式抛出 `E_INVALID_ZENTAO_VERSION`。

```ts
// 仅配置网络或响应获取失败时跳过检查；单次设置优先于全局设置。
await request('product/list', {}, { skipVersionCheckOnConfigError: true });
```

跳过选项不忽略版本不匹配、版本格式错误、取消或 profile 存储错误；直接调用 `getZentaoConfig()` 始终返回配置或抛错。

## 管理 profile

```ts
import {
  addProfile,
  deleteProfile,
  getAllProfiles,
  getProfile,
  switchProfile,
} from 'zentao-api';

const profiles = await getAllProfiles();
const active = await switchProfile(profiles[0].key);
const profile = await getProfile(active.key);

await addProfile({
  server: 'https://zentao.example.com',
  account: 'admin',
  token: 'your-token',
});

await deleteProfile('admin@https://zentao.example.com');
```

## 错误处理

SDK 会把 HTTP、网络、超时、环境限制和模块解析错误包装为 `ZentaoError`。

```ts
import { ZentaoError } from 'zentao-api';

try {
  await client.get('/products');
} catch (error) {
  if (error instanceof ZentaoError) {
    console.error(error.code);
    console.error(error.message);
    console.error(error.details);
  }
}
```

禅道服务端返回 `{ status: "fail" }` 时，SDK 默认不会抛出异常，会按响应内容返回。只有传输层错误、超时、无效模块或缺少必填参数等 SDK 可预期错误会抛出 `ZentaoError`。

## 把服务端失败响应转为异常

如果业务希望在禅道返回 `{ status: "fail" }` 时直接走异常分支，可以打开 `throwOnFail`。

```ts
import { request, setGlobalOptions } from 'zentao-api';

// 单次调用启用
await request('product/list', {}, { throwOnFail: true });

// 全局启用，所有 request() 调用默认抛错
setGlobalOptions({ throwOnFail: true });
```

启用后失败响应会抛出 `ZentaoError`，错误码为 `E_API_FAILED`，原始归一化响应通过 `error.details` 暴露。

## 常见错误码

| 错误码 | 说明 |
| --- | --- |
| `E_NO_GLOBAL_CLIENT` | 调用 `request()` 时没有全局客户端。 |
| `E_HTTP_ERROR` | HTTP 响应状态码不是 2xx。 |
| `E_NETWORK_ERROR` | 网络请求失败。 |
| `E_TIMEOUT` | 请求超时。 |
| `E_INSECURE_BROWSER` | 浏览器运行时使用了 `insecure`。 |
| `E_INVALID_BASE_URL` | `baseUrl` 不是合法的 http/https URL，或带有查询/锚点。 |
| `E_INVALID_MODULE` | 模块不存在。 |
| `E_INVALID_ACTION` | 模块动作不存在。 |
| `E_INVALID_ZENTAO_CONFIG` | 配置响应不是包含非空 `version` 的对象。 |
| `E_INVALID_ZENTAO_VERSION` | 版本不是四个系列的数字正式版本。 |
| `E_UNSUPPORTED_ZENTAO_VERSION` | 服务器版本低于 Action 的最低要求，或该系列不受支持。 |
| `E_INVALID_REQUEST_NAME` | `request()` 名称不是 `module/action` 形式。 |
| `E_MISSING_PARAM` | 缺少必填路径参数或请求体字段。 |
| `E_INVALID_PARAM` | 参数值不合法，例如布尔字段传入了无法识别的取值。 |
| `E_API_FAILED` | 启用 `throwOnFail` 时禅道返回 `{ status: "fail" }`。 |
