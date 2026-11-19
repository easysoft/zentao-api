import { getGlobalOptions } from '../misc/global-options.js';
import type { RequestOptions } from '../types/options.js';
import { parseFileUrl, type ParsedFileUrl } from '../url.js';
import { request } from './index.js';
import { getImageContentType } from './prepare-body.js';

/** 图片附件的原始内容及按附件 ID 生成的文件名。 */
export interface ImageFileContent {
  fileID: number;
  filename: string;
  contentType: string;
  data: ArrayBuffer;
}

/**
 * 从当前禅道站点读取图片附件。路径中有图片后缀时直接调用 file/read。
 * 无后缀的读取链接和数字 ID 先通过 file/get 取得扩展名，缺少扩展名时取文件标题的后缀。
 *
 * @param source - 附件 URL、{@link parseFileUrl} 的解析结果或数字 ID。带域名的 URL 按客户端站点和安装目录匹配。解析结果和 ID 均指当前站点。
 * @param options - 客户端和传输选项，省略时使用 SDK 默认值。
 * @returns 含二进制内容、文件名和 MIME 类型的图片。下载链接、无效地址、非图片或空内容返回 `undefined`。
 * @throws {ZentaoError} 沿用附件请求的客户端、版本、传输或服务端错误。
 */
export async function readImageFile(
  source: string | number | ParsedFileUrl,
  options: Pick<RequestOptions, 'client' | 'timeout' | 'insecure' | 'actionAssistant'> = {},
): Promise<ImageFileContent | undefined> {
  const { client = getGlobalOptions().client, timeout, insecure, actionAssistant } = options;
  let route: ParsedFileUrl | undefined;
  if (typeof source === 'string') route = parseFileUrl(source, client?.siteUrl);
  else if (typeof source === 'number') route = { method: 'read', fileID: source };
  else route = source;
  if (route?.method !== 'read' || !Number.isSafeInteger(route.fileID) || route.fileID <= 0) return undefined;

  const { fileID } = route;
  const requestOptions = { client, timeout, insecure, actionAssistant, throwOnFail: true };
  let extension = route.extension;
  if (!extension) {
    const { data } = await request('file/get', { fileID }, requestOptions);
    const declared = typeof data?.extension === 'string' ? data.extension.trim() : '';
    if (declared) extension = declared.replace(/^\./, '').toLowerCase();
    else if (typeof data?.title === 'string') extension = /\.([a-z0-9]+)$/i.exec(data.title.trim())?.[1].toLowerCase();
  }
  if (!extension) return undefined;
  const contentType = getImageContentType(extension);
  if (!contentType) return undefined;

  const { data } = await request('file/read', { fileID, stream: 0 }, requestOptions);
  if (!(data instanceof ArrayBuffer) || !data.byteLength) return undefined;
  return { fileID, filename: `${fileID}.${extension}`, contentType, data };
}
