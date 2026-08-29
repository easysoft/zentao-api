# 变更日志

## 0.6.6 - 2026-08-29

### 新增

- 新增 `story/getGrades`，并允许 `story/create` 通过 `grade` 设置需求层级。

### 修复

- 区分外部取消与请求超时，确保原始 `Response` 在读取、克隆和 BYOB 消费期间仍受取消与超时控制，并阻止携带 Token 或请求体的自动重定向。
- 修复对象与数组查询参数的序列化，统一拒绝不兼容的 `ReadableStream` 请求体，并加强 Node TLS 传输对中断和提前关闭响应的处理。
- `autoFill` 仅使用与更新操作路径一致的详情接口，并修正 `raw: true` 的返回类型，避免读取错误对象或把原始响应误判为归一化结果。
- 注册表生成器保留查询参数契约与请求体示例，校验合并列表的参数和结果字段一致性，并将非 Token OpenAPI operation 覆盖审计纳入完整检查。

### 变更

- 移除未使用的 BlockSuite 快照 HTML 转换链路，保留 Markdown 转换能力。
- 更新 TypeScript 与 TypeDoc 工具链，并简化公共类型导出。

### 测试

- 增加客户端取消、超时、重定向、原始响应、结构化查询、注册表合并、`autoFill` 与请求类型的回归覆盖。

### 文档

- 重新生成 SDK 参考与禅道 API 模块文档。

## 0.6.5 - 2026-08-21

### 新增

- `doc/createMyDoc`、`doc/createTeamDoc`、`doc/createProductDoc`、`doc/createProjectDoc` 与 `doc/update` 的请求体新增 `contentType`：`doc` 接收 Markdown 并生成支持协同编辑的块内容与 HTML 快照，`html` 保留直接存储 HTML 的旧格式。

### 变更

- 同步文档详情响应契约，以 `content` 表示 Markdown 正文、`html` 表示 HTML 快照，并由 `contentType` 标识文档格式。
- 补全 `my/meetings` 的会议列表项定义，不再将会议对象描述为字符串。

### 文档

- 刷新 OpenAPI 示例，并重新生成 SDK 参考与禅道 API 模块文档。

## 0.6.4 - 2026-08-19

### 新增

- 补充项目集下的产品和项目、项目下的执行，以及项目或执行范围内的问题、风险、会议和成员列表等 11 个 SDK action，确保所有非 Token OpenAPI operation 都有可追溯的注册定义。

### 修复

- 修复模块已有顶层 `list` 时同模块 scoped-list operation 被静默遗漏的问题，改由 `zentao-api-map.json` 提供语义化 action 名称。
- 仅在列表响应定义包含 `pager` 时生成 `pagerGetter`，避免非分页接口暴露无效的分页映射。

### 测试

- 增加非 Token OpenAPI operation 的独立或合并覆盖审计，以及分页字段生成的回归测试。

### 文档

- 重新生成 SDK 参考和禅道 API 模块文档，补充新增的 scoped-list action。

## 0.6.3 - 2026-08-19

### 新增

- `doc/get` 在文档格式为 `doc` 时自动将 BlockSuite 快照转换为 Markdown，并通过 `rawContent` 保留原始内容；HTML、纯文本和无法识别的内容保持不变。
- 自定义 action 的 `resultGetter` 与 `pagerGetter` 可通过可选第三参数读取当前请求的数据处理选项，便于按 `pick`、`limit` 等选项定制结果提取。

### 变更

- 扩展 OpenAPI 注册表维护流程，增加契约差异报告、action 映射规则和生成结果审计。

### 测试

- 增加文档快照转换、非快照透传、失败响应、getter 选项传递以及转换安全边界的测试覆盖。

### 文档

- 补充内置 BlockSuite 快照转换器的支持范围、扩展点与安全限制说明。

## 0.6.2 - 2026-08-18

### 新增

- 新增 `bug/confirm`，支持确认 Bug 并提交指派、类型、优先级、截止日期、抄送和备注等字段。
- `todo/create` 与 `todo/update` 支持通过 `objectID` 关联非自定义待办对象；`name` 仅在自定义待办中必填。

### 修复

- 修复 OpenAPI 更新后 `file/create` 的上传定义退化问题，继续按 `multipart/form-data` 处理文件输入。
- 修复注册表生成器无法完整解析包含嵌套中英文括号的选项标签问题。

### 变更

- `my/meetings` 的默认筛选改为未开始且本人参加的会议，并补充完整筛选项与标签。
- 更新任务实际时间、文档正文与父目录等字段说明，使生成的请求定义与接口约束一致。

### 测试

- 增加包含嵌套括号的查询选项生成测试。

## 0.6.1 - 2026-08-18

### 新增

- 高阶 `request()` 支持依据模块注册表构造 `multipart/form-data` 与表单请求；`file/create` 可在 Node.js/Bun 中上传本地路径，并在浏览器中上传 `File`、`Blob` 或内存数据。
- 新增文件上传输入与结果类型、`maxUploadBytes` 单次请求选项及明确的文件读取、大小限制和运行环境错误码；单个文件默认限制为 50 MiB。

