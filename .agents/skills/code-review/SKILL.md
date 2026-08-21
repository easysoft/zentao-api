---
name: code-review
description: 评审 zentao-api 代码变更，优先使用用户指定范围；未指定时评审本地未提交内容，工作区干净时评审相对 upstream 的全部未推送提交。用户要求代码评审、审查改动、检查提交质量、评估是否可以合并，或查找回归与风险时使用。
---

# 评审 zentao-api 代码

从仓库根目录执行评审，先读取并遵守项目 `AGENTS.md`。评审阶段是只读任务：不要修改或格式化文件，不要暂存、提交、推送或丢弃改动，也不要自动执行 `git fetch`。如果用户同时明确要求修复，先完成评审，再仅修改已授权的修复范围；修复授权不包含暂存、提交、推送或丢弃改动。验证命令产生的忽略文件不属于交付物；验证后重新检查 Git 状态。

## 1. 确定评审范围

用户指定文件、暂存区、提交、ref range、分支或 PR 时，以该范围为准。将它解析为明确的文件集合或 base/head，并报告实际解析结果；即使工作区还有其他改动，也不要混入默认范围。范围含糊、ref 不存在或 PR 无法读取时，要求用户补充信息，不要退回默认范围。

用户没有指定范围时，运行：

```bash
git rev-parse --show-toplevel
git status --short --branch
git status --porcelain=v1 -z --untracked-files=all
```

只要存在未提交内容，就仅评审本地未提交范围，并分别检查：

```bash
git diff --cached --find-renames --find-copies --
git diff --find-renames --find-copies --
git ls-files --others --exclude-standard -z
git diff --name-only --diff-filter=U
git ls-files -u
```

- 第一条 diff 是暂存内容，第二条是未暂存的 tracked 内容；未跟踪文件需要读取完整内容。
- 未解决冲突和 dirty submodule 也属于未提交范围；检查冲突 stages 和 submodule diff，不能静默跳过。
- 不要只使用 `git diff HEAD`：同一文件暂存后又在工作区撤回时，净 diff 可能为空，但暂存区仍有待提交改动。
- 发现任一未提交内容后，不再把未推送提交加入本次默认评审。

## 2. 工作区干净时评审未推送提交

只有工作区、暂存区、未跟踪文件、冲突和 submodule 状态都干净时，才使用当前分支的 upstream：

```bash
git symbolic-ref --quiet --short HEAD
git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}'
git rev-parse '@{upstream}'
git rev-parse HEAD
git merge-base '@{upstream}' HEAD
git rev-list --left-right --count '@{upstream}...HEAD'
git rev-list --reverse --topo-order '@{upstream}..HEAD'
git diff --find-renames --find-copies '@{upstream}...HEAD' --
```

- `rev-list --left-right --count` 的结果依次是 behind、ahead；分别记录 upstream ref/OID、merge-base OID、HEAD OID 和 ahead/behind，不要在分支已分叉时把 upstream tip 误称为 base。
- 两点范围 `@{upstream}..HEAD` 定义本地独有提交；三点 diff 从 merge-base 到 HEAD 汇总这些提交的最终变化，分支已分叉时不会混入 upstream-only 变化的反向差异。
- 尝试解析 `@{push}`；如果它与 upstream 不同，在范围报告中提示，但仍以 upstream 为评审基线。
- 默认不刷新远端引用，明确说明结果基于本地 remote-tracking ref。只有用户要求远端实时状态时才另行确认是否 fetch。
- detached HEAD、upstream 缺失或失效、shallow history 无法提供所需历史，或无法取得 merge-base 时，停止并要求用户指定基线。不要猜测 `HEAD~1`、默认分支或全部历史。
- ahead 为零时，明确报告“没有可评审的未提交或未推送代码”并结束。

## 3. 建立变更上下文

阅读完整 diff、相关实现、调用方、公共导出和现有测试，先理解预期行为再判断问题。按变更内容补充项目专用约束：

- 涉及 OpenAPI、模块注册表、生成器、`src/modules/generated.ts` 或 action 映射时，读取 `.agents/skills/update-openapi-registry/SKILL.md`，核对 operation 覆盖、映射、生成来源和专项验证。
- 涉及版本号、`CHANGES.md`、发布文档或 tag 准备时，读取 `.agents/skills/release/SKILL.md`，核对发布范围和验证要求。
- 对生成文件的变化追溯到 OpenAPI、映射、override、TSDoc 或生成脚本；手工修改生成结果、遗漏再生成或只改生成文件都应作为具体风险核查。

## 4. 识别可执行问题

只报告由评审范围引入、能够用代码路径或验证结果证明，并值得作者修改的问题。重点检查：

- 正确性、回归、边界条件、错误处理和数据丢失风险。
- 安全与隐私问题，以及认证、输入、路径、网络和 TLS 边界。
- 公共 API、类型、模块注册行为和 Node 18+／浏览器兼容性。
- 测试是否覆盖变更承诺的行为；只有存在具体漏测路径时才作为发现报告。

不要把纯风格偏好、无证据的猜测或与本次范围无关的既有问题列为 finding。优先验证实际调用链和失败场景；行号应指向引入问题的最小相关代码范围。

## 5. 运行验证

当当前 checkout 与评审范围一致，且没有范围外工作区改动污染结果时，默认运行：

```bash
bun run check
```

再按受影响领域运行针对性测试或对应项目技能中的只读检查；不要执行其中的生成、发布、暂存或提交步骤。文档站点变化应补充 `bun run docs:build`，但该命令会先重新生成 tracked 文档，只能在能够忠实包含评审范围的隔离临时副本中运行；无法隔离时跳过并报告未验证风险。不要默认运行 `bun run test:real`；只有用户要求且真实环境配置可用时才运行。

如果显式范围并不等于当前工作树状态，不要切换分支、stash 或覆盖用户改动，也不要把当前工作树的检查结果冒充为该范围的验证。说明为什么未能可靠运行完整检查以及尚存风险。

验证失败时记录准确命令和关键错误，判断它是否由评审范围引起；无法证明关联时作为验证限制报告，不要虚构通过。最后再次运行 `git status --short --branch`，确认评审没有改变 tracked 状态。

## 6. 输出评审结果

先输出 findings，按严重度和影响排序：

- `P0`：会造成广泛数据损失、严重安全事件或完全不可用，必须立即阻断。
- `P1`：高影响的正确性、安全或兼容问题，应在合并前修复。
- `P2`：在明确场景下发生的实际缺陷，正常优先级修复。
- `P3`：影响较低但仍有明确行为或维护成本的问题；纯风格不属于 P3。

每项 finding 包含简短标题、准确的 `file:line`、触发条件、用户或系统影响、证据和修复方向。不要先写长篇摘要掩盖问题。

findings 之后报告：

1. 实际评审范围：显式范围、未提交范围或 upstream 范围；列出 base/head、提交或文件。
2. 已运行的验证及结果，注明未运行或无法归因的检查。
3. 剩余风险和未验证项。

没有 finding 时明确写“未发现问题”，仍需报告范围、验证结果和剩余风险。没有可评审变更时，不编造评审结论，只报告范围判定结果。
