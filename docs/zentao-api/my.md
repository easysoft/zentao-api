# 地盘 (my)

地盘管理，支持我的待办、指派给我的任务、指派给我的Bug、指派给我的研发需求、指派给我的业务需求、指派给我的用户需求、我负责的的测试单、我参与的项目、指派给我的反馈、指派给我的工单、指派给我的用例、我的会议、指派给我的问题、指派给我的风险、我的地盘-贡献任务、我的地盘-贡献 Bug、我的地盘-贡献研发需求、我的地盘-贡献业务需求、我的地盘-贡献用户需求、我的地盘-贡献测试单、我的地盘-贡献用例、我的地盘-贡献文档、我的地盘-贡献问题、我的地盘-贡献风险、我的地盘-贡献评审问题、我的地盘-贡献反馈、我的地盘-贡献审批、我的地盘-待处理评审问题、我的地盘-待处理审批、我的地盘-待处理审计计划、我的地盘-待处理不符合项

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `todos` | 我的待办 | `GET` | `/my/todos` |
| `tasks` | 指派给我的任务 | `GET` | `/my/tasks` |
| `bugs` | 指派给我的Bug | `GET` | `/my/bugs` |
| `stories` | 指派给我的研发需求 | `GET` | `/my/stories` |
| `epics` | 指派给我的业务需求 | `GET` | `/my/epics` |
| `requirements` | 指派给我的用户需求 | `GET` | `/my/requirements` |
| `testtasks` | 我负责的的测试单 | `GET` | `/my/testtasks` |
| `projects` | 我参与的项目 | `GET` | `/my/projects` |
| `feedbacks` | 指派给我的反馈 | `GET` | `/my/feedbacks` |
| `tickets` | 指派给我的工单 | `GET` | `/my/tickets` |
| `testcases` | 指派给我的用例 | `GET` | `/my/testcases` |
| `meetings` | 我的会议 | `GET` | `/my/meetings` |
| `issues` | 指派给我的问题 | `GET` | `/my/issues` |
| `risks` | 指派给我的风险 | `GET` | `/my/risks` |
| `activityTasks` | 我的地盘-贡献任务 | `GET` | `/my/activity/tasks` |
| `activityBugs` | 我的地盘-贡献 Bug | `GET` | `/my/activity/bugs` |
| `activityStories` | 我的地盘-贡献研发需求 | `GET` | `/my/activity/stories` |
| `activityEpics` | 我的地盘-贡献业务需求 | `GET` | `/my/activity/epics` |
| `activityRequirements` | 我的地盘-贡献用户需求 | `GET` | `/my/activity/requirements` |
| `activityTestTasks` | 我的地盘-贡献测试单 | `GET` | `/my/activity/testtasks` |
| `activityTestCases` | 我的地盘-贡献用例 | `GET` | `/my/activity/testcases` |
| `activityDocs` | 我的地盘-贡献文档 | `GET` | `/my/activity/docs` |
| `activityIssues` | 我的地盘-贡献问题 | `GET` | `/my/activity/issues` |
| `activityRisks` | 我的地盘-贡献风险 | `GET` | `/my/activity/risks` |
| `activityReviewIssues` | 我的地盘-贡献评审问题 | `GET` | `/my/activity/reviewissues` |
| `activityFeedbacks` | 我的地盘-贡献反馈 | `GET` | `/my/activity/feedbacks` |
| `activityAudits` | 我的地盘-贡献审批 | `GET` | `/my/activity/audits` |
| `reviewIssues` | 我的地盘-待处理评审问题 | `GET` | `/my/reviewissues` |
| `audits` | 我的地盘-待处理审批 | `GET` | `/my/audits` |
| `auditPlans` | 我的地盘-待处理审计计划 | `GET` | `/my/auditplans` |
| `ncs` | 我的地盘-待处理不符合项 | `GET` | `/my/ncs` |
| `createSSH` | 添加我的 SSH 公钥 | `POST` | `/my/sshkeys` |

## 我的待办

