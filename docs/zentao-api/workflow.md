# 工作流 (workflow)

工作流管理，支持获取工作流数据列表(以合同为例)、获取工作流数据详情(以合同为例)、获取工作流列表、获取工作流字段列表、获取工作流动作列表、获取工作流标签列表、获取工作流数据表列表、获取数据源列表、获取规则列表、创建工作流数据(以合同为例)、创建工作流、复制工作流、创建工作流字段、创建工作流动作、创建工作流标签、创建工作流数据表、创建数据源、创建规则、获取工作流详情、获取工作流字段详情、获取工作流动作详情、获取工作流标签详情、获取工作流数据表详情、获取数据源详情、获取规则详情、修改工作流数据(以合同为例)、修改工作流、修改工作流字段、修改工作流动作、修改工作流标签、修改工作流数据表、修改数据源、修改规则、删除工作流事项(以合同为例)、删除工作流、删除工作流字段、删除工作流动作、删除工作流标签、删除工作流数据表、删除数据源、删除规则、启用工作流、停用工作流、发布工作流、设置工作流审批、设置动作CSS、设置工作流CSS、设置字段导出、设置工作流全文检索、设置动作JS、设置工作流JS、设置动作通知、设置字段搜索、设置字段取值、设置动作验证

## 动作概览

