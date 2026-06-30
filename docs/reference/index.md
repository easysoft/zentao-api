# zentao-api

## Classes

| Class | Description |
| ------ | ------ |
| [ZentaoClient](classes/ZentaoClient.md) | 禅道 API 客户端，封装一次次原始 HTTP 调用。 |
| [ZentaoError](classes/ZentaoError.md) | SDK 统一错误类型。 |

## Interfaces

| Interface | Description |
| ------ | ------ |
| [ApiListResponse](interfaces/ApiListResponse.md) | 禅道 API 列表响应结构。 |
| [ApiResponse](interfaces/ApiResponse.md) | 禅道 API 通用响应结构，允许携带任意业务字段。 |
| [ClientRequestOptions](interfaces/ClientRequestOptions.md) | `ZentaoClient.request()` 的单次请求选项。 |
| [DataRecordFilter](interfaces/DataRecordFilter.md) | 单条过滤条件，字段名支持 `.` 访问子字段。 |
| [DataRecordFilterGroup](interfaces/DataRecordFilterGroup.md) | 一组过滤条件，组内按 `operator` 组合；多组之间按 AND 组合。 |
| [DefineModulesOptions](interfaces/DefineModulesOptions.md) | [defineModules](functions/defineModules.md) 的选项。 |
| [GlobalOptions](interfaces/GlobalOptions.md) | SDK 进程级全局默认选项，供高阶 [request](functions/request.md) 调用复用。 |
| [LoginResponse](interfaces/LoginResponse.md) | 登录接口响应结构。 |
| [ModuleAction](interfaces/ModuleAction.md) | 禅道模块中的单个 API 动作定义。 |
| [ModuleActionPagerGetterMap](interfaces/ModuleActionPagerGetterMap.md) | 从原始响应中提取分页字段时使用的字段映射，值为原始响应中的字段路径（支持 `a.b` 嵌套）。 |
| [ModuleActionParam](interfaces/ModuleActionParam.md) | 模块动作的查询参数定义。 |
| [ModuleActionRequest](interfaces/ModuleActionRequest.md) | 将模块动作和参数解析后的可执行请求描述。 |
| [ModuleActionRequestBody](interfaces/ModuleActionRequestBody.md) | 模块动作请求体定义。 |
| [ModuleActionResponse](interfaces/ModuleActionResponse.md) | 模块动作响应定义。 |
| [ModuleDefinition](interfaces/ModuleDefinition.md) | 禅道模块定义，由多个动作组成。 |
| [Pager](interfaces/Pager.md) | 禅道 API 原始分页结构。 |
| [ProcessListOptions](interfaces/ProcessListOptions.md) | [processData](functions/processData.md) 处理列表时的选项；执行顺序为 过滤 → 搜索 → 排序 → 限制数量 → 摘取。 |
| [ProcessSingleOptions](interfaces/ProcessSingleOptions.md) | [processData](functions/processData.md) 处理单条对象时的选项。 |
| [RequestOptions](interfaces/RequestOptions.md) | 高阶 `request("moduleName")` / `request("moduleName/methodName")` / `request("moduleName/<objectID>")` 的单次调用选项。 |
| [ResponseData](interfaces/ResponseData.md) | 高阶 `request()` 归一化后的返回数据。 |
| [ServerConfig](interfaces/ServerConfig.md) | 禅道 `?mode=getconfig` 返回的服务端配置。 |
| [ZentaoClientOptions](interfaces/ZentaoClientOptions.md) | 创建 [ZentaoClient](classes/ZentaoClient.md) 时使用的配置。 |
| [ZentaoProfile](interfaces/ZentaoProfile.md) | 本地持久化的禅道账号 profile。 |
| [ZentaoProfileConfig](interfaces/ZentaoProfileConfig.md) | 保存到本地 profile 中的客户端偏好配置。 |
| [ZentaoProfileRecord](interfaces/ZentaoProfileRecord.md) | 运行时返回的 profile，会额外带上 `account@server` 形式的 key。 |
| [ZentaoProfilesStore](interfaces/ZentaoProfilesStore.md) | 本地 profile 存储文件或浏览器 localStorage 中的 JSON 结构。 |

## Type Aliases