- SDK 调用：`request("my/todos", params)`
- HTTP：`GET /my/todos`
- 动作类型：`list`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `status` | string | 否 |  | 待办状态；browseType=undone 时传 undone。 |
| `browseType` | string | 否 | `all` | 状态，默认是all<br>`all` 全部<br>`today` 今天<br>`thisWeek` 本周<br>`thisMonth` 本月<br>`future` 将来<br>`undone` 未完成，需同时传 status=undone<br>`cycle` 周期待办<br>`assignedToOther` 指派他人 |
| `orderBy` | string | 否 |  | 排序(date_desc,status,begin 日期/状态/开始时间) |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`todos`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/todos", {
  "status": "<string>",
  "browseType": "all",
  "orderBy": "<string>",
  "recPerPage": 1,
  "pageID": 1
});
```
## 指派给我的任务

- SDK 调用：`request("my/tasks", params)`
- HTTP：`GET /my/tasks`
- 动作类型：`list`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `param` | string | 否 |  | 搜索参数；browseType=bysearch 或 bySearch 时必填。 |
| `browseType` | string | 否 | `assignedTo` | 状态，默认是assignedTo，取值区分大小写<br>`assignedTo` 指派给我<br>`openedBy` 由我创建<br>`finishedBy` 由我完成<br>`myInvolved` 由我参与<br>`closedBy` 由我关闭<br>`canceledBy` 由我取消<br>`assignedBy` 由我指派<br>`bysearch` 按查询搜索，需同时传 param |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`name_asc` 名称 升序<br>`name_desc` 名称 降序<br>`status_asc` 状态 升序<br>`status_desc` 状态 降序<br>`pri_asc` 优先级 升序<br>`pri_desc` 优先级 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：name(任务名称，示例：关键字)；keywords(关键词，示例：关键字)；id(编号，示例：1)；status(任务状态，枚举：wait 未开始 \| doing 进行中 \| done 已完成 \| pause 已暂停 \| cancel 已取消 \| closed 已关闭)；desc(任务描述，示例：关键字)；assignedTo(指派给，用户，示例：admin)；pri(优先级，枚举：1 \| 2 \| 3 \| 4)；project(所属项目，示例：all)；execution(所属执行，示例：all)；module(所属模块，示例：all)；estimate(最初预计，示例：关键字)；left(预计剩余，示例：关键字)；consumed(总计消耗，示例：关键字)；type(任务类型，枚举：design 设计 \| devel 开发 \| request 需求 \| test 测试 \| study 研究 \| discuss 讨论 \| ui 界面 \| affair 事务 \| misc 其他)；story(相关用户故事，示例：all)；fromBug(来源Bug编号，枚举：design 设计 \| devel 开发 \| request 需求 \| test 测试 \| study 研究 \| discuss 讨论 \| ui 界面 \| affair 事务 \| misc 其他)；closedReason(关闭原因，枚举：done 已完成 \| cancel 已取消)；openedBy(由谁创建，用户，示例：admin)；finishedBy(由谁完成，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；canceledBy(由谁取消，用户，示例：admin)；lastEditedBy(最后修改，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；openedDate(创建日期，示例：2026-01-01)；deadline(截止日期，示例：2026-01-01)；estStarted(预计开始，示例：2026-01-01)；realStarted(实际开始，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；finishedDate(实际完成，示例：2026-01-01)；closedDate(关闭时间，示例：2026-01-01)；canceledDate(取消时间，示例：2026-01-01)；lastEditedDate(最后修改日期，示例：2026-01-01)；activatedDate(激活日期，示例：2026-01-01) |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`tasks`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/tasks", {
  "param": "<string>",
  "browseType": "assignedTo",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 指派给我的Bug

- SDK 调用：`request("my/bugs", params)`
- HTTP：`GET /my/bugs`
- 动作类型：`list`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `param` | string | 否 |  | 搜索参数；browseType=bysearch 或 bySearch 时必填。 |
| `browseType` | string | 否 | `assignedTo` | 状态，默认是assignedTo，取值取自 zt_bug 的字段名（区分大小写）<br>`assignedTo` 指派给我<br>`openedBy` 由我创建<br>`resolvedBy` 由我解决<br>`closedBy` 由我关闭<br>`assignedBy` 由我指派<br>`bysearch` 按查询搜索，需同时传 param |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`title_asc` 标题 升序<br>`title_desc` 标题 降序<br>`status_asc` 状态 升序<br>`status_desc` 状态 降序<br>`severity_asc` 严重程度 升序<br>`severity_desc` 严重程度 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(Bug标题，示例：关键字)；module(所属模块，模块，示例：0)；keywords(关键词，示例：关键字)；steps(重现步骤，示例：关键字)；assignedTo(指派给，用户，示例：admin)；resolvedBy(解决者，用户，示例：admin)；status(Bug状态，枚举：active 激活 \| resolved 已解决 \| closed 已关闭)；confirmed(是否确认，枚举：1 已确认 \| 0 未确认)；story(相关需求，示例：关键字)；project(所属项目，示例：all)；product(所属产品，示例：all)；branch(branch，示例：all)；plan(所属计划，示例：all)；id(Bug编号，示例：1)；execution(所属执行，执行，示例：3)；severity(严重程度，枚举：1 \| 2 \| 3 \| 4)；pri(优先级，枚举：1 \| 2 \| 3 \| 4)；type(Bug类型，枚举：codeerror 代码错误 \| config 配置相关 \| install 安装部署 \| security 安全相关 \| performance 性能问题 \| standard 标准规范 \| automation 测试脚本 \| designdefect 设计缺陷 \| codeimprovement 代码改进 \| others 其他)；os(操作系统，枚举：all 全部 \| windows Windows \| win11 Windows 11 \| win10 Windows 10 \| win8 Windows 8 \| win7 Windows 7 \| winxp Windows XP \| osx Mac OS \| android Android \| ios IOS \| linux Linux \| ubuntu Ubuntu \| chromeos Chrome OS \| fedora Fedora \| unix Unix \| others 其他)；browser(浏览器，枚举：all 全部 \| chrome Chrome \| edge Edge \| ie IE系列 \| ie11 IE11 \| ie10 IE10 \| ie9 IE9 \| ie8 IE8 \| firefox firefox系列 \| opera Opera系列 \| safari \| 360 360浏览器 \| qq QQ浏览器 \| other 其他)；resolution(解决方案，枚举：bydesign 设计如此 \| duplicate 重复Bug \| external 外部原因 \| fixed 已解决 \| notrepro 无法重现 \| postponed 延期处理 \| willnotfix 不予解决 \| tostory 转为用户故事)；activatedCount(激活次数，示例：关键字)；toTask(转任务，示例：关键字)；toStory(转用户故事，示例：关键字)；openedBy(由谁创建，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedBy(修改者，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；openedBuild(影响版本，示例：builds)；resolvedBuild(解决版本，示例：builds)；openedDate(创建日期，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；resolvedDate(解决日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(修改日期，示例：2026-01-01)；deadline(截止日期，示例：2026-01-01)；activatedDate(激活时间，示例：2026-01-01) |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`bugs`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/bugs", {
  "param": "<string>",
  "browseType": "assignedTo",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 指派给我的研发需求

- SDK 调用：`request("my/stories", params)`
- HTTP：`GET /my/stories`
- 动作类型：`list`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `param` | string | 否 |  | 搜索参数；browseType=bysearch 或 bySearch 时必填。 |
| `browseType` | string | 否 | `assignedTo` | 状态，默认是assignedTo，取值区分大小写<br>`all` 全部<br>`assignedTo` 指派给我<br>`openedBy` 由我创建<br>`reviewBy` 待我评审<br>`reviewedBy` 我评审过<br>`closedBy` 由我关闭<br>`assignedBy` 由我指派<br>`bysearch` 按查询搜索，需同时传 param |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`title_asc` 标题 升序<br>`title_desc` 标题 降序<br>`status_asc` 状态 升序<br>`status_desc` 状态 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(需求名称，示例：关键字)；id(编号，示例：1)；keywords(关键词，示例：关键字)；status(当前状态，枚举：draft 草稿 \| reviewing 评审中 \| active 激活 \| changing 变更中 \| closed 已关闭)；pri(优先级，枚举：1 \| 2 \| 3 \| 4)；module(所属模块，示例：all)；stage(所处阶段，枚举：wait 未开始 \| planned 已计划 \| projected 研发立项 \| designing 设计中 \| designed 设计完毕 \| developing 研发中 \| developed 研发完毕 \| testing 测试中 \| tested 测试完毕 \| verified 已验收 \| rejected 验收失败 \| delivering 交付中 \| delivered 已交付 \| released 已发布 \| closed 已关闭)；product(所属产品，示例：all)；branch(branch，示例：all)；grade(需求层级，示例：all)；plan(所属计划，示例：all)；release(所属发布，示例：all)；estimate(预计小时，示例：关键字)；source(来源，枚举：customer 客户 \| user 用户 \| po 产品经理 \| market 市场 \| service 客服 \| operation 运营 \| support 技术支持 \| competitor 竞争对手 \| partner 合作伙伴 \| dev 开发人员 \| tester 测试人员 \| bug Bug \| forum 论坛 \| other 其他)；sourceNote(来源备注，示例：关键字)；fromBug(来源Bug，示例：关键字)；category(类别，枚举：feature 功能 \| interface 接口 \| performance 性能 \| safe 安全 \| experience 体验 \| improve 改进 \| other 其他)；openedBy(由谁创建，用户，示例：admin)；reviewedBy(已评审人，用户，示例：admin)；result(评审结果，枚举：pass 确认通过 \| revert 撤销变更 \| clarify 有待明确 \| reject 拒绝)；assignedTo(指派给，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedBy(最后修改，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；closedReason(关闭原因，枚举：done 已完成 \| subdivided 已拆分 \| duplicate 重复 \| postponed 延期 \| willnotdo 不做 \| cancel 已取消 \| bydesign 设计如此)；version(版本号，示例：关键字)；openedDate(创建日期，示例：2026-01-01)；reviewedDate(评审时间，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(最后修改日期，示例：2026-01-01)；activatedDate(激活日期，示例：2026-01-01) |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`stories`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/stories", {
  "param": "<string>",
  "browseType": "assignedTo",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 指派给我的业务需求

- SDK 调用：`request("my/epics", params)`
- HTTP：`GET /my/epics`
- 动作类型：`list`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `param` | string | 否 |  | 搜索参数；browseType=bysearch 或 bySearch 时必填。 |
| `browseType` | string | 否 | `assignedTo` | 状态，默认是assignedTo，取值区分大小写<br>`all` 全部<br>`assignedTo` 指派给我<br>`openedBy` 由我创建<br>`reviewBy` 待我评审<br>`reviewedBy` 我评审过<br>`closedBy` 由我关闭<br>`assignedBy` 由我指派<br>`bysearch` 按查询搜索，需同时传 param |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`title_asc` 标题 升序<br>`title_desc` 标题 降序<br>`status_asc` 状态 升序<br>`status_desc` 状态 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(需求名称，示例：关键字)；id(编号，示例：1)；keywords(关键词，示例：关键字)；status(当前状态，枚举：draft 草稿 \| reviewing 评审中 \| active 激活 \| changing 变更中 \| closed 已关闭)；pri(优先级，枚举：1 \| 2 \| 3 \| 4)；module(所属模块，示例：all)；stage(所处阶段，枚举：wait 未开始 \| planned 已计划 \| projected 研发立项 \| designing 设计中 \| designed 设计完毕 \| developing 研发中 \| developed 研发完毕 \| testing 测试中 \| tested 测试完毕 \| verified 已验收 \| rejected 验收失败 \| delivering 交付中 \| delivered 已交付 \| released 已发布 \| closed 已关闭)；product(所属产品，示例：all)；branch(branch，示例：all)；grade(需求层级，示例：all)；plan(所属计划，示例：all)；release(所属发布，示例：all)；estimate(预计小时，示例：关键字)；source(来源，枚举：customer 客户 \| user 用户 \| po 产品经理 \| market 市场 \| service 客服 \| operation 运营 \| support 技术支持 \| competitor 竞争对手 \| partner 合作伙伴 \| dev 开发人员 \| tester 测试人员 \| bug Bug \| forum 论坛 \| other 其他)；sourceNote(来源备注，示例：关键字)；fromBug(来源Bug，示例：关键字)；category(类别，枚举：feature 功能 \| interface 接口 \| performance 性能 \| safe 安全 \| experience 体验 \| improve 改进 \| other 其他)；openedBy(由谁创建，用户，示例：admin)；reviewedBy(已评审人，用户，示例：admin)；result(评审结果，枚举：pass 确认通过 \| revert 撤销变更 \| clarify 有待明确 \| reject 拒绝)；assignedTo(指派给，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedBy(最后修改，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；closedReason(关闭原因，枚举：done 已完成 \| subdivided 已拆分 \| duplicate 重复 \| postponed 延期 \| willnotdo 不做 \| cancel 已取消 \| bydesign 设计如此)；version(版本号，示例：关键字)；openedDate(创建日期，示例：2026-01-01)；reviewedDate(评审时间，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(最后修改日期，示例：2026-01-01)；activatedDate(激活日期，示例：2026-01-01) |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`epics`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/epics", {
  "param": "<string>",
  "browseType": "assignedTo",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 指派给我的用户需求

- SDK 调用：`request("my/requirements", params)`
- HTTP：`GET /my/requirements`
- 动作类型：`list`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `param` | string | 否 |  | 搜索参数；browseType=bysearch 或 bySearch 时必填。 |
| `browseType` | string | 否 | `assignedTo` | 状态，默认是assignedTo，取值区分大小写<br>`all` 全部<br>`assignedTo` 指派给我<br>`openedBy` 由我创建<br>`reviewBy` 待我评审<br>`reviewedBy` 我评审过<br>`closedBy` 由我关闭<br>`assignedBy` 由我指派<br>`bysearch` 按查询搜索，需同时传 param |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`title_asc` 标题 升序<br>`title_desc` 标题 降序<br>`status_asc` 状态 升序<br>`status_desc` 状态 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(需求名称，示例：关键字)；id(编号，示例：1)；keywords(关键词，示例：关键字)；status(当前状态，枚举：draft 草稿 \| reviewing 评审中 \| active 激活 \| changing 变更中 \| closed 已关闭)；pri(优先级，枚举：1 \| 2 \| 3 \| 4)；module(所属模块，示例：all)；stage(所处阶段，枚举：wait 未开始 \| planned 已计划 \| projected 研发立项 \| designing 设计中 \| designed 设计完毕 \| developing 研发中 \| developed 研发完毕 \| testing 测试中 \| tested 测试完毕 \| verified 已验收 \| rejected 验收失败 \| delivering 交付中 \| delivered 已交付 \| released 已发布 \| closed 已关闭)；product(所属产品，示例：all)；branch(branch，示例：all)；grade(需求层级，示例：all)；plan(所属计划，示例：all)；release(所属发布，示例：all)；estimate(预计小时，示例：关键字)；source(来源，枚举：customer 客户 \| user 用户 \| po 产品经理 \| market 市场 \| service 客服 \| operation 运营 \| support 技术支持 \| competitor 竞争对手 \| partner 合作伙伴 \| dev 开发人员 \| tester 测试人员 \| bug Bug \| forum 论坛 \| other 其他)；sourceNote(来源备注，示例：关键字)；fromBug(来源Bug，示例：关键字)；category(类别，枚举：feature 功能 \| interface 接口 \| performance 性能 \| safe 安全 \| experience 体验 \| improve 改进 \| other 其他)；openedBy(由谁创建，用户，示例：admin)；reviewedBy(已评审人，用户，示例：admin)；result(评审结果，枚举：pass 确认通过 \| revert 撤销变更 \| clarify 有待明确 \| reject 拒绝)；assignedTo(指派给，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedBy(最后修改，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；closedReason(关闭原因，枚举：done 已完成 \| subdivided 已拆分 \| duplicate 重复 \| postponed 延期 \| willnotdo 不做 \| cancel 已取消 \| bydesign 设计如此)；version(版本号，示例：关键字)；openedDate(创建日期，示例：2026-01-01)；reviewedDate(评审时间，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(最后修改日期，示例：2026-01-01)；activatedDate(激活日期，示例：2026-01-01) |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`requirements`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/requirements", {
  "param": "<string>",
  "browseType": "assignedTo",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 我负责的的测试单

- SDK 调用：`request("my/testtasks", params)`
- HTTP：`GET /my/testtasks`
- 动作类型：`list`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `param` | string | 否 |  | 搜索参数；browseType=bysearch 或 bySearch 时必填。 |
| `browseType` | string | 否 | `assignedTo` | 状态，默认是assignedTo，接口固定返回“我参与的未完成测试单”<br>`assignedTo` 我参与的<br>`bySearch` 按查询搜索，需同时传 param |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`name_asc` 名称 升序<br>`name_desc` 名称 降序<br>`status_asc` 状态 升序<br>`status_desc` 状态 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`testtasks`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/testtasks", {
  "param": "<string>",
  "browseType": "assignedTo",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1
});
```
## 我参与的项目

