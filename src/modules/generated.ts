import type { ModuleDefinition } from '../types/index.js';

/**
 * 内置模块注册表：key 为模块名（小写），value 为对应禅道 REST 资源元数据。
 * 新增模块时优先更新 OpenAPI 数据并重新生成此文件。
 *
 * 此文件由 scripts/update-registry.ts 自动生成，请勿手动编辑。
 */
export const BUILTIN_MODULES = [
    /* 用户模块 */
    {
        name: 'user',
        display: '用户',
        description: '用户管理，支持获取用户列表、创建用户、获取用户详情、修改用户信息、删除用户',
        actions: [
            {
                name: 'list',
                display: '获取用户列表',
                type: 'list',
                method: 'get',
                path: '/users',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'users',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '浏览类型',
                        options: [
                            { value: 'inside', label: '内部用户' },
                            { value: 'outside', label: '内部用户' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'realname_asc', label: '姓名 升序' },
                            { value: 'realname_desc', label: '姓名 降序' },
                            { value: 'account_asc', label: '用户名 升序' },
                            { value: 'account_desc', label: '用户名 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：realname(姓名，示例：admin)；email(邮箱，示例：关键字)；dept(部门，示例：all)；account(用户名，示例：admin)；role(职位，枚举：dev 研发 | qa 测试 | pm 项目经理 | po 产品经理 | td 研发主管 | pd 产品主管 | qd 测试主管 | top 高层管理 | others 其他)；phone(电话，示例：关键字)；visions(界面类型，枚举：rnd 研发综合界面 | lite 运营管理界面)；join(入职日期，示例：2026-01-01)；id(用户编号，示例：1)；commiter(源代码帐号，示例：all)；gender(性别，枚举：m 男 | f 女)；qq(QQ，示例：关键字)；skype(Skype，示例：关键字)；dingding(钉钉，示例：关键字)；weixin(微信，示例：关键字)；slack(Slack，示例：关键字)；whatsapp(WhatsApp，示例：关键字)；address(通讯地址，示例：关键字)；zipcode(邮编，示例：关键字)',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
            }, {
                name: 'create',
                display: '创建用户',
                type: 'create',
                method: 'post',
                path: '/users',
                resultType: 'object',
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "account": {
                                "type": "string",
                                "description": "登录名"
                            },
                            "realname": {
                                "type": "string",
                                "description": "姓名"
                            },
                            "password": {
                                "type": "string",
                                "description": "密码"
                            }
                        },
                        "required": [
                            "account",
                            "realname",
                            "password"
                        ]
                    },
                },
            }, {
                name: 'get',
                display: '获取用户详情',
                type: 'get',
                method: 'get',
                path: '/users/{userID}',
                resultType: 'object',
                resultGetter: 'user',
                pathParams: {
                    userID: '用户ID',
                },
            }, {
                name: 'update',
                display: '修改用户信息',
                type: 'update',
                method: 'put',
                path: '/users/{userID}',
                resultType: 'object',
                pathParams: {
                    userID: '用户ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "realname": {
                                "type": "string",
                                "description": "真实姓名"
                            },
                            "dept": {
                                "type": "integer",
                                "description": "部门",
                                "format": "int32"
                            },
                            "join": {
                                "type": "string",
                                "description": "入职日期"
                            },
                            "group": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "权限分组"
                            },
                            "email": {
                                "type": "string",
                                "description": "邮箱"
                            },
                            "visions": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "界面类型(研发综合界面 rnd | 运营管理界面 lite)"
                            },
                            "mobile": {
                                "type": "string",
                                "description": "手机"
                            },
                            "weixin": {
                                "type": "string",
                                "description": "微信"
                            },
                            "password": {
                                "type": "string",
                                "description": "密码"
                            }
                        }
                    },
                },
            }, {
                name: 'delete',
                display: '删除用户',
                type: 'delete',
                method: 'delete',
                path: '/users/{userID}',
                resultType: 'text',
                pathParams: {
                    userID: '用户ID',
                },
            }
        ],
    },

    /* 项目集模块 */
    {
        name: 'program',
        display: '项目集',
        description: '项目集管理，支持获取项目集列表、创建项目集、获取项目集详情、修改项目集、删除项目集',
        actions: [
            {
                name: 'list',
                display: '获取项目集列表',
                type: 'list',
                method: 'get',
                path: '/programs',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'programs',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '浏览类型',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'unclosed', label: '未关闭' },
                            { value: 'wait', label: '未开始' },
                            { value: 'doing', label: '进行中' },
                            { value: 'suspended', label: '已挂起' },
                            { value: 'delayed', label: '已延期' },
                            { value: 'closed', label: '已关闭' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'name_asc', label: '名称 升序' },
                            { value: 'name_desc', label: '名称 降序' },
                            { value: 'begin_asc', label: '计划开始 升序' },
                            { value: 'begin_desc', label: '计划开始 降序' },
                            { value: 'end_asc', label: '计划结束 升序' },
                            { value: 'end_desc', label: '计划结束 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：name(项目集名称，示例：关键字)；PM(负责人，用户，示例：admin)；openedDate(创建时间，示例：2026-01-01)；status(状态，枚举：wait 未开始 | doing 进行中 | suspended 已挂起 | closed 已关闭)；openedBy(创建者，用户，示例：admin)；begin(计划开始，示例：2026-01-01)；end(计划完成，示例：2026-01-01)；realBegan(实际开始，示例：2026-01-01)；realEnd(实际完成，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(最后编辑日期，示例：2026-01-01)；desc(项目集描述，示例：关键字)',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
            }, {
                name: 'create',
                display: '创建项目集',
                type: 'create',
                method: 'post',
                path: '/programs',
                resultType: 'object',
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "项目集名称"
                            },
                            "begin": {
                                "type": "string",
                                "description": "计划开始日期"
                            },
                            "end": {
                                "type": "string",
                                "description": "计划完成日期"
                            },
                            "PM": {
                                "type": "string",
                                "description": "计划完成日期"
                            },
                            "desc": {
                                "type": "string",
                                "description": "项目集描述"
                            }
                        },
                        "required": [
                            "name",
                            "begin",
                            "end"
                        ]
                    },
                },
            }, {
                name: 'get',
                display: '获取项目集详情',
                type: 'get',
                method: 'get',
                path: '/programs/{programID}',
                resultType: 'object',
                resultGetter: 'program',
                pathParams: {
                    programID: '项目集ID',
                },
            }, {
                name: 'update',
                display: '修改项目集',
                type: 'update',
                method: 'put',
                path: '/programs/{programID}',
                resultType: 'object',
                pathParams: {
                    programID: '项目集ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "项目集名称"
                            },
                            "begin": {
                                "type": "string",
                                "description": "计划开始日期"
                            },
                            "end": {
                                "type": "string",
                                "description": "计划完成日期"
                            },
                            "PM": {
                                "type": "string",
                                "description": "计划完成日期"
                            },
                            "desc": {
                                "type": "string",
                                "description": "项目集描述"
                            }
                        },
                        "required": [
                            "name",
                            "begin",
                            "end"
                        ]
                    },
                },
            }, {
                name: 'delete',
                display: '删除项目集',
                type: 'delete',
                method: 'delete',
                path: '/programs/{programID}',
                resultType: 'text',
                pathParams: {
                    programID: '项目集ID',
                },
            }
        ],
    },

    /* 产品模块 */
    {
        name: 'product',
        display: '产品',
        description: '产品管理，支持获取产品列表、获取项目集的产品列表、创建产品、关闭产品、创建产品的需求模块、创建产品的Bug模块、创建产品的用例模块、获取产品详情、修改产品、删除产品',
        actions: [
            {
                name: 'list',
                display: '获取产品列表',
                type: 'list',
                method: 'get',
                path: '/products',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'products',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '浏览类型',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'noclosed', label: '未关闭' },
                            { value: 'closed', label: '已结束' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'title_asc', label: '名称 升序' },
                            { value: 'title_desc', label: '名称 降序' },
                            { value: 'begin_asc', label: '计划开始 升序' },
                            { value: 'begin_desc', label: '计划开始 降序' },
                            { value: 'end_asc', label: '计划结束 升序' },
                            { value: 'end_desc', label: '计划结束 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                ],
            }, {
                name: 'programProducts',
                display: '获取项目集的产品列表',
                type: 'list',
                method: 'get',
                path: '/programs/{programID}/products',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'products',
                pathParams: {
                    programID: '项目集ID',
                },
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是noclosed',
                        defaultValue: 'noclosed',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'noclosed', label: '未关闭' },
                            { value: 'closed', label: '已结束' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'name_asc', label: '名称 升序' },
                            { value: 'name_desc', label: '名称 降序' },
                            { value: 'begin_asc', label: '计划开始 升序' },
                            { value: 'begin_desc', label: '计划开始 降序' },
                            { value: 'end_asc', label: '计划结束 升序' },
                            { value: 'end_desc', label: '计划结束 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                ],
            }, {
                name: 'create',
                display: '创建产品',
                type: 'create',
                method: 'post',
                path: '/products',
                resultType: 'object',
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "产品名称"
                            },
                            "program": {
                                "type": "integer",
                                "description": "所属项目集",
                                "format": "int32"
                            },
                            "line": {
                                "type": "integer",
                                "description": "所属产品线",
                                "format": "int32"
                            },
                            "type": {
                                "type": "string",
                                "description": "类型(normal 正常 | branch 多分支 | platform 多平台)"
                            },
                            "PO": {
                                "type": "string",
                                "description": "产品负责人"
                            },
                            "reviewer": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "评审人"
                            },
                            "desc": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "产品描述"
                            },
                            "QD": {
                                "type": "string",
                                "description": "测试负责人"
                            },
                            "RD": {
                                "type": "string",
                                "description": "发布负责人"
                            },
                            "acl": {
                                "type": "string",
                                "description": "访问控制(open 公开 | private 私有)"
                            }
                        },
                        "required": [
                            "name"
                        ]
                    },
                },
            }, {
                name: 'close',
                display: '关闭产品',
                type: 'action',
                method: 'post',
                path: '/products/{productID}/close',
                resultType: 'text',
                pathParams: {
                    productID: '产品ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "comment": {
                                "type": "string",
                                "description": "备注"
                            }
                        }
                    },
                },
            }, {
                name: 'createStoryModule',
                display: '创建产品的需求模块',
                type: 'create',
                method: 'post',
                path: '/products/{productID}/story/modules',
                resultType: 'object',
                pathParams: {
                    productID: '产品ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "模块名称"
                            },
                            "parentID": {
                                "type": "integer",
                                "description": "父模块",
                                "format": "int32"
                            }
                        }
                    },
                },
            }, {
                name: 'createBugModule',
                display: '创建产品的Bug模块',
                type: 'create',
                method: 'post',
                path: '/products/{productID}/bug/modules',
                resultType: 'object',
                pathParams: {
                    productID: '产品ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "模块名称"
                            },
                            "parentID": {
                                "type": "integer",
                                "description": "父模块",
                                "format": "int32"
                            }
                        }
                    },
                },
            }, {
                name: 'createTestcaseModule',
                display: '创建产品的用例模块',
                type: 'create',
                method: 'post',
                path: '/products/{productID}/testcase/modules',
                resultType: 'object',
                pathParams: {
                    productID: '产品ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "模块名称"
                            },
                            "parentID": {
                                "type": "integer",
                                "description": "父模块",
                                "format": "int32"
                            }
                        }
                    },
                },
            }, {
                name: 'get',
                display: '获取产品详情',
                type: 'get',
                method: 'get',
                path: '/products/{productID}',
                resultType: 'object',
                resultGetter: 'product',
                pathParams: {
                    productID: '产品ID',
                },
            }, {
                name: 'update',
                display: '修改产品',
                type: 'update',
                method: 'put',
                path: '/products/{productID}',
                resultType: 'object',
                pathParams: {
                    productID: '产品ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "产品名称"
                            },
                            "program": {
                                "type": "integer",
                                "description": "所属项目集",
                                "format": "int32"
                            },
                            "line": {
                                "type": "integer",
                                "description": "所属产品线",
                                "format": "int32"
                            },
                            "type": {
                                "type": "string",
                                "description": "类型(normal 正常 | branch 多分支 | platform 多平台)"
                            },
                            "PO": {
                                "type": "string",
                                "description": "产品负责人"
                            },
                            "reviewer": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "评审人"
                            },
                            "desc": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "产品描述"
                            },
                            "QD": {
                                "type": "string",
                                "description": "测试负责人"
                            },
                            "RD": {
                                "type": "string",
                                "description": "发布负责人"
                            },
                            "acl": {
                                "type": "string",
                                "description": "访问控制(open 公开 | private 私有)"
                            }
                        },
                        "required": [
                            "name"
                        ]
                    },
                },
            }, {
                name: 'delete',
                display: '删除产品',
                type: 'delete',
                method: 'delete',
                path: '/products/{productID}',
                resultType: 'text',
                pathParams: {
                    productID: '产品ID',
                },
            }
        ],
    },

    /* 项目模块 */
    {
        name: 'project',
        display: '项目',
        description: '项目管理，支持获取项目列表、获取项目集的项目列表、获取项目团队列表、获取项目成员列表、创建项目、关闭项目、创建项目需求、创建项目Bug、创建项目任务、修改项目、删除项目、维护项目成员',
        actions: [
            {
                name: 'list',
                display: '获取项目列表',
                type: 'list',
                method: 'get',
                path: '/projects',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'projects',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '项目状态，默认是undone',
                        defaultValue: 'undone',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'undone', label: '未完成' },
                            { value: 'wait', label: '未开始' },
                            { value: 'doing', label: '进行中' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'name_asc', label: '名称 升序' },
                            { value: 'name_desc', label: '名称 降序' },
                            { value: 'begin_asc', label: '计划开始 升序' },
                            { value: 'begin_desc', label: '计划开始 降序' },
                            { value: 'end_asc', label: '计划结束 升序' },
                            { value: 'end_desc', label: '计划结束 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：name(项目名称，示例：关键字)；code(项目代号，示例：关键字)；id(项目ID，示例：1)；model(项目管理方式，枚举：scrum Scrum | waterfall 瀑布 | kanban 看板 | agileplus 融合敏捷 | waterfallplus 融合瀑布)；hasProduct(项目类型，枚举：1 产品型 | 0 项目型)；parent(所属项目集，示例：all)；status(状态，枚举：wait 未开始 | doing 进行中 | suspended 已挂起 | closed 已关闭 | delay 已延期)；desc(项目描述，示例：关键字)；PM(负责人，用户，示例：admin)；openedDate(创建日期，示例：2026-01-01)；begin(计划开始，示例：2026-01-01)；end(计划完成，示例：2026-01-01)；realBegan(实际开始，示例：2026-01-01)；realEnd(实际完成，示例：2026-01-01)；openedBy(由谁创建，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedDate(最后编辑日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
            }, {
                name: 'programProjects',
                display: '获取项目集的项目列表',
                type: 'list',
                method: 'get',
                path: '/programs/{programID}/projects',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'projects',
                pathParams: {
                    programID: '项目集ID',
                },
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '项目状态，默认是undone',
                        defaultValue: 'undone',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'undone', label: '未完成' },
                            { value: 'wait', label: '未开始' },
                            { value: 'doing', label: '进行中' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'name_asc', label: '名称 升序' },
                            { value: 'name_desc', label: '名称 降序' },
                            { value: 'begin_asc', label: '计划开始 升序' },
                            { value: 'begin_desc', label: '计划开始 降序' },
                            { value: 'end_asc', label: '计划结束 升序' },
                            { value: 'end_desc', label: '计划结束 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                ],
            }, {
                name: 'team',
                display: '获取项目团队列表',
                type: 'list',
                method: 'get',
                path: '/projects/team',
                resultType: 'list',
                resultGetter: 'members',
                params: [
                    {
                        name: 'projectID',
                        required: true,
                        type: 'string',
                        description: '项目ID',
                    },
                ],
            }, {
                name: 'projectMembers',
                display: '获取项目成员列表',
                type: 'list',
                method: 'get',
                path: '/projects/{projectID}/members',
                resultType: 'list',
                resultGetter: 'members',
                pathParams: {
                    projectID: '项目ID',
                },
            }, {
                name: 'create',
                display: '创建项目',
                type: 'create',
                method: 'post',
                path: '/projects',
                resultType: 'object',
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "项目名称"
                            },
                            "model": {
                                "type": "string",
                                "description": "项目管理方式(scrum 敏捷 | waterfall 瀑布 | kanban 看板 | agileplus 融合敏捷 | waterfallplus 融合瀑布)"
                            },
                            "begin": {
                                "type": "string",
                                "description": "开始日期"
                            },
                            "end": {
                                "type": "string",
                                "description": "结束日期"
                            },
                            "products": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "关联产品"
                            },
                            "parent": {
                                "type": "integer",
                                "description": "所属项目集",
                                "format": "int32"
                            },
                            "workflowGroup": {
                                "type": "integer",
                                "description": "项目流程，付费版功能，开源版可以不填",
                                "format": "int32"
                            },
                            "PM": {
                                "type": "string",
                                "description": "项目负责人"
                            }
                        },
                        "required": [
                            "name",
                            "model",
                            "begin",
                            "end",
                            "workflowGroup"
                        ]
                    },
                },
            }, {
                name: 'close',
                display: '关闭项目',
                type: 'action',
                method: 'post',
                path: '/projects/{projectID}/close',
                resultType: 'text',
                pathParams: {
                    projectID: '项目ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "realEnd": {
                                "type": "string",
                                "description": "实际完成日期"
                            },
                            "comment": {
                                "type": "string",
                                "description": "备注"
                            }
                        },
                        "required": [
                            "realEnd"
                        ]
                    },
                },
            }, {
                name: 'createStory',
                display: '创建项目需求',
                type: 'create',
                method: 'post',
                path: '/projects/{projectID}/stories',
                resultType: 'object',
                pathParams: {
                    projectID: '项目ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "productID": {
                                "type": "integer",
                                "description": "所属产品；项目型项目可不传，产品型项目必须传",
                                "format": "int32"
                            },
                            "title": {
                                "type": "string",
                                "description": "需求标题"
                            },
                            "spec": {
                                "type": "string",
                                "description": "需求描述"
                            },
                            "pri": {
                                "type": "integer",
                                "description": "优先级",
                                "format": "int32"
                            },
                            "category": {
                                "type": "string",
                                "description": "类别"
                            },
                            "reviewer": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "评审人"
                            }
                        },
                        "required": [
                            "title"
                        ]
                    },
                },
            }, {
                name: 'createBug',
                display: '创建项目Bug',
                type: 'create',
                method: 'post',
                path: '/projects/{projectID}/bugs',
                resultType: 'object',
                pathParams: {
                    projectID: '项目ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "productID": {
                                "type": "integer",
                                "description": "所属产品；项目型项目可不传，产品型项目必须传",
                                "format": "int32"
                            },
                            "title": {
                                "type": "string",
                                "description": "Bug标题"
                            },
                            "openedBuild": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "影响版本，主干是trunk，其他版本使用版本ID"
                            },
                            "severity": {
                                "type": "integer",
                                "description": "严重程度",
                                "format": "int32"
                            },
                            "pri": {
                                "type": "integer",
                                "description": "优先级",
                                "format": "int32"
                            },
                            "type": {
                                "type": "string",
                                "description": "Bug类型"
                            },
                            "steps": {
                                "type": "string",
                                "description": "重现步骤"
                            }
                        },
                        "required": [
                            "title",
                            "openedBuild"
                        ]
                    },
                },
            }, {
                name: 'createTask',
                display: '创建项目任务',
                type: 'create',
                method: 'post',
                path: '/projects/{projectID}/tasks',
                resultType: 'object',
                pathParams: {
                    projectID: '项目ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "任务名称"
                            },
                            "executionID": {
                                "type": "integer",
                                "description": "所属执行；无执行项目可不传，有执行项目必须传",
                                "format": "int32"
                            },
                            "type": {
                                "type": "string",
                                "description": "任务类型"
                            },
                            "assignedTo": {
                                "type": "string",
                                "description": "指派给"
                            },
                            "estStarted": {
                                "type": "string",
                                "description": "预计开始"
                            },
                            "deadline": {
                                "type": "string",
                                "description": "截止日期"
                            },
                            "pri": {
                                "type": "integer",
                                "description": "优先级",
                                "format": "int32"
                            },
                            "estimate": {
                                "type": "number",
                                "description": "预计工时",
                                "format": "float"
                            },
                            "module": {
                                "type": "integer",
                                "description": "所属模块",
                                "format": "int32"
                            },
                            "story": {
                                "type": "integer",
                                "description": "相关需求",
                                "format": "int32"
                            },
                            "desc": {
                                "type": "string",
                                "description": "任务描述"
                            }
                        },
                        "required": [
                            "name"
                        ]
                    },
                },
            }, {
                name: 'update',
                display: '修改项目',
                type: 'update',
                method: 'put',
                path: '/projects/{projectID}',
                resultType: 'object',
                pathParams: {
                    projectID: '项目ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "项目名称"
                            },
                            "model": {
                                "type": "string",
                                "description": "项目管理方式(scrum 敏捷 | waterfall 瀑布 | kanban 看板 | agileplus 融合敏捷 | waterfallplus 融合瀑布)"
                            },
                            "begin": {
                                "type": "string",
                                "description": "开始日期"
                            },
                            "end": {
                                "type": "string",
                                "description": "结束日期"
                            },
                            "products": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "关联产品"
                            },
                            "parent": {
                                "type": "integer",
                                "description": "所属项目集",
                                "format": "int32"
                            },
                            "workflowGroup": {
                                "type": "integer",
                                "description": "项目流程，付费版功能，开源版可以不填",
                                "format": "int32"
                            },
                            "PM": {
                                "type": "string",
                                "description": "项目负责人"
                            }
                        },
                        "required": [
                            "name",
                            "model",
                            "begin",
                            "end",
                            "workflowGroup"
                        ]
                    },
                },
            }, {
                name: 'delete',
                display: '删除项目',
                type: 'delete',
                method: 'delete',
                path: '/projects/{projectID}',
                resultType: 'text',
                pathParams: {
                    projectID: '项目ID',
                },
            }, {
                name: 'members',
                display: '维护项目成员',
                type: 'action',
                method: 'put',
                path: '/projects/{projectID}/members',
                resultType: 'text',
                pathParams: {
                    projectID: '项目ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "account": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "成员账号，多人时按顺序设置。例如 account=[\"admin\",\"dev1\"] 时，role[0] 对应 admin，role[1] 对应 dev1"
                            },
                            "role": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "成员角色，与account顺序一一对应"
                            },
                            "days": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "可用工作日，与account顺序一一对应"
                            },
                            "hours": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "每日工时，与account顺序一一对应"
                            },
                            "limited": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "是否限制日期，与account顺序一一对应"
                            }
                        },
                        "required": [
                            "account"
                        ]
                    },
                },
            }
        ],
    },

    /* 执行模块 */
    {
        name: 'execution',
        display: '执行',
        description: '执行管理，支持获取执行列表、获取项目的执行列表、获取执行团队列表、获取执行成员列表、创建执行（迭代/阶段/看板）、关闭执行、创建执行的任务模块、获取执行详情、修改执行、删除执行、维护执行成员',
        actions: [
            {
                name: 'list',
                display: '获取执行列表',
                type: 'list',
                method: 'get',
                path: '/executions',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'executions',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '执行状态，默认是undone',
                        defaultValue: 'undone',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'undone', label: '未完成' },
                            { value: 'wait', label: '未开始' },
                            { value: 'doing', label: '进行中' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'rawID_asc', label: 'RAWID 升序' },
                            { value: 'rawID_desc', label: 'RAWID 降序' },
                            { value: 'nameCol_asc', label: '名称 升序' },
                            { value: 'nameCol_desc', label: '名称 降序' },
                            { value: 'begin_asc', label: '计划开始 升序' },
                            { value: 'begin_desc', label: '计划开始 降序' },
                            { value: 'end_asc', label: '计划结束 升序' },
                            { value: 'end_desc', label: '计划结束 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activatedDate,assignedDate,assignedTo,canceledBy,canceledDate,closedBy,closedDate,closedReason,consumed,deadline,desc,estStarted,estimate,execution,finishedBy,finishedDate,fromBug,id,keywords,lastEditedBy,lastEditedDate,left,mailto,module,name,openedBy,openedDate,pri,project,realStarted,status,story,type',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
            }, {
                name: 'projectExecutions',
                display: '获取项目的执行列表',
                type: 'list',
                method: 'get',
                path: '/projects/{projectID}/executions',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'executions',
                pathParams: {
                    projectID: '项目ID',
                },
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '执行状态，默认是undone',
                        defaultValue: 'undone',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'undone', label: '未完成' },
                            { value: 'wait', label: '未开始' },
                            { value: 'doing', label: '进行中' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'rawID_asc', label: 'RAWID 升序' },
                            { value: 'rawID_desc', label: 'RAWID 降序' },
                            { value: 'nameCol_asc', label: '名称 升序' },
                            { value: 'nameCol_desc', label: '名称 降序' },
                            { value: 'begin_asc', label: '计划开始 升序' },
                            { value: 'begin_desc', label: '计划开始 降序' },
                            { value: 'end_asc', label: '计划结束 升序' },
                            { value: 'end_desc', label: '计划结束 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                ],
            }, {
                name: 'team',
                display: '获取执行团队列表',
                type: 'list',
                method: 'get',
                path: '/executions/team',
                resultType: 'list',
                resultGetter: 'members',
                params: [
                    {
                        name: 'executionID',
                        required: true,
                        type: 'string',
                        description: '执行ID',
                    },
                ],
            }, {
                name: 'executionMembers',
                display: '获取执行成员列表',
                type: 'list',
                method: 'get',
                path: '/executions/{executionID}/members',
                resultType: 'list',
                resultGetter: 'members',
                pathParams: {
                    executionID: '执行ID',
                },
            }, {
                name: 'create',
                display: '创建执行（迭代/阶段/看板）',
                type: 'create',
                method: 'post',
                path: '/executions',
                resultType: 'object',
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "project": {
                                "type": "integer",
                                "description": "所属项目",
                                "format": "int32"
                            },
                            "name": {
                                "type": "string",
                                "description": "迭代/阶段名称"
                            },
                            "type": {
                                "type": "string",
                                "description": "类型(sprint 迭代 | stage 阶段 | kanban 看板)。默认按项目模型推导：scrum→sprint、kanban→kanban、waterfall/waterfallplus→stage；IPD 项目创建阶段时必须显式传 stage"
                            },
                            "parent": {
                                "type": "integer",
                                "description": "父执行/父阶段ID；创建子阶段时传父阶段ID，不传为顶层阶段",
                                "format": "int32"
                            },
                            "attribute": {
                                "type": "string",
                                "description": "阶段类型(mix 综合 | request 需求 | design 设计 | dev 开发 | qa 测试 | release 发布 | review 总结评审 | other 其他；IPD: concept 概念 | plan 计划 | develop 开发 | qualify 验证 | launch 发布)。不传为空，有 parent 时继承父阶段"
                            },
                            "lifetime": {
                                "type": "string",
                                "description": "周期(short 短期，迭代 | long 长期，阶段 | ops 运维)"
                            },
                            "begin": {
                                "type": "string",
                                "description": "开始日期"
                            },
                            "end": {
                                "type": "string",
                                "description": "结束日期"
                            },
                            "days": {
                                "type": "integer",
                                "description": "可用工作日",
                                "format": "int32"
                            },
                            "products": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "关联产品；waterfall/waterfallplus 项目创建阶段时必填"
                            },
                            "plans": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "关联计划，必须是产品+planID的二维数组"
                            },
                            "PO": {
                                "type": "string",
                                "description": "产品负责人"
                            },
                            "QD": {
                                "type": "string",
                                "description": "测试负责人"
                            },
                            "PM": {
                                "type": "string",
                                "description": "执行负责人"
                            },
                            "RD": {
                                "type": "string",
                                "description": "发布负责人"
                            },
                            "acl": {
                                "type": "string",
                                "description": "访问控制(open 公开 | private 私有)"
                            }
                        },
                        "required": [
                            "project",
                            "name",
                            "begin",
                            "end"
                        ]
                    },
                },
            }, {
                name: 'close',
                display: '关闭执行',
                type: 'action',
                method: 'post',
                path: '/executions/{executionID}/close',
                resultType: 'text',
                pathParams: {
                    executionID: '执行ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "realEnd": {
                                "type": "string",
                                "description": "实际完成日期"
                            },
                            "comment": {
                                "type": "string",
                                "description": "备注"
                            }
                        },
                        "required": [
                            "realEnd"
                        ]
                    },
                },
            }, {
                name: 'createTaskModule',
                display: '创建执行的任务模块',
                type: 'create',
                method: 'post',
                path: '/executions/{executionID}/task/modules',
                resultType: 'object',
                pathParams: {
                    executionID: '执行ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "模块名称"
                            },
                            "parentID": {
                                "type": "integer",
                                "description": "父模块",
                                "format": "int32"
                            }
                        }
                    },
                },
            }, {
                name: 'get',
                display: '获取执行详情',
                type: 'get',
                method: 'get',
                path: '/executions/{executionID}',
                resultType: 'object',
                resultGetter: 'execution',
                pathParams: {
                    executionID: '执行ID',
                },
            }, {
                name: 'update',
                display: '修改执行',
                type: 'update',
                method: 'put',
                path: '/executions/{executionID}',
                resultType: 'object',
                pathParams: {
                    executionID: '执行ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "project": {
                                "type": "integer",
                                "description": "所属项目",
                                "format": "int32"
                            },
                            "name": {
                                "type": "string",
                                "description": "迭代名称"
                            },
                            "lifetime": {
                                "type": "string",
                                "description": "执行类型(short 短期 | long 长期 | ops 运维)"
                            },
                            "begin": {
                                "type": "string",
                                "description": "开始日期"
                            },
                            "end": {
                                "type": "string",
                                "description": "结束日期"
                            },
                            "days": {
                                "type": "integer",
                                "description": "可用工作日",
                                "format": "int32"
                            },
                            "products": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "关联产品"
                            },
                            "plans": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "关联计划，必须是产品+planID的二维数组"
                            },
                            "PO": {
                                "type": "string",
                                "description": "产品负责人"
                            },
                            "QD": {
                                "type": "string",
                                "description": "测试负责人"
                            },
                            "PM": {
                                "type": "string",
                                "description": "执行负责人"
                            },
                            "RD": {
                                "type": "string",
                                "description": "发布负责人"
                            },
                            "acl": {
                                "type": "string",
                                "description": "访问控制(open 公开 | private 私有)"
                            }
                        },
                        "required": [
                            "name",
                            "begin",
                            "end"
                        ]
                    },
                },
            }, {
                name: 'delete',
                display: '删除执行',
                type: 'delete',
                method: 'delete',
                path: '/executions/{executionID}',
                resultType: 'text',
                pathParams: {
                    executionID: '执行ID',
                },
            }, {
                name: 'members',
                display: '维护执行成员',
                type: 'action',
                method: 'put',
                path: '/executions/{executionID}/members',
                resultType: 'text',
                pathParams: {
                    executionID: '执行ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "account": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "成员账号，多人时按顺序设置。例如 account=[\"admin\",\"dev1\"] 时，role[0] 对应 admin，role[1] 对应 dev1"
                            },
                            "role": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "成员角色，与account顺序一一对应"
                            },
                            "days": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "可用工作日，与account顺序一一对应"
                            },
                            "hours": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "每日工时，与account顺序一一对应"
                            },
                            "limited": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "是否限制日期，与account顺序一一对应"
                            }
                        },
                        "required": [
                            "account"
                        ]
                    },
                },
            }
        ],
    },

    /* 产品计划模块 */
    {
        name: 'productplan',
        display: '产品计划',
        description: '产品计划管理，支持获取产品计划列表，支持获取产品下的产品计划、创建产品计划、获取产品计划详情、修改产品计划、删除产品计划',
        actions: [
            {
                name: 'list',
                display: '获取产品计划列表，支持获取产品下的产品计划',
                type: 'list',
                method: 'get',
                path: '/products/{productID}/productplans',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'productplans',
                pathParams: {
                    productID: '所属产品ID',
                },
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '执行状态，默认是undone',
                        defaultValue: 'undone',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'undone', label: '未完成' },
                            { value: 'wait', label: '未开始' },
                            { value: 'doing', label: '进行中' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'title_asc', label: '名称 升序' },
                            { value: 'title_desc', label: '名称 降序' },
                            { value: 'begin_asc', label: '开始日期 升序' },
                            { value: 'begin_desc', label: '开始日期 降序' },
                            { value: 'end_asc', label: '结束日期 升序' },
                            { value: 'end_desc', label: '结束日期 降序' },
                            { value: 'status_asc', label: '状态 升序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：begin,branch,end,id,status,title',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
            }, {
                name: 'create',
                display: '创建产品计划',
                type: 'create',
                method: 'post',
                path: '/productplans',
                resultType: 'object',
                params: [
                    {
                        name: 'productID',
                        required: true,
                        type: 'number',
                        description: '产品ID',
                    },
                ],
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "title": {
                                "type": "string",
                                "description": "计划名称"
                            },
                            "parent": {
                                "type": "integer",
                                "description": "父计划ID",
                                "format": "int32"
                            },
                            "begin": {
                                "type": "string",
                                "description": "开始日期"
                            },
                            "end": {
                                "type": "string",
                                "description": "结束日期"
                            },
                            "branchID": {
                                "type": "integer",
                                "description": "分支ID",
                                "format": "int32"
                            },
                            "desc": {
                                "type": "string",
                                "description": "计划描述"
                            }
                        },
                        "required": [
                            "title"
                        ]
                    },
                },
            }, {
                name: 'get',
                display: '获取产品计划详情',
                type: 'get',
                method: 'get',
                path: '/productplans/{planID}',
                resultType: 'object',
                resultGetter: 'productplan',
                pathParams: {
                    planID: '产品计划ID',
                },
            }, {
                name: 'update',
                display: '修改产品计划',
                type: 'update',
                method: 'put',
                path: '/productplans/{planID}',
                resultType: 'object',
                pathParams: {
                    planID: '产品计划ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "title": {
                                "type": "string",
                                "description": "计划名称"
                            },
                            "parent": {
                                "type": "integer",
                                "description": "父计划",
                                "format": "int32"
                            },
                            "begin": {
                                "type": "string",
                                "description": "开始日期"
                            },
                            "end": {
                                "type": "string",
                                "description": "结束日期"
                            },
                            "branchID": {
                                "type": "integer",
                                "description": "分支ID",
                                "format": "int32"
                            },
                            "desc": {
                                "type": "string",
                                "description": "计划描述"
                            }
                        },
                        "required": [
                            "title"
                        ]
                    },
                },
            }, {
                name: 'delete',
                display: '删除产品计划',
                type: 'delete',
                method: 'delete',
                path: '/productplans/{planID}',
                resultType: 'text',
                pathParams: {
                    planID: '产品计划ID',
                },
            }
        ],
    },

    /* 需求模块 */
    {
        name: 'story',
        display: '需求',
        description: '需求管理，支持获取需求列表，支持获取项目/产品/执行下的需求、产品的需求模块树、创建需求、获取需求详情、修改需求、修改需求模块、删除需求、删除需求模块、激活需求、变更需求、关闭需求',
        actions: [
            {
                name: 'list',
                display: '获取需求列表，支持获取项目/产品/执行下的需求',
                type: 'list',
                method: 'get',
                path: '/{scope}/{scopeID}/stories',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'stories',
                pathParams: {
                    scope: {description: '需求所属范围', options: [{value: 'projects', label: '项目'}, {value: 'products', label: '产品'}, {value: 'executions', label: '执行'}]},
                    scopeID: '所属范围ID',
                },
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是allstory',
                        defaultValue: 'allstory',
                        options: [
                            { value: 'allstory', label: '全部' },
                            { value: 'assignedtome', label: '指派给我' },
                            { value: 'openedbyme', label: '我创建' },
                            { value: 'reviewbyme', label: '待我评审' },
                            { value: 'draftstory', label: '草稿' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'title_asc', label: '标题 升序' },
                            { value: 'title_desc', label: '标题 降序' },
                            { value: 'status_asc', label: '状态 升序' },
                            { value: 'status_desc', label: '状态 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(需求名称，示例：关键字)；id(编号，示例：1)；keywords(关键词，示例：关键字)；status(当前状态，枚举：draft 草稿 | reviewing 评审中 | active 激活 | changing 变更中 | closed 已关闭)；pri(优先级，枚举：1 | 2 | 3 | 4)；module(所属模块，示例：all)；stage(所处阶段，枚举：wait 未开始 | planned 已计划 | projected 研发立项 | designing 设计中 | designed 设计完毕 | developing 研发中 | developed 研发完毕 | testing 测试中 | tested 测试完毕 | verified 已验收 | rejected 验收失败 | delivering 交付中 | delivered 已交付 | released 已发布 | closed 已关闭)；product(所属产品，示例：all)；branch(branch，示例：all)；grade(需求层级，示例：all)；plan(所属计划，示例：all)；estimate(预计小时，示例：关键字)；source(来源，枚举：customer 客户 | user 用户 | po 产品经理 | market 市场 | service 客服 | operation 运营 | support 技术支持 | competitor 竞争对手 | partner 合作伙伴 | dev 开发人员 | tester 测试人员 | bug Bug | forum 论坛 | other 其他)；sourceNote(来源备注，示例：关键字)；fromBug(来源Bug，示例：关键字)；category(类别，枚举：feature 功能 | interface 接口 | performance 性能 | safe 安全 | experience 体验 | improve 改进 | other 其他)；openedBy(由谁创建，用户，示例：admin)；reviewedBy(已评审人，用户，示例：admin)；result(评审结果，枚举：pass 确认通过 | revert 撤销变更 | clarify 有待明确 | reject 拒绝)；assignedTo(指派给，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedBy(最后修改，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；closedReason(关闭原因，枚举：done 已完成 | subdivided 已拆分 | duplicate 重复 | postponed 延期 | willnotdo 不做 | cancel 已取消 | bydesign 设计如此)；version(版本号，示例：关键字)；openedDate(创建日期，示例：2026-01-01)；reviewedDate(评审时间，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(最后修改日期，示例：2026-01-01)；activatedDate(激活日期，示例：2026-01-01)',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
            }, {
                name: 'modules',
                display: '产品的需求模块树',
                type: 'list',
                method: 'get',
                path: '/products/{productID}/story/modules',
                resultType: 'list',
                pathParams: {
                    productID: '产品ID',
                },
                resultGetter: 'tree',
            }, {
                name: 'create',
                display: '创建需求',
                type: 'create',
                method: 'post',
                path: '/stories',
                resultType: 'object',
                params: [
                    {
                        name: 'productID',
                        required: true,
                        type: 'number',
                        description: '产品ID',
                    },
                ],
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "title": {
                                "type": "string"
                            },
                            "pri": {
                                "type": "integer",
                                "description": "优先级，默认是3",
                                "format": "int32"
                            },
                            "module": {
                                "type": "integer",
                                "description": "所属模块",
                                "format": "int32"
                            },
                            "parent": {
                                "type": "integer",
                                "description": "父需求",
                                "format": "int32"
                            },
                            "estimate": {
                                "type": "number",
                                "description": "预计工时",
                                "format": "float"
                            },
                            "spec": {
                                "type": "string",
                                "description": "需求描述"
                            },
                            "category": {
                                "type": "integer",
                                "description": "类别(feature 功能 | interface 接口 | performance 性能 | safe 安全 | experience 体验 | improve 改进 | other 其他)",
                                "format": "int32"
                            },
                            "source": {
                                "type": "string",
                                "description": "来源(customer 客户 | user 用户 | po 产品经理 | market 市场 | service 客服 | operation 运营 | support 技术支持 | competitor 竞争对手 | partner 合作伙伴 | dev 开发人员 | tester 测试人员 | bug Bug | forum 论坛 | other 其他)"
                            },
                            "verify": {
                                "type": "string",
                                "description": "验收标准"
                            },
                            "assignedTo": {
                                "type": "string",
                                "description": "指派给"
                            },
                            "reviewer": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "评审人，如果设置必须评审，必须填写"
                            },
                            "project": {
                                "type": "integer",
                                "description": "所属项目",
                                "format": "int32"
                            },
                            "execution": {
                                "type": "integer",
                                "description": "所属执行",
                                "format": "int32"
                            }
                        },
                        "required": [
                            "title"
                        ]
                    },
                },
            }, {
                name: 'get',
                display: '获取需求详情',
                type: 'get',
                method: 'get',
                path: '/stories/{storyID}',
                resultType: 'object',
                resultGetter: 'story',
                pathParams: {
                    storyID: '需求ID',
                },
            }, {
                name: 'update',
                display: '修改需求',
                type: 'update',
                method: 'put',
                path: '/stories/{storyID}',
                resultType: 'object',
                pathParams: {
                    storyID: '需求ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "title": {
                                "type": "string"
                            },
                            "pri": {
                                "type": "integer",
                                "description": "优先级，默认是3",
                                "format": "int32"
                            },
                            "module": {
                                "type": "integer",
                                "description": "所属模块",
                                "format": "int32"
                            },
                            "parent": {
                                "type": "integer",
                                "description": "父需求",
                                "format": "int32"
                            },
                            "estimate": {
                                "type": "number",
                                "description": "预计工时",
                                "format": "float"
                            },
                            "category": {
                                "type": "integer",
                                "description": "类别(feature 功能 | interface 接口 | performance 性能 | safe 安全 | experience 体验 | improve 改进 | other 其他)",
                                "format": "int32"
                            },
                            "source": {
                                "type": "string",
                                "description": "来源(customer 客户 | user 用户 | po 产品经理 | market 市场 | service 客服 | operation 运营 | support 技术支持 | competitor 竞争对手 | partner 合作伙伴 | dev 开发人员 | tester 测试人员 | bug Bug | forum 论坛 | other 其他)"
                            },
                            "assignedTo": {
                                "type": "string",
                                "description": "指派给"
                            }
                        },
                        "required": [
                            "title"
                        ]
                    },
                },
            }, {
                name: 'updateModule',
                display: '修改需求模块',
                type: 'update',
                method: 'put',
                path: '/story/modules/{moduleID}',
                resultType: 'object',
                pathParams: {
                    moduleID: '模块ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "模块名称"
                            },
                            "parent": {
                                "type": "integer",
                                "description": "父模块",
                                "format": "int32"
                            }
                        }
                    },
                },
            }, {
                name: 'delete',
                display: '删除需求',
                type: 'delete',
                method: 'delete',
                path: '/stories/{storyID}',
                resultType: 'text',
                pathParams: {
                    storyID: '需求ID',
                },
            }, {
                name: 'deleteModule',
                display: '删除需求模块',
                type: 'delete',
                method: 'delete',
                path: '/story/modules/{moduleID}',
                resultType: 'text',
                pathParams: {
                    moduleID: '模块ID',
                },
            }, {
                name: 'activate',
                display: '激活需求',
                type: 'action',
                method: 'put',
                path: '/stories/{storyID}/activate',
                resultType: 'text',
                pathParams: {
                    storyID: '需求ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "assignedTo": {
                                "type": "string",
                                "description": "指派给"
                            },
                            "comment": {
                                "type": "string",
                                "description": "备注"
                            }
                        }
                    },
                },
            }, {
                name: 'change',
                display: '变更需求',
                type: 'action',
                method: 'put',
                path: '/stories/{storyID}/change',
                resultType: 'text',
                pathParams: {
                    storyID: '需求ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "title": {
                                "type": "string",
                                "description": "需求名称"
                            },
                            "reviewer": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "评审人员"
                            },
                            "spec": {
                                "type": "string",
                                "description": "需求描述"
                            },
                            "verify": {
                                "type": "string",
                                "description": "验收标准"
                            }
                        },
                        "required": [
                            "reviewer"
                        ]
                    },
                },
            }, {
                name: 'close',
                display: '关闭需求',
                type: 'action',
                method: 'put',
                path: '/stories/{storyID}/close',
                resultType: 'text',
                pathParams: {
                    storyID: '需求ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "closedReason": {
                                "type": "string",
                                "description": "关闭原因(done 已完成 | subdivided 已拆分 | duplicate 重复 | postponed 延期 | willnotdo 不做 | cancel 已取消 | bydesign 设计如此)"
                            },
                            "comment": {
                                "type": "string",
                                "description": "备注"
                            }
                        },
                        "required": [
                            "closedReason"
                        ]
                    },
                },
            }
        ],
    },

    /* 业务需求模块 */
    {
        name: 'epic',
        display: '业务需求',
        description: '业务需求管理，支持获取业务需求列表，支持获取产品下的业务需求、创建业务需求、获取业务需求详情、修改业务需求、删除业务需求、激活业务需求、变更业务需求、关闭业务需求',
        actions: [
            {
                name: 'list',
                display: '获取业务需求列表，支持获取产品下的业务需求',
                type: 'list',
                method: 'get',
                path: '/products/{productID}/epics',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'epics',
                pathParams: {
                    productID: '所属产品ID',
                },
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是unclosed',
                        defaultValue: 'unclosed',
                        options: [
                            { value: 'allstory', label: '全部' },
                            { value: 'assignedtome', label: '指派给我' },
                            { value: 'openedbyme', label: '我创建' },
                            { value: 'reviewbyme', label: '待我评审' },
                            { value: 'draftstory', label: '草稿' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'title_asc', label: '标题 升序' },
                            { value: 'title_desc', label: '标题 降序' },
                            { value: 'status_asc', label: '状态 升序' },
                            { value: 'status_desc', label: '状态 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(需求名称，示例：关键字)；id(编号，示例：1)；keywords(关键词，示例：关键字)；status(当前状态，枚举：draft 草稿 | reviewing 评审中 | active 激活 | changing 变更中 | closed 已关闭)；pri(优先级，枚举：1 | 2 | 3 | 4)；module(所属模块，示例：all)；stage(所处阶段，枚举：wait 未开始 | planned 已计划 | projected 研发立项 | designing 设计中 | designed 设计完毕 | developing 研发中 | developed 研发完毕 | testing 测试中 | tested 测试完毕 | verified 已验收 | rejected 验收失败 | delivering 交付中 | delivered 已交付 | released 已发布 | closed 已关闭)；product(所属产品，示例：all)；branch(branch，示例：all)；grade(需求层级，示例：all)；plan(所属计划，示例：all)；estimate(预计小时，示例：关键字)；source(来源，枚举：customer 客户 | user 用户 | po 产品经理 | market 市场 | service 客服 | operation 运营 | support 技术支持 | competitor 竞争对手 | partner 合作伙伴 | dev 开发人员 | tester 测试人员 | bug Bug | forum 论坛 | other 其他)；sourceNote(来源备注，示例：关键字)；fromBug(来源Bug，示例：关键字)；category(类别，枚举：feature 功能 | interface 接口 | performance 性能 | safe 安全 | experience 体验 | improve 改进 | other 其他)；openedBy(由谁创建，用户，示例：admin)；reviewedBy(已评审人，用户，示例：admin)；result(评审结果，枚举：pass 确认通过 | revert 撤销变更 | clarify 有待明确 | reject 拒绝)；assignedTo(指派给，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedBy(最后修改，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；closedReason(关闭原因，枚举：done 已完成 | subdivided 已拆分 | duplicate 重复 | postponed 延期 | willnotdo 不做 | cancel 已取消 | bydesign 设计如此)；version(版本号，示例：关键字)；openedDate(创建日期，示例：2026-01-01)；reviewedDate(评审时间，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(最后修改日期，示例：2026-01-01)；activatedDate(激活日期，示例：2026-01-01)',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
            }, {
                name: 'create',
                display: '创建业务需求',
                type: 'create',
                method: 'post',
                path: '/epics',
                resultType: 'object',
                params: [
                    {
                        name: 'productID',
                        required: true,
                        type: 'number',
                        description: '产品ID',
                    },
                ],
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "title": {
                                "type": "string"
                            },
                            "pri": {
                                "type": "integer",
                                "description": "优先级，默认是3",
                                "format": "int32"
                            },
                            "module": {
                                "type": "integer",
                                "description": "所属模块",
                                "format": "int32"
                            },
                            "parent": {
                                "type": "integer",
                                "description": "父业务需求",
                                "format": "int32"
                            },
                            "estimate": {
                                "type": "number",
                                "description": "预计工时",
                                "format": "float"
                            },
                            "spec": {
                                "type": "string",
                                "description": "业务需求描述"
                            },
                            "category": {
                                "type": "integer",
                                "description": "类别(feature 功能 | interface 接口 | performance 性能 | safe 安全 | experience 体验 | improve 改进 | other 其他)",
                                "format": "int32"
                            },
                            "source": {
                                "type": "string",
                                "description": "来源(customer 客户 | user 用户 | po 产品经理 | market 市场 | service 客服 | operation 运营 | support 技术支持 | competitor 竞争对手 | partner 合作伙伴 | dev 开发人员 | tester 测试人员 | bug Bug | forum 论坛 | other 其他)"
                            },
                            "verify": {
                                "type": "string",
                                "description": "验收标准"
                            },
                            "assignedTo": {
                                "type": "string",
                                "description": "指派给"
                            },
                            "reviewer": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "评审人，如果设置必须评审，必须填写"
                            }
                        },
                        "required": [
                            "title"
                        ]
                    },
                },
            }, {
                name: 'get',
                display: '获取业务需求详情',
                type: 'get',
                method: 'get',
                path: '/epics/{storyID}',
                resultType: 'object',
                pathParams: {
                    storyID: '需求ID',
                },
                resultGetter: 'epic',
            }, {
                name: 'update',
                display: '修改业务需求',
                type: 'update',
                method: 'put',
                path: '/epics/{storyID}',
                resultType: 'object',
                pathParams: {
                    storyID: '需求ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "title": {
                                "type": "string",
                                "description": "需求名称"
                            },
                            "pri": {
                                "type": "integer",
                                "description": "优先级，默认是3",
                                "format": "int32"
                            },
                            "module": {
                                "type": "integer",
                                "description": "所属模块",
                                "format": "int32"
                            },
                            "parent": {
                                "type": "integer",
                                "description": "父业务需求",
                                "format": "int32"
                            },
                            "estimate": {
                                "type": "number",
                                "description": "预计工时",
                                "format": "float"
                            },
                            "category": {
                                "type": "integer",
                                "description": "类别(feature 功能 | interface 接口 | performance 性能 | safe 安全 | experience 体验 | improve 改进 | other 其他)",
                                "format": "int32"
                            },
                            "source": {
                                "type": "string",
                                "description": "来源(customer 客户 | user 用户 | po 产品经理 | market 市场 | service 客服 | operation 运营 | support 技术支持 | competitor 竞争对手 | partner 合作伙伴 | dev 开发人员 | tester 测试人员 | bug Bug | forum 论坛 | other 其他)"
                            },
                            "assignedTo": {
                                "type": "string",
                                "description": "指派给"
                            }
                        },
                        "required": [
                            "title"
                        ]
                    },
                },
            }, {
                name: 'delete',
                display: '删除业务需求',
                type: 'delete',
                method: 'delete',
                path: '/epics/{storyID}',
                resultType: 'text',
                pathParams: {
                    storyID: '需求ID',
                },
            }, {
                name: 'activate',
                display: '激活业务需求',
                type: 'action',
                method: 'put',
                path: '/epics/{storyID}/activate',
                resultType: 'text',
                pathParams: {
                    storyID: '需求ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "assignedTo": {
                                "type": "string",
                                "description": "指派给"
                            },
                            "comment": {
                                "type": "string",
                                "description": "备注"
                            }
                        }
                    },
                },
            }, {
                name: 'change',
                display: '变更业务需求',
                type: 'action',
                method: 'put',
                path: '/epics/{storyID}/change',
                resultType: 'text',
                pathParams: {
                    storyID: '需求ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "title": {
                                "type": "string",
                                "description": "需求名称"
                            },
                            "reviewer": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "评审人员"
                            },
                            "spec": {
                                "type": "string",
                                "description": "需求描述"
                            },
                            "verify": {
                                "type": "string",
                                "description": "验收标准"
                            }
                        },
                        "required": [
                            "reviewer"
                        ]
                    },
                },
            }, {
                name: 'close',
                display: '关闭业务需求',
                type: 'action',
                method: 'put',
                path: '/epics/{storyID}/close',
                resultType: 'text',
                pathParams: {
                    storyID: '需求ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "closedReason": {
                                "type": "string",
                                "description": "关闭原因(done 已完成 | subdivided 已拆分 | duplicate 重复 | postponed 延期 | willnotdo 不做 | cancel 已取消 | bydesign 设计如此)"
                            },
                            "comment": {
                                "type": "string",
                                "description": "备注"
                            }
                        },
                        "required": [
                            "closedReason"
                        ]
                    },
                },
            }
        ],
    },

    /* 用户需求模块 */
    {
        name: 'requirement',
        display: '用户需求',
        description: '用户需求管理，支持获取用户需求列表，支持获取产品下的用户需求、创建用户需求、获取用户需求详情、修改用户需求、删除用户需求、激活用户需求、变更用户需求、关闭用户需求',
        actions: [
            {
                name: 'list',
                display: '获取用户需求列表，支持获取产品下的用户需求',
                type: 'list',
                method: 'get',
                path: '/products/{productID}/requirements',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'requirements',
                pathParams: {
                    productID: '所属产品ID',
                },
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是unclosed',
                        defaultValue: 'unclosed',
                        options: [
                            { value: 'allstory', label: '全部' },
                            { value: 'assignedtome', label: '指派给我' },
                            { value: 'openedbyme', label: '我创建' },
                            { value: 'reviewbyme', label: '待我评审' },
                            { value: 'draftstory', label: '草稿' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'title_asc', label: '标题 升序' },
                            { value: 'title_desc', label: '标题 降序' },
                            { value: 'status_asc', label: '状态 升序' },
                            { value: 'status_desc', label: '状态 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(需求名称，示例：关键字)；id(编号，示例：1)；keywords(关键词，示例：关键字)；status(当前状态，枚举：draft 草稿 | reviewing 评审中 | active 激活 | changing 变更中 | closed 已关闭)；pri(优先级，枚举：1 | 2 | 3 | 4)；module(所属模块，示例：all)；stage(所处阶段，枚举：wait 未开始 | planned 已计划 | projected 研发立项 | designing 设计中 | designed 设计完毕 | developing 研发中 | developed 研发完毕 | testing 测试中 | tested 测试完毕 | verified 已验收 | rejected 验收失败 | delivering 交付中 | delivered 已交付 | released 已发布 | closed 已关闭)；product(所属产品，示例：all)；branch(branch，示例：all)；grade(需求层级，示例：all)；plan(所属计划，示例：all)；estimate(预计小时，示例：关键字)；source(来源，枚举：customer 客户 | user 用户 | po 产品经理 | market 市场 | service 客服 | operation 运营 | support 技术支持 | competitor 竞争对手 | partner 合作伙伴 | dev 开发人员 | tester 测试人员 | bug Bug | forum 论坛 | other 其他)；sourceNote(来源备注，示例：关键字)；fromBug(来源Bug，示例：关键字)；category(类别，枚举：feature 功能 | interface 接口 | performance 性能 | safe 安全 | experience 体验 | improve 改进 | other 其他)；openedBy(由谁创建，用户，示例：admin)；reviewedBy(已评审人，用户，示例：admin)；result(评审结果，枚举：pass 确认通过 | revert 撤销变更 | clarify 有待明确 | reject 拒绝)；assignedTo(指派给，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedBy(最后修改，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；closedReason(关闭原因，枚举：done 已完成 | subdivided 已拆分 | duplicate 重复 | postponed 延期 | willnotdo 不做 | cancel 已取消 | bydesign 设计如此)；version(版本号，示例：关键字)；openedDate(创建日期，示例：2026-01-01)；reviewedDate(评审时间，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(最后修改日期，示例：2026-01-01)；activatedDate(激活日期，示例：2026-01-01)',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
            }, {
                name: 'create',
                display: '创建用户需求',
                type: 'create',
                method: 'post',
                path: '/requirements',
                resultType: 'object',
                params: [
                    {
                        name: 'productID',
                        required: true,
                        type: 'number',
                        description: '产品ID',
                    },
                ],
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "title": {
                                "type": "string"
                            },
                            "pri": {
                                "type": "integer",
                                "description": "优先级，默认是3",
                                "format": "int32"
                            },
                            "module": {
                                "type": "integer",
                                "description": "所属模块",
                                "format": "int32"
                            },
                            "parent": {
                                "type": "integer",
                                "description": "父用户需求",
                                "format": "int32"
                            },
                            "estimate": {
                                "type": "number",
                                "description": "预计工时",
                                "format": "float"
                            },
                            "spec": {
                                "type": "string",
                                "description": "用户需求描述"
                            },
                            "category": {
                                "type": "integer",
                                "description": "类别(feature 功能 | interface 接口 | performance 性能 | safe 安全 | experience 体验 | improve 改进 | other 其他)",
                                "format": "int32"
                            },
                            "source": {
                                "type": "string",
                                "description": "来源(customer 客户 | user 用户 | po 产品经理 | market 市场 | service 客服 | operation 运营 | support 技术支持 | competitor 竞争对手 | partner 合作伙伴 | dev 开发人员 | tester 测试人员 | bug Bug | forum 论坛 | other 其他)"
                            },
                            "verify": {
                                "type": "string",
                                "description": "验收标准"
                            },
                            "assignedTo": {
                                "type": "string",
                                "description": "指派给"
                            },
                            "reviewer": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "评审人，如果设置必须评审，必须填写"
                            }
                        },
                        "required": [
                            "title"
                        ]
                    },
                },
            }, {
                name: 'get',
                display: '获取用户需求详情',
                type: 'get',
                method: 'get',
                path: '/requirements/{storyID}',
                resultType: 'object',
                pathParams: {
                    storyID: '需求ID',
                },
                resultGetter: 'requirement',
            }, {
                name: 'update',
                display: '修改用户需求',
                type: 'update',
                method: 'put',
                path: '/requirements/{storyID}',
                resultType: 'object',
                pathParams: {
                    storyID: '需求ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "title": {
                                "type": "string"
                            },
                            "pri": {
                                "type": "integer",
                                "description": "优先级，默认是3",
                                "format": "int32"
                            },
                            "module": {
                                "type": "integer",
                                "description": "所属模块",
                                "format": "int32"
                            },
                            "parent": {
                                "type": "integer",
                                "description": "父用户需求",
                                "format": "int32"
                            },
                            "estimate": {
                                "type": "number",
                                "description": "预计工时",
                                "format": "float"
                            },
                            "category": {
                                "type": "integer",
                                "description": "类别(feature 功能 | interface 接口 | performance 性能 | safe 安全 | experience 体验 | improve 改进 | other 其他)",
                                "format": "int32"
                            },
                            "source": {
                                "type": "string",
                                "description": "来源(customer 客户 | user 用户 | po 产品经理 | market 市场 | service 客服 | operation 运营 | support 技术支持 | competitor 竞争对手 | partner 合作伙伴 | dev 开发人员 | tester 测试人员 | bug Bug | forum 论坛 | other 其他)"
                            },
                            "assignedTo": {
                                "type": "string",
                                "description": "指派给"
                            }
                        },
                        "required": [
                            "title"
                        ]
                    },
                },
            }, {
                name: 'delete',
                display: '删除用户需求',
                type: 'delete',
                method: 'delete',
                path: '/requirements/{storyID}',
                resultType: 'text',
                pathParams: {
                    storyID: '需求ID',
                },
            }, {
                name: 'activate',
                display: '激活用户需求',
                type: 'action',
                method: 'put',
                path: '/requirements/{storyID}/activate',
                resultType: 'text',
                pathParams: {
                    storyID: '需求ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "assignedTo": {
                                "type": "string",
                                "description": "指派给"
                            },
                            "comment": {
                                "type": "string",
                                "description": "备注"
                            }
                        }
                    },
                },
            }, {
                name: 'change',
                display: '变更用户需求',
                type: 'action',
                method: 'put',
                path: '/requirements/{storyID}/change',
                resultType: 'text',
                pathParams: {
                    storyID: '需求ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "title": {
                                "type": "string",
                                "description": "需求名称"
                            },
                            "spec": {
                                "type": "string",
                                "description": "需求描述"
                            },
                            "verify": {
                                "type": "string",
                                "description": "验收标准"
                            }
                        }
                    },
                },
            }, {
                name: 'close',
                display: '关闭用户需求',
                type: 'action',
                method: 'put',
                path: '/requirements/{storyID}/close',
                resultType: 'text',
                pathParams: {
                    storyID: '需求ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "closedReason": {
                                "type": "string",
                                "description": "关闭原因(done 已完成 | subdivided 已拆分 | duplicate 重复 | postponed 延期 | willnotdo 不做 | cancel 已取消 | bydesign 设计如此)"
                            },
                            "comment": {
                                "type": "string",
                                "description": "备注"
                            }
                        },
                        "required": [
                            "closedReason"
                        ]
                    },
                },
            }
        ],
    },

    /* Bug模块 */
    {
        name: 'bug',
        display: 'Bug',
        description: 'Bug管理，支持获取Bug列表，支持获取项目/产品/执行下的Bug、产品的Bug模块树、创建Bug、获取Bug详情、修改Bug、修改Bug模块、删除Bug、删除Bug模块、激活Bug、关闭Bug、确认Bug、解决Bug',
        actions: [
            {
                name: 'list',
                display: '获取Bug列表，支持获取项目/产品/执行下的Bug',
                type: 'list',
                method: 'get',
                path: '/{scope}/{scopeID}/bugs',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'bugs',
                pathParams: {
                    scope: {description: 'Bug所属范围', options: [{value: 'projects', label: '项目'}, {value: 'products', label: '产品'}, {value: 'executions', label: '执行'}]},
                    scopeID: '所属范围ID',
                },
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是all',
                        defaultValue: 'all',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'unresolved', label: '未关闭' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'title_asc', label: '标题 升序' },
                            { value: 'title_desc', label: '标题 降序' },
                            { value: 'status_asc', label: '状态 升序' },
                            { value: 'status_desc', label: '状态 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(Bug标题，示例：关键字)；module(所属模块，模块，示例：0)；keywords(关键词，示例：关键字)；steps(重现步骤，示例：关键字)；assignedTo(指派给，用户，示例：admin)；resolvedBy(解决者，用户，示例：admin)；status(Bug状态，枚举：active 激活 | resolved 已解决 | closed 已关闭)；confirmed(是否确认，枚举：1 已确认 | 0 未确认)；story(相关需求，示例：关键字)；project(所属项目，示例：all)；product(所属产品，示例：all)；branch(branch，示例：all)；plan(所属计划，示例：all)；id(Bug编号，示例：1)；execution(所属执行，执行，示例：3)；severity(严重程度，枚举：1 | 2 | 3 | 4)；pri(优先级，枚举：1 | 2 | 3 | 4)；type(Bug类型，枚举：codeerror 代码错误 | config 配置相关 | install 安装部署 | security 安全相关 | performance 性能问题 | standard 标准规范 | automation 测试脚本 | designdefect 设计缺陷 | codeimprovement 代码改进 | others 其他)；os(操作系统，枚举：all 全部 | windows Windows | win11 Windows 11 | win10 Windows 10 | win8 Windows 8 | win7 Windows 7 | winxp Windows XP | osx Mac OS | android Android | ios IOS | linux Linux | ubuntu Ubuntu | chromeos Chrome OS | fedora Fedora | unix Unix | others 其他)；browser(浏览器，枚举：all 全部 | chrome Chrome | edge Edge | ie IE系列 | ie11 IE11 | ie10 IE10 | ie9 IE9 | ie8 IE8 | firefox firefox系列 | opera Opera系列 | safari | 360 360浏览器 | qq QQ浏览器 | other 其他)；resolution(解决方案，枚举：bydesign 设计如此 | duplicate 重复Bug | external 外部原因 | fixed 已解决 | notrepro 无法重现 | postponed 延期处理 | willnotfix 不予解决 | tostory 转为用户故事)；activatedCount(激活次数，示例：关键字)；toTask(转任务，示例：关键字)；toStory(转用户故事，示例：关键字)；openedBy(由谁创建，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedBy(修改者，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；openedBuild(影响版本，示例：builds)；resolvedBuild(解决版本，示例：builds)；openedDate(创建日期，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；resolvedDate(解决日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(修改日期，示例：2026-01-01)；deadline(截止日期，示例：2026-01-01)；activatedDate(激活时间，示例：2026-01-01)',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
            }, {
                name: 'modules',
                display: '产品的Bug模块树',
                type: 'list',
                method: 'get',
                path: '/products/{productID}/bug/modules',
                resultType: 'list',
                pathParams: {
                    productID: '产品ID',
                },
                resultGetter: 'tree',
            }, {
                name: 'create',
                display: '创建Bug',
                type: 'create',
                method: 'post',
                path: '/bugs',
                resultType: 'object',
                params: [
                    {
                        name: 'productID',
                        required: true,
                        type: 'number',
                        description: '所属产品',
                    },
                ],
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "title": {
                                "type": "string",
                                "description": "Bug标题"
                            },
                            "openedBuild": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "影响版本,主干是trunk，其他版本使用版本ID"
                            },
                            "project": {
                                "type": "integer",
                                "description": "所属项目",
                                "format": "int32"
                            },
                            "execution": {
                                "type": "integer",
                                "description": "所属执行",
                                "format": "int32"
                            },
                            "severity": {
                                "type": "integer",
                                "description": "严重程度，默认是3",
                                "format": "int32"
                            },
                            "pri": {
                                "type": "integer",
                                "description": "优先级，默认是3",
                                "format": "int32"
                            },
                            "type": {
                                "type": "string",
                                "description": "Bug类型(codeerror 代码错误 | config 配置相关 | install 安装部署 | security 安全相关 | performance 性能问题 | standard 标准规范 | automation 测试脚本 | designdefect 设计缺陷 | others 其他)"
                            },
                            "steps": {
                                "type": "string",
                                "description": "重现步骤"
                            },
                            "story": {
                                "type": "integer",
                                "description": "相关需求",
                                "format": "int32"
                            },
                            "assignedTo": {
                                "type": "string",
                                "description": "指派给"
                            }
                        },
                        "required": [
                            "title",
                            "openedBuild"
                        ]
                    },
                },
            }, {
                name: 'get',
                display: '获取Bug详情',
                type: 'get',
                method: 'get',
                path: '/bugs/{bugID}',
                resultType: 'object',
                resultGetter: 'bug',
                pathParams: {
                    bugID: 'Bug ID',
                },
            }, {
                name: 'update',
                display: '修改Bug',
                type: 'update',
                method: 'put',
                path: '/bugs/{bugID}',
                resultType: 'object',
                pathParams: {
                    bugID: 'Bug ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "title": {
                                "type": "string",
                                "description": "Bug标题"
                            },
                            "severity": {
                                "type": "integer",
                                "description": "严重程度，默认是3",
                                "format": "int32"
                            },
                            "pri": {
                                "type": "integer",
                                "description": "优先级，默认是3",
                                "format": "int32"
                            },
                            "type": {
                                "type": "string",
                                "description": "Bug类型(codeerror 代码错误 | config 配置相关 | install 安装部署 | security 安全相关 | performance 性能问题 | standard 标准规范 | automation 测试脚本 | designdefect 设计缺陷 | others 其他)"
                            },
                            "openedBuild": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "影响版本,主干是trunk，其他版本使用版本ID"
                            },
                            "steps": {
                                "type": "string",
                                "description": "重现步骤"
                            },
                            "project": {
                                "type": "integer",
                                "description": "所属项目",
                                "format": "int32"
                            },
                            "execution": {
                                "type": "integer",
                                "description": "所属执行",
                                "format": "int32"
                            },
                            "story": {
                                "type": "integer",
                                "description": "相关需求",
                                "format": "int32"
                            },
                            "assignedTo": {
                                "type": "string",
                                "description": "指派给"
                            }
                        }
                    },
                },
            }, {
                name: 'updateModule',
                display: '修改Bug模块',
                type: 'update',
                method: 'put',
                path: '/bug/modules/{moduleID}',
                resultType: 'object',
                pathParams: {
                    moduleID: '模块ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "模块名称"
                            },
                            "parent": {
                                "type": "integer",
                                "description": "父模块",
                                "format": "int32"
                            }
                        }
                    },
                },
            }, {
                name: 'delete',
                display: '删除Bug',
                type: 'delete',
                method: 'delete',
                path: '/bugs/{bugID}',
                resultType: 'text',
                pathParams: {
                    bugID: 'Bug ID',
                },
            }, {
                name: 'deleteModule',
                display: '删除Bug模块',
                type: 'delete',
                method: 'delete',
                path: '/bug/modules/{moduleID}',
                resultType: 'text',
                pathParams: {
                    moduleID: '模块ID',
                },
            }, {
                name: 'activate',
                display: '激活Bug',
                type: 'action',
                method: 'put',
                path: '/bugs/{bugID}/activate',
                resultType: 'text',
                pathParams: {
                    bugID: 'Bug ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "openedBuild": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "影响版本, trunk为主干"
                            },
                            "assignedTo": {
                                "type": "string",
                                "description": "指派给"
                            },
                            "comment": {
                                "type": "string",
                                "description": "备注"
                            }
                        }
                    },
                },
            }, {
                name: 'close',
                display: '关闭Bug',
                type: 'action',
                method: 'put',
                path: '/bugs/{bugID}/close',
                resultType: 'text',
                pathParams: {
                    bugID: 'Bug ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "comment": {
                                "type": "string",
                                "description": "备注"
                            }
                        }
                    },
                },
            }, {
                name: 'confirm',
                display: '确认Bug',
                type: 'action',
                method: 'put',
                path: '/bugs/{bugID}/confirm',
                resultType: 'text',
                pathParams: {
                    bugID: 'Bug ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "assignedTo": {
                                "type": "string",
                                "description": "指派给"
                            },
                            "type": {
                                "type": "string",
                                "description": "Bug类型(codeerror 代码错误 | config 配置相关 | install 安装部署 | security 安全相关 | performance 性能问题 | standard 标准规范 | automation 测试脚本 | designdefect 设计缺陷 | others 其他)"
                            },
                            "pri": {
                                "type": "integer",
                                "description": "优先级，默认是3",
                                "format": "int32"
                            },
                            "deadline": {
                                "type": "string",
                                "description": "截止日期"
                            },
                            "status": {
                                "type": "string",
                                "description": "状态"
                            },
                            "mailto": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "抄送给"
                            },
                            "comment": {
                                "type": "string",
                                "description": "备注"
                            }
                        }
                    },
                },
            }, {
                name: 'resolve',
                display: '解决Bug',
                type: 'action',
                method: 'put',
                path: '/bugs/{bugID}/resolve',
                resultType: 'text',
                pathParams: {
                    bugID: 'Bug ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "resolution": {
                                "type": "string",
                                "description": "fixed 已解决 | notrepro 无法重现 | bydesign 设计如此 | duplicate 重复Bug | external 外部原因| postponed 延期处理 | willnotfix 不予解决 | tostory 转为需求"
                            },
                            "resolvedDate": {
                                "type": "string",
                                "description": "解决日期，默认今天"
                            },
                            "resolvedBuild": {
                                "type": "string",
                                "description": "解决版本, trunk为主干"
                            },
                            "assignedTo": {
                                "type": "string",
                                "description": "指派给"
                            },
                            "comment": {
                                "type": "string",
                                "description": "备注"
                            }
                        },
                        "required": [
                            "resolution"
                        ]
                    },
                },
            }
        ],
    },

    /* 测试用例模块 */
    {
        name: 'testcase',
        display: '测试用例',
        description: '测试用例管理，支持获取测试用例列表，支持获取产品/项目/执行下的测试用例、产品的用例模块树、创建测试用例、获取测试用例详情、修改测试用例、修改用例模块、删除测试用例、删除用例模块',
        actions: [
            {
                name: 'list',
                display: '获取测试用例列表，支持获取产品/项目/执行下的测试用例',
                type: 'list',
                method: 'get',
                path: '/{scope}/{scopeID}/testcases',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'testcases',
                pathParams: {
                    scope: {description: '测试用例所属范围', options: [{value: 'products', label: '产品'}, {value: 'projects', label: '项目'}, {value: 'executions', label: '执行'}]},
                    scopeID: '所属范围ID',
                },
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是all',
                        defaultValue: 'all',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'wait', label: '未关闭' },
                            { value: 'needconfirm', label: '需求变动' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'title_asc', label: '标题 升序' },
                            { value: 'title_desc', label: '标题 降序' },
                            { value: 'status_asc', label: '状态 升序' },
                            { value: 'status_desc', label: '状态 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(用例名称，示例：关键字)；story(关联需求，示例：all)；id(用例编号，示例：1)；keywords(关键词，示例：关键字)；lastEditedBy(修改者，用户，示例：admin)；type(用例类型，枚举：unit 单元测试 | interface 接口测试 | feature 功能测试 | install 安装部署 | config 配置相关 | performance 性能测试 | security 安全相关 | other 其他)；auto(自动化，枚举：auto 是 | no 否)；openedBy(由谁创建，用户，示例：admin)；status(用例状态，枚举：wait 待评审 | normal 正常 | blocked 被阻塞 | investigate 研究中)；product(所属产品，示例：all)；branch(branch，示例：all)；stage(适用环节，枚举：unittest 单元测试环节 | feature 功能测试环节 | intergrate 集成测试环节 | system 系统测试环节 | smoke 冒烟测试环节 | bvt 版本验证环节)；module(所属模块，模块，示例：0)；pri(优先级，枚举：3 | 1 | 2 | 4)；lib(所属库，示例：all)；lastRunner(执行人，用户，示例：admin)；lastRunResult(结果，枚举：pass 通过 | fail 失败 | blocked 阻塞 | null 未执行)；lastRunDate(执行时间，示例：2026-01-01)；openedDate(创建日期，示例：2026-01-01)；lastEditedDate(修改日期，示例：2026-01-01)；scene(所属场景，示例：all)',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
            }, {
                name: 'modules',
                display: '产品的用例模块树',
                type: 'list',
                method: 'get',
                path: '/products/{productID}/testcase/modules',
                resultType: 'list',
                pathParams: {
                    productID: '产品ID',
                },
                resultGetter: 'tree',
            }, {
                name: 'create',
                display: '创建测试用例',
                type: 'create',
                method: 'post',
                path: '/testcases',
                resultType: 'object',
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "productID": {
                                "type": "integer",
                                "description": "所属产品",
                                "format": "int32"
                            },
                            "title": {
                                "type": "string",
                                "description": "用例标题"
                            },
                            "module": {
                                "type": "integer",
                                "description": "所属模块",
                                "format": "int32"
                            },
                            "story": {
                                "type": "integer",
                                "description": "相关需求",
                                "format": "int32"
                            },
                            "pri": {
                                "type": "integer",
                                "description": "优先级",
                                "format": "int32"
                            },
                            "type": {
                                "type": "string",
                                "description": "用例类型(unit 单元测试 | interface 接口测试 | feature 功能测试 | install 安装部署 | config 配置相关 | performance 性能测试 | security 安全相关 | other 其他)"
                            },
                            "precondition": {
                                "type": "string",
                                "description": "前置条件"
                            },
                            "steps": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "用例步骤, 如果是嵌套用例，可以通过key表示嵌套关系 {\"1\": \"分组1\", \"1.1\": \"子分组1.1\", \"1.1.1\": \"步骤1.1.1\"}"
                            },
                            "expects": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "用例步骤期望, 如果是嵌套用例步骤，可以通过key表示嵌套关系 {\"1\": \"\", \"1.1\": \"\", \"1.1.1\": \"步骤1.1.1的期望\"}"
                            },
                            "stepType": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "用例步骤类型(step 步骤 | group 父级步骤), 如果是嵌套用例步骤，可以通过key表示嵌套关系 {\"1\": \"group\", \"1.1\": \"group\", \"1.1.1\": \"step\"}"
                            },
                            "project": {
                                "type": "integer",
                                "description": "所属项目",
                                "format": "int32"
                            },
                            "execution": {
                                "type": "integer",
                                "description": "所属执行",
                                "format": "int32"
                            }
                        },
                        "required": [
                            "productID",
                            "title"
                        ]
                    },
                },
            }, {
                name: 'get',
                display: '获取测试用例详情',
                type: 'get',
                method: 'get',
                path: '/testcases/{caseID}',
                resultType: 'object',
                resultGetter: 'testcase',
                pathParams: {
                    caseID: '测试用例ID',
                },
            }, {
                name: 'update',
                display: '修改测试用例',
                type: 'update',
                method: 'put',
                path: '/testcases/{caseID}',
                resultType: 'object',
                pathParams: {
                    caseID: '测试用例ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "title": {
                                "type": "string",
                                "description": "用例标题"
                            },
                            "module": {
                                "type": "integer",
                                "description": "所属模块",
                                "format": "int32"
                            },
                            "story": {
                                "type": "integer",
                                "description": "相关需求",
                                "format": "int32"
                            },
                            "pri": {
                                "type": "integer",
                                "description": "优先级",
                                "format": "int32"
                            },
                            "type": {
                                "type": "string",
                                "description": "用例类型(unit 单元测试 | interface 接口测试 | feature 功能测试 | install 安装部署 | config 配置相关 | performance 性能测试 | security 安全相关 | other 其他)"
                            },
                            "precondition": {
                                "type": "string",
                                "description": "前置条件"
                            },
                            "steps": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "用例步骤, 如果是嵌套用例，可以通过key表示嵌套关系 {\"1\": \"分组1\", \"1.1\": \"子分组1.1\", \"1.1.1\": \"步骤1.1.1\"}"
                            },
                            "expects": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "用例步骤期望, 如果是嵌套用例步骤，可以通过key表示嵌套关系 {\"1\": \"\", \"1.1\": \"\", \"1.1.1\": \"步骤1.1.1的期望\"}"
                            },
                            "stepType": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "用例步骤类型(step 步骤 | group 父级步骤), 如果是嵌套用例步骤，可以通过key表示嵌套关系 {\"1\": \"group\", \"1.1\": \"group\", \"1.1.1\": \"step\"}"
                            }
                        },
                        "required": [
                            "title"
                        ]
                    },
                },
            }, {
                name: 'updateModule',
                display: '修改用例模块',
                type: 'update',
                method: 'put',
                path: '/testcase/modules/{moduleID}',
                resultType: 'object',
                pathParams: {
                    moduleID: '模块ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "模块名称"
                            },
                            "parent": {
                                "type": "integer",
                                "description": "父模块",
                                "format": "int32"
                            }
                        }
                    },
                },
            }, {
                name: 'delete',
                display: '删除测试用例',
                type: 'delete',
                method: 'delete',
                path: '/testcases/{caseID}',
                resultType: 'text',
                pathParams: {
                    caseID: '测试用例ID',
                },
            }, {
                name: 'deleteModule',
                display: '删除用例模块',
                type: 'delete',
                method: 'delete',
                path: '/testcase/modules/{moduleID}',
                resultType: 'text',
                pathParams: {
                    moduleID: '模块ID',
                },
            }
        ],
    },

    /* 任务模块 */
    {
        name: 'task',
        display: '任务',
        description: '任务管理，支持获取任务列表，支持获取执行下的任务、执行的任务模块树、创建任务、获取任务详情、修改任务、修改任务模块、删除任务、删除任务模块、激活任务、关闭任务、完成任务、启动任务',
        actions: [
            {
                name: 'list',
                display: '获取任务列表，支持获取执行下的任务',
                type: 'list',
                method: 'get',
                path: '/executions/{executionID}/tasks',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'tasks',
                pathParams: {
                    executionID: '所属执行ID',
                },
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是unclosed',
                        defaultValue: 'unclosed',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'unclosed', label: '未关闭' },
                            { value: 'assignedtome', label: '指派给我' },
                            { value: 'assignedtome', label: '指派给我' },
                            { value: 'myinvolved', label: '由我参与' },
                            { value: 'assignedbyme', label: '由我指派' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'name_asc', label: '名称 升序' },
                            { value: 'name_desc', label: '名称 降序' },
                            { value: 'status_asc', label: '状态 升序' },
                            { value: 'status_desc', label: '状态 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                ],
            }, {
                name: 'modules',
                display: '执行的任务模块树',
                type: 'list',
                method: 'get',
                path: '/executions/{executionID}/task/modules',
                resultType: 'list',
                pathParams: {
                    executionID: '执行ID',
                },
                resultGetter: 'tree',
            }, {
                name: 'create',
                display: '创建任务',
                type: 'create',
                method: 'post',
                path: '/tasks',
                resultType: 'object',
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "任务名称"
                            },
                            "executionID": {
                                "type": "integer",
                                "description": "所属执行",
                                "format": "int32"
                            },
                            "type": {
                                "type": "string",
                                "description": "任务类型"
                            },
                            "assignedTo": {
                                "type": "string",
                                "description": "指派给"
                            },
                            "estStarted": {
                                "type": "string",
                                "description": "预计开始"
                            },
                            "deadline": {
                                "type": "string",
                                "description": "截止日期"
                            },
                            "pri": {
                                "type": "integer",
                                "description": "优先级",
                                "format": "int32"
                            },
                            "estimate": {
                                "type": "number",
                                "description": "预计工时",
                                "format": "float"
                            },
                            "module": {
                                "type": "integer",
                                "description": "所属模块",
                                "format": "int32"
                            },
                            "story": {
                                "type": "integer",
                                "description": "相关需求",
                                "format": "int32"
                            },
                            "desc": {
                                "type": "string",
                                "description": "任务描述"
                            }
                        },
                        "required": [
                            "name",
                            "executionID"
                        ]
                    },
                },
            }, {
                name: 'get',
                display: '获取任务详情',
                type: 'get',
                method: 'get',
                path: '/tasks/{taskID}',
                resultType: 'object',
                pathParams: {
                    taskID: '任务ID',
                },
                resultGetter: 'task',
            }, {
                name: 'update',
                display: '修改任务',
                type: 'update',
                method: 'put',
                path: '/tasks/{taskID}',
                resultType: 'object',
                pathParams: {
                    taskID: '任务ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "任务名称"
                            },
                            "type": {
                                "type": "string",
                                "description": "任务类型"
                            },
                            "assignedTo": {
                                "type": "string",
                                "description": "指派给"
                            },
                            "estStarted": {
                                "type": "string",
                                "description": "预计开始"
                            },
                            "deadline": {
                                "type": "string",
                                "description": "截止日期"
                            },
                            "pri": {
                                "type": "integer",
                                "description": "优先级",
                                "format": "int32"
                            },
                            "estimate": {
                                "type": "number",
                                "description": "预计工时",
                                "format": "float"
                            },
                            "module": {
                                "type": "integer",
                                "description": "所属模块",
                                "format": "int32"
                            },
                            "story": {
                                "type": "integer",
                                "description": "相关需求",
                                "format": "int32"
                            },
                            "desc": {
                                "type": "string",
                                "description": "任务描述"
                            }
                        }
                    },
                },
            }, {
                name: 'updateModule',
                display: '修改任务模块',
                type: 'update',
                method: 'put',
                path: '/task/modules/{moduleID}',
                resultType: 'object',
                pathParams: {
                    moduleID: '模块ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "模块名称"
                            },
                            "parent": {
                                "type": "integer",
                                "description": "父模块",
                                "format": "int32"
                            }
                        }
                    },
                },
            }, {
                name: 'delete',
                display: '删除任务',
                type: 'delete',
                method: 'delete',
                path: '/tasks/{taskID}',
                resultType: 'text',
                pathParams: {
                    taskID: '任务ID',
                },
            }, {
                name: 'deleteModule',
                display: '删除任务模块',
                type: 'delete',
                method: 'delete',
                path: '/task/modules/{moduleID}',
                resultType: 'text',
                pathParams: {
                    moduleID: '模块ID',
                },
            }, {
                name: 'activate',
                display: '激活任务',
                type: 'action',
                method: 'put',
                path: '/tasks/{taskID}/activate',
                resultType: 'text',
                pathParams: {
                    taskID: '任务ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "left": {
                                "type": "number",
                                "description": "预计剩余",
                                "format": "float"
                            },
                            "assignedTo": {
                                "type": "string",
                                "description": "指派给"
                            },
                            "comment": {
                                "type": "string",
                                "description": "备注"
                            }
                        }
                    },
                },
            }, {
                name: 'close',
                display: '关闭任务',
                type: 'action',
                method: 'put',
                path: '/tasks/{taskID}/close',
                resultType: 'text',
                pathParams: {
                    taskID: '任务ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "comment": {
                                "type": "string",
                                "description": "备注"
                            }
                        }
                    },
                },
            }, {
                name: 'finish',
                display: '完成任务',
                type: 'action',
                method: 'put',
                path: '/tasks/{taskID}/finish',
                resultType: 'text',
                pathParams: {
                    taskID: '任务ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "currentConsumed": {
                                "type": "number",
                                "description": "本次消耗",
                                "format": "float"
                            },
                            "assignedTo": {
                                "type": "string",
                                "description": "指派给"
                            },
                            "consumed": {
                                "type": "number",
                                "description": "总计消耗",
                                "format": "float"
                            },
                            "realStarted": {
                                "type": "string",
                                "description": "实际开始，精确到秒"
                            },
                            "finishedDate": {
                                "type": "string",
                                "description": "实际完成，精确到秒"
                            },
                            "comment": {
                                "type": "string",
                                "description": "备注"
                            }
                        },
                        "required": [
                            "currentConsumed",
                            "realStarted",
                            "finishedDate"
                        ]
                    },
                },
            }, {
                name: 'start',
                display: '启动任务',
                type: 'action',
                method: 'put',
                path: '/tasks/{taskID}/start',
                resultType: 'text',
                pathParams: {
                    taskID: '任务ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "assignedTo": {
                                "type": "string",
                                "description": "任务名称"
                            },
                            "realStarted": {
                                "type": "string",
                                "description": "实际开始，精确到秒"
                            },
                            "consumed": {
                                "type": "number",
                                "description": "总计消耗",
                                "format": "float"
                            },
                            "left": {
                                "type": "number",
                                "description": "预计剩余",
                                "format": "float"
                            },
                            "comment": {
                                "type": "string",
                                "description": "备注"
                            }
                        },
                        "required": [
                            "realStarted"
                        ]
                    },
                },
            }
        ],
    },

    /* 问题模块 */
    {
        name: 'issue',
        display: '问题',
        description: '问题管理，支持获取问题列表、获取项目问题列表、获取执行问题列表、创建问题、获取问题详情',
        actions: [
            {
                name: 'list',
                display: '获取问题列表',
                type: 'list',
                method: 'get',
                path: '/issues',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'issues',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是all',
                        defaultValue: 'all',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'open', label: '开放' },
                            { value: 'assignto', label: '指派给我' },
                            { value: 'assignby', label: '由我指派' },
                            { value: 'closed', label: '已关闭' },
                            { value: 'resolved', label: '已解决' },
                            { value: 'canceled', label: '已取消' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'title_asc', label: '标题 升序' },
                            { value: 'title_desc', label: '标题 降序' },
                            { value: 'severity_asc', label: '严重程度 升序' },
                            { value: 'severity_desc', label: '严重程度 降序' },
                            { value: 'status_asc', label: '状态 升序' },
                            { value: 'status_desc', label: '状态 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：assignedDate,assignedTo,closedBy,closedDate,createdBy,createdDate,editedBy,editedDate,execution,id,pri,project,severity,status,title,type',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
            }, {
                name: 'projectIssues',
                display: '获取项目问题列表',
                type: 'list',
                method: 'get',
                path: '/projects/{projectID}/issues',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'issues',
                pathParams: {
                    projectID: '项目ID',
                },
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是all',
                        defaultValue: 'all',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'open', label: '开放' },
                            { value: 'assignto', label: '指派给我' },
                            { value: 'assignby', label: '由我指派' },
                            { value: 'closed', label: '已关闭' },
                            { value: 'resolved', label: '已解决' },
                            { value: 'canceled', label: '已取消' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'title_asc', label: '标题 升序' },
                            { value: 'title_desc', label: '标题 降序' },
                            { value: 'severity_asc', label: '严重程度 升序' },
                            { value: 'severity_desc', label: '严重程度 降序' },
                            { value: 'status_asc', label: '状态 升序' },
                            { value: 'status_desc', label: '状态 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：assignedDate,assignedTo,closedBy,closedDate,createdBy,createdDate,editedBy,editedDate,execution,id,pri,project,severity,status,title,type',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
            }, {
                name: 'executionIssues',
                display: '获取执行问题列表',
                type: 'list',
                method: 'get',
                path: '/executions/{executionID}/issues',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'issues',
                pathParams: {
                    executionID: '执行ID',
                },
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是all',
                        defaultValue: 'all',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'open', label: '开放' },
                            { value: 'assignto', label: '指派给我' },
                            { value: 'assignby', label: '由我指派' },
                            { value: 'closed', label: '已关闭' },
                            { value: 'resolved', label: '已解决' },
                            { value: 'canceled', label: '已取消' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'title_asc', label: '标题 升序' },
                            { value: 'title_desc', label: '标题 降序' },
                            { value: 'severity_asc', label: '严重程度 升序' },
                            { value: 'severity_desc', label: '严重程度 降序' },
                            { value: 'status_asc', label: '状态 升序' },
                            { value: 'status_desc', label: '状态 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：assignedDate,assignedTo,closedBy,closedDate,createdBy,createdDate,editedBy,editedDate,execution,id,pri,project,severity,status,title,type',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
            }, {
                name: 'create',
                display: '创建问题',
                type: 'create',
                method: 'post',
                path: '/issues',
                resultType: 'object',
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "objectID": {
                                "type": "integer",
                                "description": "所属项目",
                                "format": "int32"
                            },
                            "from": {
                                "type": "integer",
                                "description": "来源，0 表示直接创建",
                                "format": "int32"
                            },
                            "title": {
                                "type": "string",
                                "description": "问题名称"
                            },
                            "type": {
                                "type": "string",
                                "description": "类型(design 设计问题 | code 程序缺陷 | performance 性能问题 | version 版本控制 | storyadd 需求新增 | storychanged 需求修改 | storyremoved 需求删除 | data 数据问题)"
                            },
                            "severity": {
                                "type": "integer",
                                "description": "严重程度(1 严重 | 2 较严重 | 3 较小 | 4 建议)",
                                "format": "int32"
                            },
                            "pri": {
                                "type": "integer",
                                "description": "优先级(1-4)",
                                "format": "int32"
                            },
                            "execution": {
                                "type": "integer",
                                "description": "所属执行",
                                "format": "int32"
                            },
                            "assignedTo": {
                                "type": "string",
                                "description": "指派给"
                            },
                            "owner": {
                                "type": "string",
                                "description": "提出人"
                            },
                            "deadline": {
                                "type": "string",
                                "description": "计划解决日期"
                            },
                            "desc": {
                                "type": "string",
                                "description": "描述"
                            }
                        },
                        "required": [
                            "objectID",
                            "title",
                            "type",
                            "severity"
                        ]
                    },
                },
            }, {
                name: 'get',
                display: '获取问题详情',
                type: 'get',
                method: 'get',
                path: '/issues/{issueID}',
                resultType: 'object',
                resultGetter: 'issue',
                pathParams: {
                    issueID: '问题ID',
                },
            }
        ],
    },

    /* 风险模块 */
    {
        name: 'risk',
        display: '风险',
        description: '风险管理，支持获取风险列表、获取项目风险列表、获取执行风险列表、创建风险、获取风险详情、修改风险',
        actions: [
            {
                name: 'list',
                display: '获取风险列表',
                type: 'list',
                method: 'get',
                path: '/risks',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'risks',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是all',
                        defaultValue: 'all',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'active', label: '开放' },
                            { value: 'assignTo', label: '指派给我' },
                            { value: 'assignBy', label: '由我指派' },
                            { value: 'closed', label: '已关闭' },
                            { value: 'hangup', label: '已挂起' },
                            { value: 'canceled', label: '已取消' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'name_asc', label: '名称 升序' },
                            { value: 'name_desc', label: '名称 降序' },
                            { value: 'status_asc', label: '状态 升序' },
                            { value: 'status_desc', label: '状态 降序' },
                            { value: 'pri_asc', label: '优先级 升序' },
                            { value: 'pri_desc', label: '优先级 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activateBy,actualClosedDate,assignedTo,cancelBy,category,createdBy,createdDate,editedBy,editedDate,hangupBy,id,identifiedDate,impact,name,plannedClosedDate,prevention,pri,probability,project,rate,remedy,resolution,resolvedBy,source,status,strategy,trackedBy',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
            }, {
                name: 'projectRisks',
                display: '获取项目风险列表',
                type: 'list',
                method: 'get',
                path: '/projects/{projectID}/risks',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'risks',
                pathParams: {
                    projectID: '项目ID',
                },
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是all',
                        defaultValue: 'all',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'active', label: '开放' },
                            { value: 'assignTo', label: '指派给我' },
                            { value: 'assignBy', label: '由我指派' },
                            { value: 'closed', label: '已关闭' },
                            { value: 'hangup', label: '已挂起' },
                            { value: 'canceled', label: '已取消' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'name_asc', label: '名称 升序' },
                            { value: 'name_desc', label: '名称 降序' },
                            { value: 'status_asc', label: '状态 升序' },
                            { value: 'status_desc', label: '状态 降序' },
                            { value: 'pri_asc', label: '优先级 升序' },
                            { value: 'pri_desc', label: '优先级 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activateBy,actualClosedDate,assignedTo,cancelBy,category,createdBy,createdDate,editedBy,editedDate,hangupBy,id,identifiedDate,impact,name,plannedClosedDate,prevention,pri,probability,project,rate,remedy,resolution,resolvedBy,source,status,strategy,trackedBy',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
            }, {
                name: 'executionRisks',
                display: '获取执行风险列表',
                type: 'list',
                method: 'get',
                path: '/executions/{executionID}/risks',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'risks',
                pathParams: {
                    executionID: '执行ID',
                },
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是all',
                        defaultValue: 'all',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'active', label: '开放' },
                            { value: 'assignTo', label: '指派给我' },
                            { value: 'assignBy', label: '由我指派' },
                            { value: 'closed', label: '已关闭' },
                            { value: 'hangup', label: '已挂起' },
                            { value: 'canceled', label: '已取消' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'name_asc', label: '名称 升序' },
                            { value: 'name_desc', label: '名称 降序' },
                            { value: 'status_asc', label: '状态 升序' },
                            { value: 'status_desc', label: '状态 降序' },
                            { value: 'pri_asc', label: '优先级 升序' },
                            { value: 'pri_desc', label: '优先级 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activateBy,actualClosedDate,assignedTo,cancelBy,category,createdBy,createdDate,editedBy,editedDate,hangupBy,id,identifiedDate,impact,name,plannedClosedDate,prevention,pri,probability,project,rate,remedy,resolution,resolvedBy,source,status,strategy,trackedBy',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
            }, {
                name: 'create',
                display: '创建风险',
                type: 'create',
                method: 'post',
                path: '/risks',
                resultType: 'object',
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "project": {
                                "type": "integer",
                                "description": "所属项目",
                                "format": "int32"
                            },
                            "name": {
                                "type": "string",
                                "description": "风险名称"
                            },
                            "execution": {
                                "type": "integer",
                                "description": "所属执行",
                                "format": "int32"
                            },
                            "source": {
                                "type": "string",
                                "description": "来源(business 业务部门 | team 项目组 | logistic 项目保障科室 | manage 管理层 | sourcing 供应商-采购 | outsourcing 供应商-外包 | customer 外部客户 | others 其他)"
                            },
                            "category": {
                                "type": "string",
                                "description": "类型(technical 技术类 | manage 管理类 | business 业务类 | requirement 需求类 | resource 资源类 | others 其他)"
                            },
                            "strategy": {
                                "type": "string",
                                "description": "策略(avoidance 规避 | mitigation 缓解 | transference 转移 | acceptance 接受)"
                            },
                            "impact": {
                                "type": "integer",
                                "description": "影响程度(1-5)",
                                "format": "int32"
                            },
                            "probability": {
                                "type": "integer",
                                "description": "发生概率(1-5)",
                                "format": "int32"
                            },
                            "rate": {
                                "type": "integer",
                                "description": "风险系数",
                                "format": "int32"
                            },
                            "pri": {
                                "type": "integer",
                                "description": "优先级(1 高 | 2 中 | 3 低)",
                                "format": "int32"
                            },
                            "identifiedDate": {
                                "type": "string",
                                "description": "识别日期"
                            },
                            "plannedClosedDate": {
                                "type": "string",
                                "description": "计划关闭日期"
                            },
                            "assignedTo": {
                                "type": "string",
                                "description": "指派给"
                            },
                            "prevention": {
                                "type": "string",
                                "description": "应对措施"
                            },
                            "remedy": {
                                "type": "string",
                                "description": "响应措施"
                            }
                        },
                        "required": [
                            "project",
                            "name",
                            "impact",
                            "probability",
                            "pri"
                        ]
                    },
                },
            }, {
                name: 'get',
                display: '获取风险详情',
                type: 'get',
                method: 'get',
                path: '/risks/{riskID}',
                resultType: 'object',
                resultGetter: 'risk',
                pathParams: {
                    riskID: '风险ID',
                },
            }, {
                name: 'update',
                display: '修改风险',
                type: 'update',
                method: 'put',
                path: '/risks/{riskID}',
                resultType: 'object',
                pathParams: {
                    riskID: '风险ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "风险名称"
                            },
                            "source": {
                                "type": "string",
                                "description": "来源(business 业务部门 | team 项目组 | logistic 项目保障科室 | manage 管理层 | sourcing 供应商-采购 | outsourcing 供应商-外包 | customer 外部客户 | others 其他)"
                            },
                            "category": {
                                "type": "string",
                                "description": "类型(technical 技术类 | manage 管理类 | business 业务类 | requirement 需求类 | resource 资源类 | others 其他)"
                            },
                            "strategy": {
                                "type": "string",
                                "description": "策略(avoidance 规避 | mitigation 缓解 | transference 转移 | acceptance 接受)"
                            },
                            "impact": {
                                "type": "integer",
                                "description": "影响程度(1-5)",
                                "format": "int32"
                            },
                            "probability": {
                                "type": "integer",
                                "description": "发生概率(1-5)",
                                "format": "int32"
                            },
                            "rate": {
                                "type": "integer",
                                "description": "风险系数",
                                "format": "int32"
                            },
                            "pri": {
                                "type": "integer",
                                "description": "优先级(1 高 | 2 中 | 3 低)",
                                "format": "int32"
                            },
                            "identifiedDate": {
                                "type": "string",
                                "description": "识别日期"
                            },
                            "plannedClosedDate": {
                                "type": "string",
                                "description": "计划关闭日期"
                            },
                            "assignedTo": {
                                "type": "string",
                                "description": "指派给"
                            },
                            "prevention": {
                                "type": "string",
                                "description": "应对措施"
                            },
                            "remedy": {
                                "type": "string",
                                "description": "响应措施"
                            },
                            "resolution": {
                                "type": "string",
                                "description": "解决措施"
                            }
                        },
                        "required": [
                            "name"
                        ]
                    },
                },
            }
        ],
    },

    /* 会议模块 */
    {
        name: 'meeting',
        display: '会议',
        description: '会议管理，支持获取会议列表、获取项目会议列表、获取执行会议列表、创建会议、获取会议详情、修改会议、删除会议、编辑会议纪要',
        actions: [
            {
                name: 'list',
                display: '获取会议列表',
                type: 'list',
                method: 'get',
                path: '/meetings',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'meetings',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是all',
                        defaultValue: 'all',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'booked', label: '我预约的' },
                            { value: 'participate', label: '我参加的' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'name_asc', label: '名称 升序' },
                            { value: 'name_desc', label: '名称 降序' },
                            { value: 'date_asc', label: '日期 升序' },
                            { value: 'date_desc', label: '日期 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：begin,createdBy,createdDate,date,dept,editedBy,editedDate,end,execution,host,id,minutedBy,minutedDate,mode,name,project,room',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
            }, {
                name: 'projectMeetings',
                display: '获取项目会议列表',
                type: 'list',
                method: 'get',
                path: '/projects/{projectID}/meetings',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'meetings',
                pathParams: {
                    projectID: '项目ID',
                },
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是all',
                        defaultValue: 'all',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'booked', label: '我预约的' },
                            { value: 'participate', label: '我参加的' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'name_asc', label: '名称 升序' },
                            { value: 'name_desc', label: '名称 降序' },
                            { value: 'date_asc', label: '日期 升序' },
                            { value: 'date_desc', label: '日期 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：begin,createdBy,createdDate,date,dept,editedBy,editedDate,end,execution,host,id,minutedBy,minutedDate,mode,name,project,room',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
            }, {
                name: 'executionMeetings',
                display: '获取执行会议列表',
                type: 'list',
                method: 'get',
                path: '/executions/{executionID}/meetings',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'meetings',
                pathParams: {
                    executionID: '执行ID',
                },
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是all',
                        defaultValue: 'all',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'booked', label: '我预约的' },
                            { value: 'participate', label: '我参加的' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'name_asc', label: '名称 升序' },
                            { value: 'name_desc', label: '名称 降序' },
                            { value: 'date_asc', label: '日期 升序' },
                            { value: 'date_desc', label: '日期 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：begin,createdBy,createdDate,date,dept,editedBy,editedDate,end,execution,host,id,minutedBy,minutedDate,mode,name,project,room',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
            }, {
                name: 'create',
                display: '创建会议',
                type: 'create',
                method: 'post',
                path: '/meetings',
                resultType: 'object',
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "project": {
                                "type": "integer",
                                "description": "所属项目",
                                "format": "int32"
                            },
                            "execution": {
                                "type": "integer",
                                "description": "所属执行",
                                "format": "int32"
                            },
                            "name": {
                                "type": "string",
                                "description": "会议名称"
                            },
                            "begin": {
                                "type": "string",
                                "description": "开始时间"
                            },
                            "end": {
                                "type": "string",
                                "description": "结束时间"
                            },
                            "mode": {
                                "type": "string",
                                "description": "会议模式(online 线上 | outline 线下 | both 线上+线下)"
                            },
                            "host": {
                                "type": "string",
                                "description": "主持人"
                            },
                            "participant": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "参会人员"
                            },
                            "room": {
                                "type": "integer",
                                "description": "会议室",
                                "format": "int32"
                            },
                            "dept": {
                                "type": "integer",
                                "description": "所属部门",
                                "format": "int32"
                            },
                            "objectType": {
                                "type": "string",
                                "description": "关联类型(story | task | bug | issue | risk | opportunity)"
                            },
                            "objectID": {
                                "type": "integer",
                                "description": "关联对象",
                                "format": "int32"
                            }
                        },
                        "required": [
                            "project",
                            "name",
                            "begin",
                            "end",
                            "mode",
                            "host",
                            "participant"
                        ]
                    },
                },
            }, {
                name: 'get',
                display: '获取会议详情',
                type: 'get',
                method: 'get',
                path: '/meetings/{meetingID}',
                resultType: 'object',
                resultGetter: 'meeting',
                pathParams: {
                    meetingID: '会议ID',
                },
            }, {
                name: 'update',
                display: '修改会议',
                type: 'update',
                method: 'put',
                path: '/meetings/{meetingID}',
                resultType: 'object',
                pathParams: {
                    meetingID: '会议ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "会议名称"
                            },
                            "begin": {
                                "type": "string",
                                "description": "开始时间"
                            },
                            "end": {
                                "type": "string",
                                "description": "结束时间"
                            },
                            "mode": {
                                "type": "string",
                                "description": "会议模式(online 线上 | outline 线下 | both 线上+线下)"
                            },
                            "host": {
                                "type": "string",
                                "description": "主持人"
                            },
                            "participant": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "参会人员"
                            },
                            "room": {
                                "type": "integer",
                                "description": "会议室",
                                "format": "int32"
                            },
                            "dept": {
                                "type": "integer",
                                "description": "所属部门",
                                "format": "int32"
                            },
                            "objectType": {
                                "type": "string",
                                "description": "关联类型(story | task | bug | issue | risk | opportunity)"
                            },
                            "objectID": {
                                "type": "integer",
                                "description": "关联对象",
                                "format": "int32"
                            }
                        },
                        "required": [
                            "name",
                            "begin",
                            "end",
                            "mode",
                            "host",
                            "participant"
                        ]
                    },
                },
            }, {
                name: 'delete',
                display: '删除会议',
                type: 'delete',
                method: 'delete',
                path: '/meetings/{meetingID}',
                resultType: 'text',
                pathParams: {
                    meetingID: '会议ID',
                },
            }, {
                name: 'minutes',
                display: '编辑会议纪要',
                type: 'action',
                method: 'put',
                path: '/meetings/{meetingID}/minutes',
                resultType: 'text',
                pathParams: {
                    meetingID: '会议ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "minutes": {
                                "type": "string",
                                "description": "会议纪要"
                            }
                        }
                    },
                },
            }
        ],
    },

    /* 反馈模块 */
    {
        name: 'feedback',
        display: '反馈',
        description: '反馈管理，支持获取反馈列表，支持获取产品下的反馈、创建反馈、反馈转Bug、反馈转工单、反馈转待办、反馈转需求、反馈转任务、获取反馈详情、修改反馈、删除反馈、激活反馈、关闭反馈',
        actions: [
            {
                name: 'list',
                display: '获取反馈列表，支持获取产品下的反馈',
                type: 'list',
                method: 'get',
                path: '/products/{productID}/feedbacks',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'feedbacks',
                pathParams: {
                    productID: '所属产品ID',
                },
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是wait',
                        defaultValue: 'wait',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'wait', label: '待处理' },
                            { value: 'doing', label: '处理中' },
                            { value: 'toclosed', label: '待关闭' },
                            { value: 'review', label: '待评审' },
                            { value: 'assigntome', label: '指派给我' },
                            { value: 'openedbyme', label: '由我反馈' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'title_asc', label: '标题 升序' },
                            { value: 'title_desc', label: '标题 降序' },
                            { value: 'status_asc', label: '状态 升序' },
                            { value: 'status_desc', label: '状态 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activatedBy,activatedDate,assignedTo,closedBy,closedDate,closedReason,desc,feedbackBy,id,keywords,mailto,module,notifyEmail,openedBy,openedDate,pri,processedBy,processedDate,product,public,reviewedBy,solution,source,status,title,type',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
            }, {
                name: 'create',
                display: '创建反馈',
                type: 'create',
                method: 'post',
                path: '/feedbacks',
                resultType: 'object',
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "product": {
                                "type": "integer",
                                "description": "所属产品",
                                "format": "int32"
                            },
                            "title": {
                                "type": "string",
                                "description": "标题"
                            },
                            "module": {
                                "type": "integer",
                                "description": "所属模块",
                                "format": "int32"
                            },
                            "type": {
                                "type": "string",
                                "description": "类型(story 需求 | task 任务 | bug Bug | todo 待办 | advice 建议 | issue 问题 | risk 风险 | opportunity 机会)"
                            },
                            "desc": {
                                "type": "string",
                                "description": "描述"
                            },
                            "feedbackBy": {
                                "type": "string",
                                "description": "反馈者"
                            },
                            "source": {
                                "type": "string",
                                "description": "来源"
                            }
                        },
                        "required": [
                            "product",
                            "title"
                        ]
                    },
                },
            }, {
                name: 'createBug',
                display: '反馈转Bug',
                type: 'create',
                method: 'post',
                path: '/feedbacks/{feedbackID}/bugs',
                resultType: 'object',
                pathParams: {
                    feedbackID: '反馈ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "productID": {
                                "type": "integer",
                                "description": "所属产品",
                                "format": "int32"
                            },
                            "title": {
                                "type": "string",
                                "description": "Bug标题"
                            },
                            "openedBuild": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "影响版本，主干是trunk，其他版本使用版本ID"
                            },
                            "severity": {
                                "type": "integer",
                                "description": "严重程度(1-4)",
                                "format": "int32"
                            },
                            "pri": {
                                "type": "integer",
                                "description": "优先级",
                                "format": "int32"
                            },
                            "type": {
                                "type": "string",
                                "description": "Bug类型(codeerror 代码错误 | config 配置相关 | install 安装部署 | security 安全相关 | performance 性能问题 | standard 标准规范 | automation 测试脚本 | designdefect 设计缺陷 | others 其他)"
                            },
                            "steps": {
                                "type": "string",
                                "description": "重现步骤"
                            }
                        },
                        "required": [
                            "productID",
                            "title",
                            "openedBuild"
                        ]
                    },
                },
            }, {
                name: 'createTicket',
                display: '反馈转工单',
                type: 'create',
                method: 'post',
                path: '/feedbacks/{feedbackID}/tickets',
                resultType: 'object',
                pathParams: {
                    feedbackID: '反馈ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "product": {
                                "type": "integer",
                                "description": "所属产品",
                                "format": "int32"
                            },
                            "module": {
                                "type": "integer",
                                "description": "所属模块",
                                "format": "int32"
                            },
                            "title": {
                                "type": "string",
                                "description": "工单标题"
                            },
                            "type": {
                                "type": "string",
                                "description": "类型(code 程序报错 | data 数据错误 | stuck 流程卡断 | security 安全问题 | affair 事务)"
                            },
                            "desc": {
                                "type": "string",
                                "description": "工单描述"
                            }
                        },
                        "required": [
                            "product",
                            "module",
                            "title"
                        ]
                    },
                },
            }, {
                name: 'createTodo',
                display: '反馈转待办',
                type: 'create',
                method: 'post',
                path: '/feedbacks/{feedbackID}/todos',
                resultType: 'object',
                pathParams: {
                    feedbackID: '反馈ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "date": {
                                "type": "string",
                                "description": "日期"
                            },
                            "name": {
                                "type": "string",
                                "description": "待办名称"
                            }
                        },
                        "required": [
                            "date",
                            "name"
                        ]
                    },
                },
            }, {
                name: 'createStory',
                display: '反馈转需求',
                type: 'create',
                method: 'post',
                path: '/feedbacks/{feedbackID}/stories',
                resultType: 'object',
                pathParams: {
                    feedbackID: '反馈ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "productID": {
                                "type": "integer",
                                "description": "所属产品",
                                "format": "int32"
                            },
                            "title": {
                                "type": "string",
                                "description": "需求标题"
                            },
                            "spec": {
                                "type": "string",
                                "description": "需求描述"
                            },
                            "pri": {
                                "type": "integer",
                                "description": "优先级",
                                "format": "int32"
                            },
                            "category": {
                                "type": "string",
                                "description": "类别"
                            }
                        },
                        "required": [
                            "productID",
                            "title"
                        ]
                    },
                },
            }, {
                name: 'createTask',
                display: '反馈转任务',
                type: 'create',
                method: 'post',
                path: '/feedbacks/{feedbackID}/tasks',
                resultType: 'object',
                pathParams: {
                    feedbackID: '反馈ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "executionID": {
                                "type": "integer",
                                "description": "所属执行",
                                "format": "int32"
                            },
                            "name": {
                                "type": "string",
                                "description": "任务名称"
                            },
                            "type": {
                                "type": "string",
                                "description": "任务类型"
                            },
                            "assignedTo": {
                                "type": "string",
                                "description": "指派给"
                            },
                            "estStarted": {
                                "type": "string",
                                "description": "预计开始"
                            },
                            "deadline": {
                                "type": "string",
                                "description": "截止日期"
                            },
                            "desc": {
                                "type": "string",
                                "description": "任务描述"
                            }
                        },
                        "required": [
                            "executionID",
                            "name"
                        ]
                    },
                },
            }, {
                name: 'get',
                display: '获取反馈详情',
                type: 'get',
                method: 'get',
                path: '/feedbacks/{feedbackID}',
                resultType: 'object',
                resultGetter: 'feedback',
                pathParams: {
                    feedbackID: '反馈ID',
                },
            }, {
                name: 'update',
                display: '修改反馈',
                type: 'update',
                method: 'put',
                path: '/feedbacks/{feedbackID}',
                resultType: 'object',
                pathParams: {
                    feedbackID: '反馈ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "product": {
                                "type": "integer",
                                "description": "所属产品",
                                "format": "int32"
                            },
                            "module": {
                                "type": "integer",
                                "description": "所属模块",
                                "format": "int32"
                            },
                            "title": {
                                "type": "string",
                                "description": "标题"
                            },
                            "type": {
                                "type": "string",
                                "description": "类型(story 需求 | task 任务 | bug Bug | todo 待办 | advice 建议 | issue 问题 | risk 风险 | opportunity 机会)"
                            },
                            "desc": {
                                "type": "string",
                                "description": "描述"
                            },
                            "feedbackBy": {
                                "type": "string",
                                "description": "反馈者"
                            },
                            "source": {
                                "type": "string",
                                "description": "来源"
                            }
                        },
                        "required": [
                            "product",
                            "title"
                        ]
                    },
                },
            }, {
                name: 'delete',
                display: '删除反馈',
                type: 'delete',
                method: 'delete',
                path: '/feedbacks/{feedbackID}',
                resultType: 'text',
                pathParams: {
                    feedbackID: '反馈ID',
                },
            }, {
                name: 'activate',
                display: '激活反馈',
                type: 'action',
                method: 'put',
                path: '/feedbacks/{feedbackID}/activate',
                resultType: 'text',
                pathParams: {
                    feedbackID: '反馈ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "assignedTo": {
                                "type": "string",
                                "description": "指派给"
                            },
                            "comment": {
                                "type": "string",
                                "description": "备注"
                            }
                        }
                    },
                },
            }, {
                name: 'close',
                display: '关闭反馈',
                type: 'action',
                method: 'put',
                path: '/feedbacks/{feedbackID}/close',
                resultType: 'text',
                pathParams: {
                    feedbackID: '反馈ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "closedReason": {
                                "type": "string",
                                "description": "关闭原因(commented 已处理 | repeat 重复 | refuse 不予采纳)"
                            },
                            "comment": {
                                "type": "string",
                                "description": "备注"
                            },
                            "confirmClose": {
                                "type": "string",
                                "description": "存在未关闭转化对象时是否强制关闭"
                            }
                        },
                        "required": [
                            "closedReason"
                        ]
                    },
                },
            }
        ],
    },

    /* 工单模块 */
    {
        name: 'ticket',
        display: '工单',
        description: '工单管理，支持获取工单列表，支持获取产品下的工单、创建工单、工单转需求、工单转Bug、获取工单详情、修改工单、删除工单、激活工单、关闭工单',
        actions: [
            {
                name: 'list',
                display: '获取工单列表，支持获取产品下的工单',
                type: 'list',
                method: 'get',
                path: '/products/{productID}/tickets',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'tickets',
                pathParams: {
                    productID: '所属产品ID',
                },
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是wait',
                        defaultValue: 'wait',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'unclosed', label: '未关闭' },
                            { value: 'wait', label: '待处理' },
                            { value: 'doing', label: '处理中' },
                            { value: 'done', label: '待关闭' },
                            { value: 'finishedbyme', label: '由我解决' },
                            { value: 'assigntome', label: '指派给我' },
                            { value: 'openedbyme', label: '由我创建' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'title_asc', label: '标题 升序' },
                            { value: 'title_desc', label: '标题 降序' },
                            { value: 'status_asc', label: '状态 升序' },
                            { value: 'status_desc', label: '状态 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activatedBy,activatedCount,activatedDate,assignedTo,closedBy,closedDate,closedReason,contact,customer,deadline,desc,editedBy,editedDate,feedback,id,keywords,mailto,module,notifyEmail,openedBuild,openedBy,openedDate,pri,product,resolution,resolvedBy,resolvedDate,startedBy,startedDate,status,title,type',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
            }, {
                name: 'create',
                display: '创建工单',
                type: 'create',
                method: 'post',
                path: '/tickets',
                resultType: 'object',
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "product": {
                                "type": "integer",
                                "description": "所属产品",
                                "format": "int32"
                            },
                            "module": {
                                "type": "integer",
                                "description": "所属模块",
                                "format": "int32"
                            },
                            "title": {
                                "type": "string",
                                "description": "标题"
                            },
                            "type": {
                                "type": "string",
                                "description": "类型(code 程序报错 | data 数据错误 | stuck 流程卡断 | security 安全问题 | affair 事务)"
                            },
                            "desc": {
                                "type": "string",
                                "description": "描述"
                            },
                            "assignedTo": {
                                "type": "string",
                                "description": "指派给"
                            },
                            "deadline": {
                                "type": "string",
                                "description": "截止日期"
                            },
                            "openedBuild": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "影响版本"
                            }
                        },
                        "required": [
                            "product",
                            "title"
                        ]
                    },
                },
            }, {
                name: 'createStory',
                display: '工单转需求',
                type: 'create',
                method: 'post',
                path: '/tickets/{ticketID}/stories',
                resultType: 'object',
                pathParams: {
                    ticketID: '工单ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "productID": {
                                "type": "integer",
                                "description": "所属产品",
                                "format": "int32"
                            },
                            "title": {
                                "type": "string",
                                "description": "需求标题"
                            },
                            "spec": {
                                "type": "string",
                                "description": "需求描述"
                            },
                            "pri": {
                                "type": "integer",
                                "description": "优先级",
                                "format": "int32"
                            },
                            "category": {
                                "type": "string",
                                "description": "类别"
                            }
                        },
                        "required": [
                            "productID",
                            "title"
                        ]
                    },
                },
            }, {
                name: 'createBug',
                display: '工单转Bug',
                type: 'create',
                method: 'post',
                path: '/tickets/{ticketID}/bugs',
                resultType: 'object',
                pathParams: {
                    ticketID: '工单ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "productID": {
                                "type": "integer",
                                "description": "所属产品",
                                "format": "int32"
                            },
                            "title": {
                                "type": "string",
                                "description": "Bug标题"
                            },
                            "openedBuild": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "影响版本，主干是trunk，其他版本使用版本ID"
                            },
                            "severity": {
                                "type": "integer",
                                "description": "严重程度(1-4)",
                                "format": "int32"
                            },
                            "pri": {
                                "type": "integer",
                                "description": "优先级",
                                "format": "int32"
                            },
                            "type": {
                                "type": "string",
                                "description": "Bug类型(codeerror 代码错误 | config 配置相关 | install 安装部署 | security 安全相关 | performance 性能问题 | standard 标准规范 | automation 测试脚本 | designdefect 设计缺陷 | others 其他)"
                            },
                            "steps": {
                                "type": "string",
                                "description": "重现步骤"
                            }
                        },
                        "required": [
                            "productID",
                            "title",
                            "openedBuild"
                        ]
                    },
                },
            }, {
                name: 'get',
                display: '获取工单详情',
                type: 'get',
                method: 'get',
                path: '/tickets/{ticketID}',
                resultType: 'object',
                resultGetter: 'ticket',
                pathParams: {
                    ticketID: '工单ID',
                },
            }, {
                name: 'update',
                display: '修改工单',
                type: 'update',
                method: 'put',
                path: '/tickets/{ticketID}',
                resultType: 'object',
                pathParams: {
                    ticketID: '工单ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "product": {
                                "type": "integer",
                                "description": "所属产品",
                                "format": "int32"
                            },
                            "module": {
                                "type": "integer",
                                "description": "所属模块",
                                "format": "int32"
                            },
                            "title": {
                                "type": "string",
                                "description": "标题"
                            },
                            "type": {
                                "type": "string",
                                "description": "类型(code 程序报错 | data 数据错误 | stuck 流程卡断 | security 安全问题 | affair 事务)"
                            },
                            "desc": {
                                "type": "string",
                                "description": "描述"
                            },
                            "assignedTo": {
                                "type": "string",
                                "description": "指派给"
                            },
                            "deadline": {
                                "type": "string",
                                "description": "截止日期"
                            },
                            "openedBuild": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "影响版本"
                            }
                        }
                    },
                },
            }, {
                name: 'delete',
                display: '删除工单',
                type: 'delete',
                method: 'delete',
                path: '/tickets/{ticketID}',
                resultType: 'text',
                pathParams: {
                    ticketID: '工单ID',
                },
            }, {
                name: 'activate',
                display: '激活工单',
                type: 'action',
                method: 'put',
                path: '/tickets/{ticketID}/activate',
                resultType: 'text',
                pathParams: {
                    ticketID: '工单ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "assignedTo": {
                                "type": "string",
                                "description": "指派给"
                            },
                            "comment": {
                                "type": "string",
                                "description": "备注"
                            }
                        }
                    },
                },
            }, {
                name: 'close',
                display: '关闭工单',
                type: 'action',
                method: 'put',
                path: '/tickets/{ticketID}/close',
                resultType: 'text',
                pathParams: {
                    ticketID: '工单ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "closedReason": {
                                "type": "string",
                                "description": "关闭原因(commented 已处理 | repeat 重复 | refuse 不予处理)"
                            },
                            "comment": {
                                "type": "string",
                                "description": "备注"
                            }
                        },
                        "required": [
                            "closedReason",
                            "comment"
                        ]
                    },
                },
            }
        ],
    },

    /* 应用模块 */
    {
        name: 'system',
        display: '应用',
        description: '应用管理，支持获取应用列表，支持获取产品下的应用、创建应用、修改应用',
        actions: [
            {
                name: 'list',
                display: '获取应用列表，支持获取产品下的应用',
                type: 'list',
                method: 'get',
                path: '/products/{productID}/systems',
                resultType: 'list',
                pagerGetter: 'pager',
                pathParams: {
                    productID: '所属产品ID',
                },
                params: [
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'name_asc', label: '名称 升序' },
                            { value: 'name_desc', label: '名称 降序' },
                            { value: 'status_asc', label: '状态 升序' },
                            { value: 'status_desc', label: '状态 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                ],
                resultGetter: 'systems',
            }, {
                name: 'create',
                display: '创建应用',
                type: 'create',
                method: 'post',
                path: '/systems',
                resultType: 'object',
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "productID": {
                                "type": "integer",
                                "description": "所属产品",
                                "format": "int32"
                            },
                            "integrated": {
                                "type": "integer",
                                "description": "是否集成应用(0 否| 1 是)",
                                "format": "int32"
                            },
                            "children": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "集成应用需要包含其他应用，非集成应用传空数组[]"
                            },
                            "name": {
                                "type": "string",
                                "description": "应用名称"
                            },
                            "desc": {
                                "type": "string",
                                "description": "描述"
                            }
                        },
                        "required": [
                            "productID",
                            "integrated",
                            "children",
                            "name"
                        ]
                    },
                },
            }, {
                name: 'update',
                display: '修改应用',
                type: 'update',
                method: 'put',
                path: '/systems/{systemID}',
                resultType: 'object',
                pathParams: {
                    systemID: '应用ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "应用名称"
                            },
                            "children": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "集成应用需要包含其他应用，非集成应用传空数组[]"
                            },
                            "desc": {
                                "type": "string",
                                "description": "描述"
                            }
                        },
                        "required": [
                            "name",
                            "children"
                        ]
                    },
                },
            }
        ],
    },

    /* 版本模块 */
    {
        name: 'build',
        display: '版本',
        description: '版本管理，支持获取版本列表，支持获取项目/执行下的版本、创建版本/构建、修改版本、删除版本',
        actions: [
            {
                name: 'list',
                display: '获取版本列表，支持获取项目/执行下的版本',
                type: 'list',
                method: 'get',
                path: '/{scope}/{scopeID}/builds',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'builds',
                pathParams: {
                    scope: {description: '版本所属范围', options: [{value: 'projects', label: '项目'}, {value: 'executions', label: '执行'}]},
                    scopeID: '所属范围ID',
                },
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是all',
                        defaultValue: 'all',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'active', label: '有效' },
                            { value: 'closed', label: '已关闭' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'name_asc', label: '名称 升序' },
                            { value: 'name_desc', label: '名称 降序' },
                            { value: 'date_asc', label: '日期 升序' },
                            { value: 'date_desc', label: '日期 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：name(名称，示例：关键字)；system(所属应用，示例：all)；id(ID，示例：1)；product(所属产品，产品，示例：1)；scmPath(源代码地址，示例：关键字)；filePath(下载地址，示例：关键字)；date(打包日期，示例：2026-01-01)；builder(构建者，用户，示例：admin)；desc(描述，示例：关键字)',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
            }, {
                name: 'create',
                display: '创建版本/构建',
                type: 'create',
                method: 'post',
                path: '/builds',
                resultType: 'object',
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "executionID": {
                                "type": "integer",
                                "description": "所属执行/迭代",
                                "format": "int32"
                            },
                            "product": {
                                "type": "integer",
                                "description": "所属产品",
                                "format": "int32"
                            },
                            "name": {
                                "type": "string",
                                "description": "构建名称"
                            },
                            "system": {
                                "type": "integer",
                                "description": "所属应用",
                                "format": "int32"
                            },
                            "builder": {
                                "type": "string",
                                "description": "构建者"
                            },
                            "date": {
                                "type": "string",
                                "description": "打包日期"
                            },
                            "scmPath": {
                                "type": "string",
                                "description": "源代码地址"
                            },
                            "filePath": {
                                "type": "string",
                                "description": "下载地址"
                            },
                            "desc": {
                                "type": "string",
                                "description": "描述"
                            }
                        },
                        "required": [
                            "executionID",
                            "product",
                            "name",
                            "system",
                            "builder",
                            "date"
                        ]
                    },
                },
            }, {
                name: 'update',
                display: '修改版本',
                type: 'update',
                method: 'put',
                path: '/builds/{buildID}',
                resultType: 'object',
                pathParams: {
                    buildID: '版本ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "execution": {
                                "type": "integer",
                                "description": "所属执行/迭代",
                                "format": "int32"
                            },
                            "product": {
                                "type": "integer",
                                "description": "所属产品",
                                "format": "int32"
                            },
                            "name": {
                                "type": "string",
                                "description": "构建名称"
                            },
                            "system": {
                                "type": "integer",
                                "description": "所属应用",
                                "format": "int32"
                            },
                            "builder": {
                                "type": "string",
                                "description": "构建者"
                            },
                            "date": {
                                "type": "string",
                                "description": "打包日期"
                            },
                            "scmPath": {
                                "type": "string",
                                "description": "源代码地址"
                            },
                            "filePath": {
                                "type": "string",
                                "description": "下载地址"
                            },
                            "desc": {
                                "type": "string",
                                "description": "描述"
                            }
                        },
                        "required": [
                            "execution",
                            "product",
                            "name",
                            "system",
                            "builder",
                            "date"
                        ]
                    },
                },
            }, {
                name: 'delete',
                display: '删除版本',
                type: 'delete',
                method: 'delete',
                path: '/builds/{buildID}',
                resultType: 'text',
                pathParams: {
                    buildID: '版本ID',
                },
            }
        ],
    },

    /* 测试单模块 */
    {
        name: 'testtask',
        display: '测试单',
        description: '测试单管理，支持获取测试单列表，支持获取产品/项目/执行下的测试单、创建测试单、修改测试单、删除测试单',
        actions: [
            {
                name: 'list',
                display: '获取测试单列表，支持获取产品/项目/执行下的测试单',
                type: 'list',
                method: 'get',
                path: '/{scope}/{scopeID}/testtasks',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'testtasks',
                pathParams: {
                    scope: {description: '测试单所属范围', options: [{value: 'products', label: '产品'}, {value: 'projects', label: '项目'}, {value: 'executions', label: '执行'}]},
                    scopeID: '所属范围ID',
                },
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是all',
                        defaultValue: 'all',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'wait', label: '未开始' },
                            { value: 'doing', label: '进行中' },
                            { value: 'done', label: '已完成' },
                            { value: 'blocked', label: '阻塞' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'name_asc', label: '名称 升序' },
                            { value: 'name_desc', label: '名称 降序' },
                            { value: 'status_asc', label: '状态 升序' },
                            { value: 'status_desc', label: '状态 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                ],
            }, {
                name: 'create',
                display: '创建测试单',
                type: 'create',
                method: 'post',
                path: '/testtasks',
                resultType: 'object',
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "productID": {
                                "type": "integer",
                                "description": "所属产品ID",
                                "format": "int32"
                            },
                            "name": {
                                "type": "string",
                                "description": "测试单名称"
                            },
                            "build": {
                                "type": "integer",
                                "description": "提测构建/版本",
                                "format": "int32"
                            },
                            "execution": {
                                "type": "integer",
                                "description": "所属执行",
                                "format": "int32"
                            },
                            "type": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "类型(integrate 集成测试 | system 系统测试 | acceptance 验收测试 | performance 性能测试 | safety 安全测试)"
                            },
                            "owner": {
                                "type": "string",
                                "description": "负责人"
                            },
                            "status": {
                                "type": "string",
                                "description": "状态(wait 未开始 | doing 进行中 | done 已关闭 | blocked 被阻塞)"
                            },
                            "begin": {
                                "type": "string",
                                "description": "开始日期"
                            },
                            "end": {
                                "type": "string",
                                "description": "结束日期"
                            },
                            "desc": {
                                "type": "string",
                                "description": "描述"
                            }
                        },
                        "required": [
                            "productID",
                            "name",
                            "build",
                            "begin",
                            "end"
                        ]
                    },
                },
            }, {
                name: 'update',
                display: '修改测试单',
                type: 'update',
                method: 'put',
                path: '/testtasks/{testtaskID}',
                resultType: 'object',
                pathParams: {
                    testtaskID: '测试单ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "测试单名称"
                            },
                            "build": {
                                "type": "integer",
                                "description": "提测构建/版本",
                                "format": "int32"
                            },
                            "execution": {
                                "type": "integer",
                                "description": "所属执行",
                                "format": "int32"
                            },
                            "type": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "类型(integrate 集成测试 | system 系统测试 | acceptance 验收测试 | performance 性能测试 | safety 安全测试)"
                            },
                            "owner": {
                                "type": "string",
                                "description": "负责人"
                            },
                            "status": {
                                "type": "string",
                                "description": "状态(wait 未开始 | doing 进行中 | done 已关闭 | blocked 被阻塞)"
                            },
                            "begin": {
                                "type": "string",
                                "description": "开始日期"
                            },
                            "end": {
                                "type": "string",
                                "description": "结束日期"
                            },
                            "desc": {
                                "type": "string",
                                "description": "描述"
                            }
                        },
                        "required": [
                            "name",
                            "build",
                            "begin",
                            "end"
                        ]
                    },
                },
            }, {
                name: 'delete',
                display: '删除测试单',
                type: 'delete',
                method: 'delete',
                path: '/testtasks/{testtaskID}',
                resultType: 'text',
                pathParams: {
                    testtaskID: '测试单ID',
                },
            }
        ],
    },

    /* 发布模块 */
    {
        name: 'release',
        display: '发布',
        description: '发布管理，支持获取发布列表，支持获取产品下的发布、创建发布、修改发布、删除发布',
        actions: [
            {
                name: 'list',
                display: '获取发布列表，支持获取产品下的发布',
                type: 'list',
                method: 'get',
                path: '/products/{productID}/releases',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'releases',
                pathParams: {
                    productID: '所属产品ID',
                },
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是all',
                        defaultValue: 'all',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'wait', label: '未开始' },
                            { value: 'normal', label: '已发布' },
                            { value: 'fail', label: '发布失败' },
                            { value: 'terminate', label: '停止维护' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'name_asc', label: '名称 升序' },
                            { value: 'name_desc', label: '名称 降序' },
                            { value: 'date_asc', label: '日期 升序' },
                            { value: 'date_desc', label: '日期 降序' },
                            { value: 'status_asc', label: '状态 升序' },
                            { value: 'status_desc', label: '状态 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：name(应用版本号，示例：关键字)；branch(平台/分支，示例：all)；id(ID，示例：1)；build(包含构建，示例：all)；status(发布状态，枚举：wait 未开始 | normal 已发布 | fail 发布失败 | terminate 停止维护)；date(计划发布日期，示例：2026-01-01)；marker(里程碑，枚举：1 是 | 0 否)',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
            }, {
                name: 'create',
                display: '创建发布',
                type: 'create',
                method: 'post',
                path: '/releases',
                resultType: 'object',
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "productID": {
                                "type": "integer",
                                "description": "所属产品",
                                "format": "int32"
                            },
                            "system": {
                                "type": "integer",
                                "description": "所属应用",
                                "format": "int32"
                            },
                            "name": {
                                "type": "string",
                                "description": "应用版本号"
                            },
                            "build": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "包含构建"
                            },
                            "status": {
                                "type": "string",
                                "description": "状态(wait 未开始 | normal 已发布 | fail 发布失败 | terminate 停止维护)"
                            },
                            "date": {
                                "type": "string",
                                "description": "计划发布日期"
                            },
                            "desc": {
                                "type": "string",
                                "description": "描述"
                            }
                        },
                        "required": [
                            "productID",
                            "system",
                            "name",
                            "build",
                            "date"
                        ]
                    },
                },
            }, {
                name: 'update',
                display: '修改发布',
                type: 'update',
                method: 'put',
                path: '/releases/{releaseID}',
                resultType: 'object',
                pathParams: {
                    releaseID: '发布ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "system": {
                                "type": "integer",
                                "description": "所属应用",
                                "format": "int32"
                            },
                            "name": {
                                "type": "string",
                                "description": "应用版本号"
                            },
                            "build": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "包含构建"
                            },
                            "status": {
                                "type": "string",
                                "description": "状态(wait 未开始 | normal 已发布 | fail 发布失败 | terminate 停止维护)"
                            },
                            "date": {
                                "type": "string",
                                "description": "计划发布日期"
                            },
                            "desc": {
                                "type": "string",
                                "description": "描述"
                            }
                        },
                        "required": [
                            "system",
                            "name",
                            "build",
                            "date"
                        ]
                    },
                },
            }, {
                name: 'delete',
                display: '删除发布',
                type: 'delete',
                method: 'delete',
                path: '/releases/{releaseID}',
                resultType: 'text',
                pathParams: {
                    releaseID: '发布ID',
                },
            }
        ],
    },

    /* 附件模块 */
    {
        name: 'file',
        display: '附件',
        description: '附件管理，支持上传附件，使用【表单formdata】方式提交，不支持json、编辑附件，修改附件的名称、删除附件',
        actions: [
            {
                name: 'create',
                display: '上传附件，使用【表单formdata】方式提交，不支持json',
                type: 'create',
                method: 'post',
                path: '/files',
                resultType: 'object',
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "file": {
                                "type": "string",
                                "description": "本地文件路径，将按 multipart/form-data 上传"
                            },
                            "objectType": {
                                "type": "string",
                                "description": "关联对象类型(bug 缺陷 | story 需求 | task 任务 | testcase 用例)"
                            },
                            "objectID": {
                                "type": "integer",
                                "description": "关联对象ID",
                                "format": "int32"
                            }
                        },
                        "required": [
                            "file",
                            "objectType",
                            "objectID"
                        ]
                    },
                },
            }, {
                name: 'update',
                display: '编辑附件，修改附件的名称',
                type: 'update',
                method: 'put',
                path: '/files/{fileID}',
                resultType: 'object',
                pathParams: {
                    fileID: '附件ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "fileName": {
                                "type": "string",
                                "description": "附件名称"
                            }
                        },
                        "required": [
                            "fileName"
                        ]
                    },
                },
            }, {
                name: 'delete',
                display: '删除附件',
                type: 'delete',
                method: 'delete',
                path: '/files/{fileID}',
                resultType: 'text',
                pathParams: {
                    fileID: '附件ID',
                },
            }
        ],
    },

    /* 工作流模块 */
    {
        name: 'workflow',
        display: '工作流',
        description: '工作流管理，支持获取工作流数据列表(以合同为例)、获取工作流数据详情(以合同为例)、创建工作流数据(以合同为例)、修改工作流数据(以合同为例)、删除工作流事项(以合同为例)',
        actions: [
            {
                name: 'list',
                display: '获取工作流数据列表(以合同为例)',
                type: 'list',
                method: 'get',
                path: '/workflow/contract',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'dataList',
            }, {
                name: 'getContract',
                display: '获取工作流数据详情(以合同为例)',
                type: 'get',
                method: 'get',
                path: '/workflow/contract/1',
                resultType: 'object',
                resultGetter: 'data',
            }, {
                name: 'create',
                display: '创建工作流数据(以合同为例)',
                type: 'create',
                method: 'post',
                path: '/workflow/contract',
                resultType: 'object',
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "合同名称"
                            }
                        },
                        "required": [
                            "name"
                        ]
                    },
                },
            }, {
                name: 'update',
                display: '修改工作流数据(以合同为例)',
                type: 'update',
                method: 'put',
                path: '/workflow/contract/{contractID}',
                resultType: 'object',
                pathParams: {
                    contractID: '合同ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "合同名称"
                            }
                        },
                        "required": [
                            "name"
                        ]
                    },
                },
            }, {
                name: 'delete',
                display: '删除工作流事项(以合同为例)',
                type: 'delete',
                method: 'delete',
                path: '/workflow/contract/{contractID}',
                resultType: 'text',
                pathParams: {
                    contractID: '合同ID',
                },
            }
        ],
    },

    /* 文档模块 */
    {
        name: 'doc',
        display: '文档',
        description: '文档管理，支持获取我的文档空间列表、获取团队文档空间列表、获取产品文档空间列表、获取项目文档空间列表、获取我的文档库列表、获取团队文档库列表、获取产品文档库列表、获取项目文档库列表、获取我的文档列表、获取团队文档列表、获取产品文档列表、获取项目文档列表、获取我的文档库目录列表、获取团队文档库目录列表、获取产品文档库目录列表、获取项目文档库目录列表、创建我的文档空间、创建团队文档空间、创建我的文档库、创建团队文档库、创建产品文档库、创建项目文档库、创建我的文档、创建团队文档、创建产品文档、创建项目文档、创建我的文档库目录、创建团队文档库目录、创建产品文档库目录、创建项目文档库目录、获取文档空间详情、获取文档库详情、获取文档详情、修改文档空间、修改文档库、修改文档、修改文档库目录、删除文档空间、删除文档库、删除文档、删除文档库目录',
        actions: [
            {
                name: 'mySpaces',
                display: '获取我的文档空间列表',
                type: 'list',
                method: 'get',
                path: '/doc/my/spaces',
                resultType: 'list',
                resultGetter: 'spaces',
            }, {
                name: 'teamSpaces',
                display: '获取团队文档空间列表',
                type: 'list',
                method: 'get',
                path: '/doc/team/spaces',
                resultType: 'list',
                resultGetter: 'spaces',
            }, {
                name: 'productSpaces',
                display: '获取产品文档空间列表',
                type: 'list',
                method: 'get',
                path: '/doc/product/spaces',
                resultType: 'list',
                resultGetter: 'spaces',
            }, {
                name: 'projectSpaces',
                display: '获取项目文档空间列表',
                type: 'list',
                method: 'get',
                path: '/doc/project/spaces',
                resultType: 'list',
                resultGetter: 'spaces',
            }, {
                name: 'myLibs',
                display: '获取我的文档库列表',
                type: 'list',
                method: 'get',
                path: '/doc/my/spaces/{spaceID}/libs',
                resultType: 'list',
                resultGetter: 'libs',
                pathParams: {
                    spaceID: '空间ID',
                },
            }, {
                name: 'teamLibs',
                display: '获取团队文档库列表',
                type: 'list',
                method: 'get',
                path: '/doc/team/spaces/{spaceID}/libs',
                resultType: 'list',
                resultGetter: 'libs',
                pathParams: {
                    spaceID: '空间ID',
                },
            }, {
                name: 'productLibs',
                display: '获取产品文档库列表',
                type: 'list',
                method: 'get',
                path: '/doc/product/spaces/{productID}/libs',
                resultType: 'list',
                resultGetter: 'libs',
                pathParams: {
                    productID: '产品ID',
                },
            }, {
                name: 'projectLibs',
                display: '获取项目文档库列表',
                type: 'list',
                method: 'get',
                path: '/doc/project/spaces/{projectID}/libs',
                resultType: 'list',
                resultGetter: 'libs',
                pathParams: {
                    projectID: '项目ID',
                },
            }, {
                name: 'myDocs',
                display: '获取我的文档列表',
                type: 'list',
                method: 'get',
                path: '/doc/my/spaces/{spaceID}/libs/{libID}/docs',
                resultType: 'list',
                pathParams: {
                    spaceID: '空间ID',
                    libID: '文档库ID',
                },
                resultGetter: 'docs',
            }, {
                name: 'teamDocs',
                display: '获取团队文档列表',
                type: 'list',
                method: 'get',
                path: '/doc/team/spaces/{spaceID}/libs/{libID}/docs',
                resultType: 'list',
                resultGetter: 'docs',
                pathParams: {
                    spaceID: '空间ID',
                    libID: '文档库ID',
                },
            }, {
                name: 'productDocs',
                display: '获取产品文档列表',
                type: 'list',
                method: 'get',
                path: '/doc/product/spaces/{productID}/libs/{libID}/docs',
                resultType: 'list',
                pathParams: {
                    productID: '产品ID',
                    libID: '文档库ID',
                },
                resultGetter: 'docs',
            }, {
                name: 'projectDocs',
                display: '获取项目文档列表',
                type: 'list',
                method: 'get',
                path: '/doc/project/spaces/{projectID}/libs/{libID}/docs',
                resultType: 'list',
                pathParams: {
                    projectID: '项目ID',
                    libID: '文档库ID',
                },
                resultGetter: 'docs',
            }, {
                name: 'myModules',
                display: '获取我的文档库目录列表',
                type: 'list',
                method: 'get',
                path: '/doc/my/spaces/{spaceID}/libs/{libID}/modules',
                resultType: 'list',
                resultGetter: 'modules',
                pathParams: {
                    spaceID: '空间ID',
                    libID: '文档库ID',
                },
            }, {
                name: 'teamModules',
                display: '获取团队文档库目录列表',
                type: 'list',
                method: 'get',
                path: '/doc/team/spaces/{spaceID}/libs/{libID}/modules',
                resultType: 'list',
                resultGetter: 'modules',
                pathParams: {
                    spaceID: '空间ID',
                    libID: '文档库ID',
                },
            }, {
                name: 'productModules',
                display: '获取产品文档库目录列表',
                type: 'list',
                method: 'get',
                path: '/doc/product/spaces/{productID}/libs/{libID}/modules',
                resultType: 'list',
                resultGetter: 'modules',
                pathParams: {
                    productID: '产品ID',
                    libID: '文档库ID',
                },
            }, {
                name: 'projectModules',
                display: '获取项目文档库目录列表',
                type: 'list',
                method: 'get',
                path: '/doc/project/spaces/{projectID}/libs/{libID}/modules',
                resultType: 'list',
                resultGetter: 'modules',
                pathParams: {
                    projectID: '项目ID',
                    libID: '文档库ID',
                },
            }, {
                name: 'createMySpace',
                display: '创建我的文档空间',
                type: 'create',
                method: 'post',
                path: '/doc/my/spaces',
                resultType: 'object',
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "文档空间名称"
                            }
                        },
                        "required": [
                            "name"
                        ]
                    },
                },
            }, {
                name: 'createTeamSpace',
                display: '创建团队文档空间',
                type: 'create',
                method: 'post',
                path: '/doc/team/spaces',
                resultType: 'object',
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "文档空间名称"
                            }
                        },
                        "required": [
                            "name"
                        ]
                    },
                },
            }, {
                name: 'createMyLib',
                display: '创建我的文档库',
                type: 'create',
                method: 'post',
                path: '/doc/my/spaces/{spaceID}/libs',
                resultType: 'object',
                pathParams: {
                    spaceID: '空间ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "文档库名称"
                            }
                        },
                        "required": [
                            "name"
                        ]
                    },
                },
            }, {
                name: 'createTeamLib',
                display: '创建团队文档库',
                type: 'create',
                method: 'post',
                path: '/doc/team/spaces/{spaceID}/libs',
                resultType: 'object',
                pathParams: {
                    spaceID: '空间ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "文档库名称"
                            },
                            "acl": {
                                "type": "string",
                                "description": "open 公开 | private 私有，默认是open"
                            },
                            "groups": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "如果acl=private,可以设置哪些权限分组可以访问"
                            },
                            "users": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "如果acl=private,可以设置哪些用户可以访问"
                            }
                        },
                        "required": [
                            "name"
                        ]
                    },
                },
            }, {
                name: 'createProductLib',
                display: '创建产品文档库',
                type: 'create',
                method: 'post',
                path: '/doc/product/spaces/{productID}/libs',
                resultType: 'object',
                pathParams: {
                    productID: '产品ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "文档库名称"
                            },
                            "acl": {
                                "type": "string",
                                "description": "default 默认产品权限 | private 私有"
                            },
                            "groups": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "如果acl=private,可以设置哪些权限分组可以访问"
                            },
                            "users": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "如果acl=private,可以设置哪些用户可以访问"
                            }
                        },
                        "required": [
                            "name"
                        ]
                    },
                },
            }, {
                name: 'createProjectLib',
                display: '创建项目文档库',
                type: 'create',
                method: 'post',
                path: '/doc/project/spaces/{projectID}/libs',
                resultType: 'object',
                pathParams: {
                    projectID: '项目ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "文档库名称"
                            },
                            "acl": {
                                "type": "string",
                                "description": "default 默认项目权限 | private 私有"
                            },
                            "groups": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "如果acl=private,可以设置哪些权限分组可以访问"
                            },
                            "users": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "如果acl=private,可以设置哪些用户可以访问"
                            }
                        },
                        "required": [
                            "name"
                        ]
                    },
                },
            }, {
                name: 'createMyDoc',
                display: '创建我的文档',
                type: 'create',
                method: 'post',
                path: '/doc/my/spaces/{spaceID}/libs/{libID}/docs',
                resultType: 'object',
                pathParams: {
                    spaceID: '空间ID',
                    libID: '文档库ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "moduleID": {
                                "type": "integer",
                                "description": "所属目录",
                                "format": "int32"
                            },
                            "title": {
                                "type": "string",
                                "description": "文档标题"
                            },
                            "content": {
                                "type": "string",
                                "description": "文档正文，使用Markdown格式；系统会转换为块编辑器内容并生成HTML快照"
                            },
                            "contentType": {
                                "type": "string",
                                "description": "文档格式(doc 按Markdown处理，支持团队协同编辑 | html 旧格式，直接保存HTML，不支持团队协同编辑)"
                            }
                        },
                        "required": [
                            "title",
                            "content"
                        ]
                    },
                },
            }, {
                name: 'createTeamDoc',
                display: '创建团队文档',
                type: 'create',
                method: 'post',
                path: '/doc/team/spaces/{spaceID}/libs/{libID}/docs',
                resultType: 'object',
                pathParams: {
                    spaceID: '空间ID',
                    libID: '文档库ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "moduleID": {
                                "type": "integer",
                                "description": "所属目录",
                                "format": "int32"
                            },
                            "title": {
                                "type": "string",
                                "description": "文档标题"
                            },
                            "content": {
                                "type": "string",
                                "description": "文档正文，使用Markdown格式；系统会转换为块编辑器内容并生成HTML快照"
                            },
                            "contentType": {
                                "type": "string",
                                "description": "文档格式(doc 按Markdown处理，支持团队协同编辑 | html 旧格式，直接保存HTML，不支持团队协同编辑)"
                            }
                        },
                        "required": [
                            "title",
                            "content"
                        ]
                    },
                },
            }, {
                name: 'createProductDoc',
                display: '创建产品文档',
                type: 'create',
                method: 'post',
                path: '/doc/product/spaces/{productID}/libs/{libID}/docs',
                resultType: 'object',
                pathParams: {
                    productID: '产品ID',
                    libID: '文档库ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "moduleID": {
                                "type": "integer",
                                "description": "所属目录",
                                "format": "int32"
                            },
                            "title": {
                                "type": "string",
                                "description": "文档标题"
                            },
                            "content": {
                                "type": "string",
                                "description": "文档正文，使用Markdown格式；系统会转换为块编辑器内容并生成HTML快照"
                            },
                            "contentType": {
                                "type": "string",
                                "description": "文档格式(doc 按Markdown处理，支持团队协同编辑 | html 旧格式，直接保存HTML，不支持团队协同编辑)"
                            }
                        },
                        "required": [
                            "title",
                            "content"
                        ]
                    },
                },
            }, {
                name: 'createProjectDoc',
                display: '创建项目文档',
                type: 'create',
                method: 'post',
                path: '/doc/project/spaces/{projectID}/libs/{libID}/docs',
                resultType: 'object',
                pathParams: {
                    projectID: '项目ID',
                    libID: '文档库ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "moduleID": {
                                "type": "integer",
                                "description": "所属目录",
                                "format": "int32"
                            },
                            "title": {
                                "type": "string",
                                "description": "文档标题"
                            },
                            "content": {
                                "type": "string",
                                "description": "文档正文，使用Markdown格式；系统会转换为块编辑器内容并生成HTML快照"
                            },
                            "contentType": {
                                "type": "string",
                                "description": "文档格式(doc 按Markdown处理，支持团队协同编辑 | html 旧格式，直接保存HTML，不支持团队协同编辑)"
                            }
                        },
                        "required": [
                            "title",
                            "content"
                        ]
                    },
                },
            }, {
                name: 'createMyModule',
                display: '创建我的文档库目录',
                type: 'create',
                method: 'post',
                path: '/doc/my/spaces/{spaceID}/libs/{libID}/modules',
                resultType: 'object',
                pathParams: {
                    spaceID: '空间ID',
                    libID: '文档库ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "文档库目录"
                            },
                            "parentID": {
                                "type": "integer",
                                "description": "父目录ID，必须属于当前文档库",
                                "format": "int32"
                            }
                        },
                        "required": [
                            "name"
                        ]
                    },
                },
            }, {
                name: 'createTeamModule',
                display: '创建团队文档库目录',
                type: 'create',
                method: 'post',
                path: '/doc/team/spaces/{spaceID}/libs/{libID}/modules',
                resultType: 'object',
                pathParams: {
                    spaceID: '空间ID',
                    libID: '文档库ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "文档库目录"
                            },
                            "parentID": {
                                "type": "integer",
                                "description": "父目录ID，必须属于当前文档库",
                                "format": "int32"
                            }
                        },
                        "required": [
                            "name"
                        ]
                    },
                },
            }, {
                name: 'createProductModule',
                display: '创建产品文档库目录',
                type: 'create',
                method: 'post',
                path: '/doc/product/spaces/{productID}/libs/{libID}/modules',
                resultType: 'object',
                pathParams: {
                    productID: '产品ID',
                    libID: '文档库ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "文档库目录"
                            },
                            "parentID": {
                                "type": "integer",
                                "description": "父目录ID，必须属于当前文档库",
                                "format": "int32"
                            }
                        },
                        "required": [
                            "name"
                        ]
                    },
                },
            }, {
                name: 'createProjectModule',
                display: '创建项目文档库目录',
                type: 'create',
                method: 'post',
                path: '/doc/project/spaces/{projectID}/libs/{libID}/modules',
                resultType: 'object',
                pathParams: {
                    projectID: '项目ID',
                    libID: '文档库ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "文档库目录"
                            },
                            "parentID": {
                                "type": "integer",
                                "description": "父目录ID，必须属于当前文档库",
                                "format": "int32"
                            }
                        },
                        "required": [
                            "name"
                        ]
                    },
                },
            }, {
                name: 'getSpace',
                display: '获取文档空间详情',
                type: 'get',
                method: 'get',
                path: '/doc/spaces/{spaceID}',
                resultType: 'object',
                resultGetter: 'space',
                pathParams: {
                    spaceID: '空间ID',
                },
            }, {
                name: 'getLib',
                display: '获取文档库详情',
                type: 'get',
                method: 'get',
                path: '/doc/libs/{libID}',
                resultType: 'object',
                resultGetter: 'lib',
                pathParams: {
                    libID: '文档库ID',
                },
            }, {
                name: 'get',
                display: '获取文档详情',
                type: 'get',
                method: 'get',
                path: '/doc/docs/{docID}',
                resultType: 'object',
                resultGetter: 'doc',
                pathParams: {
                    docID: '文档ID',
                },
            }, {
                name: 'updateSpace',
                display: '修改文档空间',
                type: 'update',
                method: 'put',
                path: '/doc/spaces/{spaceID}',
                resultType: 'object',
                pathParams: {
                    spaceID: '空间ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "文档空间名称"
                            }
                        },
                        "required": [
                            "name"
                        ]
                    },
                },
            }, {
                name: 'updateLib',
                display: '修改文档库',
                type: 'update',
                method: 'put',
                path: '/doc/libs/{libID}',
                resultType: 'object',
                pathParams: {
                    libID: '文档库ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "文档库名称"
                            },
                            "acl": {
                                "type": "string",
                                "description": "open 公开(适用于团队文档库) | default 默认权限(适用于产品、项目文档库) | private 私有(适用于所有类型文档库)"
                            },
                            "groups": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "如果acl=private,可以设置哪些权限分组可以访问"
                            },
                            "users": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "如果acl=private,可以设置哪些用户可以访问"
                            }
                        },
                        "required": [
                            "name"
                        ]
                    },
                },
            }, {
                name: 'update',
                display: '修改文档',
                type: 'update',
                method: 'put',
                path: '/doc/docs/{docID}',
                resultType: 'object',
                pathParams: {
                    docID: '文档ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "moduleID": {
                                "type": "integer",
                                "description": "所属目录",
                                "format": "int32"
                            },
                            "title": {
                                "type": "string",
                                "description": "文档标题"
                            },
                            "content": {
                                "type": "string",
                                "description": "文档正文，使用Markdown格式；系统会转换为块编辑器内容并生成HTML快照"
                            },
                            "contentType": {
                                "type": "string",
                                "description": "文档格式(doc 按Markdown处理，支持团队协同编辑 | html 旧格式，直接保存HTML，不支持团队协同编辑)"
                            }
                        },
                        "required": [
                            "title",
                            "content"
                        ]
                    },
                },
            }, {
                name: 'updateModule',
                display: '修改文档库目录',
                type: 'update',
                method: 'put',
                path: '/doc/modules/{moduleID}',
                resultType: 'object',
                pathParams: {
                    moduleID: '模块ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "文档库目录名称"
                            }
                        },
                        "required": [
                            "name"
                        ]
                    },
                },
            }, {
                name: 'deleteSpace',
                display: '删除文档空间',
                type: 'delete',
                method: 'delete',
                path: '/doc/spaces/{spaceID}',
                resultType: 'text',
                pathParams: {
                    spaceID: '空间ID',
                },
            }, {
                name: 'deleteLib',
                display: '删除文档库',
                type: 'delete',
                method: 'delete',
                path: '/doc/libs/{libID}',
                resultType: 'text',
                pathParams: {
                    libID: '文档库ID',
                },
            }, {
                name: 'delete',
                display: '删除文档',
                type: 'delete',
                method: 'delete',
                path: '/doc/docs/{docID}',
                resultType: 'text',
                pathParams: {
                    docID: '文档ID',
                },
            }, {
                name: 'deleteModule',
                display: '删除文档库目录',
                type: 'delete',
                method: 'delete',
                path: '/doc/modules/{moduleID}',
                resultType: 'text',
                pathParams: {
                    moduleID: '模块ID',
                },
            }
        ],
    },

    /* 待办模块 */
    {
        name: 'todo',
        display: '待办',
        description: '待办管理，支持创建待办、编辑待办、删除待办',
        actions: [
            {
                name: 'create',
                display: '创建待办',
                type: 'create',
                method: 'post',
                path: '/todos',
                resultType: 'object',
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "date": {
                                "type": "string",
                                "description": "日期"
                            },
                            "type": {
                                "type": "string",
                                "description": "类型：custom 自定义 | task 任务 | bug 缺陷 | story 研发需求 | epic 业务需求 | requirement 用户需求 | testtask 测试单"
                            },
                            "name": {
                                "type": "string",
                                "description": "待办名称，type为custom时必填；type为非custom时由关联对象的名称或标题自动生成"
                            },
                            "objectID": {
                                "type": "integer",
                                "description": "关联对象ID，type为非custom时必填，必须是type对应对象的ID",
                                "format": "int32"
                            },
                            "begin": {
                                "type": "string",
                                "description": "开始时间，使用小时+分钟拼接"
                            },
                            "end": {
                                "type": "string",
                                "description": "结束时间，使用小时+分钟拼接"
                            },
                            "assignedTo": {
                                "type": "string",
                                "description": "指派给"
                            },
                            "desc": {
                                "type": "string",
                                "description": "待办详情"
                            }
                        },
                        "required": [
                            "date",
                            "type"
                        ]
                    },
                },
            }, {
                name: 'update',
                display: '编辑待办',
                type: 'update',
                method: 'put',
                path: '/todos/{todoID}',
                resultType: 'object',
                pathParams: {
                    todoID: '待办ID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "date": {
                                "type": "string",
                                "description": "日期"
                            },
                            "type": {
                                "type": "string",
                                "description": "类型：custom 自定义 | task 任务 | bug 缺陷 | story 研发需求 | epic 业务需求 | requirement 用户需求 | testtask 测试单"
                            },
                            "name": {
                                "type": "string",
                                "description": "待办名称，type为custom时必填；type为非custom时由关联对象的名称或标题自动生成"
                            },
                            "objectID": {
                                "type": "integer",
                                "description": "关联对象ID，type为非custom时必填，必须是type对应对象的ID",
                                "format": "int32"
                            },
                            "begin": {
                                "type": "string",
                                "description": "开始时间，使用小时+分钟拼接"
                            },
                            "end": {
                                "type": "string",
                                "description": "结束时间，使用小时+分钟拼接"
                            },
                            "assignedTo": {
                                "type": "string",
                                "description": "指派给"
                            },
                            "desc": {
                                "type": "string",
                                "description": "待办详情"
                            }
                        },
                        "required": [
                            "date",
                            "type"
                        ]
                    },
                },
            }, {
                name: 'delete',
                display: '删除待办',
                type: 'delete',
                method: 'delete',
                path: '/todos/{todoID}',
                resultType: 'text',
                pathParams: {
                    todoID: '待办ID',
                },
            }
        ],
    },

    /* 地盘模块 */
    {
        name: 'my',
        display: '地盘',
        description: '地盘管理，支持我的待办、指派给我的任务、指派给我的Bug、指派给我的研发需求、指派给我的业务需求、指派给我的用户需求、我负责的的测试单、我参与的项目、指派给我的反馈、指派给我的工单、指派给我的用例、我的会议、指派给我的问题、指派给我的风险',
        actions: [
            {
                name: 'todos',
                display: '我的待办',
                type: 'list',
                method: 'get',
                path: '/my/todos',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'todos',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是all',
                        defaultValue: 'all',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'today', label: '今天' },
                            { value: 'future', label: '将来' },
                            { value: 'lag', label: '过期' },
                            { value: 'finished', label: '已完成' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序(date_desc,status,begin 日期/状态/开始时间)',
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                ],
            }, {
                name: 'tasks',
                display: '指派给我的任务',
                type: 'list',
                method: 'get',
                path: '/my/tasks',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'tasks',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是all',
                        defaultValue: 'all',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'unclosed', label: '未关闭' },
                            { value: 'assignedtome', label: '指派给我' },
                            { value: 'openedbyme', label: '我创建' },
                            { value: 'finishedbyme', label: '由我完成' },
                            { value: 'closedbyme', label: '由我关闭' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'name_asc', label: '名称 升序' },
                            { value: 'name_desc', label: '名称 降序' },
                            { value: 'status_asc', label: '状态 升序' },
                            { value: 'status_desc', label: '状态 降序' },
                            { value: 'pri_asc', label: '优先级 升序' },
                            { value: 'pri_desc', label: '优先级 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：name(任务名称，示例：关键字)；keywords(关键词，示例：关键字)；id(编号，示例：1)；status(任务状态，枚举：wait 未开始 | doing 进行中 | done 已完成 | pause 已暂停 | cancel 已取消 | closed 已关闭)；desc(任务描述，示例：关键字)；assignedTo(指派给，用户，示例：admin)；pri(优先级，枚举：1 | 2 | 3 | 4)；project(所属项目，示例：all)；execution(所属执行，示例：all)；module(所属模块，示例：all)；estimate(最初预计，示例：关键字)；left(预计剩余，示例：关键字)；consumed(总计消耗，示例：关键字)；type(任务类型，枚举：design 设计 | devel 开发 | request 需求 | test 测试 | study 研究 | discuss 讨论 | ui 界面 | affair 事务 | misc 其他)；story(相关用户故事，示例：all)；fromBug(来源Bug编号，枚举：design 设计 | devel 开发 | request 需求 | test 测试 | study 研究 | discuss 讨论 | ui 界面 | affair 事务 | misc 其他)；closedReason(关闭原因，枚举：done 已完成 | cancel 已取消)；openedBy(由谁创建，用户，示例：admin)；finishedBy(由谁完成，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；canceledBy(由谁取消，用户，示例：admin)；lastEditedBy(最后修改，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；openedDate(创建日期，示例：2026-01-01)；deadline(截止日期，示例：2026-01-01)；estStarted(预计开始，示例：2026-01-01)；realStarted(实际开始，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；finishedDate(实际完成，示例：2026-01-01)；closedDate(关闭时间，示例：2026-01-01)；canceledDate(取消时间，示例：2026-01-01)；lastEditedDate(最后修改日期，示例：2026-01-01)；activatedDate(激活日期，示例：2026-01-01)',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
            }, {
                name: 'bugs',
                display: '指派给我的Bug',
                type: 'list',
                method: 'get',
                path: '/my/bugs',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'bugs',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是all',
                        defaultValue: 'all',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'unclosed', label: '未关闭' },
                            { value: 'assignedtome', label: '指派给我' },
                            { value: 'openedbyme', label: '我创建' },
                            { value: 'resolvedbyme', label: '由我解决' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'title_asc', label: '标题 升序' },
                            { value: 'title_desc', label: '标题 降序' },
                            { value: 'status_asc', label: '状态 升序' },
                            { value: 'status_desc', label: '状态 降序' },
                            { value: 'severity_asc', label: '严重程度 升序' },
                            { value: 'severity_desc', label: '严重程度 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(Bug标题，示例：关键字)；module(所属模块，模块，示例：0)；keywords(关键词，示例：关键字)；steps(重现步骤，示例：关键字)；assignedTo(指派给，用户，示例：admin)；resolvedBy(解决者，用户，示例：admin)；status(Bug状态，枚举：active 激活 | resolved 已解决 | closed 已关闭)；confirmed(是否确认，枚举：1 已确认 | 0 未确认)；story(相关需求，示例：关键字)；project(所属项目，示例：all)；product(所属产品，示例：all)；branch(branch，示例：all)；plan(所属计划，示例：all)；id(Bug编号，示例：1)；execution(所属执行，执行，示例：3)；severity(严重程度，枚举：1 | 2 | 3 | 4)；pri(优先级，枚举：1 | 2 | 3 | 4)；type(Bug类型，枚举：codeerror 代码错误 | config 配置相关 | install 安装部署 | security 安全相关 | performance 性能问题 | standard 标准规范 | automation 测试脚本 | designdefect 设计缺陷 | codeimprovement 代码改进 | others 其他)；os(操作系统，枚举：all 全部 | windows Windows | win11 Windows 11 | win10 Windows 10 | win8 Windows 8 | win7 Windows 7 | winxp Windows XP | osx Mac OS | android Android | ios IOS | linux Linux | ubuntu Ubuntu | chromeos Chrome OS | fedora Fedora | unix Unix | others 其他)；browser(浏览器，枚举：all 全部 | chrome Chrome | edge Edge | ie IE系列 | ie11 IE11 | ie10 IE10 | ie9 IE9 | ie8 IE8 | firefox firefox系列 | opera Opera系列 | safari | 360 360浏览器 | qq QQ浏览器 | other 其他)；resolution(解决方案，枚举：bydesign 设计如此 | duplicate 重复Bug | external 外部原因 | fixed 已解决 | notrepro 无法重现 | postponed 延期处理 | willnotfix 不予解决 | tostory 转为用户故事)；activatedCount(激活次数，示例：关键字)；toTask(转任务，示例：关键字)；toStory(转用户故事，示例：关键字)；openedBy(由谁创建，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedBy(修改者，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；openedBuild(影响版本，示例：builds)；resolvedBuild(解决版本，示例：builds)；openedDate(创建日期，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；resolvedDate(解决日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(修改日期，示例：2026-01-01)；deadline(截止日期，示例：2026-01-01)；activatedDate(激活时间，示例：2026-01-01)',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
            }, {
                name: 'stories',
                display: '指派给我的研发需求',
                type: 'list',
                method: 'get',
                path: '/my/stories',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'stories',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是allstory',
                        defaultValue: 'allstory',
                        options: [
                            { value: 'allstory', label: '全部' },
                            { value: 'assignedtome', label: '指派给我' },
                            { value: 'openedbyme', label: '我创建' },
                            { value: 'reviewbyme', label: '待我评审' },
                            { value: 'draftstory', label: '草稿' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'title_asc', label: '标题 升序' },
                            { value: 'title_desc', label: '标题 降序' },
                            { value: 'status_asc', label: '状态 升序' },
                            { value: 'status_desc', label: '状态 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(需求名称，示例：关键字)；id(编号，示例：1)；keywords(关键词，示例：关键字)；status(当前状态，枚举：draft 草稿 | reviewing 评审中 | active 激活 | changing 变更中 | closed 已关闭)；pri(优先级，枚举：1 | 2 | 3 | 4)；module(所属模块，示例：all)；stage(所处阶段，枚举：wait 未开始 | planned 已计划 | projected 研发立项 | designing 设计中 | designed 设计完毕 | developing 研发中 | developed 研发完毕 | testing 测试中 | tested 测试完毕 | verified 已验收 | rejected 验收失败 | delivering 交付中 | delivered 已交付 | released 已发布 | closed 已关闭)；product(所属产品，示例：all)；branch(branch，示例：all)；grade(需求层级，示例：all)；plan(所属计划，示例：all)；estimate(预计小时，示例：关键字)；source(来源，枚举：customer 客户 | user 用户 | po 产品经理 | market 市场 | service 客服 | operation 运营 | support 技术支持 | competitor 竞争对手 | partner 合作伙伴 | dev 开发人员 | tester 测试人员 | bug Bug | forum 论坛 | other 其他)；sourceNote(来源备注，示例：关键字)；fromBug(来源Bug，示例：关键字)；category(类别，枚举：feature 功能 | interface 接口 | performance 性能 | safe 安全 | experience 体验 | improve 改进 | other 其他)；openedBy(由谁创建，用户，示例：admin)；reviewedBy(已评审人，用户，示例：admin)；result(评审结果，枚举：pass 确认通过 | revert 撤销变更 | clarify 有待明确 | reject 拒绝)；assignedTo(指派给，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedBy(最后修改，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；closedReason(关闭原因，枚举：done 已完成 | subdivided 已拆分 | duplicate 重复 | postponed 延期 | willnotdo 不做 | cancel 已取消 | bydesign 设计如此)；version(版本号，示例：关键字)；openedDate(创建日期，示例：2026-01-01)；reviewedDate(评审时间，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(最后修改日期，示例：2026-01-01)；activatedDate(激活日期，示例：2026-01-01)',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
            }, {
                name: 'epics',
                display: '指派给我的业务需求',
                type: 'list',
                method: 'get',
                path: '/my/epics',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'epics',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是allstory',
                        defaultValue: 'allstory',
                        options: [
                            { value: 'allstory', label: '全部' },
                            { value: 'assignedtome', label: '指派给我' },
                            { value: 'openedbyme', label: '我创建' },
                            { value: 'reviewbyme', label: '待我评审' },
                            { value: 'draftstory', label: '草稿' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'title_asc', label: '标题 升序' },
                            { value: 'title_desc', label: '标题 降序' },
                            { value: 'status_asc', label: '状态 升序' },
                            { value: 'status_desc', label: '状态 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(需求名称，示例：关键字)；id(编号，示例：1)；keywords(关键词，示例：关键字)；status(当前状态，枚举：draft 草稿 | reviewing 评审中 | active 激活 | changing 变更中 | closed 已关闭)；pri(优先级，枚举：1 | 2 | 3 | 4)；module(所属模块，示例：all)；stage(所处阶段，枚举：wait 未开始 | planned 已计划 | projected 研发立项 | designing 设计中 | designed 设计完毕 | developing 研发中 | developed 研发完毕 | testing 测试中 | tested 测试完毕 | verified 已验收 | rejected 验收失败 | delivering 交付中 | delivered 已交付 | released 已发布 | closed 已关闭)；product(所属产品，示例：all)；branch(branch，示例：all)；grade(需求层级，示例：all)；plan(所属计划，示例：all)；estimate(预计小时，示例：关键字)；source(来源，枚举：customer 客户 | user 用户 | po 产品经理 | market 市场 | service 客服 | operation 运营 | support 技术支持 | competitor 竞争对手 | partner 合作伙伴 | dev 开发人员 | tester 测试人员 | bug Bug | forum 论坛 | other 其他)；sourceNote(来源备注，示例：关键字)；fromBug(来源Bug，示例：关键字)；category(类别，枚举：feature 功能 | interface 接口 | performance 性能 | safe 安全 | experience 体验 | improve 改进 | other 其他)；openedBy(由谁创建，用户，示例：admin)；reviewedBy(已评审人，用户，示例：admin)；result(评审结果，枚举：pass 确认通过 | revert 撤销变更 | clarify 有待明确 | reject 拒绝)；assignedTo(指派给，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedBy(最后修改，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；closedReason(关闭原因，枚举：done 已完成 | subdivided 已拆分 | duplicate 重复 | postponed 延期 | willnotdo 不做 | cancel 已取消 | bydesign 设计如此)；version(版本号，示例：关键字)；openedDate(创建日期，示例：2026-01-01)；reviewedDate(评审时间，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(最后修改日期，示例：2026-01-01)；activatedDate(激活日期，示例：2026-01-01)',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
            }, {
                name: 'requirements',
                display: '指派给我的用户需求',
                type: 'list',
                method: 'get',
                path: '/my/requirements',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'requirements',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是allstory',
                        defaultValue: 'allstory',
                        options: [
                            { value: 'allstory', label: '全部' },
                            { value: 'assignedtome', label: '指派给我' },
                            { value: 'openedbyme', label: '我创建' },
                            { value: 'reviewbyme', label: '待我评审' },
                            { value: 'draftstory', label: '草稿' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'title_asc', label: '标题 升序' },
                            { value: 'title_desc', label: '标题 降序' },
                            { value: 'status_asc', label: '状态 升序' },
                            { value: 'status_desc', label: '状态 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(需求名称，示例：关键字)；id(编号，示例：1)；keywords(关键词，示例：关键字)；status(当前状态，枚举：draft 草稿 | reviewing 评审中 | active 激活 | changing 变更中 | closed 已关闭)；pri(优先级，枚举：1 | 2 | 3 | 4)；module(所属模块，示例：all)；stage(所处阶段，枚举：wait 未开始 | planned 已计划 | projected 研发立项 | designing 设计中 | designed 设计完毕 | developing 研发中 | developed 研发完毕 | testing 测试中 | tested 测试完毕 | verified 已验收 | rejected 验收失败 | delivering 交付中 | delivered 已交付 | released 已发布 | closed 已关闭)；product(所属产品，示例：all)；branch(branch，示例：all)；grade(需求层级，示例：all)；plan(所属计划，示例：all)；estimate(预计小时，示例：关键字)；source(来源，枚举：customer 客户 | user 用户 | po 产品经理 | market 市场 | service 客服 | operation 运营 | support 技术支持 | competitor 竞争对手 | partner 合作伙伴 | dev 开发人员 | tester 测试人员 | bug Bug | forum 论坛 | other 其他)；sourceNote(来源备注，示例：关键字)；fromBug(来源Bug，示例：关键字)；category(类别，枚举：feature 功能 | interface 接口 | performance 性能 | safe 安全 | experience 体验 | improve 改进 | other 其他)；openedBy(由谁创建，用户，示例：admin)；reviewedBy(已评审人，用户，示例：admin)；result(评审结果，枚举：pass 确认通过 | revert 撤销变更 | clarify 有待明确 | reject 拒绝)；assignedTo(指派给，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedBy(最后修改，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；closedReason(关闭原因，枚举：done 已完成 | subdivided 已拆分 | duplicate 重复 | postponed 延期 | willnotdo 不做 | cancel 已取消 | bydesign 设计如此)；version(版本号，示例：关键字)；openedDate(创建日期，示例：2026-01-01)；reviewedDate(评审时间，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(最后修改日期，示例：2026-01-01)；activatedDate(激活日期，示例：2026-01-01)',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
            }, {
                name: 'testtasks',
                display: '我负责的的测试单',
                type: 'list',
                method: 'get',
                path: '/my/testtasks',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'testtasks',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是all',
                        defaultValue: 'all',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'wait', label: '未开始' },
                            { value: 'doing', label: '进行中' },
                            { value: 'done', label: '已完成' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'name_asc', label: '名称 升序' },
                            { value: 'name_desc', label: '名称 降序' },
                            { value: 'status_asc', label: '状态 升序' },
                            { value: 'status_desc', label: '状态 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                ],
            }, {
                name: 'projects',
                display: '我参与的项目',
                type: 'list',
                method: 'get',
                path: '/my/projects',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'projects',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是all',
                        defaultValue: 'all',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'undone', label: '未完成' },
                            { value: 'wait', label: '未开始' },
                            { value: 'doing', label: '进行中' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'name_asc', label: '名称 升序' },
                            { value: 'name_desc', label: '名称 降序' },
                            { value: 'status_asc', label: '状态 升序' },
                            { value: 'status_desc', label: '状态 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                ],
            }, {
                name: 'feedbacks',
                display: '指派给我的反馈',
                type: 'list',
                method: 'get',
                path: '/my/feedbacks',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'feedbacks',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是all',
                        defaultValue: 'all',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'wait', label: '待处理' },
                            { value: 'doing', label: '处理中' },
                            { value: 'toclosed', label: '待关闭' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'title_asc', label: '标题 升序' },
                            { value: 'title_desc', label: '标题 降序' },
                            { value: 'status_asc', label: '状态 升序' },
                            { value: 'status_desc', label: '状态 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activatedBy,activatedDate,assignedTo,closedBy,closedDate,closedReason,desc,feedbackBy,id,keywords,mailto,module,notifyEmail,openedBy,openedDate,pri,processedBy,processedDate,product,public,reviewedBy,solution,source,status,title,type',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
            }, {
                name: 'tickets',
                display: '指派给我的工单',
                type: 'list',
                method: 'get',
                path: '/my/tickets',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'tickets',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是all',
                        defaultValue: 'all',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'unclosed', label: '未关闭' },
                            { value: 'wait', label: '待处理' },
                            { value: 'doing', label: '处理中' },
                            { value: 'done', label: '待关闭' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'title_asc', label: '标题 升序' },
                            { value: 'title_desc', label: '标题 降序' },
                            { value: 'status_asc', label: '状态 升序' },
                            { value: 'status_desc', label: '状态 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activatedBy,activatedCount,activatedDate,assignedTo,closedBy,closedDate,closedReason,contact,customer,deadline,desc,editedBy,editedDate,feedback,id,keywords,mailto,module,notifyEmail,openedBuild,openedBy,openedDate,pri,product,resolution,resolvedBy,resolvedDate,startedBy,startedDate,status,title,type',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
            }, {
                name: 'testcases',
                display: '指派给我的用例',
                type: 'list',
                method: 'get',
                path: '/my/testcases',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'testcases',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是all',
                        defaultValue: 'all',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'wait', label: '未执行' },
                            { value: 'doing', label: '执行中' },
                            { value: 'pass', label: '通过' },
                            { value: 'fail', label: '失败' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'title_asc', label: '标题 升序' },
                            { value: 'title_desc', label: '标题 降序' },
                            { value: 'status_asc', label: '状态 升序' },
                            { value: 'status_desc', label: '状态 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(用例名称，示例：关键字)；story(关联需求，示例：all)；id(用例编号，示例：1)；keywords(关键词，示例：关键字)；lastEditedBy(修改者，用户，示例：admin)；type(用例类型，枚举：unit 单元测试 | interface 接口测试 | feature 功能测试 | install 安装部署 | config 配置相关 | performance 性能测试 | security 安全相关 | other 其他)；auto(自动化，枚举：auto 是 | no 否)；openedBy(由谁创建，用户，示例：admin)；status(用例状态，枚举：wait 待评审 | normal 正常 | blocked 被阻塞 | investigate 研究中)；product(所属产品，示例：all)；branch(branch，示例：all)；stage(适用环节，枚举：unittest 单元测试环节 | feature 功能测试环节 | intergrate 集成测试环节 | system 系统测试环节 | smoke 冒烟测试环节 | bvt 版本验证环节)；module(所属模块，模块，示例：0)；pri(优先级，枚举：3 | 1 | 2 | 4)；lib(所属库，示例：all)；lastRunner(执行人，用户，示例：admin)；lastRunResult(结果，枚举：pass 通过 | fail 失败 | blocked 阻塞 | null 未执行)；lastRunDate(执行时间，示例：2026-01-01)；openedDate(创建日期，示例：2026-01-01)；lastEditedDate(修改日期，示例：2026-01-01)；scene(所属场景，示例：all)',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
            }, {
                name: 'meetings',
                display: '我的会议',
                type: 'list',
                method: 'get',
                path: '/my/meetings',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'meetings',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是futureMeeting',
                        defaultValue: 'futureMeeting',
                        options: [
                            { value: 'futureMeeting', label: '我参加的（未开始）' },
                            { value: 'all', label: '全部' },
                            { value: 'booked', label: '我预约的' },
                            { value: 'participate', label: '我参加的（全部）' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'name_asc', label: '名称 升序' },
                            { value: 'name_desc', label: '名称 降序' },
                            { value: 'date_asc', label: '日期 升序' },
                            { value: 'date_desc', label: '日期 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                ],
            }, {
                name: 'issues',
                display: '指派给我的问题',
                type: 'list',
                method: 'get',
                path: '/my/issues',
                resultType: 'list',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是all',
                        defaultValue: 'all',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'open', label: '开放' },
                            { value: 'assignto', label: '指派给我' },
                            { value: 'assignby', label: '由我指派' },
                            { value: 'closed', label: '已关闭' },
                            { value: 'resolved', label: '已解决' },
                            { value: 'canceled', label: '已取消' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'title_asc', label: '标题 升序' },
                            { value: 'title_desc', label: '标题 降序' },
                            { value: 'severity_asc', label: '严重程度 升序' },
                            { value: 'severity_desc', label: '严重程度 降序' },
                            { value: 'status_asc', label: '状态 升序' },
                            { value: 'status_desc', label: '状态 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                ],
                resultGetter: 'issues',
            }, {
                name: 'risks',
                display: '指派给我的风险',
                type: 'list',
                method: 'get',
                path: '/my/risks',
                resultType: 'list',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '状态，默认是all',
                        defaultValue: 'all',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'active', label: '开放' },
                            { value: 'assignTo', label: '指派给我' },
                            { value: 'assignBy', label: '由我指派' },
                            { value: 'closed', label: '已关闭' },
                            { value: 'hangup', label: '已挂起' },
                            { value: 'canceled', label: '已取消' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序',
                        options: [
                            { value: 'id_asc', label: 'ID 升序' },
                            { value: 'id_desc', label: 'ID 降序' },
                            { value: 'name_asc', label: '名称 升序' },
                            { value: 'name_desc', label: '名称 降序' },
                            { value: 'status_asc', label: '状态 升序' },
                            { value: 'status_desc', label: '状态 降序' },
                            { value: 'pri_asc', label: '优先级 升序' },
                            { value: 'pri_desc', label: '优先级 降序' },
                        ],
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，不超过1000',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，从第1页开始',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'string',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activateBy,actualClosedDate,assignedTo,cancelBy,category,createdBy,createdDate,editedBy,editedDate,hangupBy,id,identifiedDate,impact,name,plannedClosedDate,prevention,pri,probability,project,rate,remedy,resolution,resolvedBy,source,status,strategy,trackedBy',
                    },
                    {
                        name: 'groupJoin',
                        required: false,
                        type: 'string',
                        description: '条件组之间的连接方式',
                        options: [
                            { value: 'and', label: 'and' },
                            { value: 'or', label: 'or' },
                        ],
                    },
                ],
                resultGetter: 'risks',
            }
        ],
    }
] satisfies readonly ModuleDefinition[];

/** 内置模块动作的精简类型索引，供 request() 名称/返回值推导使用。 */
export type BuiltinActionMeta = {
    user: {
        list: { resultType: 'list' };
        create: { resultType: 'object' };
        get: { resultType: 'object' };
        update: { resultType: 'object' };
        delete: { resultType: 'text' };
    };
    program: {
        list: { resultType: 'list' };
        create: { resultType: 'object' };
        get: { resultType: 'object' };
        update: { resultType: 'object' };
        delete: { resultType: 'text' };
    };
    product: {
        list: { resultType: 'list' };
        programProducts: { resultType: 'list' };
        create: { resultType: 'object' };
        close: { resultType: 'text' };
        createStoryModule: { resultType: 'object' };
        createBugModule: { resultType: 'object' };
        createTestcaseModule: { resultType: 'object' };
        get: { resultType: 'object' };
        update: { resultType: 'object' };
        delete: { resultType: 'text' };
    };
    project: {
        list: { resultType: 'list' };
        programProjects: { resultType: 'list' };
        team: { resultType: 'list' };
        projectMembers: { resultType: 'list' };
        create: { resultType: 'object' };
        close: { resultType: 'text' };
        createStory: { resultType: 'object' };
        createBug: { resultType: 'object' };
        createTask: { resultType: 'object' };
        update: { resultType: 'object' };
        delete: { resultType: 'text' };
        members: { resultType: 'text' };
    };
    execution: {
        list: { resultType: 'list' };
        projectExecutions: { resultType: 'list' };
        team: { resultType: 'list' };
        executionMembers: { resultType: 'list' };
        create: { resultType: 'object' };
        close: { resultType: 'text' };
        createTaskModule: { resultType: 'object' };
        get: { resultType: 'object' };
        update: { resultType: 'object' };
        delete: { resultType: 'text' };
        members: { resultType: 'text' };
    };
    productplan: {
        list: { resultType: 'list' };
        create: { resultType: 'object' };
        get: { resultType: 'object' };
        update: { resultType: 'object' };
        delete: { resultType: 'text' };
    };
    story: {
        list: { resultType: 'list' };
        modules: { resultType: 'list' };
        create: { resultType: 'object' };
        get: { resultType: 'object' };
        update: { resultType: 'object' };
        updateModule: { resultType: 'object' };
        delete: { resultType: 'text' };
        deleteModule: { resultType: 'text' };
        activate: { resultType: 'text' };
        change: { resultType: 'text' };
        close: { resultType: 'text' };
    };
    epic: {
        list: { resultType: 'list' };
        create: { resultType: 'object' };
        get: { resultType: 'object' };
        update: { resultType: 'object' };
        delete: { resultType: 'text' };
        activate: { resultType: 'text' };
        change: { resultType: 'text' };
        close: { resultType: 'text' };
    };
    requirement: {
        list: { resultType: 'list' };
        create: { resultType: 'object' };
        get: { resultType: 'object' };
        update: { resultType: 'object' };
        delete: { resultType: 'text' };
        activate: { resultType: 'text' };
        change: { resultType: 'text' };
        close: { resultType: 'text' };
    };
    bug: {
        list: { resultType: 'list' };
        modules: { resultType: 'list' };
        create: { resultType: 'object' };
        get: { resultType: 'object' };
        update: { resultType: 'object' };
        updateModule: { resultType: 'object' };
        delete: { resultType: 'text' };
        deleteModule: { resultType: 'text' };
        activate: { resultType: 'text' };
        close: { resultType: 'text' };
        confirm: { resultType: 'text' };
        resolve: { resultType: 'text' };
    };
    testcase: {
        list: { resultType: 'list' };
        modules: { resultType: 'list' };
        create: { resultType: 'object' };
        get: { resultType: 'object' };
        update: { resultType: 'object' };
        updateModule: { resultType: 'object' };
        delete: { resultType: 'text' };
        deleteModule: { resultType: 'text' };
    };
    task: {
        list: { resultType: 'list' };
        modules: { resultType: 'list' };
        create: { resultType: 'object' };
        get: { resultType: 'object' };
        update: { resultType: 'object' };
        updateModule: { resultType: 'object' };
        delete: { resultType: 'text' };
        deleteModule: { resultType: 'text' };
        activate: { resultType: 'text' };
        close: { resultType: 'text' };
        finish: { resultType: 'text' };
        start: { resultType: 'text' };
    };
    issue: {
        list: { resultType: 'list' };
        projectIssues: { resultType: 'list' };
        executionIssues: { resultType: 'list' };
        create: { resultType: 'object' };
        get: { resultType: 'object' };
    };
    risk: {
        list: { resultType: 'list' };
        projectRisks: { resultType: 'list' };
        executionRisks: { resultType: 'list' };
        create: { resultType: 'object' };
        get: { resultType: 'object' };
        update: { resultType: 'object' };
    };
    meeting: {
        list: { resultType: 'list' };
        projectMeetings: { resultType: 'list' };
        executionMeetings: { resultType: 'list' };
        create: { resultType: 'object' };
        get: { resultType: 'object' };
        update: { resultType: 'object' };
        delete: { resultType: 'text' };
        minutes: { resultType: 'text' };
    };
    feedback: {
        list: { resultType: 'list' };
        create: { resultType: 'object' };
        createBug: { resultType: 'object' };
        createTicket: { resultType: 'object' };
        createTodo: { resultType: 'object' };
        createStory: { resultType: 'object' };
        createTask: { resultType: 'object' };
        get: { resultType: 'object' };
        update: { resultType: 'object' };
        delete: { resultType: 'text' };
        activate: { resultType: 'text' };
        close: { resultType: 'text' };
    };
    ticket: {
        list: { resultType: 'list' };
        create: { resultType: 'object' };
        createStory: { resultType: 'object' };
        createBug: { resultType: 'object' };
        get: { resultType: 'object' };
        update: { resultType: 'object' };
        delete: { resultType: 'text' };
        activate: { resultType: 'text' };
        close: { resultType: 'text' };
    };
    system: {
        list: { resultType: 'list' };
        create: { resultType: 'object' };
        update: { resultType: 'object' };
    };
    build: {
        list: { resultType: 'list' };
        create: { resultType: 'object' };
        update: { resultType: 'object' };
        delete: { resultType: 'text' };
    };
    testtask: {
        list: { resultType: 'list' };
        create: { resultType: 'object' };
        update: { resultType: 'object' };
        delete: { resultType: 'text' };
    };
    release: {
        list: { resultType: 'list' };
        create: { resultType: 'object' };
        update: { resultType: 'object' };
        delete: { resultType: 'text' };
    };
    file: {
        create: { resultType: 'object' };
        update: { resultType: 'object' };
        delete: { resultType: 'text' };
    };
    workflow: {
        list: { resultType: 'list' };
        getContract: { resultType: 'object' };
        create: { resultType: 'object' };
        update: { resultType: 'object' };
        delete: { resultType: 'text' };
    };
    doc: {
        mySpaces: { resultType: 'list' };
        teamSpaces: { resultType: 'list' };
        productSpaces: { resultType: 'list' };
        projectSpaces: { resultType: 'list' };
        myLibs: { resultType: 'list' };
        teamLibs: { resultType: 'list' };
        productLibs: { resultType: 'list' };
        projectLibs: { resultType: 'list' };
        myDocs: { resultType: 'list' };
        teamDocs: { resultType: 'list' };
        productDocs: { resultType: 'list' };
        projectDocs: { resultType: 'list' };
        myModules: { resultType: 'list' };
        teamModules: { resultType: 'list' };
        productModules: { resultType: 'list' };
        projectModules: { resultType: 'list' };
        createMySpace: { resultType: 'object' };
        createTeamSpace: { resultType: 'object' };
        createMyLib: { resultType: 'object' };
        createTeamLib: { resultType: 'object' };
        createProductLib: { resultType: 'object' };
        createProjectLib: { resultType: 'object' };
        createMyDoc: { resultType: 'object' };
        createTeamDoc: { resultType: 'object' };
        createProductDoc: { resultType: 'object' };
        createProjectDoc: { resultType: 'object' };
        createMyModule: { resultType: 'object' };
        createTeamModule: { resultType: 'object' };
        createProductModule: { resultType: 'object' };
        createProjectModule: { resultType: 'object' };
        getSpace: { resultType: 'object' };
        getLib: { resultType: 'object' };
        get: { resultType: 'object' };
        updateSpace: { resultType: 'object' };
        updateLib: { resultType: 'object' };
        update: { resultType: 'object' };
        updateModule: { resultType: 'object' };
        deleteSpace: { resultType: 'text' };
        deleteLib: { resultType: 'text' };
        delete: { resultType: 'text' };
        deleteModule: { resultType: 'text' };
    };
    todo: {
        create: { resultType: 'object' };
        update: { resultType: 'object' };
        delete: { resultType: 'text' };
    };
    my: {
        todos: { resultType: 'list' };
        tasks: { resultType: 'list' };
        bugs: { resultType: 'list' };
        stories: { resultType: 'list' };
        epics: { resultType: 'list' };
        requirements: { resultType: 'list' };
        testtasks: { resultType: 'list' };
        projects: { resultType: 'list' };
        feedbacks: { resultType: 'list' };
        tickets: { resultType: 'list' };
        testcases: { resultType: 'list' };
        meetings: { resultType: 'list' };
        issues: { resultType: 'list' };
        risks: { resultType: 'list' };
    };
};
export type BuiltinModuleName = keyof BuiltinActionMeta;
