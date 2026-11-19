import { isZentaoConfigFetchError, ZentaoError } from '../misc/errors.js';
import { getGlobalOptions } from '../misc/global-options.js';
import { parseZentaoVersion, supportsZentaoVersion, VERSION_23_MINIMUMS } from '../misc/zentao-version.js';
import type { FileBindingOptions, GlobalOptions, RequestOptions } from '../types/options.js';

/** @internal 上传与对象保存通过同一 uid 绑定附件的最低版本。 */
export const FILE_BINDING_MINIMUMS = VERSION_23_MINIMUMS;

/** @internal null 表示调用方明确允许配置获取失败后跳过版本检查。 */
export async function resolveRequestVersion(options: RequestOptions, globals: GlobalOptions, version = globals.version): Promise<string | null> {
  if (!options.forceRefreshConfig && version !== undefined) return version;
  const client = options.client ?? globals.client;
  if (!client) throw new ZentaoError('E_NO_GLOBAL_CLIENT');
  try {
    return (await client.getZentaoConfig({
      forceRefresh: options.forceRefreshConfig,
      timeout: options.timeout ?? globals.timeout,
      insecure: options.insecure ?? globals.insecure,
    })).version;
  } catch (error) {
    if (!(options.skipVersionCheckOnConfigError ?? globals.skipVersionCheckOnConfigError)
      || !isZentaoConfigFetchError(error)) throw error;
    return null;
  }
}

/**
 * 判断当前禅道版本是否支持用 uid 将编辑器附件绑定到对象。版本门槛与实际保存共用。
 * @param options - 可传已知版本或客户端。默认使用全局版本，缺省时读取客户端的站点配置。
 * @returns 已知版本返回布尔值。配置获取失败且允许跳过版本检查时返回 `undefined`。
 * @throws {ZentaoError} 版本格式非法或无法获取所需配置时抛出对应的 SDK 错误。
 */
export async function supportsFileBinding(options: FileBindingOptions = {}): Promise<boolean | undefined> {
  const version = await resolveRequestVersion(options, getGlobalOptions(), options.version);
  return version === null ? undefined : supportsZentaoVersion(parseZentaoVersion(version), FILE_BINDING_MINIMUMS);
}