- SDK 调用：`request("my/projects", params)`
- HTTP：`GET /my/projects`
- 动作类型：`list`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `doing` | 状态，默认是doing<br>`doing` 进行中<br>`wait` 未开始<br>`suspended` 已挂起<br>`closed` 已关闭<br>`done` 已完成<br>`undone` 未完成<br>`delayed` 已延期<br>`openedbyme` 由我创建<br>`all` 全部 |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`name_asc` 名称 升序<br>`name_desc` 名称 降序<br>`status_asc` 状态 升序<br>`status_desc` 状态 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`projects`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/projects", {
  "browseType": "doing",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1
});
```
## 指派给我的反馈

- SDK 调用：`request("my/feedbacks", params)`
- HTTP：`GET /my/feedbacks`
- 动作类型：`list`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `assigntome` | 状态，默认是assigntome<br>`assigntome` 指派给我<br>`unclosed` 未关闭<br>`wait` 待处理<br>`doing` 处理中<br>`toclosed` 待关闭<br>`openedbyme` 由我创建<br>`reviewedbyme` 我评审过<br>`closedbyme` 由我关闭<br>`assignedbyme` 由我指派 |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`title_asc` 标题 升序<br>`title_desc` 标题 降序<br>`status_asc` 状态 升序<br>`status_desc` 状态 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activatedBy,activatedDate,assignedTo,closedBy,closedDate,closedReason,desc,feedbackBy,id,keywords,mailto,module,notifyEmail,openedBy,openedDate,pri,processedBy,processedDate,product,public,reviewedBy,solution,source,status,title,type |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`feedbacks`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/feedbacks", {
  "browseType": "assigntome",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 指派给我的工单

- SDK 调用：`request("my/tickets", params)`
- HTTP：`GET /my/tickets`
- 动作类型：`list`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `assignedtome` | 状态，默认是assignedtome<br>`assignedtome` 指派给我<br>`unclosed` 未关闭<br>`wait` 待处理<br>`doing` 处理中<br>`done` 待关闭<br>`closed` 已关闭<br>`openedbyme` 由我创建<br>`finishedbyme` 由我解决<br>`closedbyme` 由我关闭<br>`assignedbyme` 由我指派 |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`title_asc` 标题 升序<br>`title_desc` 标题 降序<br>`status_asc` 状态 升序<br>`status_desc` 状态 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activatedBy,activatedCount,activatedDate,assignedTo,closedBy,closedDate,closedReason,contact,customer,deadline,desc,editedBy,editedDate,feedback,id,keywords,mailto,module,notifyEmail,openedBuild,openedBy,openedDate,pri,product,resolution,resolvedBy,resolvedDate,startedBy,startedDate,status,title,type |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`tickets`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/tickets", {
  "browseType": "assignedtome",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 指派给我的用例

- SDK 调用：`request("my/testcases", params)`
- HTTP：`GET /my/testcases`
- 动作类型：`list`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `param` | string | 否 |  | 搜索参数；browseType=bysearch 或 bySearch 时必填。 |
| `browseType` | string | 否 | `assigntome` | 状态，默认是assigntome<br>`assigntome` 指派给我<br>`openedbyme` 我创建的<br>`bysearch` 按查询搜索，需同时传 param |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`title_asc` 标题 升序<br>`title_desc` 标题 降序<br>`status_asc` 状态 升序<br>`status_desc` 状态 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(用例名称，示例：关键字)；story(关联需求，示例：all)；id(用例编号，示例：1)；keywords(关键词，示例：关键字)；lastEditedBy(修改者，用户，示例：admin)；type(用例类型，枚举：unit 单元测试 \| interface 接口测试 \| feature 功能测试 \| install 安装部署 \| config 配置相关 \| performance 性能测试 \| security 安全相关 \| other 其他)；auto(自动化，枚举：auto 是 \| no 否)；openedBy(由谁创建，用户，示例：admin)；status(用例状态，枚举：wait 待评审 \| normal 正常 \| blocked 被阻塞 \| investigate 研究中)；product(所属产品，示例：all)；branch(branch，示例：all)；stage(适用环节，枚举：unittest 单元测试环节 \| feature 功能测试环节 \| intergrate 集成测试环节 \| system 系统测试环节 \| smoke 冒烟测试环节 \| bvt 版本验证环节)；module(所属模块，模块，示例：0)；pri(优先级，枚举：3 \| 1 \| 2 \| 4)；lib(所属库，示例：all)；lastRunner(执行人，用户，示例：admin)；lastRunResult(结果，枚举：pass 通过 \| fail 失败 \| blocked 阻塞 \| null 未执行)；lastRunDate(执行时间，示例：2026-01-01)；openedDate(创建日期，示例：2026-01-01)；lastEditedDate(修改日期，示例：2026-01-01)；scene(所属场景，示例：all) |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`testcases`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/testcases", {
  "param": "<string>",
  "browseType": "assigntome",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 我的会议

- SDK 调用：`request("my/meetings", params)`
- HTTP：`GET /my/meetings`
- 动作类型：`list`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `futureMeeting` | 状态，默认是futureMeeting<br>`futureMeeting` 我参加的（未开始）<br>`all` 全部<br>`booked` 我预约的<br>`participate` 我参加的（全部） |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`name_asc` 名称 升序<br>`name_desc` 名称 降序<br>`date_asc` 日期 升序<br>`date_desc` 日期 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`meetings`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/meetings", {
  "browseType": "futureMeeting",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1
});
```
## 指派给我的问题