| SDK 动作 | 说明 | 方法 | 路径 |
| --- | --- | --- | --- |
| `list` | 获取工作流数据列表(以合同为例) | `GET` | `/workflow/contract` |
| `getContract` | 获取工作流数据详情(以合同为例) | `GET` | `/workflow/contract/1` |
| `flows` | 获取工作流列表 | `GET` | `/workflows` |
| `fields` | 获取工作流字段列表 | `GET` | `/workflows/{module}/fields` |
| `actions` | 获取工作流动作列表 | `GET` | `/workflows/{module}/actions` |
| `labels` | 获取工作流标签列表 | `GET` | `/workflows/{module}/labels` |
| `tables` | 获取工作流数据表列表 | `GET` | `/workflows/{module}/tables` |
| `datasources` | 获取数据源列表 | `GET` | `/workflowdatasources` |
| `rules` | 获取规则列表 | `GET` | `/workflowrules` |
| `create` | 创建工作流数据(以合同为例) | `POST` | `/workflow/contract` |
| `createFlow` | 创建工作流 | `POST` | `/workflows` |
| `copyFlow` | 复制工作流 | `POST` | `/workflows/{flowID}/copy` |
| `createField` | 创建工作流字段 | `POST` | `/workflows/{module}/fields` |
| `createAction` | 创建工作流动作 | `POST` | `/workflows/{module}/actions` |
| `createLabel` | 创建工作流标签 | `POST` | `/workflows/{module}/labels` |
| `createTable` | 创建工作流数据表 | `POST` | `/workflows/{module}/tables` |
| `createDatasource` | 创建数据源 | `POST` | `/workflowdatasources` |
| `createRule` | 创建规则 | `POST` | `/workflowrules` |
| `getFlow` | 获取工作流详情 | `GET` | `/workflows/{flowID}` |
| `getField` | 获取工作流字段详情 | `GET` | `/workflowfields/{fieldID}` |
| `getAction` | 获取工作流动作详情 | `GET` | `/workflowactions/{actionID}` |
| `getLabel` | 获取工作流标签详情 | `GET` | `/workflowlabels/{labelID}` |
| `getTable` | 获取工作流数据表详情 | `GET` | `/workflowtables/{tableID}` |
| `getDatasource` | 获取数据源详情 | `GET` | `/workflowdatasources/{datasourceID}` |
| `getRule` | 获取规则详情 | `GET` | `/workflowrules/{ruleID}` |
| `update` | 修改工作流数据(以合同为例) | `PUT` | `/workflow/contract/{contractID}` |
| `updateFlow` | 修改工作流 | `PUT` | `/workflows/{flowID}` |
| `updateField` | 修改工作流字段 | `PUT` | `/workflowfields/{fieldID}` |
| `updateAction` | 修改工作流动作 | `PUT` | `/workflowactions/{actionID}` |
| `updateLabel` | 修改工作流标签 | `PUT` | `/workflowlabels/{labelID}` |
| `updateTable` | 修改工作流数据表 | `PUT` | `/workflowtables/{tableID}` |
| `updateDatasource` | 修改数据源 | `PUT` | `/workflowdatasources/{datasourceID}` |
| `updateRule` | 修改规则 | `PUT` | `/workflowrules/{ruleID}` |
| `delete` | 删除工作流事项(以合同为例) | `DELETE` | `/workflow/contract/{contractID}` |
| `deleteFlow` | 删除工作流 | `DELETE` | `/workflows/{flowID}` |
| `deleteField` | 删除工作流字段 | `DELETE` | `/workflowfields/{fieldID}` |
| `deleteAction` | 删除工作流动作 | `DELETE` | `/workflowactions/{actionID}` |
| `deleteLabel` | 删除工作流标签 | `DELETE` | `/workflowlabels/{labelID}` |
| `deleteTable` | 删除工作流数据表 | `DELETE` | `/workflowtables/{tableID}` |
| `deleteDatasource` | 删除数据源 | `DELETE` | `/workflowdatasources/{datasourceID}` |
| `deleteRule` | 删除规则 | `DELETE` | `/workflowrules/{ruleID}` |
| `activateFlow` | 启用工作流 | `PUT` | `/workflows/{flowID}/activate` |
| `deactivateFlow` | 停用工作流 | `PUT` | `/workflows/{flowID}/deactivate` |
| `releaseFlow` | 发布工作流 | `PUT` | `/workflows/{flowID}/release` |
| `setApproval` | 设置工作流审批 | `PUT` | `/workflows/{module}/setApproval` |
| `setActionCSS` | 设置动作CSS | `PUT` | `/workflowactions/{actionID}/setCSS` |
| `setFlowCSS` | 设置工作流CSS | `PUT` | `/workflows/{flowID}/setCSS` |
| `setExport` | 设置字段导出 | `PUT` | `/workflows/{module}/setExport` |
| `setFulltextSearch` | 设置工作流全文检索 | `PUT` | `/workflows/{flowID}/setFulltextSearch` |
| `setActionJS` | 设置动作JS | `PUT` | `/workflowactions/{actionID}/setJS` |
| `setFlowJS` | 设置工作流JS | `PUT` | `/workflows/{flowID}/setJS` |
| `setActionNotice` | 设置动作通知 | `PUT` | `/workflowactions/{actionID}/setNotice` |
| `setSearch` | 设置字段搜索 | `PUT` | `/workflows/{module}/setSearch` |
| `setValue` | 设置字段取值 | `PUT` | `/workflows/{module}/setValue` |
| `setActionVerification` | 设置动作验证 | `PUT` | `/workflowactions/{actionID}/setVerification` |

## 获取工作流数据列表(以合同为例)

- SDK 调用：`request("workflow/list", params)`
- HTTP：`GET /workflow/contract`
- 动作类型：`list`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

无路径参数。

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 对象类型：`workflow_contract`
- 结果字段：`dataList`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/list");
```
## 获取工作流数据详情(以合同为例)

- SDK 调用：`request("workflow/getContract", params)`
- HTTP：`GET /workflow/contract/1`
- 动作类型：`get`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

无路径参数。

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 对象类型：`workflow_contract`
- 结果字段：`data`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/getContract");
```
## 获取工作流列表

