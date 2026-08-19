---
name: update-openapi-registry
description: 处理 zentao-api 的 OpenAPI 与模块注册库更新：比较 operation 契约和示例变化，维护 zentao-api-map.json 的模块、action 名称及 ModuleAction 属性映射，解决命名冲突，核对 GET resultGetter，重新生成并验证 src/modules/generated.ts。用户提出更新 OpenAPI、同步注册库、重新生成模块定义、处理 action 冲突或结果字段、检查 zentao-openapi.json 差异及报告接口变化时使用。
---

# 更新 OpenAPI 注册库

从 `zentao-api` 仓库根目录执行流程，遵守项目 `AGENTS.md`，只使用 Bun 运行项目脚本。保留用户已有改动；默认不暂存、提交、推送、发布或生成文档，除非用户明确要求。

## 1. 确认范围和状态

1. 运行 `git rev-parse --show-toplevel`，确认仓库根目录。
2. 运行 `git status --short --branch`，区分用户已有改动和本次生成结果。
3. 确认 `data/zentao-openapi.json` 的比较基线：
   - 工作区或暂存区更新通常与 `HEAD` 比较。
   - 更新已经提交时，使用用户指定的 ref；没有指定时检查提交历史后选择明确的基线，不要盲目假设 `HEAD^`。
4. 不覆盖、还原或重新格式化用户提供的 OpenAPI 文件。

## 2. 生成结构化差异报告

运行技能脚本：

```bash
bun run .agents/skills/update-openapi-registry/scripts/report-openapi-changes.ts --base HEAD
```

需要机器可读结果时追加 `--json`。脚本将 operation 分为新增、删除、契约或元数据变化、仅示例变化。以结构化结果为准，不根据 JSON 文本行数判断接口数量。

重点检查：

- HTTP method、path、参数位置、类型、必填项、默认值和枚举。
- request body 的 media type、schema 和 required。
- response schema、分页字段和结果容器。
- `components.schemas` 等共享定义；共享 component 变化时继续追踪引用它的 operation，不能只看 path 本身。
- 只有 `example` 或 `examples` 变化时，明确标为示例刷新，不宣称接口契约改变。

## 3. 处理 action 映射与命名冲突

自动分类不能准确表达接口语义，或同一模块出现重名 action 时，维护 `scripts/zentao-api-map.json`。键必须是规范化的 `<小写 method> <OpenAPI path>`，路径参数使用 `{paramName}`。值是对推断结果的部分覆盖：

```json
{
  "get /tasks/{taskID}": {"resultGetter": "task"},
  "post /projects/{projectID}/stories": {"module": "project", "name": "createStory"}
}
```

遵守以下规则：

- `module`、`name` 都是可选字段；省略时保留 OpenAPI tag 和自动分类得到的值。其他字段直接覆盖对应的 `ModuleAction` 属性。
- `ModuleAction.name` 只保存 action 部分，例如 `team`、`createStory`，不能写成 `project-team`。用于报告或外部标识的完整名称严格写成 `<moduleName>-<actionName>`，例如 `project-team`、`project-createStory`。
- 多单词 action 使用 camelCase，不能用额外的 `-` 连接。根据接口实际语义命名，例如 `my-todos`、`my-tasks`，不要使用 `list2` 一类无语义后缀。
- `module` 或 `name` 属于结构映射；仅设置 `resultGetter` 等属性时，不得改变原有模块、action 名称或 scoped-list 合并行为。
- 多个 scoped operation 合并为一个 action 时，同一属性的映射值必须一致；不一致时应报出冲突，不能按遍历顺序静默覆盖。
- 生成器应处理完全部 operation 后，按最终 module/action 分组，一次性列出所有未解决的重名、对应 method/path 和映射状态。不要只修复第一个冲突。

每轮映射后重新生成，阅读完整冲突提示；仍有冲突时继续补充映射，不要把有冲突的生成结果当作完成。

## 4. 重新生成注册库

运行：