### 变更

- OpenAPI 与注册表生成器保留请求媒体类型和二进制字段格式，`exportRegistry()` 同步导出请求体媒体类型。

### 测试

- 增加本地路径、内存数据、自定义 multipart action、浏览器运行时、错误处理和真实环境附件上传覆盖，并将 Node 与浏览器上传纳入构建烟雾测试。

### 文档

- 补充附件上传用法、浏览器限制和大小上限说明，并重新生成 SDK 参考与文件模块文档。

## 0.6.0 - 2026-08-18

### 新增

- 更新 OpenAPI 数据与内置模块注册表，新增问题、风险、会议、工作流、文档、待办和地盘模块，并扩展产品、项目、执行、反馈、工单等模块的关联操作。
- `getObjectProps` 补充新增模块以及产品、项目、执行的中文字段标签。
- 注册表生成器支持通过 `scripts/zentao-api-map.json` 覆盖模块、action 名称和属性；映射项可仅指定属性，并检测同一模块内的 action 重名。

### 修复

- 修正地盘列表、团队与关闭操作、关联对象创建、模块树等 API 的模块、action 和结果类型映射，确保生成的请求名唯一且路由正确。
- 统一解析 OpenAPI 花括号路径，正确识别详情与动词操作。
- 补全生成 GET action 的 `resultGetter`，确保模块树、业务与用户需求、任务、应用、工作流、文档和地盘列表等响应正确提取数据字段。

### 变更

- `RequestParamsFor` 调整为可扩展参数记录；内置请求名和返回数据类型改由生成的精简 action 索引推导。

### 测试

- 增加 API 映射、仅属性映射、action 唯一性、GET action 结果提取、路径分类和对象字段标签的测试覆盖。

### 文档

- 重新生成 SDK 参考和禅道 API 模块文档，补充新增模块、action 与字段定义。

## 0.5.5 - 2026-08-13

### 新增

- `execution/create` 请求体补充 `type`、`attribute`、`milestone`、`parent` 字段，支持创建瀑布/IPD 阶段。

## 0.5.4 - 2026-08-12

### 修复

- 修正 `bug/list` 的 `browseType` 选项：将错误的 `assignedtome` 改为 `assigntome`，并补充“由我解决”（`resolvedbyme`）筛选项。

## 0.5.3 - 2026-08-12

### 新增

- 新增 `exportRegistry()`，可导出模块注册表的简化定义或原始结构；默认递归移除函数属性，便于安全序列化为 JSON。

### 文档

- 重写 README 的快速开始与使用说明，并统一示例中 `limit` 的数值写法。

## 0.5.2 - 2026-08-11

### 变更

- 统一列表处理语义：过滤与搜索均为组内 AND、组间 OR；过滤兼容 `=`/`:` 相等写法，排序兼容 `field:desc`/`field_desc` 写法。
- `request()` 新增 `convertSingle`，支持在摘取字段前转换单条对象。
- 字段摘取沿用嵌套对象结构并忽略不存在路径，搜索会递归遍历嵌套对象与数组。

## 0.5.1 - 2026-08-11

### 新增

- `processData` 与 `request` 支持 `convert` 选项：可在过滤、搜索、排序与摘取之前自定义转换列表或单条对象数据。

## 0.5.0 - 2026-08-11

### 新增

- 新增 `getObjectProps`，按对象类型返回字段名到中文标签的映射，便于展示与表单标签生成。

## 0.4.1 - 2026-08-04

### 新增

- 带 scope 的列表请求支持显式传入 `scope` 与 `scopeID`，无需再依赖自动推断。

### 修复

- `task/create` 请求体补充 `parent` 字段，支持创建子任务。
- `task/update` 请求体补充 `parent` 字段，支持调整任务的父任务。

### 变更

- `getModule`、`getModuleAction` 在定义缺失时返回 `undefined`，行为更明确。
- 包管理统一改用 Bun。

## 0.4.0 - 2026-07-21

### 新增

- 新增 `getModuleActionParams`，统一返回某个 action 的参数定义，便于按需读取路径、查询与请求体参数。
- 请求支持 `raw` 选项：开启后直接返回未经处理的原始响应体，跳过 `ResponseData` 归一化与分页封装。

### 修复

- 单 scope 列表请求改用具体路径参数，避免路径拼装歧义。
- 澄清带 scope 列表的路径参数以及产品计划（productplan）列表的路径。
- 当 `autoFill` 回填前的 prefill 拉取失败时，中止本次 update，避免以不完整数据覆盖对象。

### 变更

- 拆分 `resolveActionRequest` 为多个辅助函数，并由 `resolveModuleCommand` 重命名而来，逻辑更清晰。

### 文档

- 补充 `raw` 请求选项的说明。
- 随 `ModuleActionRequest` 重命名重新生成 reference 文档。

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