- SDK 调用：`request("my/issues", params)`
- HTTP：`GET /my/issues`
- 动作类型：`list`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `param` | string | 否 |  | 搜索参数；browseType=bysearch 或 bySearch 时必填。 |
| `browseType` | string | 否 | `assignedTo` | 状态，默认是assignedTo，取值取自 zt_issue 的字段名<br>`assignedTo` 指派给我<br>`createdBy` 由我创建<br>`resolvedBy` 由我解决<br>`closedBy` 由我关闭<br>`assignedBy` 由我指派<br>`bysearch` 按查询搜索，需同时传 param |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`title_asc` 标题 升序<br>`title_desc` 标题 降序<br>`severity_asc` 严重程度 升序<br>`severity_desc` 严重程度 降序<br>`status_asc` 状态 升序<br>`status_desc` 状态 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`issues`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/issues", {
  "param": "<string>",
  "browseType": "assignedTo",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1
});
```
## 指派给我的风险

- SDK 调用：`request("my/risks", params)`
- HTTP：`GET /my/risks`
- 动作类型：`list`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `param` | string | 否 |  | 搜索参数；browseType=bysearch 或 bySearch 时必填。 |
| `browseType` | string | 否 | `assignedTo` | 状态，默认是assignedTo，取值取自 zt_risk 的字段名<br>`assignedTo` 指派给我<br>`createdBy` 由我创建<br>`closedBy` 由我关闭<br>`assignedBy` 由我指派<br>`bysearch` 按查询搜索，需同时传 param |
| `orderBy` | string | 否 |  | 排序<br>`id_asc` ID 升序<br>`id_desc` ID 降序<br>`name_asc` 名称 升序<br>`name_desc` 名称 降序<br>`status_asc` 状态 升序<br>`status_desc` 状态 降序<br>`pri_asc` 优先级 升序<br>`pri_desc` 优先级 降序 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activateBy,actualClosedDate,assignedTo,cancelBy,category,createdBy,createdDate,editedBy,editedDate,hangupBy,id,identifiedDate,impact,name,plannedClosedDate,prevention,pri,probability,project,rate,remedy,resolution,resolvedBy,source,status,strategy,trackedBy |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`risks`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/risks", {
  "param": "<string>",
  "browseType": "assignedTo",
  "orderBy": "id_asc",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 我的地盘-贡献任务

- SDK 调用：`request("my/activityTasks", params)`
- HTTP：`GET /my/activity/tasks`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 |  | 贡献筛选类型，不传时使用禅道页面默认值。 |
| `orderBy` | string | 否 |  | 排序字段。 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：name(任务名称，示例：关键字)；keywords(关键词，示例：关键字)；id(编号，示例：1)；status(任务状态，枚举：wait 未开始 \| doing 进行中 \| done 已完成 \| pause 已暂停 \| cancel 已取消 \| closed 已关闭)；desc(任务描述，示例：关键字)；assignedTo(指派给，用户，示例：admin)；pri(优先级，枚举：1 \| 2 \| 3 \| 4)；project(所属项目，示例：all)；execution(所属执行，示例：all)；module(所属模块，示例：all)；estimate(最初预计，示例：关键字)；left(预计剩余，示例：关键字)；consumed(总计消耗，示例：关键字)；type(任务类型，枚举：design 设计 \| devel 开发 \| request 需求 \| test 测试 \| study 研究 \| discuss 讨论 \| ui 界面 \| affair 事务 \| misc 其他)；story(相关用户故事，示例：all)；fromBug(来源Bug编号，枚举：design 设计 \| devel 开发 \| request 需求 \| test 测试 \| study 研究 \| discuss 讨论 \| ui 界面 \| affair 事务 \| misc 其他)；closedReason(关闭原因，枚举：done 已完成 \| cancel 已取消)；openedBy(由谁创建，用户，示例：admin)；finishedBy(由谁完成，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；canceledBy(由谁取消，用户，示例：admin)；lastEditedBy(最后修改，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；openedDate(创建日期，示例：2026-01-01)；deadline(截止日期，示例：2026-01-01)；estStarted(预计开始，示例：2026-01-01)；realStarted(实际开始，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；finishedDate(实际完成，示例：2026-01-01)；closedDate(关闭时间，示例：2026-01-01)；canceledDate(取消时间，示例：2026-01-01)；lastEditedDate(最后修改日期，示例：2026-01-01)；activatedDate(激活日期，示例：2026-01-01) |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`tasks`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/activityTasks", {
  "browseType": "<string>",
  "orderBy": "<string>",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 我的地盘-贡献 Bug

- SDK 调用：`request("my/activityBugs", params)`
- HTTP：`GET /my/activity/bugs`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 |  | 贡献筛选类型，不传时使用禅道页面默认值。 |
| `orderBy` | string | 否 |  | 排序字段。 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(Bug标题，示例：关键字)；module(所属模块，模块，示例：0)；keywords(关键词，示例：关键字)；steps(重现步骤，示例：关键字)；assignedTo(指派给，用户，示例：admin)；resolvedBy(解决者，用户，示例：admin)；status(Bug状态，枚举：active 激活 \| resolved 已解决 \| closed 已关闭)；confirmed(是否确认，枚举：1 已确认 \| 0 未确认)；story(相关需求，示例：关键字)；project(所属项目，示例：all)；product(所属产品，示例：all)；branch(branch，示例：all)；plan(所属计划，示例：all)；id(Bug编号，示例：1)；execution(所属执行，执行，示例：3)；severity(严重程度，枚举：1 \| 2 \| 3 \| 4)；pri(优先级，枚举：1 \| 2 \| 3 \| 4)；type(Bug类型，枚举：codeerror 代码错误 \| config 配置相关 \| install 安装部署 \| security 安全相关 \| performance 性能问题 \| standard 标准规范 \| automation 测试脚本 \| designdefect 设计缺陷 \| codeimprovement 代码改进 \| others 其他)；os(操作系统，枚举：all 全部 \| windows Windows \| win11 Windows 11 \| win10 Windows 10 \| win8 Windows 8 \| win7 Windows 7 \| winxp Windows XP \| osx Mac OS \| android Android \| ios IOS \| linux Linux \| ubuntu Ubuntu \| chromeos Chrome OS \| fedora Fedora \| unix Unix \| others 其他)；browser(浏览器，枚举：all 全部 \| chrome Chrome \| edge Edge \| ie IE系列 \| ie11 IE11 \| ie10 IE10 \| ie9 IE9 \| ie8 IE8 \| firefox firefox系列 \| opera Opera系列 \| safari \| 360 360浏览器 \| qq QQ浏览器 \| other 其他)；resolution(解决方案，枚举：bydesign 设计如此 \| duplicate 重复Bug \| external 外部原因 \| fixed 已解决 \| notrepro 无法重现 \| postponed 延期处理 \| willnotfix 不予解决 \| tostory 转为用户故事)；activatedCount(激活次数，示例：关键字)；toTask(转任务，示例：关键字)；toStory(转用户故事，示例：关键字)；openedBy(由谁创建，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedBy(修改者，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；openedBuild(影响版本，示例：builds)；resolvedBuild(解决版本，示例：builds)；openedDate(创建日期，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；resolvedDate(解决日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(修改日期，示例：2026-01-01)；deadline(截止日期，示例：2026-01-01)；activatedDate(激活时间，示例：2026-01-01) |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`bugs`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/activityBugs", {
  "browseType": "<string>",
  "orderBy": "<string>",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 我的地盘-贡献研发需求

- SDK 调用：`request("my/activityStories", params)`
- HTTP：`GET /my/activity/stories`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 |  | 贡献筛选类型，不传时使用禅道页面默认值。 |
| `orderBy` | string | 否 |  | 排序字段。 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(需求名称，示例：关键字)；id(编号，示例：1)；keywords(关键词，示例：关键字)；status(当前状态，枚举：draft 草稿 \| reviewing 评审中 \| active 激活 \| changing 变更中 \| closed 已关闭)；pri(优先级，枚举：1 \| 2 \| 3 \| 4)；module(所属模块，示例：all)；stage(所处阶段，枚举：wait 未开始 \| planned 已计划 \| projected 研发立项 \| designing 设计中 \| designed 设计完毕 \| developing 研发中 \| developed 研发完毕 \| testing 测试中 \| tested 测试完毕 \| verified 已验收 \| rejected 验收失败 \| delivering 交付中 \| delivered 已交付 \| released 已发布 \| closed 已关闭)；product(所属产品，示例：all)；branch(branch，示例：all)；grade(需求层级，示例：all)；plan(所属计划，示例：all)；release(所属发布，示例：all)；estimate(预计小时，示例：关键字)；source(来源，枚举：customer 客户 \| user 用户 \| po 产品经理 \| market 市场 \| service 客服 \| operation 运营 \| support 技术支持 \| competitor 竞争对手 \| partner 合作伙伴 \| dev 开发人员 \| tester 测试人员 \| bug Bug \| forum 论坛 \| other 其他)；sourceNote(来源备注，示例：关键字)；fromBug(来源Bug，示例：关键字)；category(类别，枚举：feature 功能 \| interface 接口 \| performance 性能 \| safe 安全 \| experience 体验 \| improve 改进 \| other 其他)；openedBy(由谁创建，用户，示例：admin)；reviewedBy(已评审人，用户，示例：admin)；result(评审结果，枚举：pass 确认通过 \| revert 撤销变更 \| clarify 有待明确 \| reject 拒绝)；assignedTo(指派给，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedBy(最后修改，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；closedReason(关闭原因，枚举：done 已完成 \| subdivided 已拆分 \| duplicate 重复 \| postponed 延期 \| willnotdo 不做 \| cancel 已取消 \| bydesign 设计如此)；version(版本号，示例：关键字)；openedDate(创建日期，示例：2026-01-01)；reviewedDate(评审时间，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(最后修改日期，示例：2026-01-01)；activatedDate(激活日期，示例：2026-01-01) |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`stories`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/activityStories", {
  "browseType": "<string>",
  "orderBy": "<string>",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 我的地盘-贡献业务需求

- SDK 调用：`request("my/activityEpics", params)`
- HTTP：`GET /my/activity/epics`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 |  | 贡献筛选类型，不传时使用禅道页面默认值。 |
| `orderBy` | string | 否 |  | 排序字段。 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(需求名称，示例：关键字)；id(编号，示例：1)；keywords(关键词，示例：关键字)；status(当前状态，枚举：draft 草稿 \| reviewing 评审中 \| active 激活 \| changing 变更中 \| closed 已关闭)；pri(优先级，枚举：1 \| 2 \| 3 \| 4)；module(所属模块，示例：all)；stage(所处阶段，枚举：wait 未开始 \| planned 已计划 \| projected 研发立项 \| designing 设计中 \| designed 设计完毕 \| developing 研发中 \| developed 研发完毕 \| testing 测试中 \| tested 测试完毕 \| verified 已验收 \| rejected 验收失败 \| delivering 交付中 \| delivered 已交付 \| released 已发布 \| closed 已关闭)；product(所属产品，示例：all)；branch(branch，示例：all)；grade(需求层级，示例：all)；plan(所属计划，示例：all)；release(所属发布，示例：all)；estimate(预计小时，示例：关键字)；source(来源，枚举：customer 客户 \| user 用户 \| po 产品经理 \| market 市场 \| service 客服 \| operation 运营 \| support 技术支持 \| competitor 竞争对手 \| partner 合作伙伴 \| dev 开发人员 \| tester 测试人员 \| bug Bug \| forum 论坛 \| other 其他)；sourceNote(来源备注，示例：关键字)；fromBug(来源Bug，示例：关键字)；category(类别，枚举：feature 功能 \| interface 接口 \| performance 性能 \| safe 安全 \| experience 体验 \| improve 改进 \| other 其他)；openedBy(由谁创建，用户，示例：admin)；reviewedBy(已评审人，用户，示例：admin)；result(评审结果，枚举：pass 确认通过 \| revert 撤销变更 \| clarify 有待明确 \| reject 拒绝)；assignedTo(指派给，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedBy(最后修改，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；closedReason(关闭原因，枚举：done 已完成 \| subdivided 已拆分 \| duplicate 重复 \| postponed 延期 \| willnotdo 不做 \| cancel 已取消 \| bydesign 设计如此)；version(版本号，示例：关键字)；openedDate(创建日期，示例：2026-01-01)；reviewedDate(评审时间，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(最后修改日期，示例：2026-01-01)；activatedDate(激活日期，示例：2026-01-01) |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`epics`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/activityEpics", {
  "browseType": "<string>",
  "orderBy": "<string>",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 我的地盘-贡献用户需求

- SDK 调用：`request("my/activityRequirements", params)`
- HTTP：`GET /my/activity/requirements`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 |  | 贡献筛选类型，不传时使用禅道页面默认值。 |
| `orderBy` | string | 否 |  | 排序字段。 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(需求名称，示例：关键字)；id(编号，示例：1)；keywords(关键词，示例：关键字)；status(当前状态，枚举：draft 草稿 \| reviewing 评审中 \| active 激活 \| changing 变更中 \| closed 已关闭)；pri(优先级，枚举：1 \| 2 \| 3 \| 4)；module(所属模块，示例：all)；stage(所处阶段，枚举：wait 未开始 \| planned 已计划 \| projected 研发立项 \| designing 设计中 \| designed 设计完毕 \| developing 研发中 \| developed 研发完毕 \| testing 测试中 \| tested 测试完毕 \| verified 已验收 \| rejected 验收失败 \| delivering 交付中 \| delivered 已交付 \| released 已发布 \| closed 已关闭)；product(所属产品，示例：all)；branch(branch，示例：all)；grade(需求层级，示例：all)；plan(所属计划，示例：all)；release(所属发布，示例：all)；estimate(预计小时，示例：关键字)；source(来源，枚举：customer 客户 \| user 用户 \| po 产品经理 \| market 市场 \| service 客服 \| operation 运营 \| support 技术支持 \| competitor 竞争对手 \| partner 合作伙伴 \| dev 开发人员 \| tester 测试人员 \| bug Bug \| forum 论坛 \| other 其他)；sourceNote(来源备注，示例：关键字)；fromBug(来源Bug，示例：关键字)；category(类别，枚举：feature 功能 \| interface 接口 \| performance 性能 \| safe 安全 \| experience 体验 \| improve 改进 \| other 其他)；openedBy(由谁创建，用户，示例：admin)；reviewedBy(已评审人，用户，示例：admin)；result(评审结果，枚举：pass 确认通过 \| revert 撤销变更 \| clarify 有待明确 \| reject 拒绝)；assignedTo(指派给，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedBy(最后修改，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；closedReason(关闭原因，枚举：done 已完成 \| subdivided 已拆分 \| duplicate 重复 \| postponed 延期 \| willnotdo 不做 \| cancel 已取消 \| bydesign 设计如此)；version(版本号，示例：关键字)；openedDate(创建日期，示例：2026-01-01)；reviewedDate(评审时间，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(最后修改日期，示例：2026-01-01)；activatedDate(激活日期，示例：2026-01-01) |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`requirements`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/activityRequirements", {
  "browseType": "<string>",
  "orderBy": "<string>",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 我的地盘-贡献测试单

- SDK 调用：`request("my/activityTestTasks", params)`
- HTTP：`GET /my/activity/testtasks`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 |  | 贡献筛选类型，不传时使用禅道页面默认值。 |
| `orderBy` | string | 否 |  | 排序字段。 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`testtasks`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/activityTestTasks", {
  "browseType": "<string>",
  "orderBy": "<string>",
  "recPerPage": 1,
  "pageID": 1
});
```
## 我的地盘-贡献用例