- SDK 调用：`request("workflow/flows", params)`
- HTTP：`GET /workflows`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `status` | string | 否 |  | 工作流状态<br>`normal` 正常<br>`wait` 待发布<br>`pause` 已停用 |
| `app` | string | 否 |  | 所属应用，不传时不限。 |
| `onlyCustom` | number | 否 |  | 是否只显示自定义工作流<br>`0` 全部<br>`1` 仅自定义 |
| `orderBy` | string | 否 | `id_desc` | 排序字段，默认 id_desc。 |
| `recPerPage` | number | 否 | `20` | 每页数量，默认 20。 |
| `pageID` | number | 否 | `1` | 页码，默认 1。 |
| `filters` | array | 否 |  | 搜索条件数组，每项包含 field/operator/value/join/group；field 必须是该接口支持的搜索字段，operator 使用该接口搜索配置支持的操作符。支持搜索字段：app,createdBy,createdDate,desc,id,name |
| `groupJoin` | string | 否 |  | 条件组之间的连接方式<br>`and` and<br>`or` or |

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 对象类型：`workflow`
- 结果字段：`flows`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/flows", {
  "status": "normal",
  "app": "<string>",
  "onlyCustom": "0",
  "orderBy": "id_desc",
  "recPerPage": "20",
  "pageID": "1",
  "filters": "<string>",
  "groupJoin": "and"
});
```
## 获取工作流字段列表

- SDK 调用：`request("workflow/fields", params)`
- HTTP：`GET /workflows/{module}/fields`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `module` | module |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 对象类型：`workflowfield`
- 结果字段：`fields`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/fields", {
  "module": "<string>"
});
```
## 获取工作流动作列表

- SDK 调用：`request("workflow/actions", params)`
- HTTP：`GET /workflows/{module}/actions`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `module` | module |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 对象类型：`workflowaction`
- 结果字段：`actions`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/actions", {
  "module": "<string>"
});
```
## 获取工作流标签列表

- SDK 调用：`request("workflow/labels", params)`
- HTTP：`GET /workflows/{module}/labels`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `module` | module |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 对象类型：`workflowlabel`
- 结果字段：`labels`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/labels", {
  "module": "<string>"
});
```
## 获取工作流数据表列表

- SDK 调用：`request("workflow/tables", params)`
- HTTP：`GET /workflows/{module}/tables`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `module` | module |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 对象类型：`workflow`
- 结果字段：`tables`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/tables", {
  "module": "<string>"
});
```
## 获取数据源列表

- SDK 调用：`request("workflow/datasources", params)`
- HTTP：`GET /workflowdatasources`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 对象类型：`workflowdatasource`
- 结果字段：`datasources`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/datasources");
```
## 获取规则列表

- SDK 调用：`request("workflow/rules", params)`
- HTTP：`GET /workflowrules`
- 动作类型：`list`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`list`
- 对象类型：`workflowrule`
- 结果字段：`rules`
- 分页字段：`pager`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/rules");
```
## 创建工作流数据(以合同为例)

- SDK 调用：`request("workflow/create", params)`
- HTTP：`POST /workflow/contract`
- 动作类型：`create`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

无路径参数。

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
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
}
```

示例:

```json
{
  "name": "test"
}
```

### 返回值

- 返回形态：`object`
- 对象类型：`workflow_contract`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/create", {
  "name": "<string>"
});
```
## 创建工作流

- SDK 调用：`request("workflow/createFlow", params)`
- HTTP：`POST /workflows`
- 动作类型：`create`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
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
}
```

示例:

```json
{
  "module": "apidemo",
  "name": "API示例流程",
  "navigator": "primary"
}
```

### 返回值

- 返回形态：`object`
- 对象类型：`workflow`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/createFlow", {
  "module": "<string>",
  "name": "<string>",
  "navigator": "<string>"
});
```
## 复制工作流

- SDK 调用：`request("workflow/copyFlow", params)`
- HTTP：`POST /workflows/{flowID}/copy`
- 动作类型：`create`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `flowID` | flowID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
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
}
```

示例:

```json
{
  "module": "apicopy",
  "name": "API示例流程副本",
  "navigator": "primary",
  "position": "main"
}
```

### 返回值

- 返回形态：`object`
- 对象类型：`workflow`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/copyFlow", {
  "flowID": 1,
  "module": "<string>",
  "name": "<string>",
  "navigator": "<string>",
  "position": "<string>"
});
```
## 创建工作流字段

- SDK 调用：`request("workflow/createField", params)`
- HTTP：`POST /workflows/{module}/fields`
- 动作类型：`create`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `module` | module |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
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
}
```

