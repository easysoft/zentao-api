[zentao-api](../index.md) / ERRORS

# Variable: ERRORS

> `const` **ERRORS**: `object`

SDK 已知错误码到默认消息的映射表。

每条消息允许带 `{key}` 占位符，由 [ZentaoError](../classes/ZentaoError.md) 构造时使用 `replacements`
进行字面量替换。此对象使用 `as const`，可直接作为类型来源约束错误码。

## Type Declaration

| Name | Type | Default value |
| ------ | ------ | ------ |
| <a id="property-e_api_failed"></a> `E_API_FAILED` | `"ZenTao API returned failure: {message}"` | `'ZenTao API returned failure: {message}'` |
| <a id="property-e_http_error"></a> `E_HTTP_ERROR` | `"HTTP request failed: {status} {statusText}"` | `'HTTP request failed: {status} {statusText}'` |
| <a id="property-e_indeterminate_action_method"></a> `E_INDETERMINATE_ACTION_METHOD` | "Cannot infer HTTP method for action \"\{action\}\" from type \"\{type\}\"; specify \"method\" explicitly." | `'Cannot infer HTTP method for action "{action}" from type "{type}"; specify "method" explicitly.'` |
| <a id="property-e_indeterminate_action_result_type"></a> `E_INDETERMINATE_ACTION_RESULT_TYPE` | "Cannot infer result type for action \"\{action\}\" from type \"\{type\}\"; specify \"resultType\" explicitly." | `'Cannot infer result type for action "{action}" from type "{type}"; specify "resultType" explicitly.'` |
| <a id="property-e_insecure_browser"></a> `E_INSECURE_BROWSER` | `"The insecure option is only supported in Node.js runtimes."` | `'The insecure option is only supported in Node.js runtimes.'` |
| <a id="property-e_invalid_action"></a> `E_INVALID_ACTION` | `"Unknown action: {module}-{action}"` | `'Unknown action: {module}-{action}'` |
| <a id="property-e_invalid_action_definition"></a> `E_INVALID_ACTION_DEFINITION` | `"Invalid module action definition."` | `'Invalid module action definition.'` |
| <a id="property-e_invalid_base_url"></a> `E_INVALID_BASE_URL` | `"Invalid ZenTao baseUrl."` | `'Invalid ZenTao baseUrl.'` |
| <a id="property-e_invalid_module"></a> `E_INVALID_MODULE` | `"Unknown module: {module}"` | `'Unknown module: {module}'` |
| <a id="property-e_invalid_module_definition"></a> `E_INVALID_MODULE_DEFINITION` | `"Invalid module definition."` | `'Invalid module definition.'` |
| <a id="property-e_invalid_param"></a> `E_INVALID_PARAM` | `"Invalid value for parameter {param}: {value}"` | `'Invalid value for parameter {param}: {value}'` |
| <a id="property-e_invalid_profile"></a> `E_INVALID_PROFILE` | `"Invalid ZenTao profile."` | `'Invalid ZenTao profile.'` |
| <a id="property-e_invalid_request_name"></a> `E_INVALID_REQUEST_NAME` | "Request name must use the form \"moduleName\", \"moduleName/methodName\", or \"moduleName/\<objectID\>\"." | `'Request name must use the form "moduleName", "moduleName/methodName", or "moduleName/<objectID>".'` |
| <a id="property-e_login_failed"></a> `E_LOGIN_FAILED` | `"ZenTao login failed."` | `'ZenTao login failed.'` |
| <a id="property-e_missing_param"></a> `E_MISSING_PARAM` | `"Missing required parameter: {param}"` | `'Missing required parameter: {param}'` |
| <a id="property-e_network_error"></a> `E_NETWORK_ERROR` | `"Network request failed: {message}"` | `'Network request failed: {message}'` |
| <a id="property-e_no_global_client"></a> `E_NO_GLOBAL_CLIENT` | `"No global client configured. Call ZentaoClient.init() or pass options.client."` | `'No global client configured. Call ZentaoClient.init() or pass options.client.'` |
| <a id="property-e_no_profile"></a> `E_NO_PROFILE` | `"No ZenTao profile is configured."` | `'No ZenTao profile is configured.'` |
| <a id="property-e_profile_not_found"></a> `E_PROFILE_NOT_FOUND` | `"ZenTao profile not found: {profileKey}"` | `'ZenTao profile not found: {profileKey}'` |
| <a id="property-e_profile_storage_invalid"></a> `E_PROFILE_STORAGE_INVALID` | `"ZenTao profile storage is not valid JSON."` | `'ZenTao profile storage is not valid JSON.'` |
| <a id="property-e_profile_storage_unavailable"></a> `E_PROFILE_STORAGE_UNAVAILABLE` | `"ZenTao profile storage is unavailable in this runtime."` | `'ZenTao profile storage is unavailable in this runtime.'` |
| <a id="property-e_timeout"></a> `E_TIMEOUT` | `"Request timed out."` | `'Request timed out.'` |
