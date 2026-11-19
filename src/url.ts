import { parseFileRoute, type ParsedFileUrl } from './utils/file-url.js';

export type { ParsedFileUrl };

/**
 * 从禅道图片或附件下载链接提取文件 ID，支持路径路由和 GET 查询路由。
 *
 * @param url - file/read 或 file/download 的相对路径或 HTTP(S) 地址。查询参数可使用 `&amp;` 分隔。
 * @param siteUrl - 禅道站点根地址，含安装目录。解析带域名的地址时必填。
 * @returns 正的安全整数 ID。地址无效、站点或路由不匹配时返回 `undefined`。
 */
export function extractFileIdFromUrl(url: string, siteUrl?: string): number | undefined {
  return parseFileRoute(url, siteUrl, 'fileUrl')?.fileID;
}

/**
 * 解析禅道附件的读取或下载路由。路径式链接可附带普通查询参数。
 * 用查询参数指定路由时，模块、方法和文件 ID 必须唯一，且不能与路径路由混用。
 *
 * @param url - 附件路径或 URL，支持一次 HTML `&amp;` 转义。
 * @param siteUrl - 禅道站点根地址，含安装目录。解析带域名的地址时必填。
 * @returns 路由信息。地址无效、站点不匹配或路由含糊时返回 `undefined`。
 */
export function parseFileUrl(url: string, siteUrl?: string): ParsedFileUrl | undefined {
  return parseFileRoute(url, siteUrl, 'strict');
}
