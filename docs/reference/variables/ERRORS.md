[zentao-api](../index.md) / ERRORS

# Variable: ERRORS

> `const` **ERRORS**: `object`

Defined in: [src/misc/errors.ts:1](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/misc/errors.ts#L1)

## Type Declaration

| Name | Type | Default value | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-e_http_error"></a> `E_HTTP_ERROR` | `"HTTP request failed: {status} {statusText}"` | `'HTTP request failed: {status} {statusText}'` | [src/misc/errors.ts:4](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/misc/errors.ts#L4) |
| <a id="property-e_insecure_browser"></a> `E_INSECURE_BROWSER` | `"The insecure option is only supported in Node.js runtimes."` | `'The insecure option is only supported in Node.js runtimes.'` | [src/misc/errors.ts:7](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/misc/errors.ts#L7) |
| <a id="property-e_invalid_action"></a> `E_INVALID_ACTION` | `"Unknown action: {module}-{action}"` | `'Unknown action: {module}-{action}'` | [src/misc/errors.ts:15](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/misc/errors.ts#L15) |
| <a id="property-e_invalid_action_definition"></a> `E_INVALID_ACTION_DEFINITION` | `"Invalid module action definition."` | `'Invalid module action definition.'` | [src/misc/errors.ts:17](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/misc/errors.ts#L17) |
| <a id="property-e_invalid_base_url"></a> `E_INVALID_BASE_URL` | `"Invalid ZenTao baseUrl."` | `'Invalid ZenTao baseUrl.'` | [src/misc/errors.ts:2](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/misc/errors.ts#L2) |
| <a id="property-e_invalid_module"></a> `E_INVALID_MODULE` | `"Unknown module: {module}"` | `'Unknown module: {module}'` | [src/misc/errors.ts:14](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/misc/errors.ts#L14) |
| <a id="property-e_invalid_module_definition"></a> `E_INVALID_MODULE_DEFINITION` | `"Invalid module definition."` | `'Invalid module definition.'` | [src/misc/errors.ts:16](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/misc/errors.ts#L16) |
| <a id="property-e_invalid_profile"></a> `E_INVALID_PROFILE` | `"Invalid ZenTao profile."` | `'Invalid ZenTao profile.'` | [src/misc/errors.ts:9](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/misc/errors.ts#L9) |
| <a id="property-e_invalid_request_name"></a> `E_INVALID_REQUEST_NAME` | "Request name must use the form \"moduleName/methodName\"." | `'Request name must use the form "moduleName/methodName".'` | [src/misc/errors.ts:19](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/misc/errors.ts#L19) |
| <a id="property-e_login_failed"></a> `E_LOGIN_FAILED` | `"ZenTao login failed."` | `'ZenTao login failed.'` | [src/misc/errors.ts:8](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/misc/errors.ts#L8) |
| <a id="property-e_missing_param"></a> `E_MISSING_PARAM` | `"Missing required parameter: {param}"` | `'Missing required parameter: {param}'` | [src/misc/errors.ts:18](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/misc/errors.ts#L18) |
| <a id="property-e_network_error"></a> `E_NETWORK_ERROR` | `"Network request failed: {message}"` | `'Network request failed: {message}'` | [src/misc/errors.ts:5](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/misc/errors.ts#L5) |
| <a id="property-e_no_global_client"></a> `E_NO_GLOBAL_CLIENT` | `"No global client configured. Call ZentaoClient.init() or pass options.client."` | `'No global client configured. Call ZentaoClient.init() or pass options.client.'` | [src/misc/errors.ts:3](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/misc/errors.ts#L3) |
| <a id="property-e_no_profile"></a> `E_NO_PROFILE` | `"No ZenTao profile is configured."` | `'No ZenTao profile is configured.'` | [src/misc/errors.ts:10](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/misc/errors.ts#L10) |
| <a id="property-e_profile_not_found"></a> `E_PROFILE_NOT_FOUND` | `"ZenTao profile not found: {profileKey}"` | `'ZenTao profile not found: {profileKey}'` | [src/misc/errors.ts:11](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/misc/errors.ts#L11) |
| <a id="property-e_profile_storage_invalid"></a> `E_PROFILE_STORAGE_INVALID` | `"ZenTao profile storage is not valid JSON."` | `'ZenTao profile storage is not valid JSON.'` | [src/misc/errors.ts:12](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/misc/errors.ts#L12) |
| <a id="property-e_profile_storage_unavailable"></a> `E_PROFILE_STORAGE_UNAVAILABLE` | `"ZenTao profile storage is unavailable in this runtime."` | `'ZenTao profile storage is unavailable in this runtime.'` | [src/misc/errors.ts:13](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/misc/errors.ts#L13) |
| <a id="property-e_timeout"></a> `E_TIMEOUT` | `"Request timed out."` | `'Request timed out.'` | [src/misc/errors.ts:6](https://github.com/easysoft/zentao-api/blob/cd16cbd679722d93ee37e546ba6b0275d11e66db/src/misc/errors.ts#L6) |
