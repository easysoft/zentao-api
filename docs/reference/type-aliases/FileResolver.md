[zentao-api](../index.md) / FileResolver

# Type Alias: FileResolver

> **FileResolver** = ((`reference`) => [`ResolvedFile`](ResolvedFile.md) \| `Promise`\<[`ResolvedFile`](ResolvedFile.md)\>) \| `Record`\<`string`, [`ResolvedFile`](ResolvedFile.md)\>

HTML 文件解析器。函数可异步执行；映射依次按路径和文件名查找自身属性。
映射的字符串值以命中的 key 为文件名。未命中、抛错或返回无效来源时终止请求。
