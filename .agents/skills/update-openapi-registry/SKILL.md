---
name: update-openapi-registry
description: 处理 zentao-api 的 data/zentao-openapi.json 更新：比较新旧 OpenAPI operation，区分接口契约与示例数据变化，重新生成 src/modules/generated.ts，修复生成器或内置覆盖问题，验证注册库并报告新增、删除及变更接口。用户提出更新 OpenAPI、同步注册库、重新生成模块定义、检查 zentao-openapi.json 差异或报告接口变化时使用。
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

## 3. 重新生成注册库

运行：

```bash
bun run scripts/update-registry.ts
git diff -- src/modules/generated.ts
```

不要手工修改 `src/modules/generated.ts`。如果生成结果错误：

- OpenAPI 可以表达正确含义时，修正 OpenAPI 或通用生成器，并添加回归测试。
- OpenAPI 无法同时表达 SDK 入参与实际传输行为时，在 `src/modules/override.ts` 添加最小内置覆盖，并用测试证明必要性。
- 检查新增 action 是否同步进入 `BuiltinActionMeta`，GET action 是否保留正确的 `resultGetter` / `pagerGetter`。
- 检查说明文本中的嵌套中英文括号是否仍能解析默认值和 options。
- 检查 `file/create` 最终注册定义仍包含 `multipart/form-data` 和二进制文件字段；运行上传测试确认实际请求没有退化为 JSON。

修改生成器或 override 时，只处理由当前 OpenAPI 更新暴露的问题，不顺手重构无关代码。

## 4. 验证

先运行针对性检查，再运行完整检查：

```bash
bun run registry:check
bun run typecheck
bun run check
git diff --check
```

根据变更补充针对性测试，例如：

```bash
bun test tests/upload.test.ts tests/modules.test.ts tests/resolve.test.ts
```

`bun run check` 不包含真实环境测试。只有用户要求且环境配置可用时运行 `bun run test:real`；否则在报告中明确未运行。

## 5. 复核和报告

再次运行 `git status --short --branch` 和 `git diff --stat`，确认没有意外文件。报告至少包含：

1. 当前模块和 operation 数量、共享 component 变化，以及是否有接口删除。
2. 新增接口：method、path、SDK action 名、主要入参和结果类型。
3. 现有接口变更：按请求契约、查询参数、响应契约和说明变化分组。
4. 仅示例变化的数量，不必逐项展开无业务影响的时间戳、token 或测试数据刷新。
5. 为保持运行时兼容而修改的生成器、override 和测试。
6. 实际执行的验证、通过数量、未执行的真实环境验证和剩余风险。

不要把生成器输出数量与 SDK action 数量混为一谈：多个 scoped OpenAPI operation 可以合并为一个注册 action，Token 类 operation 也可能被生成器排除。
