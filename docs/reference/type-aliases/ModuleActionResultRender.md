[zentao-api](../index.md) / ModuleActionResultRender

# Type Alias: ModuleActionResultRender

> **ModuleActionResultRender** = (`result`, `type`, `action`) => `string`

Defined in: [src/types/index.ts:246](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/types/index.ts#L246)

模块动作自定义渲染函数类型；SDK 本身不直接渲染终端输出。

## Parameters

| Parameter | Type |
| ------ | ------ |
| `result` | `unknown` |
| `type` | [`ModuleActionResultRenderType`](ModuleActionResultRenderType.md) |
| `action` | [`ModuleAction`](../interfaces/ModuleAction.md) |

## Returns

`string`