- SDK 调用：`request("my/activityTestCases", params)`
- HTTP：`GET /my/activity/testcases`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 |  | 贡献筛选类型，不传时使用禅道页面默认值。 |
| `orderBy` | string | 否 |  | 排序字段。 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(用例名称，示例：关键字)；story(关联需求，示例：all)；id(用例编号，示例：1)；keywords(关键词，示例：关键字)；lastEditedBy(修改者，用户，示例：admin)；type(用例类型，枚举：unit 单元测试 \| interface 接口测试 \| feature 功能测试 \| install 安装部署 \| config 配置相关 \| performance 性能测试 \| security 安全相关 \| other 其他)；auto(自动化，枚举：auto 是 \| no 否)；openedBy(由谁创建，用户，示例：admin)；status(用例状态，枚举：wait 待评审 \| normal 正常 \| blocked 被阻塞 \| investigate 研究中)；product(所属产品，示例：all)；branch(branch，示例：all)；stage(适用环节，枚举：unittest 单元测试环节 \| feature 功能测试环节 \| intergrate 集成测试环节 \| system 系统测试环节 \| smoke 冒烟测试环节 \| bvt 版本验证环节)；module(所属模块，模块，示例：0)；pri(优先级，枚举：3 \| 1 \| 2 \| 4)；lib(所属库，示例：all)；lastRunner(执行人，用户，示例：admin)；lastRunResult(结果，枚举：pass 通过 \| fail 失败 \| blocked 阻塞 \| null 未执行)；lastRunDate(执行时间，示例：2026-01-01)；openedDate(创建日期，示例：2026-01-01)；lastEditedDate(修改日期，示例：2026-01-01)；scene(所属场景，示例：all) |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`testcases`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/activityTestCases", {
  "browseType": "<string>",
  "orderBy": "<string>",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 我的地盘-贡献文档

