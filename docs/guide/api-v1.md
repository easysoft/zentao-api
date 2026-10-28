# REST API v1

通过 `apiVersion: 'v1' | 'v2' | 'auto'` 选择 REST API。SDK 的默认值仍为 `v2`，现有调用不增加配置请求。

`auto` 在请求前读取站点配置：开源版 22、biz13、max8、ipd5 起选择 v2，更早版本选择 v1。v1 的内置动作只声明已经核对的开源版 21.2；未核对的更早版本、其他系列或未定义的动作会明确报错，不会尝试发送 v2 请求或伪造版本。

```ts
import { ZentaoClient, request, getModuleAction } from 'zentao-api';
const client = new ZentaoClient({
  baseUrl: 'https://zentao.example.com/zentao',
  apiVersion: 'auto',
  token: process.env.ZENTAO_TOKEN,
});
const bug = await request('bug/7', {}, { client });
const mine = await request('my/bugs', { type: 'assignedTo' }, { client });
getModuleAction('bug', 'get', { apiVersion: 'v1', version: '21.2' });
```

未提供 Token 时可调用 `client.login(account, password)`。v1 使用 POST /tokens，接受其 token-only 响应；v2 继续使用 /users/login。自动识别失败时停止，不会把密码在不同接口间自动重试。单次底层请求可用 `{ apiVersion: 'v1' }` 覆盖，不改变共享客户端。

| 模块 | v1 内置动作 |
| --- | --- |
| user | list、get |
| product | list、programProducts、get、create、update、delete |
| project | list、programProjects |
| execution | list、projectExecutions、get |
| bug | list、get、create、update、delete、confirm、resolve、close、activate |
| task | list、get、create、update、delete、start、finish、close、activate |
| story | list、get、create、update、delete、activate、close、change |
| my | bugs、tasks、stories |

列表保留 CLI/SDK 的 pageID、recPerPage、orderBy、browseType 参数，在 v1 请求中映射为 page、limit、order、status（user 使用 browse）。单条对象直接读取，个人列表使用 /user?fields=bug|task|story。状态流转显式使用 v1 的 POST 路由，activate 映射为 active。写入字段按 v1 控制器单独列出；v2-only 字段会被拒绝，更新自动补全会转换用户对象和版本对象。raw 保留 v1 业务对象，标准输出继续使用 ResponseData。

v1 动作定义位于 src/modules/v1.ts，与自动生成的 v2 注册表分开。添加新动作时，需要核对其路由、HTTP 方法、字段和响应；不允许只降低 v2 的最低版本。

浏览器 SSO 与 REST API 版本是独立问题。这项功能不读取或导入浏览器 Cookie，也不绕过网关登录；CLI 仍需要可直接用于 API 的账号或 Token。

验证使用本地模拟服务覆盖登录、分页、个人列表、详情、创建作用域、更新自动补全、状态流转和错误；真实 21.2 站点只执行了只读查询。契约依据 [21.2 路由](https://github.com/easysoft/zentaopms/blob/zentaopms_21.2_20241206/config/routes.php) 与 [v1 入口](https://github.com/easysoft/zentaopms/tree/zentaopms_21.2_20241206/api/v1/entries)。
