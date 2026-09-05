[zentao-api](../index.md) / ServerConfig

# Interface: ServerConfig

禅道 `?mode=getconfig` 返回的服务端配置。

## Indexable

> \[`key`: `string`\]: `unknown`

保留服务端返回的其他配置字段。

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-methodvar"></a> `methodVar` | `string` | - |
| <a id="property-modulevar"></a> `moduleVar` | `string` | - |
| <a id="property-requestfix"></a> `requestFix` | `string` | - |
| <a id="property-requesttype"></a> `requestType` | `string` | - |
| <a id="property-sessionvar"></a> `sessionVar` | `string` | - |
| <a id="property-sprintconcept"></a> `sprintConcept` | `string` | - |
| <a id="property-systemmode"></a> `systemMode` | `string` | - |
| <a id="property-version"></a> `version` | `string` | 禅道版本，不同系列以不同的前缀表示，下面为例子： - `22.5`：开源版 22.5 - `biz13.5`：企业版 13.5 - `max8.5`：旗舰版 8.5 - `ipd5.5`：IPD 5.5 |
| <a id="property-viewvar"></a> `viewVar` | `string` | - |