- SDK 调用：`request("my/activityDocs", params)`
- HTTP：`GET /my/activity/docs`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 |  | 贡献筛选类型，不传时使用禅道页面默认值。 |
| `orderBy` | string | 否 |  | 排序字段。 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`docs`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/activityDocs", {
  "browseType": "<string>",
  "orderBy": "<string>",
  "recPerPage": 1,
  "pageID": 1
});
```
## 我的地盘-贡献问题

- SDK 调用：`request("my/activityIssues", params)`
- HTTP：`GET /my/activity/issues`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 |  | 贡献筛选类型，不传时使用禅道页面默认值。 |
| `orderBy` | string | 否 |  | 排序字段。 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`issues`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/activityIssues", {
  "browseType": "<string>",
  "orderBy": "<string>",
  "recPerPage": 1,
  "pageID": 1
});
```
## 我的地盘-贡献风险

- SDK 调用：`request("my/activityRisks", params)`
- HTTP：`GET /my/activity/risks`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 |  | 贡献筛选类型，不传时使用禅道页面默认值。 |
| `orderBy` | string | 否 |  | 排序字段。 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activateBy,actualClosedDate,assignedTo,cancelBy,category,createdBy,createdDate,editedBy,editedDate,hangupBy,id,identifiedDate,impact,name,plannedClosedDate,prevention,pri,probability,project,rate,remedy,resolution,resolvedBy,source,status,strategy,trackedBy |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`risks`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/activityRisks", {
  "browseType": "<string>",
  "orderBy": "<string>",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 我的地盘-贡献评审问题