示例:

```json
{
  "name": "API测试字段",
  "field": "apitest",
  "control": "input",
  "type": "varchar",
  "length": "255"
}
```

### 返回值

- 返回形态：`object`
- 对象类型：`workflowfield`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/createField", {
  "module": "<string>",
  "name": "<string>",
  "field": "<string>",
  "control": "<string>",
  "type": "<string>",
  "length": "<string>"
});
```
## 创建工作流动作

- SDK 调用：`request("workflow/createAction", params)`
- HTTP：`POST /workflows/{module}/actions`
- 动作类型：`create`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `module` | module |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
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
}
```

示例:

```json
{
  "module": "apidemo",
  "action": "apitestact",
  "name": "API测试动作",
  "type": "single"
}
```

### 返回值

- 返回形态：`object`
- 对象类型：`workflowaction`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/createAction", {
  "module": "<string>",
  "action": "<string>",
  "name": "<string>",
  "type": "<string>"
});
```
## 创建工作流标签

- SDK 调用：`request("workflow/createLabel", params)`
- HTTP：`POST /workflows/{module}/labels`
- 动作类型：`create`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `module` | module |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
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
}
```

示例:

```json
{
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
}
```

### 返回值

- 返回形态：`object`
- 对象类型：`workflowlabel`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/createLabel", {
  "module": "<string>",
  "action": "<string>",
  "code": "<string>",
  "label": "<string>",
  "type": "<string>",
  "fields": [
    "<string>"
  ],
  "operators": [
    "<string>"
  ],
  "values": [
    "<string>"
  ]
});
```
## 创建工作流数据表

- SDK 调用：`request("workflow/createTable", params)`
- HTTP：`POST /workflows/{module}/tables`
- 动作类型：`create`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `module` | module |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
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
}
```

示例:

```json
{
  "module": "apitable",
  "name": "API数据表"
}
```

### 返回值

- 返回形态：`object`
- 对象类型：`workflow`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/createTable", {
  "module": "<string>",
  "name": "<string>"
});
```
## 创建数据源

- SDK 调用：`request("workflow/createDatasource", params)`
- HTTP：`POST /workflowdatasources`
- 动作类型：`create`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
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
}
```

示例:

```json
{
  "type": "sql",
  "name": "API数据源",
  "code": "apids",
  "sql": "SELECT 1 AS value, '示例' AS text",
  "keyField": "value",
  "valueField": "text"
}
```

### 返回值

- 返回形态：`object`
- 对象类型：`workflowdatasource`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/createDatasource", {
  "type": "<string>",
  "name": "<string>",
  "code": "<string>",
  "sql": "<string>",
  "keyField": "<string>",
  "valueField": "<string>"
});
```
## 创建规则

- SDK 调用：`request("workflow/createRule", params)`
- HTTP：`POST /workflowrules`
- 动作类型：`create`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

无路径参数。

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
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
}
```

示例:

```json
{
  "type": "regex",
  "name": "API规则",
  "rule": "/^[0-9]+$/"
}
```

### 返回值

- 返回形态：`object`
- 对象类型：`workflowrule`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/createRule", {
  "type": "<string>",
  "name": "<string>",
  "rule": "<string>"
});
```
## 获取工作流详情

- SDK 调用：`request("workflow/getFlow", params)`
- HTTP：`GET /workflows/{flowID}`
- 动作类型：`get`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `flowID` | flowID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 对象类型：`workflow`
- 结果字段：`flow`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/getFlow", {
  "flowID": 1
});
```
## 获取工作流字段详情

- SDK 调用：`request("workflow/getField", params)`
- HTTP：`GET /workflowfields/{fieldID}`
- 动作类型：`get`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `fieldID` | fieldID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 对象类型：`workflowfield`
- 结果字段：`field`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/getField", {
  "fieldID": 1
});
```
## 获取工作流动作详情

- SDK 调用：`request("workflow/getAction", params)`
- HTTP：`GET /workflowactions/{actionID}`
- 动作类型：`get`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `actionID` | actionID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 对象类型：`workflowaction`
- 结果字段：`action`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/getAction", {
  "actionID": 1
});
```
## 获取工作流标签详情

