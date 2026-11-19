[zentao-api](../index.md) / FileBindingOptions

# Type Alias: FileBindingOptions

> **FileBindingOptions** = `Pick`\<[`GlobalOptions`](../interfaces/GlobalOptions.md), `"version"`\> & `Pick`\<[`RequestOptions`](../interfaces/RequestOptions.md), `"client"` \| `"forceRefreshConfig"` \| `"skipVersionCheckOnConfigError"` \| `"timeout"` \| `"insecure"`\>

附件绑定能力查询使用的版本和配置读取选项。显式 version 优先于全局版本，forceRefreshConfig 优先使用站点实际版本。
