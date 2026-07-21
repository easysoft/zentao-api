import { ZentaoClient } from '../client/index.js';

/** 上传文件到禅道后返回的文件信息。 */
export interface UploadedFile {
  /** 文件 ID。 */
  id: number;
  /** 文件访问地址。 */
  url: string;
}

/**
 * 上传本地文件到禅道。
 *
 * 通过 multipart/form-data 方式上传文件，适用于在 story/bug 等对象的内容中插入图片。
 * 仅支持 Node.js 运行时（需要读取本地文件）。
 *
 * @param client - 已认证的 ZentaoClient 实例。
 * @param filePath - 本地文件路径。
 * @param options - 上传选项，可指定关联的对象类型和 ID。
 * @returns 上传成功后的文件信息（id、url）。
 */
export async function uploadFile(
  client: ZentaoClient,
  filePath: string,
  options?: { objectType?: string; objectID?: number },
): Promise<UploadedFile> {
  const { isNodeRuntime } = await import('../misc/environment.js');
  if (!isNodeRuntime()) {
    const { ZentaoError } = await import('../misc/errors.js');
    throw new ZentaoError('E_UPLOAD_NODE_ONLY');
  }

  const { readFile, stat } = await import('node:fs/promises');
  const fileStat = await stat(filePath);
  if (!fileStat.isFile()) {
    const { ZentaoError } = await import('../misc/errors.js');
    throw new ZentaoError('E_UPLOAD_NOT_A_FILE', { path: filePath });
  }

  const fileName = filePath.split('/').pop() ?? 'uploaded-file';
  const fileBuffer = await readFile(filePath);

  const formData = new FormData();
  formData.append('file', new Blob([fileBuffer], { type: 'image/png' }), fileName);
  if (options?.objectType) {
    formData.append('objectType', options.objectType);
  }
  if (options?.objectID !== undefined) {
    formData.append('objectID', String(options.objectID));
  }

  const result = await client.request<{
    status: string;
    id: number;
    url: string;
    data?: { id: number; url: string };
  }>('/files', {
    method: 'POST',
    body: formData,
  });

  if (!result || result.status !== 'success') {
    const { ZentaoError } = await import('../misc/errors.js');
    throw new ZentaoError('E_UPLOAD_FAILED', { message: result ? '文件上传失败' : '服务器返回空响应，请检查 objectType/objectID 参数' });
  }

  return {
    id: result.data?.id ?? result.id,
    url: result.data?.url ?? result.url,
  };
}