- SDK 调用：`request("workflow/getLabel", params)`
- HTTP：`GET /workflowlabels/{labelID}`
- 动作类型：`get`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `labelID` | labelID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 对象类型：`workflowlabel`
- 结果字段：`label`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/getLabel", {
  "labelID": 1
});
```
## 获取工作流数据表详情

- SDK 调用：`request("workflow/getTable", params)`
- HTTP：`GET /workflowtables/{tableID}`
- 动作类型：`get`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `tableID` | tableID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 对象类型：`workflow`
- 结果字段：`flow`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/getTable", {
  "tableID": 1
});
```
## 获取数据源详情

- SDK 调用：`request("workflow/getDatasource", params)`
- HTTP：`GET /workflowdatasources/{datasourceID}`
- 动作类型：`get`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `datasourceID` | datasourceID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 对象类型：`workflowdatasource`
- 结果字段：`datasource`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/getDatasource", {
  "datasourceID": 1
});
```
## 获取规则详情

- SDK 调用：`request("workflow/getRule", params)`
- HTTP：`GET /workflowrules/{ruleID}`
- 动作类型：`get`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `ruleID` | ruleID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`object`
- 对象类型：`workflowrule`
- 结果字段：`rule`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/getRule", {
  "ruleID": 1
});
```
## 修改工作流数据(以合同为例)

- SDK 调用：`request("workflow/update", params)`
- HTTP：`PUT /workflow/contract/{contractID}`
- 动作类型：`update`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `contractID` | 合同ID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
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
}
```

示例:

```json
{
  "name": "contract1"
}
```

### 返回值

- 返回形态：`object`
- 对象类型：`workflow_contract`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/update", {
  "contractID": 1,
  "name": "<string>"
});
```
## 修改工作流

- SDK 调用：`request("workflow/updateFlow", params)`
- HTTP：`PUT /workflows/{flowID}`
- 动作类型：`update`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `flowID` | flowID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
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
}
```

示例:

```json
{
  "name": "API示例流程（已编辑）",
  "navigator": "primary",
  "positionModule": "main"
}
```

### 返回值

- 返回形态：`object`
- 对象类型：`workflow`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/updateFlow", {
  "flowID": 1,
  "name": "<string>",
  "navigator": "<string>",
  "position": "<string>",
  "positionModule": "<string>"
});
```
## 修改工作流字段

- SDK 调用：`request("workflow/updateField", params)`
- HTTP：`PUT /workflowfields/{fieldID}`
- 动作类型：`update`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `fieldID` | fieldID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
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
}
```

示例:

```json
{
  "name": "API测试字段（已编辑）",
  "control": "input"
}
```

### 返回值

- 返回形态：`object`
- 对象类型：`workflowfield`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/updateField", {
  "fieldID": 1,
  "name": "<string>",
  "control": "<string>"
});
```
## 修改工作流动作

- SDK 调用：`request("workflow/updateAction", params)`
- HTTP：`PUT /workflowactions/{actionID}`
- 动作类型：`update`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `actionID` | actionID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
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
}
```

示例:

```json
{
  "action": "apitestact",
  "name": "API测试动作（已编辑）"
}
```

### 返回值

- 返回形态：`object`
- 对象类型：`workflowaction`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/updateAction", {
  "actionID": 1,
  "action": "<string>",
  "name": "<string>"
});
```
## 修改工作流标签

- SDK 调用：`request("workflow/updateLabel", params)`
- HTTP：`PUT /workflowlabels/{labelID}`
- 动作类型：`update`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `labelID` | labelID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
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
}
```

示例:

```json
{
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
}
```

### 返回值

- 返回形态：`object`
- 对象类型：`workflowlabel`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/updateLabel", {
  "labelID": 1,
  "label": "<string>",
  "type": "<string>",
  "fields": [
    "<string>"
  ],
  "operators": [
    "<string>"
  ],
  "values": [
    "<string>"
  ]
});
```
## 修改工作流数据表

