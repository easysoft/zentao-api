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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：realname(姓名，示例：admin)；email(邮箱，示例：关键字)；dept(部门，示例：all)；account(用户名，示例：admin)；role(职位，枚举：dev 研发 | qa 测试 | pm 项目经理 | po 产品经理 | td 研发主管 | pd 产品主管 | qd 测试主管 | top 高层管理 | others 其他)；phone(电话，示例：关键字)；visions(界面类型，枚举：rnd 研发综合界面 | lite 运营管理界面)；join(入职日期，示例：2026-01-01)；id(用户编号，示例：1)；commiter(源代码帐号，示例：all)；gender(性别，枚举：m 男 | f 女)；qq(QQ，示例：关键字)；skype(Skype，示例：关键字)；dingding(钉钉，示例：关键字)；weixin(微信，示例：关键字)；slack(Slack，示例：关键字)；whatsapp(WhatsApp，示例：关键字)；address(通讯地址，示例：关键字)；zipcode(邮编，示例：关键字)',
                        style: 'deepObject',
                        explode: true,
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "account": "productmanager",
                        "realname": "产品经理",
                        "password": "123Qwe!@#"
                    },
                },
            }, {
                name: 'get',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "realname": "技术经理",
                        "dept": "0",
                        "join": "2025-01-01",
                        "group": [
                            1
                        ],
                        "email": "test@test.com",
                        "visions": [
                            "rnd"
                        ],
                        "mobile": "13812345678",
                        "weixin": "15512345678",
                        "password": "P@ssw0rd"
                    },
                },
            }, {
                name: 'delete',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：name(项目集名称，示例：关键字)；PM(负责人，用户，示例：admin)；openedDate(创建时间，示例：2026-01-01)；status(状态，枚举：wait 未开始 | doing 进行中 | suspended 已挂起 | closed 已关闭)；openedBy(创建者，用户，示例：admin)；begin(计划开始，示例：2026-01-01)；end(计划完成，示例：2026-01-01)；realBegan(实际开始，示例：2026-01-01)；realEnd(实际完成，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(最后编辑日期，示例：2026-01-01)；desc(项目集描述，示例：关键字)',
                        style: 'deepObject',
                        explode: true,
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "name": "智能睡眠",
                        "begin": "2025-01-01",
                        "end": "2026-12-01",
                        "PM": "productManager",
                        "desc": "智能家居项目集"
                    },
                },
            }, {
                name: 'get',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "name": "智能家居",
                        "begin": "2025-01-01",
                        "end": "2026-12-01",
                        "PM": "productManager",
                        "desc": "智能家居项目集"
                    },
                },
            }, {
                name: 'delete',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "name": "智能头枕",
                        "program": 1,
                        "line": 0,
                        "type": "normal",
                        "PO": "normal",
                        "reviewer": [
                            "productManager"
                        ],
                        "desc": "智能健康头枕",
                        "QD": "productManager",
                        "RD": "productManager",
                        "acl": "open"
                    },
                },
            }, {
                name: 'close',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "name": "需求模块",
                        "parentID": "0"
                    },
                },
            }, {
                name: 'createBugModule',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "name": "Bug模块",
                        "parentID": "0"
                    },
                },
            }, {
                name: 'createTestcaseModule',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "name": "用例模块",
                        "parentID": "0"
                    },
                },
            }, {
                name: 'get',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "name": "智能照明",
                        "program": 1,
                        "line": 0,
                        "type": "normal",
                        "PO": "normal",
                        "reviewer": [
                            "productManager"
                        ],
                        "desc": "智能家庭照明",
                        "QD": "productManager",
                        "RD": "productManager",
                        "acl": "open"
                    },
                },
            }, {
                name: 'delete',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
        description: '项目管理，支持获取项目列表、获取项目集的项目列表、获取项目团队列表、获取项目成员列表、创建项目、关闭项目、创建项目需求、创建项目Bug、创建项目任务、创建项目风险、项目关联需求、修改项目、删除项目、维护项目成员',
        actions: [
            {
                name: 'list',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：name(项目名称，示例：关键字)；code(项目代号，示例：关键字)；id(项目ID，示例：1)；model(项目管理方式，枚举：scrum Scrum | waterfall 瀑布 | kanban 看板 | agileplus 融合敏捷 | waterfallplus 融合瀑布)；hasProduct(项目类型，枚举：1 产品型 | 0 项目型)；parent(所属项目集，示例：all)；status(状态，枚举：wait 未开始 | doing 进行中 | suspended 已挂起 | closed 已关闭 | delay 已延期)；desc(项目描述，示例：关键字)；PM(负责人，用户，示例：admin)；teamCount(人数，示例：关键字)；openedDate(创建日期，示例：2026-01-01)；begin(计划开始，示例：2026-01-01)；end(计划完成，示例：2026-01-01)；realBegan(实际开始，示例：2026-01-01)；realEnd(实际完成，示例：2026-01-01)；openedBy(由谁创建，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedDate(最后编辑日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)',
                        style: 'deepObject',
                        explode: true,
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                        type: 'number',
                        description: '项目ID',
                    },
                ],
            }, {
                name: 'projectMembers',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "name": "智能设备研发",
                        "model": "scrum",
                        "begin": "2025-01-01",
                        "end": "2026-10-01",
                        "products": [
                            1
                        ],
                        "parent": 1,
                        "workflowGroup": 13,
                        "PM": "projectManager"
                    },
                },
            }, {
                name: 'close',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "realEnd": "2026-10-16"
                    },
                },
            }, {
                name: 'createStory',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "productID": 1,
                        "title": "项目型项目的需求",
                        "spec": "需求描述",
                        "pri": 3,
                        "category": "feature",
                        "reviewer": [
                            "productManager"
                        ]
                    },
                },
            }, {
                name: 'createBug',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "productID": 1,
                        "title": "项目型项目的Bug",
                        "openedBuild": [
                            "trunk"
                        ],
                        "severity": 3,
                        "pri": 3,
                        "type": "codeerror"
                    },
                },
            }, {
                name: 'createTask',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "name": "无执行项目任务",
                        "executionID": 3,
                        "type": "devel",
                        "assignedTo": "admin",
                        "estStarted": "2026-01-01",
                        "deadline": "2026-01-10",
                        "pri": 1,
                        "estimate": 1,
                        "module": 0,
                        "story": 0
                    },
                },
            }, {
                name: 'createRisk',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '创建项目风险',
                type: 'create',
                method: 'post',
                path: '/projects/{projectID}/risks',
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
                                "description": "风险名称。"
                            },
                            "source": {
                                "type": "string",
                                "description": "风险来源。"
                            },
                            "execution": {
                                "type": "integer",
                                "description": "所属执行 ID，项目级风险传 0。",
                                "format": "int32"
                            },
                            "category": {
                                "type": "string",
                                "description": "风险类型。"
                            },
                            "strategy": {
                                "type": "string",
                                "description": "应对策略。"
                            },
                            "impact": {
                                "type": "integer",
                                "description": "影响程度，1-5。",
                                "format": "int32"
                            },
                            "probability": {
                                "type": "integer",
                                "description": "发生概率，1-5。",
                                "format": "int32"
                            },
                            "rate": {
                                "type": "integer",
                                "description": "风险系数，通常为 impact * probability。",
                                "format": "int32"
                            },
                            "pri": {
                                "type": "integer",
                                "description": "优先级，1 高、2 中、3 低。",
                                "format": "int32"
                            },
                            "identifiedDate": {
                                "type": "string",
                                "description": "识别日期。"
                            },
                            "plannedClosedDate": {
                                "type": "string",
                                "description": "计划关闭日期。"
                            },
                            "assignedTo": {
                                "type": "string",
                                "description": "指派人账号。"
                            },
                            "prevention": {
                                "type": "string",
                                "description": "应对措施。"
                            },
                            "remedy": {
                                "type": "string",
                                "description": "响应措施。"
                            }
                        },
                        "required": [
                            "name"
                        ]
                    },
                    example: {
                        "name": "API 创建风险",
                        "source": "business",
                        "execution": 0,
                        "category": "technical",
                        "strategy": "mitigation",
                        "impact": 3,
                        "probability": 3,
                        "rate": 9,
                        "pri": 2,
                        "identifiedDate": "2026-10-16",
                        "plannedClosedDate": "2026-11-05",
                        "assignedTo": "admin",
                        "prevention": "<p>提前识别并跟踪。</p>",
                        "remedy": "<p>出现风险后及时响应。</p>"
                    },
                },
            }, {
                name: 'linkStories',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '项目关联需求',
                type: 'action',
                method: 'post',
                path: '/projects/{projectID}/stories/link',
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
                            "stories": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "要关联到项目的需求 ID 列表。"
                            },
                            "storyType": {
                                "type": "string",
                                "description": "需求类型，默认 story；可按项目需求类型传 requirement、epic 等。"
                            }
                        },
                        "required": [
                            "stories"
                        ]
                    },
                    example: {
                        "stories": [
                            1
                        ],
                        "storyType": "story"
                    },
                },
            }, {
                name: 'update',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "name": "智能设备研发",
                        "model": "scrum",
                        "begin": "2025-01-01",
                        "end": "2026-10-01",
                        "products": [
                            1
                        ],
                        "parent": 1,
                        "workflowGroup": 13,
                        "PM": "projectManager"
                    },
                },
            }, {
                name: 'delete',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "account": [
                            "admin",
                            "dev1"
                        ],
                        "role": [
                            "PM",
                            "dev"
                        ],
                        "days": [
                            5,
                            3
                        ],
                        "hours": [
                            7,
                            7
                        ],
                        "limited": [
                            "no",
                            "no"
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
        description: '执行管理，支持获取执行列表、获取项目的执行列表、获取执行团队列表、获取执行成员列表、创建执行（迭代/阶段/看板）、关闭执行、创建执行的任务模块、执行关联需求、获取执行详情、修改执行、删除执行、维护执行成员',
        actions: [
            {
                name: 'list',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activatedDate,assignedDate,assignedTo,canceledBy,canceledDate,closedBy,closedDate,closedReason,consumed,deadline,desc,estStarted,estimate,execution,finishedBy,finishedDate,fromBug,id,keywords,lastEditedBy,lastEditedDate,left,mailto,module,name,openedBy,openedDate,pri,project,realStarted,status,story,type',
                        style: 'deepObject',
                        explode: true,
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                        type: 'number',
                        description: '执行ID',
                    },
                ],
            }, {
                name: 'executionMembers',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "project": 2,
                        "name": "智能设备研发3.1版本开发",
                        "type": "sprint",
                        "parent": 0,
                        "lifetime": "short",
                        "begin": "2026-01-01",
                        "end": "2026-01-21",
                        "days": 16,
                        "products": [
                            1
                        ],
                        "plans": {
                            "1": [
                                0
                            ]
                        },
                        "PO": "productManager",
                        "QD": "testManager",
                        "PM": "executionManager",
                        "RD": "productManager",
                        "acl": "open"
                    },
                },
            }, {
                name: 'close',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "realEnd": "2026-01-21"
                    },
                },
            }, {
                name: 'createTaskModule',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "name": "任务模块",
                        "parentID": "0"
                    },
                },
            }, {
                name: 'linkStories',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '执行关联需求',
                type: 'action',
                method: 'post',
                path: '/executions/{executionID}/stories/link',
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
                            "stories": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "要关联到执行的需求 ID 列表。"
                            },
                            "storyType": {
                                "type": "string",
                                "description": "需求类型，默认 story。"
                            }
                        },
                        "required": [
                            "stories"
                        ]
                    },
                    example: {
                        "stories": [
                            1
                        ],
                        "storyType": "story"
                    },
                },
            }, {
                name: 'get',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "project": 2,
                        "name": "智能设备研发3.2版本开发",
                        "lifetime": "short",
                        "begin": "2026-01-01",
                        "end": "2026-01-21",
                        "days": 16,
                        "products": [
                            1
                        ],
                        "plans": {
                            "1": [
                                1
                            ]
                        },
                        "PO": "productManager",
                        "QD": "testManager",
                        "PM": "executionManager",
                        "RD": "productManager",
                        "acl": "open"
                    },
                },
            }, {
                name: 'delete',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "account": [
                            "admin",
                            "dev1"
                        ],
                        "role": [
                            "PM",
                            "dev"
                        ],
                        "days": [
                            5,
                            3
                        ],
                        "hours": [
                            7,
                            7
                        ],
                        "limited": [
                            "no",
                            "no"
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：begin,branch,end,id,status,title',
                        style: 'deepObject',
                        explode: true,
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "productID": 1,
                        "title": "V1.0计划",
                        "parent": 0,
                        "begin": "2026-01-01",
                        "end": "2026-01-31",
                        "branchID": 1,
                        "desc": "初版计划"
                    },
                },
            }, {
                name: 'get',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "title": "V1.1计划",
                        "parent": 0,
                        "begin": "2026-01-01",
                        "end": "2026-01-31",
                        "branchID": 1,
                        "desc": "初版计划"
                    },
                },
            }, {
                name: 'delete',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                        description: '状态',
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(需求名称，示例：关键字)；id(编号，示例：1)；keywords(关键词，示例：关键字)；status(当前状态，枚举：draft 草稿 | reviewing 评审中 | active 激活 | changing 变更中 | closed 已关闭)；pri(优先级，枚举：1 | 2 | 3 | 4)；module(所属模块，示例：all)；stage(所处阶段，枚举：wait 未开始 | planned 已计划 | projected 研发立项 | designing 设计中 | designed 设计完毕 | developing 研发中 | developed 研发完毕 | testing 测试中 | tested 测试完毕 | verified 已验收 | rejected 验收失败 | delivering 交付中 | delivered 已交付 | released 已发布 | closed 已关闭)；product(所属产品，示例：all)；branch(branch，示例：all)；grade(需求层级，示例：all)；plan(所属计划，示例：all)；release(所属发布，示例：all)；estimate(预计小时，示例：关键字)；source(来源，枚举：customer 客户 | user 用户 | po 产品经理 | market 市场 | service 客服 | operation 运营 | support 技术支持 | competitor 竞争对手 | partner 合作伙伴 | dev 开发人员 | tester 测试人员 | bug Bug | forum 论坛 | other 其他)；sourceNote(来源备注，示例：关键字)；fromBug(来源Bug，示例：关键字)；category(类别，枚举：feature 功能 | interface 接口 | performance 性能 | safe 安全 | experience 体验 | improve 改进 | other 其他)；openedBy(由谁创建，用户，示例：admin)；reviewedBy(已评审人，用户，示例：admin)；result(评审结果，枚举：pass 确认通过 | revert 撤销变更 | clarify 有待明确 | reject 拒绝)；assignedTo(指派给，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedBy(最后修改，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；closedReason(关闭原因，枚举：done 已完成 | subdivided 已拆分 | duplicate 重复 | postponed 延期 | willnotdo 不做 | cancel 已取消 | bydesign 设计如此)；version(版本号，示例：关键字)；openedDate(创建日期，示例：2026-01-01)；reviewedDate(评审时间，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(最后修改日期，示例：2026-01-01)；activatedDate(激活日期，示例：2026-01-01)',
                        style: 'deepObject',
                        explode: true,
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "productID": 1,
                        "title": "智能头枕的压敏单元设计",
                        "pri": 3,
                        "module": 0,
                        "parent": 0,
                        "estimate": 1,
                        "category": "feature",
                        "source": "customer",
                        "assignedTo": "admin",
                        "reviewer": [
                            "productManager"
                        ],
                        "project": 2,
                        "execution": 0
                    },
                },
            }, {
                name: 'get',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "title": "智能照明的光敏单元设计",
                        "pri": 3,
                        "module": 0,
                        "parent": 0,
                        "estimate": 1,
                        "category": "feature",
                        "source": "customer",
                        "assignedTo": "admin"
                    },
                },
            }, {
                name: 'updateModule',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "name": "需求新模块",
                        "parent": "0"
                    },
                },
            }, {
                name: 'delete',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "assignedTo": "admin"
                    },
                },
            }, {
                name: 'change',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "title": "智能照明的定时",
                        "reviewer": [
                            "admin"
                        ],
                        "spec": "描述",
                        "verify": "验收标准"
                    },
                },
            }, {
                name: 'close',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "closedReason": "done"
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(需求名称，示例：关键字)；id(编号，示例：1)；keywords(关键词，示例：关键字)；status(当前状态，枚举：draft 草稿 | reviewing 评审中 | active 激活 | changing 变更中 | closed 已关闭)；pri(优先级，枚举：1 | 2 | 3 | 4)；module(所属模块，示例：all)；stage(所处阶段，枚举：wait 未开始 | planned 已计划 | projected 研发立项 | designing 设计中 | designed 设计完毕 | developing 研发中 | developed 研发完毕 | testing 测试中 | tested 测试完毕 | verified 已验收 | rejected 验收失败 | delivering 交付中 | delivered 已交付 | released 已发布 | closed 已关闭)；product(所属产品，示例：all)；branch(branch，示例：all)；grade(需求层级，示例：all)；plan(所属计划，示例：all)；release(所属发布，示例：all)；estimate(预计小时，示例：关键字)；source(来源，枚举：customer 客户 | user 用户 | po 产品经理 | market 市场 | service 客服 | operation 运营 | support 技术支持 | competitor 竞争对手 | partner 合作伙伴 | dev 开发人员 | tester 测试人员 | bug Bug | forum 论坛 | other 其他)；sourceNote(来源备注，示例：关键字)；fromBug(来源Bug，示例：关键字)；category(类别，枚举：feature 功能 | interface 接口 | performance 性能 | safe 安全 | experience 体验 | improve 改进 | other 其他)；openedBy(由谁创建，用户，示例：admin)；reviewedBy(已评审人，用户，示例：admin)；result(评审结果，枚举：pass 确认通过 | revert 撤销变更 | clarify 有待明确 | reject 拒绝)；assignedTo(指派给，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedBy(最后修改，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；closedReason(关闭原因，枚举：done 已完成 | subdivided 已拆分 | duplicate 重复 | postponed 延期 | willnotdo 不做 | cancel 已取消 | bydesign 设计如此)；version(版本号，示例：关键字)；openedDate(创建日期，示例：2026-01-01)；reviewedDate(评审时间，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(最后修改日期，示例：2026-01-01)；activatedDate(激活日期，示例：2026-01-01)',
                        style: 'deepObject',
                        explode: true,
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "productID": 1,
                        "title": "智能头枕颈椎检测",
                        "pri": 3,
                        "module": 0,
                        "parent": 0,
                        "estimate": 1,
                        "category": "feature",
                        "source": "customer",
                        "assignedTo": "admin",
                        "reviewer": [
                            "productManager"
                        ]
                    },
                },
            }, {
                name: 'get',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "title": "智能头枕颈椎检测",
                        "pri": 3,
                        "module": 0,
                        "parent": 0,
                        "estimate": 1,
                        "category": "feature",
                        "source": "customer",
                        "assignedTo": "admin"
                    },
                },
            }, {
                name: 'delete',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "assignedTo": "admin"
                    },
                },
            }, {
                name: 'change',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "title": "智能头枕颈椎检测",
                        "reviewer": [
                            "admin"
                        ],
                        "spec": "描述",
                        "verify": "验收标准"
                    },
                },
            }, {
                name: 'close',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "closedReason": "done"
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(需求名称，示例：关键字)；id(编号，示例：1)；keywords(关键词，示例：关键字)；status(当前状态，枚举：draft 草稿 | reviewing 评审中 | active 激活 | changing 变更中 | closed 已关闭)；pri(优先级，枚举：1 | 2 | 3 | 4)；module(所属模块，示例：all)；stage(所处阶段，枚举：wait 未开始 | planned 已计划 | projected 研发立项 | designing 设计中 | designed 设计完毕 | developing 研发中 | developed 研发完毕 | testing 测试中 | tested 测试完毕 | verified 已验收 | rejected 验收失败 | delivering 交付中 | delivered 已交付 | released 已发布 | closed 已关闭)；product(所属产品，示例：all)；branch(branch，示例：all)；grade(需求层级，示例：all)；plan(所属计划，示例：all)；release(所属发布，示例：all)；estimate(预计小时，示例：关键字)；source(来源，枚举：customer 客户 | user 用户 | po 产品经理 | market 市场 | service 客服 | operation 运营 | support 技术支持 | competitor 竞争对手 | partner 合作伙伴 | dev 开发人员 | tester 测试人员 | bug Bug | forum 论坛 | other 其他)；sourceNote(来源备注，示例：关键字)；fromBug(来源Bug，示例：关键字)；category(类别，枚举：feature 功能 | interface 接口 | performance 性能 | safe 安全 | experience 体验 | improve 改进 | other 其他)；openedBy(由谁创建，用户，示例：admin)；reviewedBy(已评审人，用户，示例：admin)；result(评审结果，枚举：pass 确认通过 | revert 撤销变更 | clarify 有待明确 | reject 拒绝)；assignedTo(指派给，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedBy(最后修改，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；closedReason(关闭原因，枚举：done 已完成 | subdivided 已拆分 | duplicate 重复 | postponed 延期 | willnotdo 不做 | cancel 已取消 | bydesign 设计如此)；version(版本号，示例：关键字)；openedDate(创建日期，示例：2026-01-01)；reviewedDate(评审时间，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(最后修改日期，示例：2026-01-01)；activatedDate(激活日期，示例：2026-01-01)',
                        style: 'deepObject',
                        explode: true,
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "productID": 1,
                        "title": "智能头枕的颈椎保护",
                        "pri": 3,
                        "module": 0,
                        "parent": 0,
                        "estimate": 1,
                        "category": "feature",
                        "source": "customer",
                        "assignedTo": "admin",
                        "reviewer": [
                            "productManager"
                        ]
                    },
                },
            }, {
                name: 'get',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "title": "智能头枕的颈椎保护",
                        "pri": 3,
                        "module": 0,
                        "parent": 0,
                        "estimate": 1,
                        "category": "feature",
                        "source": "customer",
                        "assignedTo": "admin"
                    },
                },
            }, {
                name: 'delete',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "assignedTo": "admin"
                    },
                },
            }, {
                name: 'change',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                            },
                            "reviewer": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "评审人员，产品开启评审时必填"
                            }
                        }
                    },
                    example: {
                        "title": "智能头枕的颈椎保护",
                        "spec": "描述",
                        "verify": "验收标准",
                        "reviewer": [
                            "admin"
                        ]
                    },
                },
            }, {
                name: 'close',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "closedReason": "done"
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                        description: '状态',
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(Bug标题，示例：关键字)；module(所属模块，模块，示例：0)；keywords(关键词，示例：关键字)；steps(重现步骤，示例：关键字)；assignedTo(指派给，用户，示例：admin)；resolvedBy(解决者，用户，示例：admin)；status(Bug状态，枚举：active 激活 | resolved 已解决 | closed 已关闭)；confirmed(是否确认，枚举：1 已确认 | 0 未确认)；story(相关需求，示例：关键字)；project(所属项目，示例：all)；product(所属产品，示例：all)；branch(branch，示例：all)；plan(所属计划，示例：all)；id(Bug编号，示例：1)；execution(所属执行，执行，示例：3)；severity(严重程度，枚举：1 | 2 | 3 | 4)；pri(优先级，枚举：1 | 2 | 3 | 4)；type(Bug类型，枚举：codeerror 代码错误 | config 配置相关 | install 安装部署 | security 安全相关 | performance 性能问题 | standard 标准规范 | automation 测试脚本 | designdefect 设计缺陷 | codeimprovement 代码改进 | others 其他)；os(操作系统，枚举：all 全部 | windows Windows | win11 Windows 11 | win10 Windows 10 | win8 Windows 8 | win7 Windows 7 | winxp Windows XP | osx Mac OS | android Android | ios IOS | linux Linux | ubuntu Ubuntu | chromeos Chrome OS | fedora Fedora | unix Unix | others 其他)；browser(浏览器，枚举：all 全部 | chrome Chrome | edge Edge | ie IE系列 | ie11 IE11 | ie10 IE10 | ie9 IE9 | ie8 IE8 | firefox firefox系列 | opera Opera系列 | safari | 360 360浏览器 | qq QQ浏览器 | other 其他)；resolution(解决方案，枚举：bydesign 设计如此 | duplicate 重复Bug | external 外部原因 | fixed 已解决 | notrepro 无法重现 | postponed 延期处理 | willnotfix 不予解决 | tostory 转为用户故事)；activatedCount(激活次数，示例：关键字)；toTask(转任务，示例：关键字)；toStory(转用户故事，示例：关键字)；openedBy(由谁创建，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedBy(修改者，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；openedBuild(影响版本，示例：builds)；resolvedBuild(解决版本，示例：builds)；openedDate(创建日期，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；resolvedDate(解决日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(修改日期，示例：2026-01-01)；deadline(截止日期，示例：2026-01-01)；activatedDate(激活时间，示例：2026-01-01)',
                        style: 'deepObject',
                        explode: true,
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "productID": 1,
                        "title": "压敏元件显示错误",
                        "openedBuild": [
                            "trunk"
                        ],
                        "project": 2,
                        "execution": 3,
                        "severity": 3,
                        "pri": 3,
                        "type": "codeerror",
                        "steps": "[步骤] [结果] [期望]",
                        "story": 0,
                        "assignedTo": "admin"
                    },
                },
            }, {
                name: 'get',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "title": "光敏元件显示错误",
                        "severity": 3,
                        "pri": 3,
                        "type": "codeerror",
                        "openedBuild": [
                            "trunk"
                        ],
                        "steps": "[步骤] [结果] [期望]",
                        "project": 2,
                        "execution": 3,
                        "story": 0,
                        "assignedTo": "admin"
                    },
                },
            }, {
                name: 'updateModule',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "name": "Bug新模块",
                        "parent": "0"
                    },
                },
            }, {
                name: 'delete',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "openedBuild": [
                            "trunk"
                        ],
                        "assignedTo": "admin"
                    },
                },
            }, {
                name: 'close',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "assignedTo": "admin",
                        "type": "codeerror",
                        "pri": 3,
                        "deadline": "2025-12-12",
                        "mailto": [
                            "admin"
                        ]
                    },
                },
            }, {
                name: 'resolve',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "resolution": "fixed",
                        "resolvedDate": "2025-12-12",
                        "resolvedBuild": "trunk",
                        "assignedTo": "admin"
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(用例名称，示例：关键字)；story(关联需求，示例：all)；id(用例编号，示例：1)；keywords(关键词，示例：关键字)；lastEditedBy(修改者，用户，示例：admin)；type(用例类型，枚举：unit 单元测试 | interface 接口测试 | feature 功能测试 | install 安装部署 | config 配置相关 | performance 性能测试 | security 安全相关 | other 其他)；auto(自动化，枚举：auto 是 | no 否)；openedBy(由谁创建，用户，示例：admin)；status(用例状态，枚举：wait 待评审 | normal 正常 | blocked 被阻塞 | investigate 研究中)；product(所属产品，示例：all)；branch(branch，示例：all)；stage(适用环节，枚举：unittest 单元测试环节 | feature 功能测试环节 | intergrate 集成测试环节 | system 系统测试环节 | smoke 冒烟测试环节 | bvt 版本验证环节)；module(所属模块，模块，示例：0)；pri(优先级，枚举：3 | 1 | 2 | 4)；lib(所属库，示例：all)；lastRunner(执行人，用户，示例：admin)；lastRunResult(结果，枚举：pass 通过 | fail 失败 | blocked 阻塞 | null 未执行)；lastRunDate(执行时间，示例：2026-01-01)；openedDate(创建日期，示例：2026-01-01)；lastEditedDate(修改日期，示例：2026-01-01)；scene(所属场景，示例：all)',
                        style: 'deepObject',
                        explode: true,
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "productID": 1,
                        "title": "测试压敏模块显示是否正常",
                        "module": 0,
                        "story": 0,
                        "pri": 3,
                        "type": "feature",
                        "steps": [
                            "步骤1",
                            "步骤2"
                        ],
                        "expects": [
                            "期望1",
                            "期望2"
                        ],
                        "stepType": [
                            "step",
                            "step"
                        ],
                        "project": 2,
                        "execution": 3
                    },
                },
            }, {
                name: 'get',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "title": "测试光敏模块显示是否正常",
                        "module": 0,
                        "story": 0,
                        "pri": 3,
                        "type": "feature",
                        "steps": [
                            "步骤1",
                            "步骤2"
                        ],
                        "expects": [
                            "期望1",
                            "期望2"
                        ],
                        "stepType": [
                            "step",
                            "step"
                        ]
                    },
                },
            }, {
                name: 'updateModule',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "name": "用例新模块",
                        "parent": "0"
                    },
                },
            }, {
                name: 'delete',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "name": "开发电容压力监测模块",
                        "executionID": 3,
                        "type": "devel",
                        "assignedTo": "admin",
                        "estStarted": "2025-12-25",
                        "deadline": "2025-12-30",
                        "pri": 1,
                        "estimate": 1,
                        "module": 1,
                        "story": 1
                    },
                },
            }, {
                name: 'get',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "name": "开发电容光敏监测模块",
                        "type": "devel",
                        "assignedTo": "admin",
                        "estStarted": "2025-12-25",
                        "deadline": "2025-12-30",
                        "pri": 1,
                        "estimate": 1,
                        "module": 1,
                        "story": 1
                    },
                },
            }, {
                name: 'updateModule',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "name": "任务新模块",
                        "parent": "0"
                    },
                },
            }, {
                name: 'delete',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "left": 1,
                        "assignedTo": "admin"
                    },
                },
            }, {
                name: 'close',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "currentConsumed": 1,
                        "assignedTo": "admin",
                        "consumed": 1,
                        "realStarted": "2025-12-25 09:00:00",
                        "finishedDate": "2025-12-30 17:30:00"
                    },
                },
            }, {
                name: 'start',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "assignedTo": "admin",
                        "realStarted": "2025-12-26 09:00:00",
                        "consumed": 1,
                        "left": 1
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：assignedDate,assignedTo,closedBy,closedDate,createdBy,createdDate,editedBy,editedDate,execution,id,pri,project,severity,status,title,type',
                        style: 'deepObject',
                        explode: true,
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：assignedDate,assignedTo,closedBy,closedDate,createdBy,createdDate,editedBy,editedDate,execution,id,pri,project,severity,status,title,type',
                        style: 'deepObject',
                        explode: true,
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：assignedDate,assignedTo,closedBy,closedDate,createdBy,createdDate,editedBy,editedDate,execution,id,pri,project,severity,status,title,type',
                        style: 'deepObject',
                        explode: true,
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "objectID": 2,
                        "from": 0,
                        "title": "关键路径延期",
                        "type": "design",
                        "severity": 3,
                        "pri": 3,
                        "execution": 3,
                        "assignedTo": "admin",
                        "owner": "admin",
                        "deadline": "2026-03-01"
                    },
                },
            }, {
                name: 'get',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activateBy,actualClosedDate,assignedTo,cancelBy,category,createdBy,createdDate,editedBy,editedDate,hangupBy,id,identifiedDate,impact,name,plannedClosedDate,prevention,pri,probability,project,rate,remedy,resolution,resolvedBy,source,status,strategy,trackedBy',
                        style: 'deepObject',
                        explode: true,
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activateBy,actualClosedDate,assignedTo,cancelBy,category,createdBy,createdDate,editedBy,editedDate,hangupBy,id,identifiedDate,impact,name,plannedClosedDate,prevention,pri,probability,project,rate,remedy,resolution,resolvedBy,source,status,strategy,trackedBy',
                        style: 'deepObject',
                        explode: true,
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activateBy,actualClosedDate,assignedTo,cancelBy,category,createdBy,createdDate,editedBy,editedDate,hangupBy,id,identifiedDate,impact,name,plannedClosedDate,prevention,pri,probability,project,rate,remedy,resolution,resolvedBy,source,status,strategy,trackedBy',
                        style: 'deepObject',
                        explode: true,
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "project": 2,
                        "name": "关键路径延期",
                        "execution": 3,
                        "source": "business",
                        "category": "technical",
                        "strategy": "avoidance",
                        "impact": 3,
                        "probability": 3,
                        "rate": 9,
                        "pri": 2,
                        "identifiedDate": "2026-01-01",
                        "plannedClosedDate": "2026-03-01",
                        "assignedTo": "admin"
                    },
                },
            }, {
                name: 'get',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "name": "关键路径延期",
                        "source": "business",
                        "category": "technical",
                        "strategy": "avoidance",
                        "impact": 3,
                        "probability": 3,
                        "rate": 9,
                        "pri": 2,
                        "identifiedDate": "2026-01-01",
                        "plannedClosedDate": "2026-03-01",
                        "assignedTo": "admin"
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：begin,createdBy,createdDate,date,dept,editedBy,editedDate,end,execution,host,id,minutedBy,minutedDate,mode,name,project,room',
                        style: 'deepObject',
                        explode: true,
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：begin,createdBy,createdDate,date,dept,editedBy,editedDate,end,execution,host,id,minutedBy,minutedDate,mode,name,project,room',
                        style: 'deepObject',
                        explode: true,
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：begin,createdBy,createdDate,date,dept,editedBy,editedDate,end,execution,host,id,minutedBy,minutedDate,mode,name,project,room',
                        style: 'deepObject',
                        explode: true,
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "project": 2,
                        "execution": 3,
                        "name": "项目周会",
                        "begin": "2026-10-17 09:00",
                        "end": "2026-10-17 10:00",
                        "mode": "online",
                        "host": "admin",
                        "participant": [
                            "admin"
                        ],
                        "room": 0,
                        "dept": 0,
                        "objectID": 0
                    },
                },
            }, {
                name: 'get',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "name": "项目周会",
                        "begin": "2026-10-17 09:30",
                        "end": "2026-10-17 10:30",
                        "mode": "online",
                        "host": "admin",
                        "participant": [
                            "admin"
                        ],
                        "room": 0,
                        "dept": 0,
                        "objectID": 0
                    },
                },
            }, {
                name: 'delete',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "minutes": "会议纪要内容"
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activatedBy,activatedDate,assignedTo,closedBy,closedDate,closedReason,desc,feedbackBy,id,keywords,mailto,module,notifyEmail,openedBy,openedDate,pri,processedBy,processedDate,product,public,reviewedBy,solution,source,status,title,type',
                        style: 'deepObject',
                        explode: true,
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "product": 1,
                        "title": "电容压力监测灵敏度不够",
                        "module": 0,
                        "type": "story",
                        "desc": "监测灵敏度不够",
                        "feedbackBy": "客户对接人",
                        "source": "XX技术有限公司"
                    },
                },
            }, {
                name: 'createBug',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "productID": 1,
                        "title": "从反馈创建的Bug",
                        "openedBuild": [
                            "trunk"
                        ],
                        "severity": 3,
                        "pri": 3,
                        "type": "codeerror",
                        "steps": "反馈转Bug"
                    },
                },
            }, {
                name: 'createTicket',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "product": 1,
                        "module": 1,
                        "title": "从反馈创建的工单",
                        "type": "code",
                        "desc": "反馈转工单"
                    },
                },
            }, {
                name: 'createTodo',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "date": "2026-10-16",
                        "name": "从反馈创建的待办"
                    },
                },
            }, {
                name: 'createStory',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "productID": 1,
                        "title": "从反馈创建的需求",
                        "spec": "反馈转需求",
                        "pri": 3,
                        "category": "feature"
                    },
                },
            }, {
                name: 'createTask',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "executionID": 3,
                        "name": "从反馈创建的任务",
                        "type": "devel",
                        "assignedTo": "admin",
                        "estStarted": "2026-01-01",
                        "deadline": "2026-01-10",
                        "desc": "反馈转任务"
                    },
                },
            }, {
                name: 'get',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "product": 1,
                        "module": 0,
                        "title": "光敏元件灵敏度不够",
                        "type": "story",
                        "desc": "监测灵敏度不够",
                        "feedbackBy": "客户对接人",
                        "source": "XX技术有限公司"
                    },
                },
            }, {
                name: 'delete',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "assignedTo": "admin"
                    },
                },
            }, {
                name: 'close',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "closedReason": "done",
                        "confirmClose": "yes"
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activatedBy,activatedCount,activatedDate,assignedTo,closedBy,closedDate,closedReason,contact,customer,deadline,desc,editedBy,editedDate,feedback,id,keywords,mailto,module,notifyEmail,openedBuild,openedBy,openedDate,pri,product,resolution,resolvedBy,resolvedDate,startedBy,startedDate,status,title,type',
                        style: 'deepObject',
                        explode: true,
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "product": 1,
                        "module": 1,
                        "title": "电容压力监测灵敏度不够",
                        "type": "code",
                        "desc": "监测灵敏度不够",
                        "assignedTo": "admin",
                        "deadline": "2026-01-10",
                        "openedBuild": [
                            "trunk"
                        ]
                    },
                },
            }, {
                name: 'createStory',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "productID": 1,
                        "title": "从工单创建的需求",
                        "spec": "工单转需求",
                        "pri": 3,
                        "category": "feature"
                    },
                },
            }, {
                name: 'createBug',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "productID": 1,
                        "title": "从工单创建的Bug",
                        "openedBuild": [
                            "trunk"
                        ],
                        "severity": 3,
                        "pri": 3,
                        "type": "codeerror",
                        "steps": "工单转Bug"
                    },
                },
            }, {
                name: 'get',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "product": 1,
                        "module": 1,
                        "title": "电容压力监测灵敏度不够",
                        "type": "code",
                        "desc": "监测灵敏度不够",
                        "assignedTo": "admin",
                        "deadline": "2026-01-10",
                        "openedBuild": [
                            "trunk"
                        ]
                    },
                },
            }, {
                name: 'delete',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "assignedTo": "admin"
                    },
                },
            }, {
                name: 'close',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "closedReason": "done"
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "productID": 1,
                        "integrated": 0,
                        "children": [],
                        "name": "smart-20261016055323",
                        "desc": "smart-20261016055323"
                    },
                },
            }, {
                name: 'update',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "name": "smart-20261016055323-updated",
                        "children": [],
                        "desc": "smart-20261016055323-updated"
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：name(名称，示例：关键字)；system(所属应用，示例：all)；id(ID，示例：1)；product(所属产品，产品，示例：1)；scmPath(源代码地址，示例：关键字)；filePath(下载地址，示例：关键字)；date(打包日期，示例：2026-01-01)；builder(构建者，用户，示例：admin)；desc(描述，示例：关键字)',
                        style: 'deepObject',
                        explode: true,
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "executionID": 3,
                        "product": 1,
                        "name": "v1.0",
                        "system": 1,
                        "builder": "admin",
                        "date": "2026-01-01",
                        "scmPath": "http://test.com/git",
                        "filePath": "http://test.com/download",
                        "desc": "test"
                    },
                },
            }, {
                name: 'update',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "execution": 3,
                        "product": 1,
                        "name": "版本v1.0",
                        "system": 1,
                        "builder": "admin",
                        "date": "2026-01-01",
                        "scmPath": "http://test.com/git",
                        "filePath": "http://test.com/download",
                        "desc": "test"
                    },
                },
            }, {
                name: 'delete',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "productID": 1,
                        "name": "智能家居V1.0测试单",
                        "build": 1,
                        "execution": 3,
                        "type": [
                            "integrate"
                        ],
                        "owner": "admin",
                        "status": "wait",
                        "begin": "2026-01-01",
                        "end": "2026-02-01",
                        "desc": "test"
                    },
                },
            }, {
                name: 'update',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "name": "智能家居V1.0测试单",
                        "build": 1,
                        "execution": 3,
                        "type": [
                            "integrate"
                        ],
                        "owner": "admin",
                        "status": "wait",
                        "begin": "2026-01-01",
                        "end": "2026-02-01",
                        "desc": "test"
                    },
                },
            }, {
                name: 'delete',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：name(应用版本号，示例：关键字)；branch(平台/分支，示例：all)；id(ID，示例：1)；build(包含构建，示例：all)；status(发布状态，枚举：wait 未开始 | normal 已发布 | fail 发布失败 | terminate 停止维护)；date(计划发布日期，示例：2026-01-01)；marker(里程碑，枚举：1 是 | 0 否)',
                        style: 'deepObject',
                        explode: true,
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "productID": 1,
                        "system": 1,
                        "name": "v1",
                        "build": [
                            1
                        ],
                        "status": "wait",
                        "date": "2026-02-10",
                        "desc": "release 1.0"
                    },
                },
            }, {
                name: 'update',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "system": 1,
                        "name": "v1.0",
                        "build": [
                            1
                        ],
                        "status": "wait",
                        "date": "2026-02-10",
                        "desc": "release 1.0"
                    },
                },
            }, {
                name: 'delete',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
                    example: {
                        "file": "/tmp/zentao-apidoc-test.txt",
                        "objectType": "story",
                        "objectID": 1
                    },
                },
            }, {
                name: 'update',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "fileName": "test2.txt"
                    },
                },
            }, {
                name: 'delete',
                minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
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
        description: '工作流管理，支持获取工作流数据列表(以合同为例)、获取工作流数据详情(以合同为例)、获取工作流列表、获取工作流字段列表、获取工作流动作列表、获取工作流标签列表、获取工作流数据表列表、获取数据源列表、获取规则列表、创建工作流数据(以合同为例)、创建工作流、复制工作流、创建工作流字段、创建工作流动作、创建工作流标签、创建工作流数据表、创建数据源、创建规则、获取工作流详情、获取工作流字段详情、获取工作流动作详情、获取工作流标签详情、获取工作流数据表详情、获取数据源详情、获取规则详情、修改工作流数据(以合同为例)、修改工作流、修改工作流字段、修改工作流动作、修改工作流标签、修改工作流数据表、修改数据源、修改规则、删除工作流事项(以合同为例)、删除工作流、删除工作流字段、删除工作流动作、删除工作流标签、删除工作流数据表、删除数据源、删除规则、启用工作流、停用工作流、发布工作流、设置工作流审批、设置动作CSS、设置工作流CSS、设置字段导出、设置工作流全文检索、设置动作JS、设置工作流JS、设置动作通知、设置字段搜索、设置字段取值、设置动作验证',
        actions: [
            {
                name: 'list',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
                display: '获取工作流数据列表(以合同为例)',
                type: 'list',
                method: 'get',
                path: '/workflow/contract',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'dataList',
            }, {
                name: 'getContract',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
                display: '获取工作流数据详情(以合同为例)',
                type: 'get',
                method: 'get',
                path: '/workflow/contract/1',
                resultType: 'object',
                resultGetter: 'data',
            }, {
                name: 'flows',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取工作流列表',
                type: 'list',
                method: 'get',
                path: '/workflows',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'flows',
                params: [
                    {
                        name: 'status',
                        required: false,
                        type: 'string',
                        description: '工作流状态',
                        options: [
                            { value: 'normal', label: '正常' },
                            { value: 'wait', label: '待发布' },
                            { value: 'pause', label: '已停用' },
                        ],
                    },
                    {
                        name: 'app',
                        required: false,
                        type: 'string',
                        description: '所属应用，不传时不限。',
                    },
                    {
                        name: 'onlyCustom',
                        required: false,
                        type: 'number',
                        description: '是否只显示自定义工作流',
                        options: [
                            { value: '0', label: '全部' },
                            { value: '1', label: '仅自定义' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序字段，默认 id_desc。',
                        defaultValue: 'id_desc',
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，默认 20。',
                        defaultValue: '20',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，默认 1。',
                        defaultValue: '1',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：app,createdBy,createdDate,desc,id,name',
                        style: 'deepObject',
                        explode: true,
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
                name: 'fields',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取工作流字段列表',
                type: 'list',
                method: 'get',
                path: '/workflows/{module}/fields',
                resultType: 'list',
                resultGetter: 'fields',
                pathParams: {
                    module: 'module',
                },
            }, {
                name: 'actions',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取工作流动作列表',
                type: 'list',
                method: 'get',
                path: '/workflows/{module}/actions',
                resultType: 'list',
                resultGetter: 'actions',
                pathParams: {
                    module: 'module',
                },
            }, {
                name: 'labels',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取工作流标签列表',
                type: 'list',
                method: 'get',
                path: '/workflows/{module}/labels',
                resultType: 'list',
                resultGetter: 'labels',
                pathParams: {
                    module: 'module',
                },
            }, {
                name: 'tables',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取工作流数据表列表',
                type: 'list',
                method: 'get',
                path: '/workflows/{module}/tables',
                resultType: 'list',
                resultGetter: 'tables',
                pathParams: {
                    module: 'module',
                },
            }, {
                name: 'datasources',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取数据源列表',
                type: 'list',
                method: 'get',
                path: '/workflowdatasources',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'datasources',
            }, {
                name: 'rules',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取规则列表',
                type: 'list',
                method: 'get',
                path: '/workflowrules',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'rules',
            }, {
                name: 'create',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "name": "test"
                    },
                },
            }, {
                name: 'createFlow',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '创建工作流',
                type: 'create',
                method: 'post',
                path: '/workflows',
                resultType: 'object',
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "module": {
                                "type": "string",
                                "description": "工作流代号，只能包含英文字母。"
                            },
                            "name": {
                                "type": "string",
                                "description": "工作流名称。"
                            },
                            "navigator": {
                                "type": "string",
                                "description": "所属导航(primary 主导航 | secondary 二级导航)。"
                            }
                        },
                        "required": [
                            "module",
                            "name"
                        ]
                    },
                    example: {
                        "module": "apidemo",
                        "name": "API示例流程",
                        "navigator": "primary"
                    },
                },
            }, {
                name: 'copyFlow',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '复制工作流',
                type: 'create',
                method: 'post',
                path: '/workflows/{flowID}/copy',
                resultType: 'object',
                pathParams: {
                    flowID: 'flowID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "module": {
                                "type": "string",
                                "description": "新工作流代号，只能包含英文字母。"
                            },
                            "name": {
                                "type": "string",
                                "description": "新工作流名称。"
                            },
                            "navigator": {
                                "type": "string",
                                "description": "所属导航(primary 主导航 | secondary 二级导航)。"
                            },
                            "position": {
                                "type": "string",
                                "description": "菜单位置。"
                            }
                        },
                        "required": [
                            "module",
                            "name"
                        ]
                    },
                    example: {
                        "module": "apicopy",
                        "name": "API示例流程副本",
                        "navigator": "primary",
                        "position": "main"
                    },
                },
            }, {
                name: 'createField',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '创建工作流字段',
                type: 'create',
                method: 'post',
                path: '/workflows/{module}/fields',
                resultType: 'object',
                pathParams: {
                    module: 'module',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "字段名称。"
                            },
                            "field": {
                                "type": "string",
                                "description": "字段代号，只能包含英文字母。"
                            },
                            "control": {
                                "type": "string",
                                "description": "控件类型(input 单行文本 | textarea 多行文本 | select 下拉 | date 日期 | datetime 日期时间 | richtext 富文本 | checkbox 复选框 | multi-select 多选 | formula 公式)。"
                            },
                            "type": {
                                "type": "string",
                                "description": "字段类型(varchar 字符 | int 整数 | float 浮点数 | date 日期 | datetime 日期时间 | text 文本)。"
                            },
                            "length": {
                                "type": "string",
                                "description": "字段长度。"
                            }
                        },
                        "required": [
                            "name",
                            "field",
                            "control"
                        ]
                    },
                    example: {
                        "name": "API测试字段",
                        "field": "apitest",
                        "control": "input",
                        "type": "varchar",
                        "length": "255"
                    },
                },
            }, {
                name: 'createAction',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '创建工作流动作',
                type: 'create',
                method: 'post',
                path: '/workflows/{module}/actions',
                resultType: 'object',
                pathParams: {
                    module: 'module',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "module": {
                                "type": "string",
                                "description": "工作流代号。"
                            },
                            "action": {
                                "type": "string",
                                "description": "动作代号，只能包含小写英文字母。"
                            },
                            "name": {
                                "type": "string",
                                "description": "动作名称。"
                            },
                            "type": {
                                "type": "string",
                                "description": "动作类型(single 单条操作 | batch 批量操作)。"
                            }
                        },
                        "required": [
                            "module",
                            "action",
                            "name"
                        ]
                    },
                    example: {
                        "module": "apidemo",
                        "action": "apitestact",
                        "name": "API测试动作",
                        "type": "single"
                    },
                },
            }, {
                name: 'createLabel',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '创建工作流标签',
                type: 'create',
                method: 'post',
                path: '/workflows/{module}/labels',
                resultType: 'object',
                pathParams: {
                    module: 'module',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "module": {
                                "type": "string",
                                "description": "工作流代号。"
                            },
                            "action": {
                                "type": "string",
                                "description": "关联动作代号。"
                            },
                            "code": {
                                "type": "string",
                                "description": "标签代号。"
                            },
                            "label": {
                                "type": "string",
                                "description": "标签名称。"
                            },
                            "type": {
                                "type": "string",
                                "description": "标签类型(data 数据标签 | sql SQL标签)。"
                            },
                            "fields": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "数据标签的字段列表。"
                            },
                            "operators": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "数据标签的运算符列表。"
                            },
                            "values": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "数据标签的条件值列表。"
                            }
                        },
                        "required": [
                            "module",
                            "action"
                        ]
                    },
                    example: {
                        "module": "apidemo",
                        "action": "browse",
                        "code": "apitestlabel",
                        "label": "API测试标签",
                        "type": "data",
                        "fields": [
                            "name"
                        ],
                        "operators": [
                            "include"
                        ],
                        "values": [
                            "测试"
                        ]
                    },
                },
            }, {
                name: 'createTable',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '创建工作流数据表',
                type: 'create',
                method: 'post',
                path: '/workflows/{module}/tables',
                resultType: 'object',
                pathParams: {
                    module: 'module',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "module": {
                                "type": "string",
                                "description": "数据表代号，只能包含英文字母。"
                            },
                            "name": {
                                "type": "string",
                                "description": "数据表名称。"
                            }
                        },
                        "required": [
                            "module",
                            "name"
                        ]
                    },
                    example: {
                        "module": "apitable",
                        "name": "API数据表"
                    },
                },
            }, {
                name: 'createDatasource',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '创建数据源',
                type: 'create',
                method: 'post',
                path: '/workflowdatasources',
                resultType: 'object',
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "type": {
                                "type": "string",
                                "description": "数据源类型(sql SQL查询 | system 系统方法 | option 选项 | lang 语言项 | category 分类 | func 函数)。"
                            },
                            "name": {
                                "type": "string",
                                "description": "数据源名称。"
                            },
                            "code": {
                                "type": "string",
                                "description": "数据源代码。"
                            },
                            "sql": {
                                "type": "string",
                                "description": "SQL 语句，type=sql 时必填，支持 SELECT 查询。"
                            },
                            "keyField": {
                                "type": "string",
                                "description": "键字段，type=sql 时必填。"
                            },
                            "valueField": {
                                "type": "string",
                                "description": "值字段，type=sql 时必填。"
                            }
                        },
                        "required": [
                            "type",
                            "name"
                        ]
                    },
                    example: {
                        "type": "sql",
                        "name": "API数据源",
                        "code": "apids",
                        "sql": "SELECT 1 AS value, '示例' AS text",
                        "keyField": "value",
                        "valueField": "text"
                    },
                },
            }, {
                name: 'createRule',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '创建规则',
                type: 'create',
                method: 'post',
                path: '/workflowrules',
                resultType: 'object',
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "type": {
                                "type": "string",
                                "description": "规则类型(regex 正则表达式)。"
                            },
                            "name": {
                                "type": "string",
                                "description": "规则名称。"
                            },
                            "rule": {
                                "type": "string",
                                "description": "规则内容，正则表达式需要包含定界符。"
                            }
                        },
                        "required": [
                            "type",
                            "name",
                            "rule"
                        ]
                    },
                    example: {
                        "type": "regex",
                        "name": "API规则",
                        "rule": "/^[0-9]+$/"
                    },
                },
            }, {
                name: 'getFlow',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取工作流详情',
                type: 'get',
                method: 'get',
                path: '/workflows/{flowID}',
                resultType: 'object',
                resultGetter: 'flow',
                pathParams: {
                    flowID: 'flowID',
                },
            }, {
                name: 'getField',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取工作流字段详情',
                type: 'get',
                method: 'get',
                path: '/workflowfields/{fieldID}',
                resultType: 'object',
                resultGetter: 'field',
                pathParams: {
                    fieldID: 'fieldID',
                },
            }, {
                name: 'getAction',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取工作流动作详情',
                type: 'get',
                method: 'get',
                path: '/workflowactions/{actionID}',
                resultType: 'object',
                resultGetter: 'action',
                pathParams: {
                    actionID: 'actionID',
                },
            }, {
                name: 'getLabel',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取工作流标签详情',
                type: 'get',
                method: 'get',
                path: '/workflowlabels/{labelID}',
                resultType: 'object',
                resultGetter: 'label',
                pathParams: {
                    labelID: 'labelID',
                },
            }, {
                name: 'getTable',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取工作流数据表详情',
                type: 'get',
                method: 'get',
                path: '/workflowtables/{tableID}',
                resultType: 'object',
                resultGetter: 'flow',
                pathParams: {
                    tableID: 'tableID',
                },
            }, {
                name: 'getDatasource',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取数据源详情',
                type: 'get',
                method: 'get',
                path: '/workflowdatasources/{datasourceID}',
                resultType: 'object',
                resultGetter: 'datasource',
                pathParams: {
                    datasourceID: 'datasourceID',
                },
            }, {
                name: 'getRule',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取规则详情',
                type: 'get',
                method: 'get',
                path: '/workflowrules/{ruleID}',
                resultType: 'object',
                resultGetter: 'rule',
                pathParams: {
                    ruleID: 'ruleID',
                },
            }, {
                name: 'update',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "name": "contract1"
                    },
                },
            }, {
                name: 'updateFlow',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '修改工作流',
                type: 'update',
                method: 'put',
                path: '/workflows/{flowID}',
                resultType: 'object',
                pathParams: {
                    flowID: 'flowID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "工作流名称。"
                            },
                            "navigator": {
                                "type": "string",
                                "description": "所属导航(primary 主导航 | secondary 二级导航)。"
                            },
                            "position": {
                                "type": "string",
                                "description": "菜单位置(before 之前 | after 之后 | 空 直接放在模块下)。"
                            },
                            "positionModule": {
                                "type": "string",
                                "description": "位置模块，主导航下通常传 main；工作流发布后不能为空。"
                            }
                        },
                        "required": [
                            "name"
                        ]
                    },
                    example: {
                        "name": "API示例流程（已编辑）",
                        "navigator": "primary",
                        "positionModule": "main"
                    },
                },
            }, {
                name: 'updateField',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '修改工作流字段',
                type: 'update',
                method: 'put',
                path: '/workflowfields/{fieldID}',
                resultType: 'object',
                pathParams: {
                    fieldID: 'fieldID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "字段名称。"
                            },
                            "control": {
                                "type": "string",
                                "description": "控件类型。"
                            }
                        },
                        "required": [
                            "name",
                            "control"
                        ]
                    },
                    example: {
                        "name": "API测试字段（已编辑）",
                        "control": "input"
                    },
                },
            }, {
                name: 'updateAction',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '修改工作流动作',
                type: 'update',
                method: 'put',
                path: '/workflowactions/{actionID}',
                resultType: 'object',
                pathParams: {
                    actionID: 'actionID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "action": {
                                "type": "string",
                                "description": "动作代号。"
                            },
                            "name": {
                                "type": "string",
                                "description": "动作名称。"
                            }
                        },
                        "required": [
                            "action",
                            "name"
                        ]
                    },
                    example: {
                        "action": "apitestact",
                        "name": "API测试动作（已编辑）"
                    },
                },
            }, {
                name: 'updateLabel',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '修改工作流标签',
                type: 'update',
                method: 'put',
                path: '/workflowlabels/{labelID}',
                resultType: 'object',
                pathParams: {
                    labelID: 'labelID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "label": {
                                "type": "string",
                                "description": "标签名称。"
                            },
                            "type": {
                                "type": "string",
                                "description": "标签类型。"
                            },
                            "fields": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "数据标签的字段列表。"
                            },
                            "operators": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "数据标签的运算符列表。"
                            },
                            "values": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "数据标签的条件值列表。"
                            }
                        }
                    },
                    example: {
                        "label": "API测试标签（已编辑）",
                        "type": "data",
                        "fields": [
                            "name"
                        ],
                        "operators": [
                            "include"
                        ],
                        "values": [
                            "测试"
                        ]
                    },
                },
            }, {
                name: 'updateTable',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '修改工作流数据表',
                type: 'update',
                method: 'put',
                path: '/workflowtables/{tableID}',
                resultType: 'object',
                pathParams: {
                    tableID: 'tableID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "数据表名称。"
                            }
                        },
                        "required": [
                            "name"
                        ]
                    },
                    example: {
                        "name": "API数据表（已编辑）"
                    },
                },
            }, {
                name: 'updateDatasource',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '修改数据源',
                type: 'update',
                method: 'put',
                path: '/workflowdatasources/{datasourceID}',
                resultType: 'object',
                pathParams: {
                    datasourceID: 'datasourceID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "type": {
                                "type": "string",
                                "description": "数据源类型。"
                            },
                            "name": {
                                "type": "string",
                                "description": "数据源名称。"
                            },
                            "code": {
                                "type": "string",
                                "description": "数据源代码。"
                            },
                            "sql": {
                                "type": "string",
                                "description": "SQL 语句。"
                            },
                            "keyField": {
                                "type": "string",
                                "description": "键字段。"
                            },
                            "valueField": {
                                "type": "string",
                                "description": "值字段。"
                            }
                        },
                        "required": [
                            "type",
                            "name"
                        ]
                    },
                    example: {
                        "type": "sql",
                        "name": "API数据源（已编辑）",
                        "code": "apids",
                        "sql": "SELECT 1 AS value, '示例' AS text",
                        "keyField": "value",
                        "valueField": "text"
                    },
                },
            }, {
                name: 'updateRule',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '修改规则',
                type: 'update',
                method: 'put',
                path: '/workflowrules/{ruleID}',
                resultType: 'object',
                pathParams: {
                    ruleID: 'ruleID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "type": {
                                "type": "string",
                                "description": "规则类型。"
                            },
                            "name": {
                                "type": "string",
                                "description": "规则名称。"
                            },
                            "rule": {
                                "type": "string",
                                "description": "规则内容。"
                            }
                        },
                        "required": [
                            "type",
                            "name",
                            "rule"
                        ]
                    },
                    example: {
                        "type": "regex",
                        "name": "API规则（已编辑）",
                        "rule": "/^[0-9]+$/"
                    },
                },
            }, {
                name: 'delete',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
                display: '删除工作流事项(以合同为例)',
                type: 'delete',
                method: 'delete',
                path: '/workflow/contract/{contractID}',
                resultType: 'text',
                pathParams: {
                    contractID: '合同ID',
                },
            }, {
                name: 'deleteFlow',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '删除工作流',
                type: 'delete',
                method: 'delete',
                path: '/workflows/{flowID}',
                resultType: 'text',
                pathParams: {
                    flowID: 'flowID',
                },
            }, {
                name: 'deleteField',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '删除工作流字段',
                type: 'delete',
                method: 'delete',
                path: '/workflowfields/{fieldID}',
                resultType: 'text',
                pathParams: {
                    fieldID: 'fieldID',
                },
            }, {
                name: 'deleteAction',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '删除工作流动作',
                type: 'delete',
                method: 'delete',
                path: '/workflowactions/{actionID}',
                resultType: 'text',
                pathParams: {
                    actionID: 'actionID',
                },
            }, {
                name: 'deleteLabel',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '删除工作流标签',
                type: 'delete',
                method: 'delete',
                path: '/workflowlabels/{labelID}',
                resultType: 'text',
                pathParams: {
                    labelID: 'labelID',
                },
            }, {
                name: 'deleteTable',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '删除工作流数据表',
                type: 'delete',
                method: 'delete',
                path: '/workflowtables/{tableID}',
                resultType: 'text',
                pathParams: {
                    tableID: 'tableID',
                },
            }, {
                name: 'deleteDatasource',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '删除数据源',
                type: 'delete',
                method: 'delete',
                path: '/workflowdatasources/{datasourceID}',
                resultType: 'text',
                pathParams: {
                    datasourceID: 'datasourceID',
                },
            }, {
                name: 'deleteRule',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '删除规则',
                type: 'delete',
                method: 'delete',
                path: '/workflowrules/{ruleID}',
                resultType: 'text',
                pathParams: {
                    ruleID: 'ruleID',
                },
            }, {
                name: 'activateFlow',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '启用工作流',
                type: 'action',
                method: 'put',
                path: '/workflows/{flowID}/activate',
                resultType: 'text',
                pathParams: {
                    flowID: 'flowID',
                },
            }, {
                name: 'deactivateFlow',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '停用工作流',
                type: 'action',
                method: 'put',
                path: '/workflows/{flowID}/deactivate',
                resultType: 'text',
                pathParams: {
                    flowID: 'flowID',
                },
            }, {
                name: 'releaseFlow',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '发布工作流',
                type: 'action',
                method: 'put',
                path: '/workflows/{flowID}/release',
                resultType: 'text',
                pathParams: {
                    flowID: 'flowID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "navigator": {
                                "type": "string",
                                "description": "所属导航(primary 主导航 | secondary 二级导航)。"
                            },
                            "position": {
                                "type": "string",
                                "description": "菜单位置(before 之前 | after 之后 | 空 直接放在模块下)。"
                            },
                            "positionModule": {
                                "type": "string",
                                "description": "位置模块，主导航下通常传 main。"
                            }
                        },
                        "required": [
                            "navigator",
                            "positionModule"
                        ]
                    },
                    example: {
                        "navigator": "primary",
                        "positionModule": "main"
                    },
                },
            }, {
                name: 'setApproval',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '设置工作流审批',
                type: 'action',
                method: 'put',
                path: '/workflows/{module}/setApproval',
                resultType: 'text',
                pathParams: {
                    module: 'module',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "approval": {
                                "type": "string",
                                "description": "是否启用审批(enabled 启用 | disabled 停用)。"
                            }
                        },
                        "required": [
                            "approval"
                        ]
                    },
                    example: {
                        "approval": "disabled"
                    },
                },
            }, {
                name: 'setActionCSS',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '设置动作CSS',
                type: 'action',
                method: 'put',
                path: '/workflowactions/{actionID}/setCSS',
                resultType: 'text',
                pathParams: {
                    actionID: 'actionID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "css": {
                                "type": "string",
                                "description": "动作自定义CSS。"
                            }
                        }
                    },
                    example: {
                        "css": "/* 动作CSS示例 */"
                    },
                },
            }, {
                name: 'setFlowCSS',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '设置工作流CSS',
                type: 'action',
                method: 'put',
                path: '/workflows/{flowID}/setCSS',
                resultType: 'text',
                pathParams: {
                    flowID: 'flowID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "css": {
                                "type": "string",
                                "description": "工作流自定义CSS。"
                            }
                        }
                    },
                    example: {
                        "css": "/* 流程CSS示例 */"
                    },
                },
            }, {
                name: 'setExport',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '设置字段导出',
                type: 'action',
                method: 'put',
                path: '/workflows/{module}/setExport',
                resultType: 'text',
                pathParams: {
                    module: 'module',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "modules": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "要设置的模块列表。"
                            },
                            "fields": {
                                "type": "object",
                                "properties": [],
                                "description": "导出字段，键为模块、值为字段代号列表。"
                            }
                        },
                        "required": [
                            "modules"
                        ]
                    },
                    example: {
                        "modules": [
                            "apidemo"
                        ],
                        "fields": {
                            "apidemo": [
                                "name"
                            ]
                        }
                    },
                },
            }, {
                name: 'setFulltextSearch',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '设置工作流全文检索',
                type: 'action',
                method: 'put',
                path: '/workflows/{flowID}/setFulltextSearch',
                resultType: 'text',
                pathParams: {
                    flowID: 'flowID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "contentField": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "参与全文检索的字段列表。"
                            }
                        }
                    },
                    example: {
                        "contentField": [
                            "name"
                        ]
                    },
                },
            }, {
                name: 'setActionJS',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '设置动作JS',
                type: 'action',
                method: 'put',
                path: '/workflowactions/{actionID}/setJS',
                resultType: 'text',
                pathParams: {
                    actionID: 'actionID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "js": {
                                "type": "string",
                                "description": "动作自定义JS。"
                            }
                        }
                    },
                    example: {
                        "js": "// 动作JS示例"
                    },
                },
            }, {
                name: 'setFlowJS',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '设置工作流JS',
                type: 'action',
                method: 'put',
                path: '/workflows/{flowID}/setJS',
                resultType: 'text',
                pathParams: {
                    flowID: 'flowID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "js": {
                                "type": "string",
                                "description": "工作流自定义JS。"
                            }
                        }
                    },
                    example: {
                        "js": "// 流程JS示例"
                    },
                },
            }, {
                name: 'setActionNotice',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '设置动作通知',
                type: 'action',
                method: 'put',
                path: '/workflowactions/{actionID}/setNotice',
                resultType: 'text',
                pathParams: {
                    actionID: 'actionID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "toList": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "通知人账号列表。"
                            }
                        },
                        "required": [
                            "toList"
                        ]
                    },
                    example: {
                        "toList": [
                            "admin"
                        ]
                    },
                },
            }, {
                name: 'setSearch',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '设置字段搜索',
                type: 'action',
                method: 'put',
                path: '/workflows/{module}/setSearch',
                resultType: 'text',
                pathParams: {
                    module: 'module',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "modules": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "要设置的模块列表。"
                            },
                            "fields": {
                                "type": "object",
                                "properties": [],
                                "description": "搜索字段，键为模块、值为字段代号列表（按数组顺序作为搜索排序）。"
                            }
                        },
                        "required": [
                            "modules"
                        ]
                    },
                    example: {
                        "modules": [
                            "apidemo"
                        ],
                        "fields": {
                            "apidemo": [
                                "name"
                            ]
                        }
                    },
                },
            }, {
                name: 'setValue',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '设置字段取值',
                type: 'action',
                method: 'put',
                path: '/workflows/{module}/setValue',
                resultType: 'text',
                pathParams: {
                    module: 'module',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "modules": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "要设置的模块列表。"
                            },
                            "fields": {
                                "type": "object",
                                "properties": [],
                                "description": "取值字段，键为模块、值为字段代号列表。"
                            }
                        },
                        "required": [
                            "modules"
                        ]
                    },
                    example: {
                        "modules": [
                            "apidemo"
                        ],
                        "fields": {
                            "apidemo": [
                                "name"
                            ]
                        }
                    },
                },
            }, {
                name: 'setActionVerification',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '设置动作验证',
                type: 'action',
                method: 'put',
                path: '/workflowactions/{actionID}/setVerification',
                resultType: 'text',
                pathParams: {
                    actionID: 'actionID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "type": {
                                "type": "string",
                                "description": "验证类型(data 数据验证 | no 不验证)。"
                            },
                            "message": {
                                "type": "string",
                                "description": "验证失败提示。"
                            },
                            "verifications": {
                                "type": "object",
                                "properties": [],
                                "description": "验证规则，包含 field(字段)、paramType(参数类型)、param(参数) 三个数组。"
                            }
                        },
                        "required": [
                            "type"
                        ]
                    },
                    example: {
                        "type": "data",
                        "message": "请输入有效的名称",
                        "verifications": {
                            "field": [
                                "name"
                            ],
                            "paramType": [
                                "field"
                            ],
                            "param": [
                                "name"
                            ]
                        }
                    },
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
                display: '获取我的文档空间列表',
                type: 'list',
                method: 'get',
                path: '/doc/my/spaces',
                resultType: 'list',
                resultGetter: 'spaces',
            }, {
                name: 'teamSpaces',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
                display: '获取团队文档空间列表',
                type: 'list',
                method: 'get',
                path: '/doc/team/spaces',
                resultType: 'list',
                resultGetter: 'spaces',
            }, {
                name: 'productSpaces',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
                display: '获取产品文档空间列表',
                type: 'list',
                method: 'get',
                path: '/doc/product/spaces',
                resultType: 'list',
                resultGetter: 'spaces',
            }, {
                name: 'projectSpaces',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
                display: '获取项目文档空间列表',
                type: 'list',
                method: 'get',
                path: '/doc/project/spaces',
                resultType: 'list',
                resultGetter: 'spaces',
            }, {
                name: 'myLibs',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "name": "我的文档空间"
                    },
                },
            }, {
                name: 'createTeamSpace',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "name": "团队文档空间"
                    },
                },
            }, {
                name: 'createMyLib',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "name": "新增我的文档库"
                    },
                },
            }, {
                name: 'createTeamLib',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "name": "新增团队文档库",
                        "acl": "open",
                        "groups": [
                            1
                        ],
                        "users": [
                            "admin"
                        ]
                    },
                },
            }, {
                name: 'createProductLib',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "name": "新增产品文档库",
                        "acl": "default",
                        "groups": [
                            1
                        ],
                        "users": [
                            "admin"
                        ]
                    },
                },
            }, {
                name: 'createProjectLib',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "name": "新增项目文档库",
                        "acl": "default",
                        "groups": [
                            1
                        ],
                        "users": [
                            "admin"
                        ]
                    },
                },
            }, {
                name: 'createMyDoc',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "moduleID": 1,
                        "title": "演示文档",
                        "content": "# 演示文档\n\n**这是文章正文**",
                        "contentType": "doc"
                    },
                },
            }, {
                name: 'createTeamDoc',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "moduleID": 1,
                        "title": "演示文档",
                        "content": "# 演示文档\n\n**这是文章正文**",
                        "contentType": "doc"
                    },
                },
            }, {
                name: 'createProductDoc',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "moduleID": 1,
                        "title": "演示文档",
                        "content": "# 演示文档\n\n**这是文章正文**",
                        "contentType": "doc"
                    },
                },
            }, {
                name: 'createProjectDoc',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "moduleID": 1,
                        "title": "演示文档",
                        "content": "# 演示文档\n\n**这是文章正文**",
                        "contentType": "doc"
                    },
                },
            }, {
                name: 'createMyModule',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "name": "CMMI资料",
                        "parentID": "0"
                    },
                },
            }, {
                name: 'createTeamModule',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "name": "CMMI资料",
                        "parentID": "0"
                    },
                },
            }, {
                name: 'createProductModule',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "name": "CMMI资料",
                        "parentID": "0"
                    },
                },
            }, {
                name: 'createProjectModule',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "name": "CMMI资料",
                        "parentID": "0"
                    },
                },
            }, {
                name: 'getSpace',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "name": "新的空间"
                    },
                },
            }, {
                name: 'updateLib',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "name": "新文档库",
                        "acl": "default",
                        "groups": [
                            1
                        ],
                        "users": [
                            "admin"
                        ]
                    },
                },
            }, {
                name: 'update',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "moduleID": 1,
                        "title": "API修改演示文档",
                        "content": "**这是修改后的文章正文**",
                        "contentType": "doc"
                    },
                },
            }, {
                name: 'updateModule',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "name": "文档目录1"
                    },
                },
            }, {
                name: 'deleteSpace',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
        description: '待办管理，支持创建待办、获取待办详情、编辑待办、删除待办',
        actions: [
            {
                name: 'create',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "date": "2026-12-10",
                        "type": "bug",
                        "objectID": 1,
                        "begin": "0900",
                        "end": "0930",
                        "assignedTo": "admin",
                        "desc": "审批项目预算详情"
                    },
                },
            }, {
                name: 'get',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取待办详情',
                type: 'get',
                method: 'get',
                path: '/todos/{todoID}',
                resultType: 'object',
                resultGetter: 'todo',
                pathParams: {
                    todoID: '待办ID',
                },
            }, {
                name: 'update',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                    example: {
                        "date": "2026-12-10",
                        "type": "bug",
                        "objectID": 1,
                        "begin": "0900",
                        "end": "0930",
                        "assignedTo": "admin",
                        "desc": "审批项目预算详情"
                    },
                },
            }, {
                name: 'delete',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
        description: '地盘管理，支持我的待办、指派给我的任务、指派给我的Bug、指派给我的研发需求、指派给我的业务需求、指派给我的用户需求、我负责的的测试单、我参与的项目、指派给我的反馈、指派给我的工单、指派给我的用例、我的会议、指派给我的问题、指派给我的风险、我的地盘-贡献任务、我的地盘-贡献 Bug、我的地盘-贡献研发需求、我的地盘-贡献业务需求、我的地盘-贡献用户需求、我的地盘-贡献测试单、我的地盘-贡献用例、我的地盘-贡献文档、我的地盘-贡献问题、我的地盘-贡献风险、我的地盘-贡献评审问题、我的地盘-贡献反馈、我的地盘-贡献审批、我的地盘-待处理评审问题、我的地盘-待处理审批、我的地盘-待处理审计计划、我的地盘-待处理不符合项',
        actions: [
            {
                name: 'todos',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
                display: '我的待办',
                type: 'list',
                method: 'get',
                path: '/my/todos',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'todos',
                params: [
                    {
                        "name": "status",
                        "required": false,
                        "type": "string",
                        "description": "待办状态；browseType=undone 时传 undone。"
                    },
                    {
                        "name": "browseType",
                        "required": false,
                        "type": "string",
                        "description": "状态，默认是all",
                        "defaultValue": "all",
                        "options": [
                            {
                                "value": "all",
                                "label": "全部"
                            },
                            {
                                "value": "today",
                                "label": "今天"
                            },
                            {
                                "value": "thisWeek",
                                "label": "本周"
                            },
                            {
                                "value": "thisMonth",
                                "label": "本月"
                            },
                            {
                                "value": "future",
                                "label": "将来"
                            },
                            {
                                "value": "undone",
                                "label": "未完成，需同时传 status=undone"
                            },
                            {
                                "value": "cycle",
                                "label": "周期待办"
                            },
                            {
                                "value": "assignedToOther",
                                "label": "指派他人"
                            }
                        ]
                    },
                    {
                        "name": "orderBy",
                        "required": false,
                        "type": "string",
                        "description": "排序(date_desc,status,begin 日期/状态/开始时间)"
                    },
                    {
                        "name": "recPerPage",
                        "required": false,
                        "type": "number",
                        "description": "每页数量，不超过1000"
                    },
                    {
                        "name": "pageID",
                        "required": false,
                        "type": "number",
                        "description": "页码，从第1页开始"
                    }
                ],
            }, {
                name: 'tasks',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
                display: '指派给我的任务',
                type: 'list',
                method: 'get',
                path: '/my/tasks',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'tasks',
                params: [
                    {
                        "name": "param",
                        "required": false,
                        "type": "string",
                        "description": "搜索参数；browseType=bysearch 或 bySearch 时必填。"
                    },
                    {
                        "name": "browseType",
                        "required": false,
                        "type": "string",
                        "description": "状态，默认是assignedTo，取值区分大小写",
                        "defaultValue": "assignedTo",
                        "options": [
                            {
                                "value": "assignedTo",
                                "label": "指派给我"
                            },
                            {
                                "value": "openedBy",
                                "label": "由我创建"
                            },
                            {
                                "value": "finishedBy",
                                "label": "由我完成"
                            },
                            {
                                "value": "myInvolved",
                                "label": "由我参与"
                            },
                            {
                                "value": "closedBy",
                                "label": "由我关闭"
                            },
                            {
                                "value": "canceledBy",
                                "label": "由我取消"
                            },
                            {
                                "value": "assignedBy",
                                "label": "由我指派"
                            },
                            {
                                "value": "bysearch",
                                "label": "按查询搜索，需同时传 param"
                            }
                        ]
                    },
                    {
                        "name": "orderBy",
                        "required": false,
                        "type": "string",
                        "description": "排序",
                        "options": [
                            {
                                "value": "id_asc",
                                "label": "ID 升序"
                            },
                            {
                                "value": "id_desc",
                                "label": "ID 降序"
                            },
                            {
                                "value": "name_asc",
                                "label": "名称 升序"
                            },
                            {
                                "value": "name_desc",
                                "label": "名称 降序"
                            },
                            {
                                "value": "status_asc",
                                "label": "状态 升序"
                            },
                            {
                                "value": "status_desc",
                                "label": "状态 降序"
                            },
                            {
                                "value": "pri_asc",
                                "label": "优先级 升序"
                            },
                            {
                                "value": "pri_desc",
                                "label": "优先级 降序"
                            }
                        ]
                    },
                    {
                        "name": "recPerPage",
                        "required": false,
                        "type": "number",
                        "description": "每页数量，不超过1000"
                    },
                    {
                        "name": "pageID",
                        "required": false,
                        "type": "number",
                        "description": "页码，从第1页开始"
                    },
                    {
                        "name": "filters",
                        "required": false,
                        "type": "array",
                        "description": "搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：name(任务名称，示例：关键字)；keywords(关键词，示例：关键字)；id(编号，示例：1)；status(任务状态，枚举：wait 未开始 | doing 进行中 | done 已完成 | pause 已暂停 | cancel 已取消 | closed 已关闭)；desc(任务描述，示例：关键字)；assignedTo(指派给，用户，示例：admin)；pri(优先级，枚举：1 | 2 | 3 | 4)；project(所属项目，示例：all)；execution(所属执行，示例：all)；module(所属模块，示例：all)；estimate(最初预计，示例：关键字)；left(预计剩余，示例：关键字)；consumed(总计消耗，示例：关键字)；type(任务类型，枚举：design 设计 | devel 开发 | request 需求 | test 测试 | study 研究 | discuss 讨论 | ui 界面 | affair 事务 | misc 其他)；story(相关用户故事，示例：all)；fromBug(来源Bug编号，枚举：design 设计 | devel 开发 | request 需求 | test 测试 | study 研究 | discuss 讨论 | ui 界面 | affair 事务 | misc 其他)；closedReason(关闭原因，枚举：done 已完成 | cancel 已取消)；openedBy(由谁创建，用户，示例：admin)；finishedBy(由谁完成，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；canceledBy(由谁取消，用户，示例：admin)；lastEditedBy(最后修改，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；openedDate(创建日期，示例：2026-01-01)；deadline(截止日期，示例：2026-01-01)；estStarted(预计开始，示例：2026-01-01)；realStarted(实际开始，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；finishedDate(实际完成，示例：2026-01-01)；closedDate(关闭时间，示例：2026-01-01)；canceledDate(取消时间，示例：2026-01-01)；lastEditedDate(最后修改日期，示例：2026-01-01)；activatedDate(激活日期，示例：2026-01-01)",
                        "style": "deepObject",
                        "explode": true
                    },
                    {
                        "name": "groupJoin",
                        "required": false,
                        "type": "string",
                        "description": "条件组之间的连接方式",
                        "options": [
                            {
                                "value": "and",
                                "label": "and"
                            },
                            {
                                "value": "or",
                                "label": "or"
                            }
                        ]
                    }
                ],
            }, {
                name: 'bugs',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
                display: '指派给我的Bug',
                type: 'list',
                method: 'get',
                path: '/my/bugs',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'bugs',
                params: [
                    {
                        "name": "param",
                        "required": false,
                        "type": "string",
                        "description": "搜索参数；browseType=bysearch 或 bySearch 时必填。"
                    },
                    {
                        "name": "browseType",
                        "required": false,
                        "type": "string",
                        "description": "状态，默认是assignedTo，取值取自 zt_bug 的字段名（区分大小写）",
                        "defaultValue": "assignedTo",
                        "options": [
                            {
                                "value": "assignedTo",
                                "label": "指派给我"
                            },
                            {
                                "value": "openedBy",
                                "label": "由我创建"
                            },
                            {
                                "value": "resolvedBy",
                                "label": "由我解决"
                            },
                            {
                                "value": "closedBy",
                                "label": "由我关闭"
                            },
                            {
                                "value": "assignedBy",
                                "label": "由我指派"
                            },
                            {
                                "value": "bysearch",
                                "label": "按查询搜索，需同时传 param"
                            }
                        ]
                    },
                    {
                        "name": "orderBy",
                        "required": false,
                        "type": "string",
                        "description": "排序",
                        "options": [
                            {
                                "value": "id_asc",
                                "label": "ID 升序"
                            },
                            {
                                "value": "id_desc",
                                "label": "ID 降序"
                            },
                            {
                                "value": "title_asc",
                                "label": "标题 升序"
                            },
                            {
                                "value": "title_desc",
                                "label": "标题 降序"
                            },
                            {
                                "value": "status_asc",
                                "label": "状态 升序"
                            },
                            {
                                "value": "status_desc",
                                "label": "状态 降序"
                            },
                            {
                                "value": "severity_asc",
                                "label": "严重程度 升序"
                            },
                            {
                                "value": "severity_desc",
                                "label": "严重程度 降序"
                            }
                        ]
                    },
                    {
                        "name": "recPerPage",
                        "required": false,
                        "type": "number",
                        "description": "每页数量，不超过1000"
                    },
                    {
                        "name": "pageID",
                        "required": false,
                        "type": "number",
                        "description": "页码，从第1页开始"
                    },
                    {
                        "name": "filters",
                        "required": false,
                        "type": "array",
                        "description": "搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(Bug标题，示例：关键字)；module(所属模块，模块，示例：0)；keywords(关键词，示例：关键字)；steps(重现步骤，示例：关键字)；assignedTo(指派给，用户，示例：admin)；resolvedBy(解决者，用户，示例：admin)；status(Bug状态，枚举：active 激活 | resolved 已解决 | closed 已关闭)；confirmed(是否确认，枚举：1 已确认 | 0 未确认)；story(相关需求，示例：关键字)；project(所属项目，示例：all)；product(所属产品，示例：all)；branch(branch，示例：all)；plan(所属计划，示例：all)；id(Bug编号，示例：1)；execution(所属执行，执行，示例：3)；severity(严重程度，枚举：1 | 2 | 3 | 4)；pri(优先级，枚举：1 | 2 | 3 | 4)；type(Bug类型，枚举：codeerror 代码错误 | config 配置相关 | install 安装部署 | security 安全相关 | performance 性能问题 | standard 标准规范 | automation 测试脚本 | designdefect 设计缺陷 | codeimprovement 代码改进 | others 其他)；os(操作系统，枚举：all 全部 | windows Windows | win11 Windows 11 | win10 Windows 10 | win8 Windows 8 | win7 Windows 7 | winxp Windows XP | osx Mac OS | android Android | ios IOS | linux Linux | ubuntu Ubuntu | chromeos Chrome OS | fedora Fedora | unix Unix | others 其他)；browser(浏览器，枚举：all 全部 | chrome Chrome | edge Edge | ie IE系列 | ie11 IE11 | ie10 IE10 | ie9 IE9 | ie8 IE8 | firefox firefox系列 | opera Opera系列 | safari | 360 360浏览器 | qq QQ浏览器 | other 其他)；resolution(解决方案，枚举：bydesign 设计如此 | duplicate 重复Bug | external 外部原因 | fixed 已解决 | notrepro 无法重现 | postponed 延期处理 | willnotfix 不予解决 | tostory 转为用户故事)；activatedCount(激活次数，示例：关键字)；toTask(转任务，示例：关键字)；toStory(转用户故事，示例：关键字)；openedBy(由谁创建，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedBy(修改者，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；openedBuild(影响版本，示例：builds)；resolvedBuild(解决版本，示例：builds)；openedDate(创建日期，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；resolvedDate(解决日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(修改日期，示例：2026-01-01)；deadline(截止日期，示例：2026-01-01)；activatedDate(激活时间，示例：2026-01-01)",
                        "style": "deepObject",
                        "explode": true
                    },
                    {
                        "name": "groupJoin",
                        "required": false,
                        "type": "string",
                        "description": "条件组之间的连接方式",
                        "options": [
                            {
                                "value": "and",
                                "label": "and"
                            },
                            {
                                "value": "or",
                                "label": "or"
                            }
                        ]
                    }
                ],
            }, {
                name: 'stories',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
                display: '指派给我的研发需求',
                type: 'list',
                method: 'get',
                path: '/my/stories',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'stories',
                params: [
                    {
                        "name": "param",
                        "required": false,
                        "type": "string",
                        "description": "搜索参数；browseType=bysearch 或 bySearch 时必填。"
                    },
                    {
                        "name": "browseType",
                        "required": false,
                        "type": "string",
                        "description": "状态，默认是assignedTo，取值区分大小写",
                        "defaultValue": "assignedTo",
                        "options": [
                            {
                                "value": "all",
                                "label": "全部"
                            },
                            {
                                "value": "assignedTo",
                                "label": "指派给我"
                            },
                            {
                                "value": "openedBy",
                                "label": "由我创建"
                            },
                            {
                                "value": "reviewBy",
                                "label": "待我评审"
                            },
                            {
                                "value": "reviewedBy",
                                "label": "我评审过"
                            },
                            {
                                "value": "closedBy",
                                "label": "由我关闭"
                            },
                            {
                                "value": "assignedBy",
                                "label": "由我指派"
                            },
                            {
                                "value": "bysearch",
                                "label": "按查询搜索，需同时传 param"
                            }
                        ]
                    },
                    {
                        "name": "orderBy",
                        "required": false,
                        "type": "string",
                        "description": "排序",
                        "options": [
                            {
                                "value": "id_asc",
                                "label": "ID 升序"
                            },
                            {
                                "value": "id_desc",
                                "label": "ID 降序"
                            },
                            {
                                "value": "title_asc",
                                "label": "标题 升序"
                            },
                            {
                                "value": "title_desc",
                                "label": "标题 降序"
                            },
                            {
                                "value": "status_asc",
                                "label": "状态 升序"
                            },
                            {
                                "value": "status_desc",
                                "label": "状态 降序"
                            }
                        ]
                    },
                    {
                        "name": "recPerPage",
                        "required": false,
                        "type": "number",
                        "description": "每页数量，不超过1000"
                    },
                    {
                        "name": "pageID",
                        "required": false,
                        "type": "number",
                        "description": "页码，从第1页开始"
                    },
                    {
                        "name": "filters",
                        "required": false,
                        "type": "array",
                        "description": "搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(需求名称，示例：关键字)；id(编号，示例：1)；keywords(关键词，示例：关键字)；status(当前状态，枚举：draft 草稿 | reviewing 评审中 | active 激活 | changing 变更中 | closed 已关闭)；pri(优先级，枚举：1 | 2 | 3 | 4)；module(所属模块，示例：all)；stage(所处阶段，枚举：wait 未开始 | planned 已计划 | projected 研发立项 | designing 设计中 | designed 设计完毕 | developing 研发中 | developed 研发完毕 | testing 测试中 | tested 测试完毕 | verified 已验收 | rejected 验收失败 | delivering 交付中 | delivered 已交付 | released 已发布 | closed 已关闭)；product(所属产品，示例：all)；branch(branch，示例：all)；grade(需求层级，示例：all)；plan(所属计划，示例：all)；release(所属发布，示例：all)；estimate(预计小时，示例：关键字)；source(来源，枚举：customer 客户 | user 用户 | po 产品经理 | market 市场 | service 客服 | operation 运营 | support 技术支持 | competitor 竞争对手 | partner 合作伙伴 | dev 开发人员 | tester 测试人员 | bug Bug | forum 论坛 | other 其他)；sourceNote(来源备注，示例：关键字)；fromBug(来源Bug，示例：关键字)；category(类别，枚举：feature 功能 | interface 接口 | performance 性能 | safe 安全 | experience 体验 | improve 改进 | other 其他)；openedBy(由谁创建，用户，示例：admin)；reviewedBy(已评审人，用户，示例：admin)；result(评审结果，枚举：pass 确认通过 | revert 撤销变更 | clarify 有待明确 | reject 拒绝)；assignedTo(指派给，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedBy(最后修改，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；closedReason(关闭原因，枚举：done 已完成 | subdivided 已拆分 | duplicate 重复 | postponed 延期 | willnotdo 不做 | cancel 已取消 | bydesign 设计如此)；version(版本号，示例：关键字)；openedDate(创建日期，示例：2026-01-01)；reviewedDate(评审时间，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(最后修改日期，示例：2026-01-01)；activatedDate(激活日期，示例：2026-01-01)",
                        "style": "deepObject",
                        "explode": true
                    },
                    {
                        "name": "groupJoin",
                        "required": false,
                        "type": "string",
                        "description": "条件组之间的连接方式",
                        "options": [
                            {
                                "value": "and",
                                "label": "and"
                            },
                            {
                                "value": "or",
                                "label": "or"
                            }
                        ]
                    }
                ],
            }, {
                name: 'epics',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
                display: '指派给我的业务需求',
                type: 'list',
                method: 'get',
                path: '/my/epics',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'epics',
                params: [
                    {
                        "name": "param",
                        "required": false,
                        "type": "string",
                        "description": "搜索参数；browseType=bysearch 或 bySearch 时必填。"
                    },
                    {
                        "name": "browseType",
                        "required": false,
                        "type": "string",
                        "description": "状态，默认是assignedTo，取值区分大小写",
                        "defaultValue": "assignedTo",
                        "options": [
                            {
                                "value": "all",
                                "label": "全部"
                            },
                            {
                                "value": "assignedTo",
                                "label": "指派给我"
                            },
                            {
                                "value": "openedBy",
                                "label": "由我创建"
                            },
                            {
                                "value": "reviewBy",
                                "label": "待我评审"
                            },
                            {
                                "value": "reviewedBy",
                                "label": "我评审过"
                            },
                            {
                                "value": "closedBy",
                                "label": "由我关闭"
                            },
                            {
                                "value": "assignedBy",
                                "label": "由我指派"
                            },
                            {
                                "value": "bysearch",
                                "label": "按查询搜索，需同时传 param"
                            }
                        ]
                    },
                    {
                        "name": "orderBy",
                        "required": false,
                        "type": "string",
                        "description": "排序",
                        "options": [
                            {
                                "value": "id_asc",
                                "label": "ID 升序"
                            },
                            {
                                "value": "id_desc",
                                "label": "ID 降序"
                            },
                            {
                                "value": "title_asc",
                                "label": "标题 升序"
                            },
                            {
                                "value": "title_desc",
                                "label": "标题 降序"
                            },
                            {
                                "value": "status_asc",
                                "label": "状态 升序"
                            },
                            {
                                "value": "status_desc",
                                "label": "状态 降序"
                            }
                        ]
                    },
                    {
                        "name": "recPerPage",
                        "required": false,
                        "type": "number",
                        "description": "每页数量，不超过1000"
                    },
                    {
                        "name": "pageID",
                        "required": false,
                        "type": "number",
                        "description": "页码，从第1页开始"
                    },
                    {
                        "name": "filters",
                        "required": false,
                        "type": "array",
                        "description": "搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(需求名称，示例：关键字)；id(编号，示例：1)；keywords(关键词，示例：关键字)；status(当前状态，枚举：draft 草稿 | reviewing 评审中 | active 激活 | changing 变更中 | closed 已关闭)；pri(优先级，枚举：1 | 2 | 3 | 4)；module(所属模块，示例：all)；stage(所处阶段，枚举：wait 未开始 | planned 已计划 | projected 研发立项 | designing 设计中 | designed 设计完毕 | developing 研发中 | developed 研发完毕 | testing 测试中 | tested 测试完毕 | verified 已验收 | rejected 验收失败 | delivering 交付中 | delivered 已交付 | released 已发布 | closed 已关闭)；product(所属产品，示例：all)；branch(branch，示例：all)；grade(需求层级，示例：all)；plan(所属计划，示例：all)；release(所属发布，示例：all)；estimate(预计小时，示例：关键字)；source(来源，枚举：customer 客户 | user 用户 | po 产品经理 | market 市场 | service 客服 | operation 运营 | support 技术支持 | competitor 竞争对手 | partner 合作伙伴 | dev 开发人员 | tester 测试人员 | bug Bug | forum 论坛 | other 其他)；sourceNote(来源备注，示例：关键字)；fromBug(来源Bug，示例：关键字)；category(类别，枚举：feature 功能 | interface 接口 | performance 性能 | safe 安全 | experience 体验 | improve 改进 | other 其他)；openedBy(由谁创建，用户，示例：admin)；reviewedBy(已评审人，用户，示例：admin)；result(评审结果，枚举：pass 确认通过 | revert 撤销变更 | clarify 有待明确 | reject 拒绝)；assignedTo(指派给，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedBy(最后修改，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；closedReason(关闭原因，枚举：done 已完成 | subdivided 已拆分 | duplicate 重复 | postponed 延期 | willnotdo 不做 | cancel 已取消 | bydesign 设计如此)；version(版本号，示例：关键字)；openedDate(创建日期，示例：2026-01-01)；reviewedDate(评审时间，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(最后修改日期，示例：2026-01-01)；activatedDate(激活日期，示例：2026-01-01)",
                        "style": "deepObject",
                        "explode": true
                    },
                    {
                        "name": "groupJoin",
                        "required": false,
                        "type": "string",
                        "description": "条件组之间的连接方式",
                        "options": [
                            {
                                "value": "and",
                                "label": "and"
                            },
                            {
                                "value": "or",
                                "label": "or"
                            }
                        ]
                    }
                ],
            }, {
                name: 'requirements',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
                display: '指派给我的用户需求',
                type: 'list',
                method: 'get',
                path: '/my/requirements',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'requirements',
                params: [
                    {
                        "name": "param",
                        "required": false,
                        "type": "string",
                        "description": "搜索参数；browseType=bysearch 或 bySearch 时必填。"
                    },
                    {
                        "name": "browseType",
                        "required": false,
                        "type": "string",
                        "description": "状态，默认是assignedTo，取值区分大小写",
                        "defaultValue": "assignedTo",
                        "options": [
                            {
                                "value": "all",
                                "label": "全部"
                            },
                            {
                                "value": "assignedTo",
                                "label": "指派给我"
                            },
                            {
                                "value": "openedBy",
                                "label": "由我创建"
                            },
                            {
                                "value": "reviewBy",
                                "label": "待我评审"
                            },
                            {
                                "value": "reviewedBy",
                                "label": "我评审过"
                            },
                            {
                                "value": "closedBy",
                                "label": "由我关闭"
                            },
                            {
                                "value": "assignedBy",
                                "label": "由我指派"
                            },
                            {
                                "value": "bysearch",
                                "label": "按查询搜索，需同时传 param"
                            }
                        ]
                    },
                    {
                        "name": "orderBy",
                        "required": false,
                        "type": "string",
                        "description": "排序",
                        "options": [
                            {
                                "value": "id_asc",
                                "label": "ID 升序"
                            },
                            {
                                "value": "id_desc",
                                "label": "ID 降序"
                            },
                            {
                                "value": "title_asc",
                                "label": "标题 升序"
                            },
                            {
                                "value": "title_desc",
                                "label": "标题 降序"
                            },
                            {
                                "value": "status_asc",
                                "label": "状态 升序"
                            },
                            {
                                "value": "status_desc",
                                "label": "状态 降序"
                            }
                        ]
                    },
                    {
                        "name": "recPerPage",
                        "required": false,
                        "type": "number",
                        "description": "每页数量，不超过1000"
                    },
                    {
                        "name": "pageID",
                        "required": false,
                        "type": "number",
                        "description": "页码，从第1页开始"
                    },
                    {
                        "name": "filters",
                        "required": false,
                        "type": "array",
                        "description": "搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(需求名称，示例：关键字)；id(编号，示例：1)；keywords(关键词，示例：关键字)；status(当前状态，枚举：draft 草稿 | reviewing 评审中 | active 激活 | changing 变更中 | closed 已关闭)；pri(优先级，枚举：1 | 2 | 3 | 4)；module(所属模块，示例：all)；stage(所处阶段，枚举：wait 未开始 | planned 已计划 | projected 研发立项 | designing 设计中 | designed 设计完毕 | developing 研发中 | developed 研发完毕 | testing 测试中 | tested 测试完毕 | verified 已验收 | rejected 验收失败 | delivering 交付中 | delivered 已交付 | released 已发布 | closed 已关闭)；product(所属产品，示例：all)；branch(branch，示例：all)；grade(需求层级，示例：all)；plan(所属计划，示例：all)；release(所属发布，示例：all)；estimate(预计小时，示例：关键字)；source(来源，枚举：customer 客户 | user 用户 | po 产品经理 | market 市场 | service 客服 | operation 运营 | support 技术支持 | competitor 竞争对手 | partner 合作伙伴 | dev 开发人员 | tester 测试人员 | bug Bug | forum 论坛 | other 其他)；sourceNote(来源备注，示例：关键字)；fromBug(来源Bug，示例：关键字)；category(类别，枚举：feature 功能 | interface 接口 | performance 性能 | safe 安全 | experience 体验 | improve 改进 | other 其他)；openedBy(由谁创建，用户，示例：admin)；reviewedBy(已评审人，用户，示例：admin)；result(评审结果，枚举：pass 确认通过 | revert 撤销变更 | clarify 有待明确 | reject 拒绝)；assignedTo(指派给，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedBy(最后修改，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；closedReason(关闭原因，枚举：done 已完成 | subdivided 已拆分 | duplicate 重复 | postponed 延期 | willnotdo 不做 | cancel 已取消 | bydesign 设计如此)；version(版本号，示例：关键字)；openedDate(创建日期，示例：2026-01-01)；reviewedDate(评审时间，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(最后修改日期，示例：2026-01-01)；activatedDate(激活日期，示例：2026-01-01)",
                        "style": "deepObject",
                        "explode": true
                    },
                    {
                        "name": "groupJoin",
                        "required": false,
                        "type": "string",
                        "description": "条件组之间的连接方式",
                        "options": [
                            {
                                "value": "and",
                                "label": "and"
                            },
                            {
                                "value": "or",
                                "label": "or"
                            }
                        ]
                    }
                ],
            }, {
                name: 'testtasks',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
                display: '我负责的的测试单',
                type: 'list',
                method: 'get',
                path: '/my/testtasks',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'testtasks',
                params: [
                    {
                        "name": "param",
                        "required": false,
                        "type": "string",
                        "description": "搜索参数；browseType=bysearch 或 bySearch 时必填。"
                    },
                    {
                        "name": "browseType",
                        "required": false,
                        "type": "string",
                        "description": "状态，默认是assignedTo，接口固定返回“我参与的未完成测试单”",
                        "defaultValue": "assignedTo",
                        "options": [
                            {
                                "value": "assignedTo",
                                "label": "我参与的"
                            },
                            {
                                "value": "bySearch",
                                "label": "按查询搜索，需同时传 param"
                            }
                        ]
                    },
                    {
                        "name": "orderBy",
                        "required": false,
                        "type": "string",
                        "description": "排序",
                        "options": [
                            {
                                "value": "id_asc",
                                "label": "ID 升序"
                            },
                            {
                                "value": "id_desc",
                                "label": "ID 降序"
                            },
                            {
                                "value": "name_asc",
                                "label": "名称 升序"
                            },
                            {
                                "value": "name_desc",
                                "label": "名称 降序"
                            },
                            {
                                "value": "status_asc",
                                "label": "状态 升序"
                            },
                            {
                                "value": "status_desc",
                                "label": "状态 降序"
                            }
                        ]
                    },
                    {
                        "name": "recPerPage",
                        "required": false,
                        "type": "number",
                        "description": "每页数量，不超过1000"
                    },
                    {
                        "name": "pageID",
                        "required": false,
                        "type": "number",
                        "description": "页码，从第1页开始"
                    }
                ],
            }, {
                name: 'projects',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                        description: '状态，默认是doing',
                        defaultValue: 'doing',
                        options: [
                            { value: 'doing', label: '进行中' },
                            { value: 'wait', label: '未开始' },
                            { value: 'suspended', label: '已挂起' },
                            { value: 'closed', label: '已关闭' },
                            { value: 'done', label: '已完成' },
                            { value: 'undone', label: '未完成' },
                            { value: 'delayed', label: '已延期' },
                            { value: 'openedbyme', label: '由我创建' },
                            { value: 'all', label: '全部' },
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                        description: '状态，默认是assigntome',
                        defaultValue: 'assigntome',
                        options: [
                            { value: 'assigntome', label: '指派给我' },
                            { value: 'unclosed', label: '未关闭' },
                            { value: 'wait', label: '待处理' },
                            { value: 'doing', label: '处理中' },
                            { value: 'toclosed', label: '待关闭' },
                            { value: 'openedbyme', label: '由我创建' },
                            { value: 'reviewedbyme', label: '我评审过' },
                            { value: 'closedbyme', label: '由我关闭' },
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activatedBy,activatedDate,assignedTo,closedBy,closedDate,closedReason,desc,feedbackBy,id,keywords,mailto,module,notifyEmail,openedBy,openedDate,pri,processedBy,processedDate,product,public,reviewedBy,solution,source,status,title,type',
                        style: 'deepObject',
                        explode: true,
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                        description: '状态，默认是assignedtome',
                        defaultValue: 'assignedtome',
                        options: [
                            { value: 'assignedtome', label: '指派给我' },
                            { value: 'unclosed', label: '未关闭' },
                            { value: 'wait', label: '待处理' },
                            { value: 'doing', label: '处理中' },
                            { value: 'done', label: '待关闭' },
                            { value: 'closed', label: '已关闭' },
                            { value: 'openedbyme', label: '由我创建' },
                            { value: 'finishedbyme', label: '由我解决' },
                            { value: 'closedbyme', label: '由我关闭' },
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activatedBy,activatedCount,activatedDate,assignedTo,closedBy,closedDate,closedReason,contact,customer,deadline,desc,editedBy,editedDate,feedback,id,keywords,mailto,module,notifyEmail,openedBuild,openedBy,openedDate,pri,product,resolution,resolvedBy,resolvedDate,startedBy,startedDate,status,title,type',
                        style: 'deepObject',
                        explode: true,
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
                display: '指派给我的用例',
                type: 'list',
                method: 'get',
                path: '/my/testcases',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'testcases',
                params: [
                    {
                        "name": "param",
                        "required": false,
                        "type": "string",
                        "description": "搜索参数；browseType=bysearch 或 bySearch 时必填。"
                    },
                    {
                        "name": "browseType",
                        "required": false,
                        "type": "string",
                        "description": "状态，默认是assigntome",
                        "defaultValue": "assigntome",
                        "options": [
                            {
                                "value": "assigntome",
                                "label": "指派给我"
                            },
                            {
                                "value": "openedbyme",
                                "label": "我创建的"
                            },
                            {
                                "value": "bysearch",
                                "label": "按查询搜索，需同时传 param"
                            }
                        ]
                    },
                    {
                        "name": "orderBy",
                        "required": false,
                        "type": "string",
                        "description": "排序",
                        "options": [
                            {
                                "value": "id_asc",
                                "label": "ID 升序"
                            },
                            {
                                "value": "id_desc",
                                "label": "ID 降序"
                            },
                            {
                                "value": "title_asc",
                                "label": "标题 升序"
                            },
                            {
                                "value": "title_desc",
                                "label": "标题 降序"
                            },
                            {
                                "value": "status_asc",
                                "label": "状态 升序"
                            },
                            {
                                "value": "status_desc",
                                "label": "状态 降序"
                            }
                        ]
                    },
                    {
                        "name": "recPerPage",
                        "required": false,
                        "type": "number",
                        "description": "每页数量，不超过1000"
                    },
                    {
                        "name": "pageID",
                        "required": false,
                        "type": "number",
                        "description": "页码，从第1页开始"
                    },
                    {
                        "name": "filters",
                        "required": false,
                        "type": "array",
                        "description": "搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(用例名称，示例：关键字)；story(关联需求，示例：all)；id(用例编号，示例：1)；keywords(关键词，示例：关键字)；lastEditedBy(修改者，用户，示例：admin)；type(用例类型，枚举：unit 单元测试 | interface 接口测试 | feature 功能测试 | install 安装部署 | config 配置相关 | performance 性能测试 | security 安全相关 | other 其他)；auto(自动化，枚举：auto 是 | no 否)；openedBy(由谁创建，用户，示例：admin)；status(用例状态，枚举：wait 待评审 | normal 正常 | blocked 被阻塞 | investigate 研究中)；product(所属产品，示例：all)；branch(branch，示例：all)；stage(适用环节，枚举：unittest 单元测试环节 | feature 功能测试环节 | intergrate 集成测试环节 | system 系统测试环节 | smoke 冒烟测试环节 | bvt 版本验证环节)；module(所属模块，模块，示例：0)；pri(优先级，枚举：3 | 1 | 2 | 4)；lib(所属库，示例：all)；lastRunner(执行人，用户，示例：admin)；lastRunResult(结果，枚举：pass 通过 | fail 失败 | blocked 阻塞 | null 未执行)；lastRunDate(执行时间，示例：2026-01-01)；openedDate(创建日期，示例：2026-01-01)；lastEditedDate(修改日期，示例：2026-01-01)；scene(所属场景，示例：all)",
                        "style": "deepObject",
                        "explode": true
                    },
                    {
                        "name": "groupJoin",
                        "required": false,
                        "type": "string",
                        "description": "条件组之间的连接方式",
                        "options": [
                            {
                                "value": "and",
                                "label": "and"
                            },
                            {
                                "value": "or",
                                "label": "or"
                            }
                        ]
                    }
                ],
            }, {
                name: 'meetings',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
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
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
                display: '指派给我的问题',
                type: 'list',
                method: 'get',
                path: '/my/issues',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'issues',
                params: [
                    {
                        "name": "param",
                        "required": false,
                        "type": "string",
                        "description": "搜索参数；browseType=bysearch 或 bySearch 时必填。"
                    },
                    {
                        "name": "browseType",
                        "required": false,
                        "type": "string",
                        "description": "状态，默认是assignedTo，取值取自 zt_issue 的字段名",
                        "defaultValue": "assignedTo",
                        "options": [
                            {
                                "value": "assignedTo",
                                "label": "指派给我"
                            },
                            {
                                "value": "createdBy",
                                "label": "由我创建"
                            },
                            {
                                "value": "resolvedBy",
                                "label": "由我解决"
                            },
                            {
                                "value": "closedBy",
                                "label": "由我关闭"
                            },
                            {
                                "value": "assignedBy",
                                "label": "由我指派"
                            },
                            {
                                "value": "bysearch",
                                "label": "按查询搜索，需同时传 param"
                            }
                        ]
                    },
                    {
                        "name": "orderBy",
                        "required": false,
                        "type": "string",
                        "description": "排序",
                        "options": [
                            {
                                "value": "id_asc",
                                "label": "ID 升序"
                            },
                            {
                                "value": "id_desc",
                                "label": "ID 降序"
                            },
                            {
                                "value": "title_asc",
                                "label": "标题 升序"
                            },
                            {
                                "value": "title_desc",
                                "label": "标题 降序"
                            },
                            {
                                "value": "severity_asc",
                                "label": "严重程度 升序"
                            },
                            {
                                "value": "severity_desc",
                                "label": "严重程度 降序"
                            },
                            {
                                "value": "status_asc",
                                "label": "状态 升序"
                            },
                            {
                                "value": "status_desc",
                                "label": "状态 降序"
                            }
                        ]
                    },
                    {
                        "name": "recPerPage",
                        "required": false,
                        "type": "number",
                        "description": "每页数量，不超过1000"
                    },
                    {
                        "name": "pageID",
                        "required": false,
                        "type": "number",
                        "description": "页码，从第1页开始"
                    }
                ],
            }, {
                name: 'risks',
                minVersion: ['22.5', 'biz13.5', 'max8.5', 'ipd5.5'],
                display: '指派给我的风险',
                type: 'list',
                method: 'get',
                path: '/my/risks',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'risks',
                params: [
                    {
                        "name": "param",
                        "required": false,
                        "type": "string",
                        "description": "搜索参数；browseType=bysearch 或 bySearch 时必填。"
                    },
                    {
                        "name": "browseType",
                        "required": false,
                        "type": "string",
                        "description": "状态，默认是assignedTo，取值取自 zt_risk 的字段名",
                        "defaultValue": "assignedTo",
                        "options": [
                            {
                                "value": "assignedTo",
                                "label": "指派给我"
                            },
                            {
                                "value": "createdBy",
                                "label": "由我创建"
                            },
                            {
                                "value": "closedBy",
                                "label": "由我关闭"
                            },
                            {
                                "value": "assignedBy",
                                "label": "由我指派"
                            },
                            {
                                "value": "bysearch",
                                "label": "按查询搜索，需同时传 param"
                            }
                        ]
                    },
                    {
                        "name": "orderBy",
                        "required": false,
                        "type": "string",
                        "description": "排序",
                        "options": [
                            {
                                "value": "id_asc",
                                "label": "ID 升序"
                            },
                            {
                                "value": "id_desc",
                                "label": "ID 降序"
                            },
                            {
                                "value": "name_asc",
                                "label": "名称 升序"
                            },
                            {
                                "value": "name_desc",
                                "label": "名称 降序"
                            },
                            {
                                "value": "status_asc",
                                "label": "状态 升序"
                            },
                            {
                                "value": "status_desc",
                                "label": "状态 降序"
                            },
                            {
                                "value": "pri_asc",
                                "label": "优先级 升序"
                            },
                            {
                                "value": "pri_desc",
                                "label": "优先级 降序"
                            }
                        ]
                    },
                    {
                        "name": "recPerPage",
                        "required": false,
                        "type": "number",
                        "description": "每页数量，不超过1000"
                    },
                    {
                        "name": "pageID",
                        "required": false,
                        "type": "number",
                        "description": "页码，从第1页开始"
                    },
                    {
                        "name": "filters",
                        "required": false,
                        "type": "array",
                        "description": "搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activateBy,actualClosedDate,assignedTo,cancelBy,category,createdBy,createdDate,editedBy,editedDate,hangupBy,id,identifiedDate,impact,name,plannedClosedDate,prevention,pri,probability,project,rate,remedy,resolution,resolvedBy,source,status,strategy,trackedBy",
                        "style": "deepObject",
                        "explode": true
                    },
                    {
                        "name": "groupJoin",
                        "required": false,
                        "type": "string",
                        "description": "条件组之间的连接方式",
                        "options": [
                            {
                                "value": "and",
                                "label": "and"
                            },
                            {
                                "value": "or",
                                "label": "or"
                            }
                        ]
                    }
                ],
            }, {
                name: 'activityTasks',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '我的地盘-贡献任务',
                type: 'list',
                method: 'get',
                path: '/my/activity/tasks',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'tasks',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '贡献筛选类型，不传时使用禅道页面默认值。',
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序字段。',
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：name(任务名称，示例：关键字)；keywords(关键词，示例：关键字)；id(编号，示例：1)；status(任务状态，枚举：wait 未开始 | doing 进行中 | done 已完成 | pause 已暂停 | cancel 已取消 | closed 已关闭)；desc(任务描述，示例：关键字)；assignedTo(指派给，用户，示例：admin)；pri(优先级，枚举：1 | 2 | 3 | 4)；project(所属项目，示例：all)；execution(所属执行，示例：all)；module(所属模块，示例：all)；estimate(最初预计，示例：关键字)；left(预计剩余，示例：关键字)；consumed(总计消耗，示例：关键字)；type(任务类型，枚举：design 设计 | devel 开发 | request 需求 | test 测试 | study 研究 | discuss 讨论 | ui 界面 | affair 事务 | misc 其他)；story(相关用户故事，示例：all)；fromBug(来源Bug编号，枚举：design 设计 | devel 开发 | request 需求 | test 测试 | study 研究 | discuss 讨论 | ui 界面 | affair 事务 | misc 其他)；closedReason(关闭原因，枚举：done 已完成 | cancel 已取消)；openedBy(由谁创建，用户，示例：admin)；finishedBy(由谁完成，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；canceledBy(由谁取消，用户，示例：admin)；lastEditedBy(最后修改，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；openedDate(创建日期，示例：2026-01-01)；deadline(截止日期，示例：2026-01-01)；estStarted(预计开始，示例：2026-01-01)；realStarted(实际开始，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；finishedDate(实际完成，示例：2026-01-01)；closedDate(关闭时间，示例：2026-01-01)；canceledDate(取消时间，示例：2026-01-01)；lastEditedDate(最后修改日期，示例：2026-01-01)；activatedDate(激活日期，示例：2026-01-01)',
                        style: 'deepObject',
                        explode: true,
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
                name: 'activityBugs',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '我的地盘-贡献 Bug',
                type: 'list',
                method: 'get',
                path: '/my/activity/bugs',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'bugs',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '贡献筛选类型，不传时使用禅道页面默认值。',
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序字段。',
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(Bug标题，示例：关键字)；module(所属模块，模块，示例：0)；keywords(关键词，示例：关键字)；steps(重现步骤，示例：关键字)；assignedTo(指派给，用户，示例：admin)；resolvedBy(解决者，用户，示例：admin)；status(Bug状态，枚举：active 激活 | resolved 已解决 | closed 已关闭)；confirmed(是否确认，枚举：1 已确认 | 0 未确认)；story(相关需求，示例：关键字)；project(所属项目，示例：all)；product(所属产品，示例：all)；branch(branch，示例：all)；plan(所属计划，示例：all)；id(Bug编号，示例：1)；execution(所属执行，执行，示例：3)；severity(严重程度，枚举：1 | 2 | 3 | 4)；pri(优先级，枚举：1 | 2 | 3 | 4)；type(Bug类型，枚举：codeerror 代码错误 | config 配置相关 | install 安装部署 | security 安全相关 | performance 性能问题 | standard 标准规范 | automation 测试脚本 | designdefect 设计缺陷 | codeimprovement 代码改进 | others 其他)；os(操作系统，枚举：all 全部 | windows Windows | win11 Windows 11 | win10 Windows 10 | win8 Windows 8 | win7 Windows 7 | winxp Windows XP | osx Mac OS | android Android | ios IOS | linux Linux | ubuntu Ubuntu | chromeos Chrome OS | fedora Fedora | unix Unix | others 其他)；browser(浏览器，枚举：all 全部 | chrome Chrome | edge Edge | ie IE系列 | ie11 IE11 | ie10 IE10 | ie9 IE9 | ie8 IE8 | firefox firefox系列 | opera Opera系列 | safari | 360 360浏览器 | qq QQ浏览器 | other 其他)；resolution(解决方案，枚举：bydesign 设计如此 | duplicate 重复Bug | external 外部原因 | fixed 已解决 | notrepro 无法重现 | postponed 延期处理 | willnotfix 不予解决 | tostory 转为用户故事)；activatedCount(激活次数，示例：关键字)；toTask(转任务，示例：关键字)；toStory(转用户故事，示例：关键字)；openedBy(由谁创建，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedBy(修改者，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；openedBuild(影响版本，示例：builds)；resolvedBuild(解决版本，示例：builds)；openedDate(创建日期，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；resolvedDate(解决日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(修改日期，示例：2026-01-01)；deadline(截止日期，示例：2026-01-01)；activatedDate(激活时间，示例：2026-01-01)',
                        style: 'deepObject',
                        explode: true,
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
                name: 'activityStories',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '我的地盘-贡献研发需求',
                type: 'list',
                method: 'get',
                path: '/my/activity/stories',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'stories',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '贡献筛选类型，不传时使用禅道页面默认值。',
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序字段。',
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(需求名称，示例：关键字)；id(编号，示例：1)；keywords(关键词，示例：关键字)；status(当前状态，枚举：draft 草稿 | reviewing 评审中 | active 激活 | changing 变更中 | closed 已关闭)；pri(优先级，枚举：1 | 2 | 3 | 4)；module(所属模块，示例：all)；stage(所处阶段，枚举：wait 未开始 | planned 已计划 | projected 研发立项 | designing 设计中 | designed 设计完毕 | developing 研发中 | developed 研发完毕 | testing 测试中 | tested 测试完毕 | verified 已验收 | rejected 验收失败 | delivering 交付中 | delivered 已交付 | released 已发布 | closed 已关闭)；product(所属产品，示例：all)；branch(branch，示例：all)；grade(需求层级，示例：all)；plan(所属计划，示例：all)；release(所属发布，示例：all)；estimate(预计小时，示例：关键字)；source(来源，枚举：customer 客户 | user 用户 | po 产品经理 | market 市场 | service 客服 | operation 运营 | support 技术支持 | competitor 竞争对手 | partner 合作伙伴 | dev 开发人员 | tester 测试人员 | bug Bug | forum 论坛 | other 其他)；sourceNote(来源备注，示例：关键字)；fromBug(来源Bug，示例：关键字)；category(类别，枚举：feature 功能 | interface 接口 | performance 性能 | safe 安全 | experience 体验 | improve 改进 | other 其他)；openedBy(由谁创建，用户，示例：admin)；reviewedBy(已评审人，用户，示例：admin)；result(评审结果，枚举：pass 确认通过 | revert 撤销变更 | clarify 有待明确 | reject 拒绝)；assignedTo(指派给，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedBy(最后修改，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；closedReason(关闭原因，枚举：done 已完成 | subdivided 已拆分 | duplicate 重复 | postponed 延期 | willnotdo 不做 | cancel 已取消 | bydesign 设计如此)；version(版本号，示例：关键字)；openedDate(创建日期，示例：2026-01-01)；reviewedDate(评审时间，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(最后修改日期，示例：2026-01-01)；activatedDate(激活日期，示例：2026-01-01)',
                        style: 'deepObject',
                        explode: true,
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
                name: 'activityEpics',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '我的地盘-贡献业务需求',
                type: 'list',
                method: 'get',
                path: '/my/activity/epics',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'epics',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '贡献筛选类型，不传时使用禅道页面默认值。',
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序字段。',
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(需求名称，示例：关键字)；id(编号，示例：1)；keywords(关键词，示例：关键字)；status(当前状态，枚举：draft 草稿 | reviewing 评审中 | active 激活 | changing 变更中 | closed 已关闭)；pri(优先级，枚举：1 | 2 | 3 | 4)；module(所属模块，示例：all)；stage(所处阶段，枚举：wait 未开始 | planned 已计划 | projected 研发立项 | designing 设计中 | designed 设计完毕 | developing 研发中 | developed 研发完毕 | testing 测试中 | tested 测试完毕 | verified 已验收 | rejected 验收失败 | delivering 交付中 | delivered 已交付 | released 已发布 | closed 已关闭)；product(所属产品，示例：all)；branch(branch，示例：all)；grade(需求层级，示例：all)；plan(所属计划，示例：all)；release(所属发布，示例：all)；estimate(预计小时，示例：关键字)；source(来源，枚举：customer 客户 | user 用户 | po 产品经理 | market 市场 | service 客服 | operation 运营 | support 技术支持 | competitor 竞争对手 | partner 合作伙伴 | dev 开发人员 | tester 测试人员 | bug Bug | forum 论坛 | other 其他)；sourceNote(来源备注，示例：关键字)；fromBug(来源Bug，示例：关键字)；category(类别，枚举：feature 功能 | interface 接口 | performance 性能 | safe 安全 | experience 体验 | improve 改进 | other 其他)；openedBy(由谁创建，用户，示例：admin)；reviewedBy(已评审人，用户，示例：admin)；result(评审结果，枚举：pass 确认通过 | revert 撤销变更 | clarify 有待明确 | reject 拒绝)；assignedTo(指派给，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedBy(最后修改，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；closedReason(关闭原因，枚举：done 已完成 | subdivided 已拆分 | duplicate 重复 | postponed 延期 | willnotdo 不做 | cancel 已取消 | bydesign 设计如此)；version(版本号，示例：关键字)；openedDate(创建日期，示例：2026-01-01)；reviewedDate(评审时间，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(最后修改日期，示例：2026-01-01)；activatedDate(激活日期，示例：2026-01-01)',
                        style: 'deepObject',
                        explode: true,
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
                name: 'activityRequirements',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '我的地盘-贡献用户需求',
                type: 'list',
                method: 'get',
                path: '/my/activity/requirements',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'requirements',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '贡献筛选类型，不传时使用禅道页面默认值。',
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序字段。',
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(需求名称，示例：关键字)；id(编号，示例：1)；keywords(关键词，示例：关键字)；status(当前状态，枚举：draft 草稿 | reviewing 评审中 | active 激活 | changing 变更中 | closed 已关闭)；pri(优先级，枚举：1 | 2 | 3 | 4)；module(所属模块，示例：all)；stage(所处阶段，枚举：wait 未开始 | planned 已计划 | projected 研发立项 | designing 设计中 | designed 设计完毕 | developing 研发中 | developed 研发完毕 | testing 测试中 | tested 测试完毕 | verified 已验收 | rejected 验收失败 | delivering 交付中 | delivered 已交付 | released 已发布 | closed 已关闭)；product(所属产品，示例：all)；branch(branch，示例：all)；grade(需求层级，示例：all)；plan(所属计划，示例：all)；release(所属发布，示例：all)；estimate(预计小时，示例：关键字)；source(来源，枚举：customer 客户 | user 用户 | po 产品经理 | market 市场 | service 客服 | operation 运营 | support 技术支持 | competitor 竞争对手 | partner 合作伙伴 | dev 开发人员 | tester 测试人员 | bug Bug | forum 论坛 | other 其他)；sourceNote(来源备注，示例：关键字)；fromBug(来源Bug，示例：关键字)；category(类别，枚举：feature 功能 | interface 接口 | performance 性能 | safe 安全 | experience 体验 | improve 改进 | other 其他)；openedBy(由谁创建，用户，示例：admin)；reviewedBy(已评审人，用户，示例：admin)；result(评审结果，枚举：pass 确认通过 | revert 撤销变更 | clarify 有待明确 | reject 拒绝)；assignedTo(指派给，用户，示例：admin)；closedBy(由谁关闭，用户，示例：admin)；lastEditedBy(最后修改，用户，示例：admin)；mailto(抄送给，用户，示例：admin)；closedReason(关闭原因，枚举：done 已完成 | subdivided 已拆分 | duplicate 重复 | postponed 延期 | willnotdo 不做 | cancel 已取消 | bydesign 设计如此)；version(版本号，示例：关键字)；openedDate(创建日期，示例：2026-01-01)；reviewedDate(评审时间，示例：2026-01-01)；assignedDate(指派日期，示例：2026-01-01)；closedDate(关闭日期，示例：2026-01-01)；lastEditedDate(最后修改日期，示例：2026-01-01)；activatedDate(激活日期，示例：2026-01-01)',
                        style: 'deepObject',
                        explode: true,
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
                name: 'activityTestTasks',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '我的地盘-贡献测试单',
                type: 'list',
                method: 'get',
                path: '/my/activity/testtasks',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'testtasks',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '贡献筛选类型，不传时使用禅道页面默认值。',
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序字段。',
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
                name: 'activityTestCases',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '我的地盘-贡献用例',
                type: 'list',
                method: 'get',
                path: '/my/activity/testcases',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'testcases',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '贡献筛选类型，不传时使用禅道页面默认值。',
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序字段。',
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：title(用例名称，示例：关键字)；story(关联需求，示例：all)；id(用例编号，示例：1)；keywords(关键词，示例：关键字)；lastEditedBy(修改者，用户，示例：admin)；type(用例类型，枚举：unit 单元测试 | interface 接口测试 | feature 功能测试 | install 安装部署 | config 配置相关 | performance 性能测试 | security 安全相关 | other 其他)；auto(自动化，枚举：auto 是 | no 否)；openedBy(由谁创建，用户，示例：admin)；status(用例状态，枚举：wait 待评审 | normal 正常 | blocked 被阻塞 | investigate 研究中)；product(所属产品，示例：all)；branch(branch，示例：all)；stage(适用环节，枚举：unittest 单元测试环节 | feature 功能测试环节 | intergrate 集成测试环节 | system 系统测试环节 | smoke 冒烟测试环节 | bvt 版本验证环节)；module(所属模块，模块，示例：0)；pri(优先级，枚举：3 | 1 | 2 | 4)；lib(所属库，示例：all)；lastRunner(执行人，用户，示例：admin)；lastRunResult(结果，枚举：pass 通过 | fail 失败 | blocked 阻塞 | null 未执行)；lastRunDate(执行时间，示例：2026-01-01)；openedDate(创建日期，示例：2026-01-01)；lastEditedDate(修改日期，示例：2026-01-01)；scene(所属场景，示例：all)',
                        style: 'deepObject',
                        explode: true,
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
                name: 'activityDocs',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '我的地盘-贡献文档',
                type: 'list',
                method: 'get',
                path: '/my/activity/docs',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'docs',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '贡献筛选类型，不传时使用禅道页面默认值。',
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序字段。',
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
                name: 'activityIssues',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '我的地盘-贡献问题',
                type: 'list',
                method: 'get',
                path: '/my/activity/issues',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'issues',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '贡献筛选类型，不传时使用禅道页面默认值。',
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序字段。',
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
                name: 'activityRisks',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '我的地盘-贡献风险',
                type: 'list',
                method: 'get',
                path: '/my/activity/risks',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'risks',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '贡献筛选类型，不传时使用禅道页面默认值。',
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序字段。',
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activateBy,actualClosedDate,assignedTo,cancelBy,category,createdBy,createdDate,editedBy,editedDate,hangupBy,id,identifiedDate,impact,name,plannedClosedDate,prevention,pri,probability,project,rate,remedy,resolution,resolvedBy,source,status,strategy,trackedBy',
                        style: 'deepObject',
                        explode: true,
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
                name: 'activityReviewIssues',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '我的地盘-贡献评审问题',
                type: 'list',
                method: 'get',
                path: '/my/activity/reviewissues',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'reviewissues',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '贡献筛选类型，不传时使用禅道页面默认值。',
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序字段。',
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：assignedDate,assignedTo,createdBy,createdDate,id,opinion,resolution,review,status,title,type',
                        style: 'deepObject',
                        explode: true,
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
                name: 'activityFeedbacks',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '我的地盘-贡献反馈',
                type: 'list',
                method: 'get',
                path: '/my/activity/feedbacks',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'feedbacks',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '贡献筛选类型，不传时使用禅道页面默认值。',
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序字段。',
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
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activatedBy,activatedDate,assignedTo,closedBy,closedDate,closedReason,desc,feedbackBy,id,keywords,mailto,module,notifyEmail,openedBy,openedDate,pri,processedBy,processedDate,product,public,reviewedBy,solution,source,status,title,type',
                        style: 'deepObject',
                        explode: true,
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
                name: 'activityAudits',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '我的地盘-贡献审批',
                type: 'list',
                method: 'get',
                path: '/my/activity/audits',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'audits',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '贡献筛选类型，不传时使用禅道页面默认值。',
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序字段。',
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
                name: 'reviewIssues',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '我的地盘-待处理评审问题',
                type: 'list',
                method: 'get',
                path: '/my/reviewissues',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'reviewissues',
                params: [
                    {
                        "name": "param",
                        "required": false,
                        "type": "string",
                        "description": "搜索参数；browseType=bysearch 或 bySearch 时必填。"
                    },
                    {
                        "name": "browseType",
                        "required": false,
                        "type": "string",
                        "description": "待处理筛选类型，默认 assignedTo，取值取自 zt_reviewissue 的字段名",
                        "defaultValue": "assignedTo",
                        "options": [
                            {
                                "value": "assignedTo",
                                "label": "指派给我"
                            },
                            {
                                "value": "createdBy",
                                "label": "由我创建"
                            },
                            {
                                "value": "resolutionBy",
                                "label": "由我解决"
                            },
                            {
                                "value": "assignedBy",
                                "label": "由我指派"
                            },
                            {
                                "value": "bysearch",
                                "label": "按查询搜索，需同时传 param"
                            }
                        ]
                    },
                    {
                        "name": "orderBy",
                        "required": false,
                        "type": "string",
                        "description": "排序字段。"
                    },
                    {
                        "name": "recPerPage",
                        "required": false,
                        "type": "number",
                        "description": "每页数量，不超过1000"
                    },
                    {
                        "name": "pageID",
                        "required": false,
                        "type": "number",
                        "description": "页码，从第1页开始"
                    },
                    {
                        "name": "filters",
                        "required": false,
                        "type": "array",
                        "description": "搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：assignedDate,assignedTo,createdBy,createdDate,id,opinion,resolution,review,status,title,type",
                        "style": "deepObject",
                        "explode": true
                    },
                    {
                        "name": "groupJoin",
                        "required": false,
                        "type": "string",
                        "description": "条件组之间的连接方式",
                        "options": [
                            {
                                "value": "and",
                                "label": "and"
                            },
                            {
                                "value": "or",
                                "label": "or"
                            }
                        ]
                    }
                ],
            }, {
                name: 'audits',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '我的地盘-待处理审批',
                type: 'list',
                method: 'get',
                path: '/my/audits',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'audits',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '待处理审批类型，默认 all',
                        defaultValue: 'all',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'demand', label: '需求池需求' },
                            { value: 'story', label: '研发需求' },
                            { value: 'requirement', label: '用户需求' },
                            { value: 'epic', label: '业务需求' },
                            { value: 'testcase', label: '用例' },
                            { value: 'project', label: '项目' },
                            { value: 'ppm', label: '评审请求' },
                            { value: 'feedback', label: '反馈' },
                            { value: '自定义工作流模块代号', label: '自定义工作流模块代号' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序字段。',
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
                name: 'auditPlans',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '我的地盘-待处理审计计划',
                type: 'list',
                method: 'get',
                path: '/my/auditplans',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'auditplans',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '待处理筛选类型，默认 myChecking，取值不区分大小写',
                        defaultValue: 'myChecking',
                        options: [
                            { value: 'mychecking', label: '待我检查' },
                            { value: 'checked', label: '已检查' },
                            { value: 'wait', label: '未检查' },
                            { value: 'checking', label: '检查中' },
                            { value: 'assignto', label: '指派给我' },
                            { value: 'delay', label: '已延期' },
                            { value: 'iscycle', label: '周期性计划' },
                            { value: 'all', label: '全部' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序字段。',
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
                name: 'ncs',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '我的地盘-待处理不符合项',
                type: 'list',
                method: 'get',
                path: '/my/ncs',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'ncs',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '待处理筛选类型，默认 assignedToMe',
                        defaultValue: 'assignedToMe',
                        options: [
                            { value: 'assignedToMe', label: '指派给我' },
                            { value: 'createdByMe', label: '由我创建' },
                            { value: 'resolvedByMe', label: '由我解决' },
                            { value: 'closedByMe', label: '由我关闭' },
                            { value: 'all', label: '全部' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序字段。',
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
            }
        ],
    },

    /* 过程裁剪模块 */
    {
        name: 'process',
        display: '过程裁剪',
        description: '过程裁剪管理，支持获取过程裁剪列表，支持获取项目/执行下的过程裁剪、提交项目过程裁剪结果、提交执行过程裁剪结果',
        actions: [
            {
                name: 'list',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取过程裁剪列表，支持获取项目/执行下的过程裁剪',
                type: 'list',
                method: 'get',
                path: '/{scope}/{scopeID}/processes',
                resultType: 'list',
                resultGetter: 'processList',
                pathParams: {
                    scope: {description: '过程裁剪所属范围', options: [{value: 'projects', label: '项目'}, {value: 'executions', label: '执行'}]},
                    scopeID: '所属范围ID',
                },
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '过程裁剪筛选类型，默认 wait',
                        defaultValue: 'wait',
                        options: [
                            { value: 'wait', label: '待裁剪' },
                            { value: 'yes', label: '已裁剪适用' },
                            { value: 'no', label: '已裁剪不适用' },
                        ],
                    },
                    {
                        name: 'moduleID',
                        required: false,
                        type: 'number',
                        description: '过程 ID，用于只查询指定过程下的活动和交付物；默认 0。',
                        defaultValue: '0',
                    },
                ],
            }, {
                name: 'setProject',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '提交项目过程裁剪结果',
                type: 'action',
                method: 'post',
                path: '/projects/{projectID}/processes',
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
                            "items": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "裁剪结果列表，每项包含 type(activity 活动 | deliverable 交付物)、id(对象ID)、result(yes 适用 | no 不适用)"
                            }
                        },
                        "required": [
                            "items"
                        ]
                    },
                    example: {
                        "items": [
                            {
                                "type": "activity",
                                "id": 475,
                                "result": "yes"
                            }
                        ]
                    },
                },
            }, {
                name: 'setExecution',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '提交执行过程裁剪结果',
                type: 'action',
                method: 'post',
                path: '/executions/{executionID}/processes',
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
                            "items": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "裁剪结果列表，每项包含 type(activity 活动 | deliverable 交付物)、id(对象ID)、result(yes 适用 | no 不适用)"
                            }
                        },
                        "required": [
                            "items"
                        ]
                    },
                    example: {
                        "items": [
                            {
                                "type": "activity",
                                "id": 475,
                                "result": "yes"
                            }
                        ]
                    },
                },
            }
        ],
    },

    /* 质量保证计划模块 */
    {
        name: 'auditplan',
        display: '质量保证计划',
        description: '质量保证计划管理，支持获取质量保证计划列表，支持获取项目/执行下的质量保证计划、新增质量保证计划、检查质量保证计划、批量新增项目质量保证计划、获取质量保证详情、编辑质量保证计划、删除质量保证计划',
        actions: [
            {
                name: 'list',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取质量保证计划列表，支持获取项目/执行下的质量保证计划',
                type: 'list',
                method: 'get',
                path: '/{scope}/{scopeID}/auditplans',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'auditplans',
                pathParams: {
                    scope: {description: '质量保证计划所属范围', options: [{value: 'projects', label: '项目'}, {value: 'executions', label: '执行'}]},
                    scopeID: '所属范围ID',
                },
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '筛选类型，默认 all',
                        defaultValue: 'all',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'wait', label: '待检查' },
                            { value: 'checking', label: '检查中' },
                            { value: 'checked', label: '已检查' },
                            { value: 'assignto', label: '指派给我' },
                            { value: 'delay', label: '已延期' },
                            { value: 'today', label: '今天' },
                            { value: 'yesterday', label: '昨天' },
                            { value: 'lastmonth', label: '上月' },
                            { value: 'month', label: '本月' },
                            { value: 'nextmonth', label: '下月' },
                            { value: 'iscycle', label: '周期计划' },
                        ],
                    },
                    {
                        name: 'param',
                        required: false,
                        type: 'number',
                        description: '筛选参数。browseType=bysearch 时传查询 ID；按过程筛选时传过程 ID；按执行筛选时传执行 ID。',
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序字段，默认 id_desc。',
                        defaultValue: 'id_desc',
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，默认 20。',
                        defaultValue: '20',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，默认 1。',
                        defaultValue: '1',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：assignedTo,checkDate,checkedBy,createdBy,createdDate,execution,id,objectID,process,realCheckDate,status',
                        style: 'deepObject',
                        explode: true,
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
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '新增质量保证计划',
                type: 'create',
                method: 'post',
                path: '/auditplans',
                resultType: 'object',
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "projectID": {
                                "type": "integer",
                                "description": "所属项目或执行 ID",
                                "format": "int32"
                            },
                            "execution": {
                                "type": "integer",
                                "description": "所属执行 ID，项目级计划传 0；敏捷多执行项目下需要传执行 ID",
                                "format": "int32"
                            },
                            "process": {
                                "type": "integer",
                                "description": "所属过程 ID",
                                "format": "int32"
                            },
                            "objectID": {
                                "type": "integer",
                                "description": "检查对象 ID（活动或交付物 ID）",
                                "format": "int32"
                            },
                            "objectType": {
                                "type": "string",
                                "description": "检查对象类型(activity 活动 | zoutput 交付物)"
                            },
                            "status": {
                                "type": "string",
                                "description": "状态(wait 待检查 | checking 检查中 | checked 已检查)"
                            },
                            "isCycle": {
                                "type": "integer",
                                "description": "是否周期计划(0 否 | 1 是)",
                                "format": "int32"
                            },
                            "checkDateList": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "计划检查日期列表"
                            },
                            "assignedToList": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "检查人账号列表"
                            }
                        },
                        "required": [
                            "projectID",
                            "process",
                            "objectID"
                        ]
                    },
                    example: {
                        "projectID": 2,
                        "execution": 3,
                        "process": 117,
                        "objectID": 475,
                        "objectType": "activity",
                        "status": "wait",
                        "isCycle": 0,
                        "checkDateList": [
                            "2026-10-17"
                        ],
                        "assignedToList": [
                            "admin"
                        ]
                    },
                },
            }, {
                name: 'check',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '检查质量保证计划',
                type: 'action',
                method: 'post',
                path: '/auditplans/{auditplanID}/check',
                resultType: 'text',
                pathParams: {
                    auditplanID: 'auditplanID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "listID": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "检查清单项 ID 列表"
                            },
                            "result": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "检查结果列表(pass 通过 | fail 不通过)"
                            },
                            "status": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "结果状态列表(normal 正式提交 | draft 草稿)"
                            }
                        },
                        "required": [
                            "listID",
                            "result"
                        ]
                    },
                    example: {
                        "listID": [
                            1
                        ],
                        "result": [
                            "pass"
                        ],
                        "status": [
                            "normal"
                        ]
                    },
                },
            }, {
                name: 'batchCreate',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '批量新增项目质量保证计划',
                type: 'action',
                method: 'post',
                path: '/projects/{projectID}/auditplans/batch',
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
                            "process": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "过程 ID 列表"
                            },
                            "execution": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "执行 ID 列表，项目级计划传 0"
                            },
                            "objectID": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "检查对象 ID 列表"
                            },
                            "objectType": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "对象类型列表(activity 活动 | zoutput 交付物)"
                            },
                            "checkDate": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "计划检查日期列表"
                            },
                            "assignedTo": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "指派人账号列表"
                            },
                            "status": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "状态列表(wait 待检查 | checking 检查中 | checked 已检查)"
                            }
                        },
                        "required": [
                            "process",
                            "objectID",
                            "checkDate"
                        ]
                    },
                    example: {
                        "process": [
                            117
                        ],
                        "execution": [
                            3
                        ],
                        "objectID": [
                            475
                        ],
                        "objectType": [
                            "activity"
                        ],
                        "checkDate": [
                            "2026-10-18"
                        ],
                        "assignedTo": [
                            "admin"
                        ],
                        "status": [
                            "wait"
                        ]
                    },
                },
            }, {
                name: 'get',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取质量保证详情',
                type: 'get',
                method: 'get',
                path: '/auditplans/{auditplanID}',
                resultType: 'object',
                resultGetter: 'auditplan',
                pathParams: {
                    auditplanID: 'auditplanID',
                },
            }, {
                name: 'update',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '编辑质量保证计划',
                type: 'update',
                method: 'put',
                path: '/auditplans/{auditplanID}',
                resultType: 'object',
                pathParams: {
                    auditplanID: 'auditplanID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "execution": {
                                "type": "integer",
                                "description": "所属执行 ID，项目级计划传 0。",
                                "format": "int32"
                            },
                            "process": {
                                "type": "integer",
                                "description": "所属过程 ID。",
                                "format": "int32"
                            },
                            "objectID": {
                                "type": "integer",
                                "description": "检查对象 ID。",
                                "format": "int32"
                            },
                            "objectType": {
                                "type": "string",
                                "description": "检查对象类型(activity 活动 | zoutput 交付物)"
                            },
                            "status": {
                                "type": "string",
                                "description": "状态(wait 待检查 | checking 检查中 | checked 已检查)"
                            },
                            "assignedTo": {
                                "type": "string",
                                "description": "指派人账号。"
                            },
                            "comment": {
                                "type": "string",
                                "description": "编辑备注。"
                            }
                        }
                    },
                    example: {
                        "execution": 3,
                        "process": 117,
                        "objectID": 475,
                        "objectType": "activity",
                        "status": "wait",
                        "assignedTo": "admin",
                        "comment": "通过 API 编辑"
                    },
                },
            }, {
                name: 'delete',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '删除质量保证计划',
                type: 'delete',
                method: 'delete',
                path: '/auditplans/{auditplanID}',
                resultType: 'text',
                pathParams: {
                    auditplanID: 'auditplanID',
                },
            }
        ],
    },

    /* 不符合项模块 */
    {
        name: 'nc',
        display: '不符合项',
        description: '不符合项管理，支持获取不符合项列表，支持获取项目/执行下的不符合项、新建项目不符合项、新建执行不符合项、获取不符合项详情、编辑不符合项、删除不符合项',
        actions: [
            {
                name: 'list',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取不符合项列表，支持获取项目/执行下的不符合项',
                type: 'list',
                method: 'get',
                path: '/{scope}/{scopeID}/ncs',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'ncs',
                pathParams: {
                    scope: {description: '不符合项所属范围', options: [{value: 'projects', label: '项目'}, {value: 'executions', label: '执行'}]},
                    scopeID: '所属范围ID',
                },
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '筛选类型，默认 unclosed',
                        defaultValue: 'unclosed',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'unclosed', label: '未关闭' },
                            { value: 'assignedtome', label: '指派给我' },
                            { value: 'assignedbyme', label: '由我指派' },
                            { value: 'bysearch', label: '搜索' },
                        ],
                    },
                    {
                        name: 'param',
                        required: false,
                        type: 'string',
                        description: 'browseType=bysearch 时传查询 ID。',
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序字段，默认 id_desc。',
                        defaultValue: 'id_desc',
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，默认 20。',
                        defaultValue: '20',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，默认 1。',
                        defaultValue: '1',
                    },
                ],
            }, {
                name: 'createProject',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '新建项目不符合项',
                type: 'create',
                method: 'post',
                path: '/projects/{projectID}/ncs',
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
                            "objectType": {
                                "type": "string",
                                "description": "不符合项对象类型(auditplan 质量保证计划 | deliverable 交付物)"
                            },
                            "title": {
                                "type": "string",
                                "description": "不符合项名称"
                            },
                            "execution": {
                                "type": "integer",
                                "description": "所属执行 ID，项目级不符合项传 0",
                                "format": "int32"
                            },
                            "auditplan": {
                                "type": "integer",
                                "description": "质量保证计划 ID，objectType=auditplan 时必填",
                                "format": "int32"
                            },
                            "listID": {
                                "type": "integer",
                                "description": "检查清单项 ID，objectType=auditplan 时必填",
                                "format": "int32"
                            },
                            "severity": {
                                "type": "integer",
                                "description": "严重程度(1 严重 | 2 中等 | 3 轻微)",
                                "format": "int32"
                            },
                            "type": {
                                "type": "string",
                                "description": "不符合项分类"
                            }
                        },
                        "required": [
                            "objectType",
                            "title",
                            "severity"
                        ]
                    },
                    example: {
                        "objectType": "auditplan",
                        "title": "检查记录不完整",
                        "execution": 0,
                        "auditplan": 1,
                        "listID": 1,
                        "severity": 2,
                        "type": "process"
                    },
                },
            }, {
                name: 'createExecution',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '新建执行不符合项',
                type: 'create',
                method: 'post',
                path: '/executions/{executionID}/ncs',
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
                            "objectType": {
                                "type": "string",
                                "description": "不符合项对象类型(auditplan 质量保证计划 | deliverable 交付物)"
                            },
                            "title": {
                                "type": "string",
                                "description": "不符合项名称"
                            },
                            "auditplan": {
                                "type": "integer",
                                "description": "质量保证计划 ID，objectType=auditplan 时必填",
                                "format": "int32"
                            },
                            "listID": {
                                "type": "integer",
                                "description": "检查清单项 ID，objectType=auditplan 时必填",
                                "format": "int32"
                            },
                            "severity": {
                                "type": "integer",
                                "description": "严重程度(1 严重 | 2 中等 | 3 轻微)",
                                "format": "int32"
                            },
                            "type": {
                                "type": "string",
                                "description": "不符合项分类"
                            }
                        },
                        "required": [
                            "objectType",
                            "title",
                            "severity"
                        ]
                    },
                    example: {
                        "objectType": "auditplan",
                        "title": "执行检查记录不完整",
                        "auditplan": 1,
                        "listID": 1,
                        "severity": 2,
                        "type": "process"
                    },
                },
            }, {
                name: 'get',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取不符合项详情',
                type: 'get',
                method: 'get',
                path: '/ncs/{ncID}',
                resultType: 'object',
                resultGetter: 'nc',
                pathParams: {
                    ncID: 'ncID',
                },
            }, {
                name: 'update',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '编辑不符合项',
                type: 'update',
                method: 'put',
                path: '/ncs/{ncID}',
                resultType: 'object',
                pathParams: {
                    ncID: 'ncID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "title": {
                                "type": "string",
                                "description": "不符合项名称"
                            },
                            "type": {
                                "type": "string",
                                "description": "不符合项分类"
                            },
                            "execution": {
                                "type": "integer",
                                "description": "所属执行 ID，项目级不符合项传 0。",
                                "format": "int32"
                            },
                            "auditplan": {
                                "type": "integer",
                                "description": "质量保证计划 ID，基于质量保证计划的不符合项必填。",
                                "format": "int32"
                            },
                            "listID": {
                                "type": "integer",
                                "description": "检查清单项 ID，基于质量保证计划的不符合项必填。",
                                "format": "int32"
                            },
                            "severity": {
                                "type": "integer",
                                "description": "严重程度(1 严重 | 2 中等 | 3 轻微)",
                                "format": "int32"
                            },
                            "assignedTo": {
                                "type": "string",
                                "description": "指派人账号。"
                            },
                            "deadline": {
                                "type": "string",
                                "description": "计划解决日期。"
                            },
                            "desc": {
                                "type": "string",
                                "description": "完成情况说明。"
                            }
                        },
                        "required": [
                            "title",
                            "severity"
                        ]
                    },
                    example: {
                        "title": "检查记录不完整-已编辑",
                        "type": "process",
                        "execution": 0,
                        "auditplan": 1,
                        "listID": 1,
                        "severity": 2,
                        "assignedTo": "admin",
                        "deadline": "2026-10-23",
                        "desc": "<p>补充检查记录。</p>"
                    },
                },
            }, {
                name: 'delete',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '删除不符合项',
                type: 'delete',
                method: 'delete',
                path: '/ncs/{ncID}',
                resultType: 'text',
                pathParams: {
                    ncID: 'ncID',
                },
            }
        ],
    },

    /* 机会模块 */
    {
        name: 'opportunity',
        display: '机会',
        description: '机会管理，支持获取机会列表，支持获取项目/执行下的机会、创建项目机会、批量创建项目机会、获取机会详情、编辑机会、删除机会',
        actions: [
            {
                name: 'list',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取机会列表，支持获取项目/执行下的机会',
                type: 'list',
                method: 'get',
                path: '/{scope}/{scopeID}/opportunities',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'opportunities',
                pathParams: {
                    scope: {description: '机会所属范围', options: [{value: 'projects', label: '项目'}, {value: 'executions', label: '执行'}]},
                    scopeID: '所属范围ID',
                },
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '筛选类型，默认 all',
                        defaultValue: 'all',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'active', label: '开放' },
                            { value: 'assignTo', label: '指派给我' },
                            { value: 'closed', label: '已关闭' },
                            { value: 'hangup', label: '已挂起' },
                            { value: 'canceled', label: '已取消' },
                            { value: 'review', label: '待评审' },
                            { value: 'bysearch', label: '搜索' },
                        ],
                    },
                    {
                        name: 'param',
                        required: false,
                        type: 'string',
                        description: '搜索参数；browseType=bysearch 时使用。',
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序字段，默认 id_desc。',
                        defaultValue: 'id_desc',
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，默认 20。',
                        defaultValue: '20',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，默认 1。',
                        defaultValue: '1',
                    },
                    {
                        name: 'filters',
                        required: false,
                        type: 'array',
                        description: '搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：activatedBy,actualClosedDate,assignedTo,canceledBy,chance,createdBy,createdDate,desc,editedBy,editedDate,hangupedBy,id,identifiedDate,impact,lastCheckedBy,name,plannedClosedDate,prevention,pri,ratio,resolution,resolvedBy,source,status,strategy,type',
                        style: 'deepObject',
                        explode: true,
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
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '创建项目机会',
                type: 'create',
                method: 'post',
                path: '/projects/{projectID}/opportunities',
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
                                "description": "机会名称。"
                            },
                            "source": {
                                "type": "string",
                                "description": "机会来源。"
                            },
                            "execution": {
                                "type": "integer",
                                "description": "所属执行 ID，项目级机会传 0；传执行 ID 时机会同时归属项目和执行。",
                                "format": "int32"
                            },
                            "type": {
                                "type": "string",
                                "description": "机会类型。"
                            },
                            "strategy": {
                                "type": "string",
                                "description": "机会应对策略。"
                            },
                            "impact": {
                                "type": "integer",
                                "description": "影响程度，1-5。",
                                "format": "int32"
                            },
                            "chance": {
                                "type": "integer",
                                "description": "发生概率，1-5。",
                                "format": "int32"
                            },
                            "ratio": {
                                "type": "integer",
                                "description": "机会系数，通常为 impact * chance。",
                                "format": "int32"
                            },
                            "pri": {
                                "type": "integer",
                                "description": "优先级，1 高、2 中、3 低。",
                                "format": "int32"
                            },
                            "identifiedDate": {
                                "type": "string",
                                "description": "机会识别日期。"
                            },
                            "plannedClosedDate": {
                                "type": "string",
                                "description": "计划关闭日期。"
                            },
                            "assignedTo": {
                                "type": "string",
                                "description": "指派人账号。"
                            },
                            "desc": {
                                "type": "string",
                                "description": "机会描述。"
                            },
                            "prevention": {
                                "type": "string",
                                "description": "应对措施。"
                            }
                        },
                        "required": [
                            "name"
                        ]
                    },
                    example: {
                        "name": "API 创建机会",
                        "source": "business",
                        "execution": 3,
                        "type": "technical",
                        "strategy": "monitor",
                        "impact": 3,
                        "chance": 3,
                        "ratio": 9,
                        "pri": 2,
                        "identifiedDate": "2026-10-16",
                        "plannedClosedDate": "2026-11-05",
                        "assignedTo": "admin",
                        "desc": "<p>发现可复用的项目机会。</p>",
                        "prevention": "<p>持续跟踪并推进机会落地。</p>"
                    },
                },
            }, {
                name: 'batchCreate',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '批量创建项目机会',
                type: 'action',
                method: 'post',
                path: '/projects/{projectID}/opportunities/batch',
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
                            "name": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "机会名称列表"
                            },
                            "source": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "机会来源列表"
                            },
                            "execution": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "所属执行 ID 列表，项目级机会传 0"
                            },
                            "impact": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "影响程度列表，1-5"
                            },
                            "chance": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "发生概率列表，1-5"
                            },
                            "pri": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "优先级列表，1 高、2 中、3 低"
                            },
                            "desc": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "机会描述列表"
                            }
                        },
                        "required": [
                            "name"
                        ]
                    },
                    example: {
                        "name": [
                            "API 批量创建机会 1",
                            "API 批量创建机会 2"
                        ],
                        "source": [
                            "business",
                            "team"
                        ],
                        "execution": [
                            0,
                            0
                        ],
                        "impact": [
                            4,
                            3
                        ],
                        "chance": [
                            3,
                            5
                        ],
                        "pri": [
                            2,
                            1
                        ],
                        "desc": [
                            "<p>第一条机会。</p>",
                            "<p>第二条机会。</p>"
                        ]
                    },
                },
            }, {
                name: 'get',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取机会详情',
                type: 'get',
                method: 'get',
                path: '/opportunities/{opportunityID}',
                resultType: 'object',
                resultGetter: 'opportunity',
                pathParams: {
                    opportunityID: 'opportunityID',
                },
            }, {
                name: 'update',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '编辑机会',
                type: 'update',
                method: 'put',
                path: '/opportunities/{opportunityID}',
                resultType: 'object',
                pathParams: {
                    opportunityID: 'opportunityID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "机会名称。"
                            },
                            "source": {
                                "type": "string",
                                "description": "机会来源。"
                            },
                            "execution": {
                                "type": "integer",
                                "description": "所属执行 ID，项目级机会传 0。",
                                "format": "int32"
                            },
                            "type": {
                                "type": "string",
                                "description": "机会类型。"
                            },
                            "strategy": {
                                "type": "string",
                                "description": "机会应对策略。"
                            },
                            "status": {
                                "type": "string",
                                "description": "机会状态(active 开放 | closed 已关闭 | hangup 已挂起 | canceled 已取消)"
                            },
                            "impact": {
                                "type": "integer",
                                "description": "影响程度，1-5。",
                                "format": "int32"
                            },
                            "chance": {
                                "type": "integer",
                                "description": "发生概率，1-5。",
                                "format": "int32"
                            },
                            "pri": {
                                "type": "integer",
                                "description": "优先级，1 高、2 中、3 低。",
                                "format": "int32"
                            },
                            "assignedTo": {
                                "type": "string",
                                "description": "指派人账号。"
                            },
                            "desc": {
                                "type": "string",
                                "description": "机会描述。"
                            },
                            "prevention": {
                                "type": "string",
                                "description": "应对措施。"
                            }
                        }
                    },
                    example: {
                        "name": "API 编辑机会",
                        "source": "business",
                        "execution": 0,
                        "type": "technical",
                        "strategy": "monitor",
                        "status": "active",
                        "impact": 4,
                        "chance": 3,
                        "pri": 2,
                        "assignedTo": "admin",
                        "desc": "<p>更新后的机会描述。</p>",
                        "prevention": "<p>更新后的应对措施。</p>"
                    },
                },
            }, {
                name: 'delete',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '删除机会',
                type: 'delete',
                method: 'delete',
                path: '/opportunities/{opportunityID}',
                resultType: 'text',
                pathParams: {
                    opportunityID: 'opportunityID',
                },
            }
        ],
    },

    /* 交付物模块 */
    {
        name: 'deliverable',
        display: '交付物',
        description: '交付物管理，支持获取交付物列表，支持获取项目下的交付物、获取项目可选交付物列表、新增项目交付物、获取交付物详情、删除项目交付物',
        actions: [
            {
                name: 'list',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取交付物列表，支持获取项目下的交付物',
                type: 'list',
                method: 'get',
                path: '/projects/{projectID}/deliverables',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'deliverables',
                pathParams: {
                    projectID: '所属项目ID',
                },
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '交付物筛选类型，默认 normal',
                        defaultValue: 'normal',
                        options: [
                            { value: 'normal', label: '已提交' },
                            { value: 'wait', label: '未提交' },
                            { value: 'mine', label: '我提交' },
                            { value: 'submitbyme', label: '由我发起' },
                            { value: 'pending', label: '待评审' },
                            { value: 'pendingme', label: '待我评审' },
                            { value: 'reviewing', label: '评审中' },
                            { value: 'reviewedbyme', label: '我评审过' },
                            { value: 'pass', label: '评审通过' },
                            { value: 'fail', label: '评审失败' },
                            { value: 'bymodule', label: '按模块' },
                            { value: 'bysearch', label: '搜索' },
                        ],
                    },
                    {
                        name: 'param',
                        required: false,
                        type: 'string',
                        description: 'browseType 为 bymodule 时传模块 ID，为 bysearch 时传已保存查询 ID。',
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序字段，默认 id_desc。',
                        defaultValue: 'id_desc',
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，默认 20。',
                        defaultValue: '20',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，默认 1。',
                        defaultValue: '1',
                    },
                ],
            }, {
                name: 'options',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取项目可选交付物列表',
                type: 'get',
                method: 'get',
                path: '/projects/{projectID}/deliverable-options',
                resultType: 'object',
                resultGetter: 'deliverables',
                pathParams: {
                    projectID: '项目ID',
                },
                description: '获取当前项目流程下可以提交的交付物定义。返回结果中 deliverables 的属性名为交付物定义 ID，值为交付物名称，可用于创建项目交付物。',
            }, {
                name: 'create',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '新增项目交付物',
                type: 'create',
                method: 'post',
                path: '/projects/{projectID}/deliverables',
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
                            "deliverable": {
                                "type": "integer",
                                "description": "交付物定义 ID，取自交付物列表返回的 deliverable 字段。",
                                "format": "int32"
                            },
                            "sourceType": {
                                "type": "string",
                                "description": "来源类型(project 项目 | task 任务)。"
                            },
                            "sourceID": {
                                "type": "integer",
                                "description": "来源对象 ID，sourceType=project 时传项目 ID。",
                                "format": "int32"
                            },
                            "doc": {
                                "type": "object",
                                "properties": [],
                                "description": "交付物文档，键为交付物定义 ID；每项包含 doc(文档 ID 列表)、docVersion(版本列表)、name(名称列表)。"
                            }
                        },
                        "required": [
                            "deliverable",
                            "sourceType",
                            "sourceID",
                            "doc"
                        ]
                    },
                    example: {
                        "deliverable": "160",
                        "sourceType": "project",
                        "sourceID": 2,
                        "doc": {
                            "160": {
                                "doc": [
                                    4
                                ],
                                "docVersion": [
                                    1
                                ],
                                "name": [
                                    "API 创建的交付物"
                                ]
                            }
                        }
                    },
                },
            }, {
                name: 'get',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取交付物详情',
                type: 'get',
                method: 'get',
                path: '/deliverables/{deliverableID}',
                resultType: 'object',
                resultGetter: 'deliverable',
                pathParams: {
                    deliverableID: 'deliverableID',
                },
            }, {
                name: 'delete',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '删除项目交付物',
                type: 'delete',
                method: 'delete',
                path: '/deliverables/{deliverableID}',
                resultType: 'text',
                pathParams: {
                    deliverableID: 'deliverableID',
                },
            }
        ],
    },

    /* 基线模块 */
    {
        name: 'baseline',
        display: '基线',
        description: '基线管理，支持获取基线列表，支持获取项目下的基线、创建项目基线、获取基线详情、编辑项目基线、删除项目基线',
        actions: [
            {
                name: 'list',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取基线列表，支持获取项目下的基线',
                type: 'list',
                method: 'get',
                path: '/projects/{projectID}/baselines',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'baselines',
                pathParams: {
                    projectID: '所属项目ID',
                },
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '基线状态筛选，默认 all',
                        defaultValue: 'all',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'wait', label: '待提交' },
                            { value: 'reviewing', label: '评审中' },
                            { value: 'pass', label: '已通过' },
                            { value: 'reject', label: '已拒绝' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序字段，默认 id_desc。',
                        defaultValue: 'id_desc',
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，默认 20。',
                        defaultValue: '20',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，默认 1。',
                        defaultValue: '1',
                    },
                ],
            }, {
                name: 'create',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '创建项目基线',
                type: 'create',
                method: 'post',
                path: '/projects/{projectID}/baselines',
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
                            "title": {
                                "type": "string",
                                "description": "基线名称。"
                            },
                            "version": {
                                "type": "string",
                                "description": "基线版本。"
                            },
                            "category": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "纳入基线的交付物 ID 列表。"
                            },
                            "type": {
                                "type": "string",
                                "description": "基线类型。"
                            },
                            "status": {
                                "type": "string",
                                "description": "基线状态。"
                            }
                        },
                        "required": [
                            "title",
                            "version",
                            "category"
                        ]
                    },
                    example: {
                        "title": "API 基线",
                        "version": "V1.0",
                        "category": [
                            1
                        ],
                        "type": "taged",
                        "status": "wait"
                    },
                },
            }, {
                name: 'get',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取基线详情',
                type: 'get',
                method: 'get',
                path: '/baselines/{baselineID}',
                resultType: 'object',
                resultGetter: 'baseline',
                pathParams: {
                    baselineID: 'baselineID',
                },
            }, {
                name: 'update',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '编辑项目基线',
                type: 'update',
                method: 'put',
                path: '/baselines/{baselineID}',
                resultType: 'object',
                pathParams: {
                    baselineID: 'baselineID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "title": {
                                "type": "string",
                                "description": "基线名称。"
                            },
                            "version": {
                                "type": "string",
                                "description": "基线版本。"
                            },
                            "category": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "纳入基线的交付物 ID 列表。"
                            },
                            "comment": {
                                "type": "string",
                                "description": "编辑备注。"
                            }
                        },
                        "required": [
                            "title",
                            "version",
                            "category"
                        ]
                    },
                    example: {
                        "title": "API 基线（已编辑）",
                        "version": "V1.1",
                        "category": [
                            1
                        ],
                        "comment": "通过 API 编辑"
                    },
                },
            }, {
                name: 'delete',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '删除项目基线',
                type: 'delete',
                method: 'delete',
                path: '/baselines/{baselineID}',
                resultType: 'text',
                pathParams: {
                    baselineID: 'baselineID',
                },
            }
        ],
    },

    /* 项目变更模块 */
    {
        name: 'change',
        display: '项目变更',
        description: '项目变更管理，支持获取项目变更列表，支持获取项目下的项目变更、创建项目变更、获取变更详情、编辑项目变更、删除项目变更',
        actions: [
            {
                name: 'list',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取项目变更列表，支持获取项目下的项目变更',
                type: 'list',
                method: 'get',
                path: '/projects/{projectID}/changes',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'projectchanges',
                pathParams: {
                    projectID: '所属项目ID',
                },
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '变更状态筛选，默认 all',
                        defaultValue: 'all',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'wait', label: '待提交' },
                            { value: 'reviewing', label: '评审中' },
                            { value: 'pass', label: '已通过' },
                            { value: 'reject', label: '已拒绝' },
                            { value: 'reverting', label: '撤销中' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序字段，默认 id_desc。',
                        defaultValue: 'id_desc',
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量，默认 20。',
                        defaultValue: '20',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码，默认 1。',
                        defaultValue: '1',
                    },
                ],
            }, {
                name: 'create',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '创建项目变更',
                type: 'create',
                method: 'post',
                path: '/projects/{projectID}/changes',
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
                                "description": "变更名称。"
                            },
                            "urgency": {
                                "type": "string",
                                "description": "紧急程度。"
                            },
                            "type": {
                                "type": "string",
                                "description": "变更类型。"
                            },
                            "owner": {
                                "type": "string",
                                "description": "变更负责人。"
                            },
                            "reason": {
                                "type": "string",
                                "description": "变更原因。"
                            },
                            "desc": {
                                "type": "string",
                                "description": "变更描述。"
                            }
                        },
                        "required": [
                            "name",
                            "urgency",
                            "type",
                            "owner",
                            "reason",
                            "desc"
                        ]
                    },
                    example: {
                        "name": "API 变更",
                        "urgency": "urgent",
                        "type": "dev",
                        "owner": "admin",
                        "reason": "需求变化",
                        "desc": "<p>API 创建的变更。</p>"
                    },
                },
            }, {
                name: 'get',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取变更详情',
                type: 'get',
                method: 'get',
                path: '/changes/{changeID}',
                resultType: 'object',
                resultGetter: 'projectchange',
                pathParams: {
                    changeID: 'changeID',
                },
            }, {
                name: 'update',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '编辑项目变更',
                type: 'update',
                method: 'put',
                path: '/changes/{changeID}',
                resultType: 'object',
                pathParams: {
                    changeID: 'changeID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "变更名称。"
                            },
                            "urgency": {
                                "type": "string",
                                "description": "紧急程度。"
                            },
                            "type": {
                                "type": "string",
                                "description": "变更类型。"
                            },
                            "owner": {
                                "type": "string",
                                "description": "变更负责人。"
                            },
                            "reason": {
                                "type": "string",
                                "description": "变更原因。"
                            },
                            "desc": {
                                "type": "string",
                                "description": "变更描述。"
                            }
                        },
                        "required": [
                            "name",
                            "urgency",
                            "type",
                            "owner",
                            "reason",
                            "desc"
                        ]
                    },
                    example: {
                        "name": "API 变更（已编辑）",
                        "urgency": "normal",
                        "type": "dev",
                        "owner": "admin",
                        "reason": "需求调整",
                        "desc": "<p>更新后的变更描述。</p>"
                    },
                },
            }, {
                name: 'delete',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '删除项目变更',
                type: 'delete',
                method: 'delete',
                path: '/changes/{changeID}',
                resultType: 'text',
                pathParams: {
                    changeID: 'changeID',
                },
            }
        ],
    },

    /* 对象关联模块 */
    {
        name: 'relation',
        display: '对象关联',
        description: '对象关联管理，支持关联对象、查询可关联对象、查询关联对象、删除关联关系',
        actions: [
            {
                name: 'link',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '关联对象',
                type: 'action',
                method: 'post',
                path: '/relations/{objectType}/{objectID}/{relatedObjectType}',
                resultType: 'text',
                pathParams: {
                    objectType: 'objectType',
                    objectID: 'objectID',
                    relatedObjectType: 'relatedObjectType',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "relation": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "description": "被关联对象 ID 与关系 key 的映射，键为候选接口返回的 objects[].id，值为 relationPairs 返回的 key。"
                            }
                        },
                        "required": [
                            "relation"
                        ]
                    },
                    example: {
                        "relation": {
                            "1": 1
                        }
                    },
                },
            }, {
                name: 'candidates',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '查询可关联对象',
                type: 'list',
                method: 'get',
                path: '/relations/{objectType}/{objectID}/candidates/{relatedObjectType}',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'objects',
                pathParams: {
                    objectType: 'objectType',
                    objectID: 'objectID',
                    relatedObjectType: 'relatedObjectType',
                },
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '候选对象筛选类型。',
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序字段。',
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量。',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码。',
                    },
                ],
            }, {
                name: 'list',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '查询关联对象',
                type: 'list',
                method: 'get',
                path: '/relations/{objectType}/{objectID}',
                resultType: 'list',
                resultGetter: 'relations',
                pathParams: {
                    objectType: 'objectType',
                    objectID: 'objectID',
                },
            }, {
                name: 'unlink',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '删除关联关系',
                type: 'delete',
                method: 'delete',
                path: '/relations/{relationID}',
                resultType: 'text',
                pathParams: {
                    relationID: 'relationID',
                },
                description: '根据关系记录 ID 删除自定义关联关系。relationID 从查询关联对象接口返回的 relations[].relationID 字段获取，只有 relationType 为 custom 的自定义关系可以删除。',
            }
        ],
    },

    /* 项目流程模块 */
    {
        name: 'workflowgroup',
        display: '项目流程',
        description: '项目流程管理，支持获取项目流程列表',
        actions: [
            {
                name: 'list',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取项目流程列表',
                type: 'list',
                method: 'get',
                path: '/workflowgroups',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'groups',
                params: [
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '项目流程状态筛选，默认 all',
                        defaultValue: 'all',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'normal', label: '正常' },
                            { value: 'pause', label: '已停用' },
                        ],
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序字段。',
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量。',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码。',
                    },
                ],
            }
        ],
    },

    /* 人力资源日历模块 */
    {
        name: 'resourcecalendar',
        display: '人力资源日历',
        description: '人力资源日历管理，支持查询人力资源日历',
        actions: [
            {
                name: 'get',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '查询人力资源日历',
                type: 'get',
                method: 'get',
                path: '/resourcecalendars',
                resultType: 'object',
                resultGetter: 'resourceCalendars',
                params: [
                    {
                        name: 'type',
                        required: false,
                        type: 'string',
                        description: '日历维度，默认 company',
                        defaultValue: 'company',
                        options: [
                            { value: 'company', label: '按部门' },
                            { value: 'person', label: '按人员' },
                        ],
                    },
                    {
                        name: 'mode',
                        required: false,
                        type: 'string',
                        description: '统计模式，默认 wait',
                        defaultValue: 'wait',
                        options: [
                            { value: 'wait', label: '待处理' },
                            { value: 'done', label: '已完成' },
                        ],
                    },
                    {
                        name: 'accounts',
                        required: false,
                        type: 'string',
                        description: '逗号分隔的用户账号；结果会继续按部门、项目和用户权限过滤。',
                    },
                    {
                        name: 'projectID',
                        required: false,
                        type: 'number',
                        description: '项目 ID；传入后仅查询该项目成员的日历数据。',
                    },
                    {
                        name: 'depts',
                        required: false,
                        type: 'string',
                        description: '逗号分隔的部门 ID；仅拥有查看所有人权限时生效。',
                    },
                ],
            }
        ],
    },

    /* 项目周报模块 */
    {
        name: 'weekly',
        display: '项目周报',
        description: '项目周报管理，支持获取项目周报列表、创建项目周报、获取项目周报详情、编辑项目周报、删除项目周报',
        actions: [
            {
                name: 'list',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取项目周报列表',
                type: 'list',
                method: 'get',
                path: '/weeklies',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'reports',
                params: [
                    {
                        name: 'projectID',
                        required: true,
                        type: 'number',
                        description: '项目 ID。',
                    },
                    {
                        name: 'browseType',
                        required: false,
                        type: 'string',
                        description: '筛选类型，默认 all',
                        defaultValue: 'all',
                        options: [
                            { value: 'all', label: '全部' },
                            { value: 'bymodule', label: '按目录' },
                            { value: 'bysearch', label: '搜索' },
                        ],
                    },
                    {
                        name: 'param',
                        required: false,
                        type: 'string',
                        description: 'browseType=bymodule 时传目录 ID，browseType=bysearch 时传查询 ID。',
                    },
                    {
                        name: 'orderBy',
                        required: false,
                        type: 'string',
                        description: '排序字段。',
                    },
                    {
                        name: 'recPerPage',
                        required: false,
                        type: 'number',
                        description: '每页数量。',
                    },
                    {
                        name: 'pageID',
                        required: false,
                        type: 'number',
                        description: '页码。',
                    },
                ],
            }, {
                name: 'create',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '创建项目周报',
                type: 'create',
                method: 'post',
                path: '/weeklies',
                resultType: 'object',
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "projectID": {
                                "type": "integer",
                                "description": "项目 ID。",
                                "format": "int32"
                            },
                            "reportModule": {
                                "type": "string",
                                "description": "项目周报分类 ID，没有分类时可传 0。"
                            },
                            "title": {
                                "type": "string",
                                "description": "周报标题。"
                            },
                            "templateID": {
                                "type": "integer",
                                "description": "报告模板 ID，不使用模板时传 0。",
                                "format": "int32"
                            },
                            "templateDesc": {
                                "type": "string",
                                "description": "周报描述。"
                            },
                            "acl": {
                                "type": "string",
                                "description": "访问控制(open 公开 | private 私有)。"
                            },
                            "status": {
                                "type": "string",
                                "description": "周报状态(draft 草稿 | normal 正常)。"
                            }
                        },
                        "required": [
                            "projectID"
                        ]
                    },
                    example: {
                        "projectID": 2,
                        "reportModule": "0",
                        "title": "API 创建项目周报",
                        "templateID": 0,
                        "templateDesc": "通过 API 创建的项目周报",
                        "acl": "open",
                        "status": "draft"
                    },
                },
            }, {
                name: 'get',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取项目周报详情',
                type: 'get',
                method: 'get',
                path: '/weeklies/{reportID}',
                resultType: 'object',
                resultGetter: 'report',
                pathParams: {
                    reportID: 'reportID',
                },
            }, {
                name: 'update',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '编辑项目周报',
                type: 'update',
                method: 'put',
                path: '/weeklies/{reportID}',
                resultType: 'object',
                pathParams: {
                    reportID: 'reportID',
                },
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "title": {
                                "type": "string",
                                "description": "周报标题。"
                            },
                            "status": {
                                "type": "string",
                                "description": "周报状态。"
                            },
                            "contentType": {
                                "type": "string",
                                "description": "内容类型，默认 doc。"
                            },
                            "type": {
                                "type": "string",
                                "description": "文档类型，默认 text。"
                            },
                            "content": {
                                "type": "string",
                                "description": "周报 HTML 内容。"
                            },
                            "rawContent": {
                                "type": "string",
                                "description": "周报原始内容。"
                            },
                            "comment": {
                                "type": "string",
                                "description": "编辑备注。"
                            }
                        }
                    },
                    example: {
                        "title": "API 编辑项目周报",
                        "status": "normal",
                        "contentType": "doc",
                        "type": "text",
                        "content": "<p>本周项目进展正常。</p>",
                        "comment": "通过 API 编辑"
                    },
                },
            }, {
                name: 'delete',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '删除项目周报',
                type: 'delete',
                method: 'delete',
                path: '/weeklies/{reportID}',
                resultType: 'text',
                pathParams: {
                    reportID: 'reportID',
                },
            }
        ],
    },

    /* 数据库模块 */
    {
        name: 'db',
        display: '数据库',
        description: '数据库管理，支持获取数据库表列表、执行SQL查询、获取数据库表结构',
        actions: [
            {
                name: 'tables',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取数据库表列表',
                type: 'list',
                method: 'get',
                path: '/db/tables',
                resultType: 'list',
                resultGetter: 'tables',
            }, {
                name: 'query',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '执行SQL查询',
                type: 'list',
                method: 'post',
                path: '/db/query',
                resultType: 'list',
                resultGetter: 'rows',
                requestBody: {
                    required: true,
                    type: 'object',
                    schema: {
                        "type": "object",
                        "properties": {
                            "sql": {
                                "type": "string",
                                "description": "只读 SQL 语句，仅支持 SELECT 查询。"
                            },
                            "page": {
                                "type": "integer",
                                "description": "页码，默认 1。",
                                "format": "int32"
                            },
                            "limit": {
                                "type": "integer",
                                "description": "每页条数，默认 100。",
                                "format": "int32"
                            },
                            "count": {
                                "type": "boolean",
                                "description": "是否统计总条数，默认 true。"
                            }
                        },
                        "required": [
                            "sql"
                        ]
                    },
                    example: {
                        "sql": "SELECT id, account FROM zt_user",
                        "page": 1,
                        "limit": 100,
                        "count": true
                    },
                },
                description: '返回查询结果行及分页；使用 raw: true 可获取原始响应中的 SQL、列信息和执行耗时。',
                pagerGetter: {
                    "pageID": "page",
                    "recPerPage": "limit",
                    "recTotal": "total"
                },
            }, {
                name: 'table',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取数据库表结构',
                type: 'get',
                method: 'get',
                path: '/db/tables/{table}',
                resultType: 'object',
                resultGetter: 'table',
                pathParams: {
                    "table": "数据库表名，例如 zt_config"
                },
                params: [
                    {
                        "name": "type",
                        "type": "string",
                        "description": "表结构返回格式",
                        "defaultValue": "meta",
                        "options": [
                            {
                                "value": "meta",
                                "label": "元数据"
                            },
                            {
                                "value": "sql",
                                "label": "建表 SQL"
                            }
                        ]
                    }
                ],
                description: 'meta 返回表信息、主键和列定义；sql 返回包含表信息、dialect 和建表 SQL 的对象。',
            }
        ],
    },

    /* 知识库模块 */
    {
        name: 'knowledgelib',
        display: '知识库',
        description: '知识库管理，支持获取 AI 知识库列表',
        actions: [
            {
                name: 'list',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取 AI 知识库列表',
                type: 'list',
                method: 'get',
                path: '/ai/knowledgelibs',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'data',
                params: [
                    {
                        "name": "type",
                        "type": "string",
                        "description": "库类型，省略或空字符串时合并两类可见库",
                        "options": [
                            {
                                "value": "my",
                                "label": "我的知识库"
                            },
                            {
                                "value": "team",
                                "label": "组织知识库"
                            }
                        ]
                    },
                    {
                        "name": "keyword",
                        "type": "string",
                        "description": "知识库名称或描述关键词，首尾空白会被移除"
                    },
                    {
                        "name": "pageID",
                        "type": "number",
                        "defaultValue": 1,
                        "description": "页码，从 1 开始的正整数"
                    },
                    {
                        "name": "recPerPage",
                        "type": "number",
                        "defaultValue": 20,
                        "description": "每页条数，范围 1～100"
                    }
                ],
            }
        ],
    },

    /* 知识模块 */
    {
        name: 'knowledge',
        display: '知识',
        description: '知识管理，支持获取 AI 知识库内的知识列表、在多个 AI 知识库内向量搜索、按关键词搜索 AI 知识、获取 AI 知识详情',
        actions: [
            {
                name: 'list',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取 AI 知识库内的知识列表',
                type: 'list',
                method: 'get',
                path: '/ai/knowledgelibs/{libID}/knowledges',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'data',
                pathParams: {
                    "libID": "本地知识库 ID，正整数"
                },
                params: [
                    {
                        "name": "type",
                        "type": "string",
                        "description": "知识类型，省略或空字符串表示不限；text/file 不可与非空 objectType 同时使用。",
                        "options": [
                            {
                                "value": "object",
                                "label": "对象知识"
                            },
                            {
                                "value": "text",
                                "label": "文本知识"
                            },
                            {
                                "value": "file",
                                "label": "文件知识"
                            }
                        ]
                    },
                    {
                        "name": "objectType",
                        "type": "string",
                        "description": "来源对象类型；单独指定时按 type=object 筛选，每次只接受一个编码。",
                        "options": [
                            {
                                "value": "story",
                                "label": "需求"
                            },
                            {
                                "value": "task",
                                "label": "任务"
                            },
                            {
                                "value": "case",
                                "label": "测试用例"
                            },
                            {
                                "value": "bug",
                                "label": "Bug"
                            },
                            {
                                "value": "plan",
                                "label": "产品计划"
                            },
                            {
                                "value": "release",
                                "label": "发布"
                            },
                            {
                                "value": "feedback",
                                "label": "反馈"
                            },
                            {
                                "value": "ticket",
                                "label": "工单"
                            },
                            {
                                "value": "doc",
                                "label": "文档（含接口文档）"
                            },
                            {
                                "value": "issue",
                                "label": "问题"
                            },
                            {
                                "value": "risk",
                                "label": "风险"
                            },
                            {
                                "value": "opportunity",
                                "label": "机会"
                            },
                            {
                                "value": "practice",
                                "label": "最佳实践"
                            },
                            {
                                "value": "component",
                                "label": "组件"
                            }
                        ]
                    },
                    {
                        "name": "pageID",
                        "type": "number",
                        "defaultValue": 1,
                        "description": "页码，从 1 开始的正整数"
                    },
                    {
                        "name": "recPerPage",
                        "type": "number",
                        "defaultValue": 20,
                        "description": "每页条数，范围 1～100"
                    }
                ],
                description: '返回当前用户可见的知识条目，按本地 ID 降序排列；不支持标题关键词查询。',
            }, {
                name: 'embeddingsSearch',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '在多个 AI 知识库内向量搜索',
                type: 'list',
                method: 'post',
                path: '/ai/knowledges/embeddingssearch',
                resultType: 'list',
                resultGetter: 'data',
                requestBody: {
                    "required": true,
                    "mediaType": "application/json",
                    "schema": {
                        "type": "object",
                        "required": [
                            "keyword",
                            "libIDs"
                        ],
                        "example": {
                            "keyword": "如何处理接口请求超时",
                            "libIDs": [
                                12,
                                18
                            ],
                            "minSimilarity": 0.7,
                            "limit": 5
                        },
                        "properties": {
                            "keyword": {
                                "type": "string",
                                "minLength": 1,
                                "description": "搜索问题或关键词，去除首尾空白后不能为空"
                            },
                            "libIDs": {
                                "type": "array",
                                "minItems": 1,
                                "items": {
                                    "type": "integer",
                                    "minimum": 1
                                },
                                "description": "本地知识库 ID 的非空正整数数组，例如 [12,18]；不接受字符串元素，重复 ID 自动去重"
                            },
                            "type": {
                                "type": "string",
                                "description": "知识类型，省略或空字符串表示不限；text/file 不可与非空 objectType 同时使用。",
                                "options": [
                                    {
                                        "value": "object",
                                        "label": "对象知识"
                                    },
                                    {
                                        "value": "text",
                                        "label": "文本知识"
                                    },
                                    {
                                        "value": "file",
                                        "label": "文件知识"
                                    }
                                ]
                            },
                            "objectType": {
                                "type": "string",
                                "description": "来源对象类型；单独指定时按 type=object 筛选，每次只接受一个编码。",
                                "options": [
                                    {
                                        "value": "story",
                                        "label": "需求"
                                    },
                                    {
                                        "value": "task",
                                        "label": "任务"
                                    },
                                    {
                                        "value": "case",
                                        "label": "测试用例"
                                    },
                                    {
                                        "value": "bug",
                                        "label": "Bug"
                                    },
                                    {
                                        "value": "plan",
                                        "label": "产品计划"
                                    },
                                    {
                                        "value": "release",
                                        "label": "发布"
                                    },
                                    {
                                        "value": "feedback",
                                        "label": "反馈"
                                    },
                                    {
                                        "value": "ticket",
                                        "label": "工单"
                                    },
                                    {
                                        "value": "doc",
                                        "label": "文档（含接口文档）"
                                    },
                                    {
                                        "value": "issue",
                                        "label": "问题"
                                    },
                                    {
                                        "value": "risk",
                                        "label": "风险"
                                    },
                                    {
                                        "value": "opportunity",
                                        "label": "机会"
                                    },
                                    {
                                        "value": "practice",
                                        "label": "最佳实践"
                                    },
                                    {
                                        "value": "component",
                                        "label": "组件"
                                    }
                                ]
                            },
                            "minSimilarity": {
                                "type": "number",
                                "minimum": 0,
                                "maximum": 1,
                                "defaultValue": 0.5,
                                "description": "最小匹配度，范围 [0,1]"
                            },
                            "limit": {
                                "type": "integer",
                                "minimum": 1,
                                "maximum": 100,
                                "defaultValue": 5,
                                "description": "整次多库搜索最多返回的片段数，范围 1～100"
                            }
                        }
                    }
                },
                description: '仅检索已有索引，需 ai.searchknowledgelib 权限。按匹配度降序返回片段，不分页；用 knowledgeID 获取完整正文，chunkID 仅标识片段。',
            }, {
                name: 'search',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '按关键词搜索 AI 知识',
                type: 'list',
                method: 'post',
                path: '/ai/knowledges/search',
                resultType: 'list',
                pagerGetter: 'pager',
                resultGetter: 'data',
                requestBody: {
                    "required": true,
                    "mediaType": "application/json",
                    "schema": {
                        "type": "object",
                        "required": [
                            "keywords",
                            "libIDs"
                        ],
                        "example": {
                            "keywords": [
                                "登录",
                                "超时"
                            ],
                            "libIDs": [
                                12,
                                18
                            ],
                            "matchMode": "any",
                            "pageID": 1,
                            "recPerPage": 20
                        },
                        "properties": {
                            "keywords": {
                                "type": "array",
                                "minItems": 1,
                                "items": {
                                    "type": "string",
                                    "minLength": 1
                                },
                                "description": "非空关键词数组，每项去除首尾空白后为 1～200 个 Unicode 字符，去重后最多 20 项；%、_ 和反斜杠按普通字符匹配"
                            },
                            "libIDs": {
                                "type": "array",
                                "minItems": 1,
                                "items": {
                                    "type": "integer",
                                    "minimum": 1
                                },
                                "description": "本地知识库 ID 的非空正整数数组，例如 [12,18]；不接受字符串元素，重复 ID 自动去重"
                            },
                            "matchMode": {
                                "type": "string",
                                "defaultValue": "any",
                                "description": "any 表示任一关键词出现在标题或正文中；all 表示同一条知识的每个关键词均出现在标题或正文之一，可分别命中两个字段。仅省略时使用 any，空字符串和 null 无效",
                                "options": [
                                    {
                                        "value": "any",
                                        "label": "任一关键词匹配标题或正文"
                                    },
                                    {
                                        "value": "all",
                                        "label": "全部关键词匹配同一条知识"
                                    }
                                ]
                            },
                            "type": {
                                "type": "string",
                                "description": "知识类型，省略或空字符串表示不限；text/file 不可与非空 objectType 同时使用。",
                                "options": [
                                    {
                                        "value": "object",
                                        "label": "对象知识"
                                    },
                                    {
                                        "value": "text",
                                        "label": "文本知识"
                                    },
                                    {
                                        "value": "file",
                                        "label": "文件知识"
                                    }
                                ]
                            },
                            "objectType": {
                                "type": "string",
                                "description": "来源对象类型；单独指定时按 type=object 筛选，每次只接受一个编码。",
                                "options": [
                                    {
                                        "value": "story",
                                        "label": "需求"
                                    },
                                    {
                                        "value": "task",
                                        "label": "任务"
                                    },
                                    {
                                        "value": "case",
                                        "label": "测试用例"
                                    },
                                    {
                                        "value": "bug",
                                        "label": "Bug"
                                    },
                                    {
                                        "value": "plan",
                                        "label": "产品计划"
                                    },
                                    {
                                        "value": "release",
                                        "label": "发布"
                                    },
                                    {
                                        "value": "feedback",
                                        "label": "反馈"
                                    },
                                    {
                                        "value": "ticket",
                                        "label": "工单"
                                    },
                                    {
                                        "value": "doc",
                                        "label": "文档（含接口文档）"
                                    },
                                    {
                                        "value": "issue",
                                        "label": "问题"
                                    },
                                    {
                                        "value": "risk",
                                        "label": "风险"
                                    },
                                    {
                                        "value": "opportunity",
                                        "label": "机会"
                                    },
                                    {
                                        "value": "practice",
                                        "label": "最佳实践"
                                    },
                                    {
                                        "value": "component",
                                        "label": "组件"
                                    }
                                ]
                            },
                            "pageID": {
                                "type": "integer",
                                "minimum": 1,
                                "defaultValue": 1,
                                "description": "页码，从 1 开始的正整数"
                            },
                            "recPerPage": {
                                "type": "integer",
                                "minimum": 1,
                                "maximum": 100,
                                "defaultValue": 20,
                                "description": "每页条数，范围 1～100"
                            }
                        }
                    }
                },
                description: '需 ai.searchknowledgelib 权限，按字面文本匹配 title 或已保存的 content，不依赖向量索引。标题与正文分别匹配，单个关键词不能跨字段拼接。返回完整正文及 contentType，正文为空或 null 时返回空字符串；每条知识只返回一次，按知识 ID 降序分页。',
            }, {
                name: 'get',
                minVersion: ['22.7', 'biz13.7', 'max8.7', 'ipd5.7'],
                display: '获取 AI 知识详情',
                type: 'get',
                method: 'get',
                path: '/ai/knowledges/{knowledgeID}',
                resultType: 'object',
                resultGetter: 'data',
                pathParams: {
                    "knowledgeID": "本地知识条目 ID，正整数；不可使用 chunkID 或来源对象 objectID"
                },
                description: '返回已保存的完整正文及来源信息，不触发文件提取、知识同步或索引更新。按 contentType 解释正文，尚未保存正文时 content 可为空。',
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
        createRisk: { resultType: 'object' };
        linkStories: { resultType: 'text' };
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
        linkStories: { resultType: 'text' };
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
        flows: { resultType: 'list' };
        fields: { resultType: 'list' };
        actions: { resultType: 'list' };
        labels: { resultType: 'list' };
        tables: { resultType: 'list' };
        datasources: { resultType: 'list' };
        rules: { resultType: 'list' };
        create: { resultType: 'object' };
        createFlow: { resultType: 'object' };
        copyFlow: { resultType: 'object' };
        createField: { resultType: 'object' };
        createAction: { resultType: 'object' };
        createLabel: { resultType: 'object' };
        createTable: { resultType: 'object' };
        createDatasource: { resultType: 'object' };
        createRule: { resultType: 'object' };
        getFlow: { resultType: 'object' };
        getField: { resultType: 'object' };
        getAction: { resultType: 'object' };
        getLabel: { resultType: 'object' };
        getTable: { resultType: 'object' };
        getDatasource: { resultType: 'object' };
        getRule: { resultType: 'object' };
        update: { resultType: 'object' };
        updateFlow: { resultType: 'object' };
        updateField: { resultType: 'object' };
        updateAction: { resultType: 'object' };
        updateLabel: { resultType: 'object' };
        updateTable: { resultType: 'object' };
        updateDatasource: { resultType: 'object' };
        updateRule: { resultType: 'object' };
        delete: { resultType: 'text' };
        deleteFlow: { resultType: 'text' };
        deleteField: { resultType: 'text' };
        deleteAction: { resultType: 'text' };
        deleteLabel: { resultType: 'text' };
        deleteTable: { resultType: 'text' };
        deleteDatasource: { resultType: 'text' };
        deleteRule: { resultType: 'text' };
        activateFlow: { resultType: 'text' };
        deactivateFlow: { resultType: 'text' };
        releaseFlow: { resultType: 'text' };
        setApproval: { resultType: 'text' };
        setActionCSS: { resultType: 'text' };
        setFlowCSS: { resultType: 'text' };
        setExport: { resultType: 'text' };
        setFulltextSearch: { resultType: 'text' };
        setActionJS: { resultType: 'text' };
        setFlowJS: { resultType: 'text' };
        setActionNotice: { resultType: 'text' };
        setSearch: { resultType: 'text' };
        setValue: { resultType: 'text' };
        setActionVerification: { resultType: 'text' };
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
        get: { resultType: 'object' };
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
        activityTasks: { resultType: 'list' };
        activityBugs: { resultType: 'list' };
        activityStories: { resultType: 'list' };
        activityEpics: { resultType: 'list' };
        activityRequirements: { resultType: 'list' };
        activityTestTasks: { resultType: 'list' };
        activityTestCases: { resultType: 'list' };
        activityDocs: { resultType: 'list' };
        activityIssues: { resultType: 'list' };
        activityRisks: { resultType: 'list' };
        activityReviewIssues: { resultType: 'list' };
        activityFeedbacks: { resultType: 'list' };
        activityAudits: { resultType: 'list' };
        reviewIssues: { resultType: 'list' };
        audits: { resultType: 'list' };
        auditPlans: { resultType: 'list' };
        ncs: { resultType: 'list' };
    };
    process: {
        list: { resultType: 'list' };
        setProject: { resultType: 'text' };
        setExecution: { resultType: 'text' };
    };
    auditplan: {
        list: { resultType: 'list' };
        create: { resultType: 'object' };
        check: { resultType: 'text' };
        batchCreate: { resultType: 'text' };
        get: { resultType: 'object' };
        update: { resultType: 'object' };
        delete: { resultType: 'text' };
    };
    nc: {
        list: { resultType: 'list' };
        createProject: { resultType: 'object' };
        createExecution: { resultType: 'object' };
        get: { resultType: 'object' };
        update: { resultType: 'object' };
        delete: { resultType: 'text' };
    };
    opportunity: {
        list: { resultType: 'list' };
        create: { resultType: 'object' };
        batchCreate: { resultType: 'text' };
        get: { resultType: 'object' };
        update: { resultType: 'object' };
        delete: { resultType: 'text' };
    };
    deliverable: {
        list: { resultType: 'list' };
        options: { resultType: 'object' };
        create: { resultType: 'object' };
        get: { resultType: 'object' };
        delete: { resultType: 'text' };
    };
    baseline: {
        list: { resultType: 'list' };
        create: { resultType: 'object' };
        get: { resultType: 'object' };
        update: { resultType: 'object' };
        delete: { resultType: 'text' };
    };
    change: {
        list: { resultType: 'list' };
        create: { resultType: 'object' };
        get: { resultType: 'object' };
        update: { resultType: 'object' };
        delete: { resultType: 'text' };
    };
    relation: {
        link: { resultType: 'text' };
        candidates: { resultType: 'list' };
        list: { resultType: 'list' };
        unlink: { resultType: 'text' };
    };
    workflowgroup: {
        list: { resultType: 'list' };
    };
    resourcecalendar: {
        get: { resultType: 'object' };
    };
    weekly: {
        list: { resultType: 'list' };
        create: { resultType: 'object' };
        get: { resultType: 'object' };
        update: { resultType: 'object' };
        delete: { resultType: 'text' };
    };
    db: {
        tables: { resultType: 'list' };
        query: { resultType: 'list' };
        table: { resultType: 'object' };
    };
    knowledgelib: {
        list: { resultType: 'list' };
    };
    knowledge: {
        list: { resultType: 'list' };
        embeddingsSearch: { resultType: 'list' };
        search: { resultType: 'list' };
        get: { resultType: 'object' };
    };
};
export type BuiltinModuleName = keyof BuiltinActionMeta;