- SDK 调用：`request("my/activityReviewIssues", params)`
- HTTP：`GET /my/activity/reviewissues`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 |  | 贡献筛选类型，不传时使用禅道页面默认值。 |
| `orderBy` | string | 否 |  | 排序字段。 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：assignedDate,assignedTo,createdBy,createdDate,id,opinion,resolution,review,status,title,type |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`reviewissues`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/activityReviewIssues", {
  "browseType": "<string>",
  "orderBy": "<string>",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 我的地盘-贡献反馈

- SDK 调用：`request("my/activityFeedbacks", params)`
- HTTP：`GET /my/activity/feedbacks`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 |  | 贡献筛选类型，不传时使用禅道页面默认值。 |
| `orderBy` | string | 否 |  | 排序字段。 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activatedBy,activatedDate,assignedTo,closedBy,closedDate,closedReason,desc,feedbackBy,id,keywords,mailto,module,notifyEmail,openedBy,openedDate,pri,processedBy,processedDate,product,public,reviewedBy,solution,source,status,title,type |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`feedbacks`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/activityFeedbacks", {
  "browseType": "<string>",
  "orderBy": "<string>",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 我的地盘-贡献审批

- SDK 调用：`request("my/activityAudits", params)`
- HTTP：`GET /my/activity/audits`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 |  | 贡献筛选类型，不传时使用禅道页面默认值。 |
| `orderBy` | string | 否 |  | 排序字段。 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`audits`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/activityAudits", {
  "browseType": "<string>",
  "orderBy": "<string>",
  "recPerPage": 1,
  "pageID": 1
});
```
## 我的地盘-待处理评审问题

- SDK 调用：`request("my/reviewIssues", params)`
- HTTP：`GET /my/reviewissues`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `param` | string | 否 |  | 搜索参数；browseType=bysearch 或 bySearch 时必填。 |
| `browseType` | string | 否 | `assignedTo` | 待处理筛选类型，默认 assignedTo，取值取自 zt_reviewissue 的字段名<br>`assignedTo` 指派给我<br>`createdBy` 由我创建<br>`resolutionBy` 由我解决<br>`assignedBy` 由我指派<br>`bysearch` 按查询搜索，需同时传 param |
| `orderBy` | string | 否 |  | 排序字段。 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：assignedDate,assignedTo,createdBy,createdDate,id,opinion,resolution,review,status,title,type |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`reviewissues`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/reviewIssues", {
  "param": "<string>",
  "browseType": "assignedTo",
  "orderBy": "<string>",
  "recPerPage": 1,
  "pageID": 1,
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 我的地盘-待处理审批

- SDK 调用：`request("my/audits", params)`
- HTTP：`GET /my/audits`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `all` | 待处理审批类型，默认 all<br>`all` 全部<br>`demand` 需求池需求<br>`story` 研发需求<br>`requirement` 用户需求<br>`epic` 业务需求<br>`testcase` 用例<br>`project` 项目<br>`ppm` 评审请求<br>`feedback` 反馈<br>`自定义工作流模块代号` 自定义工作流模块代号 |
| `orderBy` | string | 否 |  | 排序字段。 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`audits`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/audits", {
  "browseType": "all",
  "orderBy": "<string>",
  "recPerPage": 1,
  "pageID": 1
});
```
## 我的地盘-待处理审计计划

