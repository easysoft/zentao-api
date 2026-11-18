[zentao-api](../index.md) / FileHandlingOptions

# Interface: FileHandlingOptions

高阶请求的 HTML 文件处理配置；单次请求优先于全局选项。

## Extended by

- [`GlobalOptions`](GlobalOptions.md)
- [`RequestOptions`](RequestOptions.md)

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-continueonfileuploaderror"></a> `continueOnFileUploadError?` | `boolean` | 上传或读取本地文件失败后是否标注 HTML 并继续主请求，默认 true；解析器失败始终终止。 |
| <a id="property-fileresolver"></a> `fileResolver?` | [`FileResolver`](../type-aliases/FileResolver.md) | 解析本地及自定义文件引用；HTTP(S) 和已有禅道文件链接直接保留。 |
| <a id="property-onfileerror"></a> `onFileError?` | (`warning`) => `void` \| `Promise`\<`void`\> | 文件错误通知；支持异步回调，回调异常不改变主请求结果。 普通响应同时提供 fileWarnings；raw 模式仅通过此回调通知，不修改原始响应。 |
