# 变更日志

## 0.3.3 - 2026-06-30

### 新增

- 新增 `autoFill` 选项：更新（update）类请求在省略部分字段时，可自动以对象现有值回填被忽略的字段，避免误清空数据。
- `autoFill` 支持通过全局选项（global options）统一开启，无需在每次调用时单独传入。

### 修复

- 修正 action getter 未接收到调用参数的问题，并支持解析嵌套字段映射（nested field maps）。

### 变更

- 移除 `ModuleAction.render` 定义，精简 action 定义结构。
- 当省略 `method` 与 `resultType` 时，改为依据 action 的 `type` 自动推断，减少冗余配置。

## 0.3.2 - 2026-06-29

### 新增

- 新增 `extendModuleAction`，可对已注册模块的某个 action 做深度合并式扩展，便于在不重写整体定义的前提下增量调整路径、参数与请求体。
- 引入内置覆盖（builtin overrides）机制：在自动生成的注册表之上叠加随 SDK 一起维护的人工补丁，已为执行（execution）、需求（story）、任务（task）等模块补齐生成流程无法表达的定义。
- 产品（product）与执行（execution）相关 action 的访问控制（acl）默认改为 `open`。

### 变更

- 拆分模块注册表为 `define`、`query`、`store` 三个职责模块，并通过 `registry.ts` 统一导出；内置覆盖经由注册表 post-reset 钩子接入，`resetModuleDefinitions` 后会自动重新应用。
- 按领域拆分 `src/types`，类型定义分散到各自的文件中，结构更清晰。
- `extendModuleAction` 的回调改为返回完整 action 定义，语义更明确。

### 测试

- 新增 `extendModuleAction` 与内置覆盖的注册表测试覆盖。

### 文档

- 补充 `extendModuleAction` 与模块注册表拆分的说明，并更新请求简写文档；重新生成 API 文档与参考。

### 新增

- `request()` 新增完整类型推导：导出 `BuiltinRequestName`、`RequestParamsFor`、`RequestResultFor` 类型，可根据请求名自动推导参数与返回数据类型，并支持 `"module"`、`"module/action"`、`"module/123"` 三种写法的类型提示。
- `ZentaoClient` 的 `request/get/post/put/delete` 支持 `responseType` 选项（`response` / `arrayBuffer` / `blob` / `auto`），并按返回类型提供方法重载；新增导出 `ClientRequestBodyType`、`ClientResponseType` 类型。

### 变更

- 改进请求体处理：仅在存在请求体时附加请求头，并完善 Node 环境下的请求体转换。
- 请求名为空或格式非法时以 `E_INVALID_REQUEST_NAME` 报错，避免静默放行。

### 测试

- 新增浏览器打包烟雾测试门禁，构建产物随 CI 一并校验。

## 0.3.0 - 2026-06-27

### 新增

- 新增本地数据处理工具，可对返回记录进行过滤、搜索、排序与字段裁剪：导出 `filterData`、`searchData`、`sortData`、`pickFields`、`pickFieldsSingle` 与统一入口 `processData`。
- `RequestOptions` 支持本地数据处理选项，可在请求时直接对结果做过滤、搜索、排序与字段挑选，并与 `limit` 协同生效。

### 变更

- 拆分 `utils` 为 `object`、`array`、`url` 三个子模块，结构更清晰。

### 文档

- 新增「数据处理」指南页与对应 API 参考。

## 0.2.1 - 2026-06-23

### 新增

- 请求名支持简写：省略 action（如 `"bug"`）等价于列表查询 `"bug/list"`；action 为数字（如 `"bug/123"`）等价于按 ID 获取 `"bug/get"`（自动带上 `id`）。
- 包入口新增导出 `getModuleNames`，可直接获取所有可用模块名称列表。

## 0.2.0 - 2026-05-25

### 新增

- 新增 `throwOnFail` 选项，可将禅道 API 失败响应升级为异常抛出，便于统一错误处理。
- 新增带类型的 ESM 浏览器子路径导出，UMD 全局包保留在 `./browser/global`。
- 新增 docs 自动生成与发布流程，并在文档站点导航中展示当前包版本号。

### 变更

- **破坏性**：收紧 `ZentaoClient` 请求体类型并移除 `createClient` 辅助函数，请改用 `ZentaoClient.init()` 或 `new ZentaoClient()`。
- **破坏性**：移除 `turndown` 依赖与 `htmlToMarkdown` 选项，相关 HTML 转换需在调用方自行处理。
- **破坏性**：调整浏览器 IIFE 入口路径，并将 `tsconfig` 切换至 NodeNext 模块解析。
- 模块注册表条目改为深度冻结，避免每次读取时克隆，提升性能。
- 用安全的动态 `import` 替换 `new Function` 实现的模块导入桩。
- 扩展公共 API 的 TSDoc，补全参数、返回值与边界情况说明。

### 修复

- 不识别的布尔参数取值改为以 `E_INVALID_PARAM` 报错，避免静默放行。
- 序列化 profile 存储的读改写过程，避免并发更新丢失。
- 写入 profile 存储改为原子写入，并收紧文件权限。
- 处理模块命令时保留显式的 `null` 值，避免被误判为未传。
- 生成代码中对所有字符串字面量做转义，并补全控制字符转义。
- 仅在存在请求体时附加 `Content-Type` 请求头。
- 校验 `baseUrl` 协议，并拒绝带有 query 或 hash 的取值。

## 0.2.0-beta.2 - 2026-05-11

### 新增

- 新增支持本地存储的持久化用户配置管理。
- 新增 VitePress 文档站点和生成的 SDK API 参考文档。
- 新增生成的禅道 API 模块文档。
- 新增文档生成脚本和包烟雾测试覆盖。

### 变更

- 重写 README，补充 API 参考、项目结构和贡献指南。
- 简化配置创建流程，并移除已废弃的拼写错误别名。
- 抽取共享的记录类型检查工具。
- 让参考文档生成过程保持确定性。
- 构建时阻止 TypeScript 生成不完整产物。

### 修复

- 修复配置相关导出。
- 修复请求布尔字段的严格解析逻辑。
- 隔离不安全 TLS 请求处理。
- 保护模块注册表读取结果，避免外部修改。
- 修复 `DefineModulesOptions` 中的 `replace` 拼写错误。