- SDK 调用：`request("my/auditPlans", params)`
- HTTP：`GET /my/auditplans`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `mychecking` | 待处理筛选类型，默认 mychecking，取值不区分大小写<br>`mychecking` 待我检查<br>`checked` 已检查<br>`wait` 未检查<br>`checking` 检查中<br>`assignto` 指派给我<br>`delay` 已延期<br>`iscycle` 周期性计划<br>`all` 全部 |
| `orderBy` | string | 否 |  | 排序字段。 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`auditplans`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/auditPlans", {
  "browseType": "mychecking",
  "orderBy": "<string>",
  "recPerPage": 1,
  "pageID": 1
});
```
## 我的地盘-待处理不符合项

- SDK 调用：`request("my/ncs", params)`
- HTTP：`GET /my/ncs`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `browseType` | string | 否 | `assignedToMe` | 待处理筛选类型，默认 assignedToMe<br>`assignedToMe` 指派给我<br>`createdByMe` 由我创建<br>`resolvedByMe` 由我解决<br>`closedByMe` 由我关闭<br>`all` 全部 |
| `orderBy` | string | 否 |  | 排序字段。 |
| `recPerPage` | number | 否 |  | 每页数量，不超过1000 |
| `pageID` | number | 否 |  | 页码，从第1页开始 |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 结果字段：`ncs`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/ncs", {
  "browseType": "assignedToMe",
  "orderBy": "<string>",
  "recPerPage": 1,
  "pageID": 1
});
```
## 添加我的 SSH 公钥

需部署代码库 API 2.0 实现并配置 GitFox，将公钥添加到当前 Token 用户的 GitFox 账号，account 不能改变归属。成功仅返回 message，不返回密钥 ID；公钥错误保留在 rawMessage.publicKey 中。

- SDK 调用：`request("my/createSSH", params)`
- HTTP：`POST /my/sshkeys`
- 动作类型：`action`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

无查询参数。

### 请求体

请求体必填：是
请求媒体类型：`application/json`

Schema:

```json
{
  "type": "object",
  "required": [
    "name",
    "publicKey"
  ],
  "example": {
    "name": "coder",
    "publicKey": "ssh-ed25519 <替换为完整公钥内容> coder"
  },
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "pattern": "^[A-Za-z0-9_.$-]+$",
      "description": "密钥名称，去除首尾空白后仅允许英文字母、数字、连字符、下划线、点和 $"
    },
    "publicKey": {
      "type": "string",
      "minLength": 1,
      "description": "完整单行 SSH 公钥文本，去除首尾空白；支持 ssh-rsa、ecdsa-sha2-nistp256/384/521、ssh-ed25519、sk-ecdsa-sha2-nistp256@openssh.com、sk-ssh-ed25519@openssh.com 前缀，完整性及重复检查由 GitFox 处理"
    }
  }
}
```

示例:

```json
{
  "name": "coder",
  "publicKey": "ssh-ed25519 <替换为完整公钥内容> coder"
}
```

### 返回值

- 返回形态：`text`
- 结果字段：`message`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("my/createSSH", {
  "name": "coder",
  "publicKey": "ssh-ed25519 <替换为完整公钥内容> coder"
});
```