- SDK 调用：`request("workflow/updateTable", params)`
- HTTP：`PUT /workflowtables/{tableID}`
- 动作类型：`update`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `tableID` | tableID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
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
}
```

示例:

```json
{
  "name": "API数据表（已编辑）"
}
```

### 返回值

- 返回形态：`object`
- 对象类型：`workflow`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/updateTable", {
  "tableID": 1,
  "name": "<string>"
});
```
## 修改数据源

- SDK 调用：`request("workflow/updateDatasource", params)`
- HTTP：`PUT /workflowdatasources/{datasourceID}`
- 动作类型：`update`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `datasourceID` | datasourceID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
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
}
```

示例:

```json
{
  "type": "sql",
  "name": "API数据源（已编辑）",
  "code": "apids",
  "sql": "SELECT 1 AS value, '示例' AS text",
  "keyField": "value",
  "valueField": "text"
}
```

### 返回值

- 返回形态：`object`
- 对象类型：`workflowdatasource`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/updateDatasource", {
  "datasourceID": 1,
  "type": "<string>",
  "name": "<string>",
  "code": "<string>",
  "sql": "<string>",
  "keyField": "<string>",
  "valueField": "<string>"
});
```
## 修改规则

- SDK 调用：`request("workflow/updateRule", params)`
- HTTP：`PUT /workflowrules/{ruleID}`
- 动作类型：`update`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `ruleID` | ruleID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
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
}
```

示例:

```json
{
  "type": "regex",
  "name": "API规则（已编辑）",
  "rule": "/^[0-9]+$/"
}
```

### 返回值

- 返回形态：`object`
- 对象类型：`workflowrule`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/updateRule", {
  "ruleID": 1,
  "type": "<string>",
  "name": "<string>",
  "rule": "<string>"
});
```
## 删除工作流事项(以合同为例)

- SDK 调用：`request("workflow/delete", params)`
- HTTP：`DELETE /workflow/contract/{contractID}`
- 动作类型：`delete`
- 最低禅道版本：`22.5` / `biz13.5` / `max8.5` / `ipd5.5`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `contractID` | 合同ID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`
- 对象类型：无统一对象类型

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/delete", {
  "contractID": 1
});
```
## 删除工作流

- SDK 调用：`request("workflow/deleteFlow", params)`
- HTTP：`DELETE /workflows/{flowID}`
- 动作类型：`delete`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `flowID` | flowID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`
- 对象类型：`workflow`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/deleteFlow", {
  "flowID": 1
});
```
## 删除工作流字段

- SDK 调用：`request("workflow/deleteField", params)`
- HTTP：`DELETE /workflowfields/{fieldID}`
- 动作类型：`delete`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `fieldID` | fieldID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`
- 对象类型：`workflowfield`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/deleteField", {
  "fieldID": 1
});
```
## 删除工作流动作

- SDK 调用：`request("workflow/deleteAction", params)`
- HTTP：`DELETE /workflowactions/{actionID}`
- 动作类型：`delete`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `actionID` | actionID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`
- 对象类型：`workflowaction`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/deleteAction", {
  "actionID": 1
});
```
## 删除工作流标签

- SDK 调用：`request("workflow/deleteLabel", params)`
- HTTP：`DELETE /workflowlabels/{labelID}`
- 动作类型：`delete`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `labelID` | labelID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`
- 对象类型：`workflowlabel`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/deleteLabel", {
  "labelID": 1
});
```
## 删除工作流数据表

- SDK 调用：`request("workflow/deleteTable", params)`
- HTTP：`DELETE /workflowtables/{tableID}`
- 动作类型：`delete`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `tableID` | tableID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`
- 对象类型：`workflow`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/deleteTable", {
  "tableID": 1
});
```
## 删除数据源

