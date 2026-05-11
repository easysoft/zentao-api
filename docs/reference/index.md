# zentao-api

## Classes

| Class | Description |
| ------ | ------ |
| [ZentaoClient](classes/ZentaoClient.md) | 禅道 API 客户端，负责 Token 注入、请求超时、TLS 选项和响应解析。 |
| [ZentaoError](classes/ZentaoError.md) | SDK 统一错误类型，所有可预期错误都会携带稳定错误码。 |

## Interfaces

| Interface | Description |
| ------ | ------ |
| [ApiListResponse](interfaces/ApiListResponse.md) | 禅道 API 列表响应结构。 |
| [ApiResponse](interfaces/ApiResponse.md) | 禅道 API 通用响应结构，允许携带任意业务字段。 |
| [ClientRequestOptions](interfaces/ClientRequestOptions.md) | `ZentaoClient.request()` 的单次请求选项。 |
| [DefineModulesOptions](interfaces/DefineModulesOptions.md) | - |
| [GlobalOptions](interfaces/GlobalOptions.md) | SDK 进程级全局默认选项，供高阶 [request](functions/request.md) 调用复用。 |
| [LoginResponse](interfaces/LoginResponse.md) | 登录接口响应结构。 |
| [ModuleAction](interfaces/ModuleAction.md) | 禅道模块中的单个 API 动作定义。 |
| [ModuleActionPagerGetterMap](interfaces/ModuleActionPagerGetterMap.md) | 从原始响应中提取分页字段时使用的字段映射。 |
| [ModuleActionParam](interfaces/ModuleActionParam.md) | 模块动作的查询参数定义。 |
| [ModuleActionRequestBody](interfaces/ModuleActionRequestBody.md) | 模块动作请求体定义。 |
| [ModuleActionResponse](interfaces/ModuleActionResponse.md) | 模块动作响应定义。 |
| [ModuleDefinition](interfaces/ModuleDefinition.md) | 禅道模块定义，由多个动作组成。 |
| [Pager](interfaces/Pager.md) | 禅道 API 原始分页结构。 |
| [RequestOptions](interfaces/RequestOptions.md) | 高阶 `request("moduleName/methodName")` 的单次调用选项。 |
| [ResolvedModuleCommand](interfaces/ResolvedModuleCommand.md) | 将模块动作和参数解析后的可执行请求描述。 |
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
| [ErrorCode](type-aliases/ErrorCode.md) | - |
| [HttpMethod](type-aliases/HttpMethod.md) | SDK 支持的 HTTP 方法。 |
| [ListPagerInfo](type-aliases/ListPagerInfo.md) | 列表分页信息别名。 |
| [ModuleActionMethod](type-aliases/ModuleActionMethod.md) | 模块动作使用的 HTTP 方法；兼容生成定义中的小写方法。 |
| [ModuleActionName](type-aliases/ModuleActionName.md) | 模块动作名称，允许除基础动作外的自定义名称。 |
| [ModuleActionParamOption](type-aliases/ModuleActionParamOption.md) | 模块动作参数可选项。 |
| [ModuleActionResultRender](type-aliases/ModuleActionResultRender.md) | 模块动作自定义渲染函数类型；SDK 本身不直接渲染终端输出。 |
| [ModuleActionResultRenderType](type-aliases/ModuleActionResultRenderType.md) | 模块动作渲染目标类型；保留给 CLI 等上层应用使用。 |
| [ModuleActionResultType](type-aliases/ModuleActionResultType.md) | 模块动作结果形态。 |
| [ModuleActionType](type-aliases/ModuleActionType.md) | 模块动作类型：基础 CRUD 或自定义动作。 |
| [ModuleName](type-aliases/ModuleName.md) | 内置模块名称，同时允许用户扩展自定义模块名。 |

## Variables

| Variable | Description |
| ------ | ------ |
| [BUILD](variables/BUILD.md) | - |
| [ERRORS](variables/ERRORS.md) | - |
| [VERSION](variables/VERSION.md) | - |
| [ZENTAO\_PROFILES\_STORAGE\_KEY](variables/ZENTAO_PROFILES_STORAGE_KEY.md) | - |

## Functions

| Function | Description |
| ------ | ------ |
| [addProfile](functions/addProfile.md) | 添加或覆盖一个本地 profile，并把它设置为当前使用的 profile。 |
| [defineModuleActions](functions/defineModuleActions.md) | 为已存在模块定义或覆盖动作；同名动作替换，未知动作追加。 |
| [defineModules](functions/defineModules.md) | 定义或扩展模块；同名模块默认合并动作，`replace` 为真时整体替换，未知模块追加。 |
| [deleteProfile](functions/deleteProfile.md) | 删除指定 profile；返回是否实际删除了记录。 |
| [getAllProfiles](functions/getAllProfiles.md) | 列出所有保存的本地 profile。 |
| [getGlobalOptions](functions/getGlobalOptions.md) | 获取当前全局选项快照；返回副本，避免调用方直接改写内部状态。 |
| [getModule](functions/getModule.md) | 获取模块定义；模块不存在时抛出 [ZentaoError](classes/ZentaoError.md)。 |
| [getModuleAction](functions/getModuleAction.md) | 获取指定模块动作；`ls` 会作为 `list` 的别名处理。 |
| [getProfile](functions/getProfile.md) | 获取指定 profile；不传 key 时返回上次使用的 profile。 |
| [getProfileKey](functions/getProfileKey.md) | 根据 profile 的账号和禅道地址生成稳定 key。 |
| [request](functions/request.md) | 按模块动作名请求禅道 API。 |
| [setGlobalOptions](functions/setGlobalOptions.md) | 合并设置全局选项；传入 `undefined` 可清空对应字段。 |
| [switchProfile](functions/switchProfile.md) | 切换当前使用的 profile，并刷新最后使用时间；不传 key 时使用当前 profile。 |
