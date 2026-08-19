# doc-helper

`doc-helper` 是 `zentao-api` 内部使用的 BlockSuite `0.19.x` snapshot 转换器。目前由
`doc/get` 内置 override 调用，将禅道返回的块编辑器 JSON 转换为 Markdown。

它不是独立 npm 包，也不从 `zentao-api` 根入口导出。项目只使用 Bun：

```bash
bun test tests/doc-helper.test.ts tests/modules.test.ts tests/resolve.test.ts
bun run check
```

## 内部 API

- `snapshotToMarkdown(snapshot, options?)`
- `snapshotToHtml(snapshot, options?)`

输入可以是 `DocSnapshot`、`BlockSnapshot`、`SliceSnapshot`、block 数组、
`{ snapshot }` 包装对象或 JSON 字符串。为了兼容产品读取逻辑，也支持最多三层重复
JSON 编码。

实现不依赖 `@blocksuite/*`、DOM、`window`、`File` 或 `Blob`，不会主动发起网络请求，
可随 SDK 在 Node.js 和浏览器环境中运行。

## 资源和文档链接

标准图片和附件通常只有 `sourceId`。直接调用转换器时，可通过 `resolveAssetUrl` 补齐：

```ts
const markdown = snapshotToMarkdown(snapshot, {
  resolveAssetUrl(sourceId, _block, kind) {
    return kind === 'image'
      ? `/api/files/${sourceId}?type=image`
      : `/api/files/${sourceId}`;
  },
});
```

`affine:zui-image` 可通过 `resolveZuiImageUrl` 解析产品侧 `src` 占位符。跨文档引用可使用
`resolveDocLink`、`resolveDocTitle` 或 `docLinkBaseUrl`。

## 支持范围

内置支持 page、note、paragraph、list、code、divider、latex、image、attachment、bookmark、
database、linked-doc 和常见 embed block，也兼容 zen-editor 使用的 holder、ZUI table、layout、
panel、expand、ZUI image、whiteboard、iframe、HTML、component 和 custom block。

- 未知容器默认继续转换 `children`；可通过 `unknownBlock: 'omit' | 'throw'` 调整。
- 默认限制 256 层、50,000 个 block；可通过 `maxDepth` 和 `maxBlocks` 调整。
- HTML 文本和属性会转义，危险 URL 会被过滤。
- stored/custom HTML 默认作为源码输出；只有可信内容才能设置 `allowUnsafeHtml: true`。
- Markdown 表格无法无损表达 `rowspan`、`colspan` 和单元格对齐。
- 图片和附件不会隐式请求资源；没有 resolver 时，标准图片会省略，附件保留名称。