- SDK 调用：`request("workflow/deleteDatasource", params)`
- HTTP：`DELETE /workflowdatasources/{datasourceID}`
- 动作类型：`delete`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `datasourceID` | datasourceID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`
- 对象类型：`workflowdatasource`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/deleteDatasource", {
  "datasourceID": 1
});
```
## 删除规则

- SDK 调用：`request("workflow/deleteRule", params)`
- HTTP：`DELETE /workflowrules/{ruleID}`
- 动作类型：`delete`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `ruleID` | ruleID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`
- 对象类型：`workflowrule`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/deleteRule", {
  "ruleID": 1
});
```
## 启用工作流

- SDK 调用：`request("workflow/activateFlow", params)`
- HTTP：`PUT /workflows/{flowID}/activate`
- 动作类型：`action`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `flowID` | flowID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`
- 对象类型：`workflow`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/activateFlow", {
  "flowID": 1
});
```
## 停用工作流

- SDK 调用：`request("workflow/deactivateFlow", params)`
- HTTP：`PUT /workflows/{flowID}/deactivate`
- 动作类型：`action`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `flowID` | flowID |

### 查询参数

无查询参数。

### 请求体

无请求体。

### 返回值

- 返回形态：`text`
- 对象类型：`workflow`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/deactivateFlow", {
  "flowID": 1
});
```
## 发布工作流

- SDK 调用：`request("workflow/releaseFlow", params)`
- HTTP：`PUT /workflows/{flowID}/release`
- 动作类型：`action`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `flowID` | flowID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
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
}
```

示例:

```json
{
  "navigator": "primary",
  "positionModule": "main"
}
```

### 返回值

- 返回形态：`text`
- 对象类型：`workflow`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/releaseFlow", {
  "flowID": 1,
  "navigator": "<string>",
  "position": "<string>",
  "positionModule": "<string>"
});
```
## 设置工作流审批

- SDK 调用：`request("workflow/setApproval", params)`
- HTTP：`PUT /workflows/{module}/setApproval`
- 动作类型：`action`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `module` | module |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
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
}
```

示例:

```json
{
  "approval": "disabled"
}
```

### 返回值

- 返回形态：`text`
- 对象类型：无统一对象类型

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/setApproval", {
  "module": "<string>",
  "approval": "<string>"
});
```
## 设置动作CSS

- SDK 调用：`request("workflow/setActionCSS", params)`
- HTTP：`PUT /workflowactions/{actionID}/setCSS`
- 动作类型：`action`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `actionID` | actionID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "css": {
      "type": "string",
      "description": "动作自定义CSS。"
    }
  }
}
```

示例:

```json
{
  "css": "/* 动作CSS示例 */"
}
```

### 返回值

- 返回形态：`text`
- 对象类型：`workflowaction`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/setActionCSS", {
  "actionID": 1,
  "css": "<string>"
});
```
## 设置工作流CSS

- SDK 调用：`request("workflow/setFlowCSS", params)`
- HTTP：`PUT /workflows/{flowID}/setCSS`
- 动作类型：`action`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `flowID` | flowID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "css": {
      "type": "string",
      "description": "工作流自定义CSS。"
    }
  }
}
```

示例:

```json
{
  "css": "/* 流程CSS示例 */"
}
```

### 返回值

- 返回形态：`text`
- 对象类型：`workflow`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/setFlowCSS", {
  "flowID": 1,
  "css": "<string>"
});
```
## 设置字段导出

- SDK 调用：`request("workflow/setExport", params)`
- HTTP：`PUT /workflows/{module}/setExport`
- 动作类型：`action`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `module` | module |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
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
}
```

示例:

```json
{
  "modules": [
    "apidemo"
  ],
  "fields": {
    "apidemo": [
      "name"
    ]
  }
}
```

### 返回值

- 返回形态：`text`
- 对象类型：无统一对象类型

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/setExport", {
  "module": "<string>",
  "modules": [
    "<string>"
  ],
  "fields": {}
});
```
## 设置工作流全文检索

- SDK 调用：`request("workflow/setFulltextSearch", params)`
- HTTP：`PUT /workflows/{flowID}/setFulltextSearch`
- 动作类型：`action`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `flowID` | flowID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
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
}
```

