/** Node.js/Bun 本地文件路径形式的上传输入。 */
export interface FileUploadPathInput {
  /** 本地文件路径。 */
  path: string;
  /** 上传时使用的文件名；省略时取路径 basename。 */
  filename?: string;
  /** 显式 MIME 类型；省略时按文件名推断。 */
  contentType?: string;
}

/** 内存数据形式的上传输入。 */
export interface FileUploadDataInput {
  /** 文件内容。 */
  data: Blob | ArrayBuffer | ArrayBufferView;
  /** 上传时使用的文件名。 */
  filename: string;
  /** 显式 MIME 类型；省略时优先使用 Blob.type，再按文件名推断。 */
  contentType?: string;
}

/**
 * 高阶 `request()` 可接受的文件输入。
 *
 * - Node.js/Bun：可直接传本地路径或 {@link FileUploadPathInput}。
 * - 浏览器：传 `File`（属于 `Blob`）、`Blob` 或 {@link FileUploadDataInput}；
 *   无文件名的 `Blob` 会按 MIME 类型生成文件名，需要精确文件名时使用数据对象形式。
 */
export type FileUploadSource = string | Blob | FileUploadPathInput | FileUploadDataInput;

/** `request("file/create")` 的参数。 */
export type FileCreateParams = Record<string, unknown> & {
  file: FileUploadSource;
  objectType: 'bug' | 'story' | 'task' | 'testcase' | (string & {});
  objectID: number;
};

/** `request("file/create")` 归一化后的结果。 */
export interface FileCreateResult {
  id: number;
  url?: string;
  [key: string]: unknown;
}
