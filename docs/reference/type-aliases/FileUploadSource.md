[zentao-api](../index.md) / FileUploadSource

# Type Alias: FileUploadSource

> **FileUploadSource** = `string` \| `Blob` \| [`FileUploadPathInput`](../interfaces/FileUploadPathInput.md) \| [`FileUploadDataInput`](../interfaces/FileUploadDataInput.md)

高阶 `request()` 可接受的文件输入。

- Node.js/Bun：可直接传本地路径或 [FileUploadPathInput](../interfaces/FileUploadPathInput.md)。
- 浏览器：传 `File`（属于 `Blob`）、`Blob` 或 [FileUploadDataInput](../interfaces/FileUploadDataInput.md)；
  无文件名的 `Blob` 会按 MIME 类型生成文件名，需要精确文件名时使用数据对象形式。