```bash
bun run scripts/update-registry.ts
git diff -- src/modules/generated.ts
```

不要手工修改 `src/modules/generated.ts`。如果生成结果错误：

- OpenAPI 可以表达正确含义时，修正 OpenAPI 或通用生成器，并添加回归测试。
- 静态的 module、action 名称或 `ModuleAction` 属性差异，优先写入 `scripts/zentao-api-map.json`。
- 只有映射无法表达函数或运行时行为时，才在 `src/modules/override.ts` 添加最小内置覆盖，并用测试证明必要性。
- 检查新增 action 是否同步进入 `BuiltinActionMeta`，GET action 是否保留正确的 `resultGetter` / `pagerGetter`。
- 检查说明文本中的嵌套中英文括号是否仍能解析默认值和 options。
- 检查 `file/create` 最终注册定义仍包含 `multipart/form-data` 和二进制文件字段；运行上传测试确认实际请求没有退化为 JSON。

修改生成器或 override 时，只处理由当前 OpenAPI 更新暴露的问题，不顺手重构无关代码。

## 5. 确认 GET 结果字段

所有生成的 GET action 都必须具有非空 `resultGetter`。按以下证据顺序确定字段：

1. 优先读取 `200 application/json` response schema 中除 `status`、`pager` 等元数据外的结果容器。
2. schema 缺失或与 example 不一致时检查 response example，但不要把示例数据值当作契约。
3. 用户明确提供或授权测试环境时，只执行 GET：从 OpenAPI 生成必需路径和查询参数，通过父级列表接口取得有效 ID，再请求目标接口。只输出顶层字段名和类型，不打印业务数据，不把 token 写入仓库、日志或报告。
4. 测试接口不可用时，查找权威服务端路由或正式文档中的 response extractor；明确标记推断依据和剩余风险，不能把 HTML 错误页当作响应契约。

OpenAPI 无法推断出的字段写入映射，例如 `{"resultGetter": "task"}`。列表接口只有实际响应包含分页容器时才设置 `pagerGetter`。

## 6. 验证

先运行针对性检查，再运行完整检查：

```bash
bun run .agents/skills/update-openapi-registry/scripts/audit-generated-registry.ts
bun run registry:check
bun run typecheck
bun run check
git diff --check
```

根据变更补充针对性测试，例如：

```bash
bun test tests/upload.test.ts tests/modules.test.ts tests/resolve.test.ts
```

映射或生成器变化至少覆盖这些回归断言：

- 映射可以只提供 `resultGetter` 等属性，不强制要求 `module` 和 `name`。
- 映射根据 method/path 找到最终 action，并逐项应用覆盖属性。
- 每个模块内 action 名称唯一，所有生成 GET action 都有非空 `resultGetter`。
- scoped-list 的纯属性映射不会改变原有 path、display、pathParams 或合并范围。

`bun run check` 不包含真实环境测试。只有用户要求且环境配置可用时运行 `bun run test:real`；否则在报告中明确未运行。

## 7. 复核和报告

再次运行 `git status --short --branch` 和 `git diff --stat`，确认没有意外文件。报告至少包含：

1. 当前模块和 operation 数量、共享 component 变化，以及是否有接口删除。
2. 新增接口：method、path、SDK action 名、主要入参和结果类型。
3. 现有接口变更：按请求契约、查询参数、响应契约和说明变化分组。
4. 仅示例变化的数量，不必逐项展开无业务影响的时间戳、token 或测试数据刷新。
5. 为保持运行时兼容而修改的生成器、override 和测试。
6. 实际执行的验证、通过数量、未执行的真实环境验证和剩余风险。
7. 新增或调整的 API 映射、最终 `<moduleName>-<actionName>`、未解决冲突数量。
8. GET action 总数、缺失 `resultGetter` 数量，以及真实请求确认和推断确认的范围。

不要把生成器输出数量与 SDK action 数量混为一谈：多个 scoped OpenAPI operation 可以合并为一个注册 action，Token 类 operation 也可能被生成器排除。