示例:

```json
{
  "contentField": [
    "name"
  ]
}
```

### 返回值

- 返回形态：`text`
- 对象类型：`workflow`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/setFulltextSearch", {
  "flowID": 1,
  "contentField": [
    "<string>"
  ]
});
```
## 设置动作JS

- SDK 调用：`request("workflow/setActionJS", params)`
- HTTP：`PUT /workflowactions/{actionID}/setJS`
- 动作类型：`action`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `actionID` | actionID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "js": {
      "type": "string",
      "description": "动作自定义JS。"
    }
  }
}
```

示例:

```json
{
  "js": "// 动作JS示例"
}
```

### 返回值

- 返回形态：`text`
- 对象类型：`workflowaction`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/setActionJS", {
  "actionID": 1,
  "js": "<string>"
});
```
## 设置工作流JS

- SDK 调用：`request("workflow/setFlowJS", params)`
- HTTP：`PUT /workflows/{flowID}/setJS`
- 动作类型：`action`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `flowID` | flowID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
  "type": "object",
  "properties": {
    "js": {
      "type": "string",
      "description": "工作流自定义JS。"
    }
  }
}
```

示例:

```json
{
  "js": "// 流程JS示例"
}
```

### 返回值

- 返回形态：`text`
- 对象类型：`workflow`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/setFlowJS", {
  "flowID": 1,
  "js": "<string>"
});
```
## 设置动作通知

- SDK 调用：`request("workflow/setActionNotice", params)`
- HTTP：`PUT /workflowactions/{actionID}/setNotice`
- 动作类型：`action`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `actionID` | actionID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
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
}
```

示例:

```json
{
  "toList": [
    "admin"
  ]
}
```

### 返回值

- 返回形态：`text`
- 对象类型：`workflowaction`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/setActionNotice", {
  "actionID": 1,
  "toList": [
    "<string>"
  ]
});
```
## 设置字段搜索

- SDK 调用：`request("workflow/setSearch", params)`
- HTTP：`PUT /workflows/{module}/setSearch`
- 动作类型：`action`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `module` | module |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
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
}
```

示例:

```json
{
  "modules": [
    "apidemo"
  ],
  "fields": {
    "apidemo": [
      "name"
    ]
  }
}
```

### 返回值

- 返回形态：`text`
- 对象类型：无统一对象类型

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/setSearch", {
  "module": "<string>",
  "modules": [
    "<string>"
  ],
  "fields": {}
});
```
## 设置字段取值

- SDK 调用：`request("workflow/setValue", params)`
- HTTP：`PUT /workflows/{module}/setValue`
- 动作类型：`action`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `module` | module |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
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
}
```

示例:

```json
{
  "modules": [
    "apidemo"
  ],
  "fields": {
    "apidemo": [
      "name"
    ]
  }
}
```

### 返回值

- 返回形态：`text`
- 对象类型：无统一对象类型

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/setValue", {
  "module": "<string>",
  "modules": [
    "<string>"
  ],
  "fields": {}
});
```
## 设置动作验证

- SDK 调用：`request("workflow/setActionVerification", params)`
- HTTP：`PUT /workflowactions/{actionID}/setVerification`
- 动作类型：`action`
- 最低禅道版本：`22.7` / `biz13.7` / `max8.7` / `ipd5.7`

### 路径参数

| 参数 | 说明 |
| --- | --- |
| `actionID` | actionID |

### 查询参数

无查询参数。

### 请求体

请求体必填：是

Schema:

```json
{
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
}
```

示例:

```json
{
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
}
```

### 返回值

- 返回形态：`text`
- 对象类型：`workflowaction`

### SDK 示例

```ts
import { request } from 'zentao-api';

const result = await request("workflow/setActionVerification", {
  "actionID": 1,
  "type": "<string>",
  "message": "<string>",
  "verifications": {}
});
```