| Type Alias | Description |
| ------ | ------ |
| [BuiltinRequestName](type-aliases/BuiltinRequestName.md) | 内置模块支持的请求名：`module`、`module/action` 或 `module/123`。 |
| [ClientRequestBodyType](type-aliases/ClientRequestBodyType.md) | 请求体序列化方式。 |
| [ClientResponseType](type-aliases/ClientResponseType.md) | 响应体解析方式。 |
| [DataRecord](type-aliases/DataRecord.md) | 本地数据处理的基础记录类型，对应一条对象数据。 |
| [ErrorCode](type-aliases/ErrorCode.md) | SDK 已知错误码，对应 [ERRORS](variables/ERRORS.md) 的 key。 |
| [HttpMethod](type-aliases/HttpMethod.md) | SDK 支持的 HTTP 方法。 |
| [ListPagerInfo](type-aliases/ListPagerInfo.md) | 列表分页信息别名。 |
| [ModuleActionMethod](type-aliases/ModuleActionMethod.md) | 模块动作使用的 HTTP 方法；兼容生成定义中的小写方法。 |
| [ModuleActionName](type-aliases/ModuleActionName.md) | 模块动作名称，允许除基础动作外的自定义名称。 |
| [ModuleActionParamOption](type-aliases/ModuleActionParamOption.md) | 模块动作参数可选项。 |
| [ModuleActionResultType](type-aliases/ModuleActionResultType.md) | 模块动作结果形态。 |
| [ModuleActionType](type-aliases/ModuleActionType.md) | 模块动作类型：基础 CRUD 或自定义动作。 |
| [ModuleName](type-aliases/ModuleName.md) | 内置模块名称，同时允许用户扩展自定义模块名。 |
| [RequestParamsFor](type-aliases/RequestParamsFor.md) | 根据内置请求名推导出的参数类型。 |
| [RequestResultFor](type-aliases/RequestResultFor.md) | 根据内置请求名推导出的 `ResponseData.data` 类型。 |
| [SortExpr](type-aliases/SortExpr.md) | 排序表达式，格式为 `字段:asc|desc`。 |
| [SortFn](type-aliases/SortFn.md) | 自定义排序比较函数。 |

## Variables

| Variable | Description |
| ------ | ------ |
| [BUILD](variables/BUILD.md) | 构建标识，由构建脚本通过 `__ZENTAO_API_BUILD__` 注入。 |
| [ERRORS](variables/ERRORS.md) | SDK 已知错误码到默认消息的映射表。 |
| [VERSION](variables/VERSION.md) | SDK 版本号，由构建脚本通过 `__ZENTAO_API_VERSION__` 注入。 |
| [ZENTAO\_PROFILES\_STORAGE\_KEY](variables/ZENTAO_PROFILES_STORAGE_KEY.md) | 浏览器环境下用于在 `localStorage` 中保存 profile 数据的 key。 |

## Functions

| Function | Description |
| ------ | ------ |
| [addProfile](functions/addProfile.md) | 添加或覆盖一个本地 profile，并把它设置为当前使用的 profile。 |
| [defineModuleActions](functions/defineModuleActions.md) | 为已存在的模块追加或覆盖动作。 |
| [defineModules](functions/defineModules.md) | 注册或扩展模块定义。 |
| [deleteProfile](functions/deleteProfile.md) | 删除指定 profile。 |
| [extendModuleAction](functions/extendModuleAction.md) | 扩展已存在的模块动作。 |
| [filterData](functions/filterData.md) | 按条件组过滤列表，多组之间按 AND 组合。 |
| [getAllProfiles](functions/getAllProfiles.md) | 列出本地保存的所有 profile。 |
| [getGlobalOptions](functions/getGlobalOptions.md) | 获取当前全局选项的快照。 |
| [getModule](functions/getModule.md) | 获取模块定义。 |
| [getModuleAction](functions/getModuleAction.md) | 获取指定模块下的某个动作。 |
| [getModuleNames](functions/getModuleNames.md) | 返回当前运行时注册表中的所有模块名。 |
| [getProfile](functions/getProfile.md) | 获取指定 profile。 |
| [getProfileKey](functions/getProfileKey.md) | 根据 profile 的账号和禅道站点地址生成稳定 key。 |
| [pickFields](functions/pickFields.md) | 对列表中的每条对象摘取指定字段。 |
| [pickFieldsSingle](functions/pickFieldsSingle.md) | 从单条对象中摘取指定字段，支持通过 `.` 访问子字段，保留嵌套结构。 |
| [processData](functions/processData.md) | 处理单条对象：仅支持字段摘取。 |
| [request](functions/request.md) | 按模块名或模块动作名请求禅道 API。 |
| [searchData](functions/searchData.md) | 对列表做大小写不敏感的模糊匹配。 |
| [setGlobalOptions](functions/setGlobalOptions.md) | 以浅合并的方式更新全局选项。 |
| [sortData](functions/sortData.md) | 对列表排序，返回新数组（不修改入参）。 |
| [switchProfile](functions/switchProfile.md) | 切换当前使用的 profile，并刷新其 `lastUsedTime`。 |
