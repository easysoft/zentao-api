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
  objectType?: 'bug' | 'story' | 'task' | 'testcase' | (string & {});
  objectID?: number;
  /** 附件标记，默认 editor（文档编辑器图片），23.0 / biz14.0 / max9.0 / ipd6.0 起支持；显式空字符串用于普通附件，其他值由服务端按空字符串处理。 */
  extra?: string;
};

/** `request("file/create")` 归一化后的结果。 */
export interface FileCreateResult {
  id: number;
  url?: string;
  [key: string]: unknown;
}

/** HTML 图片或下载链接中的文件引用；路径和名称已解码 HTML 实体。 */
export interface FileReference {
  /** 图片 src 或链接 href 中的原始路径。 */
  path: string;
  /** 从 alt、download、title、链接文本或来源路径提取的文件名。 */
  name?: string;
}

/** 文件解析器返回的来源；字符串表示路径，未指定名称时沿用输入名称。 */
export type ResolvedFile =
  | string
  | { path: string; name?: string }
  | { blob: Blob; name?: string }
  | { url: string; name?: string };

/**
 * HTML 文件解析器。函数可异步执行；映射依次按路径和文件名查找自身属性。
 * 映射的字符串值以命中的 key 为文件名。未命中、抛错或返回无效来源时终止请求。
 */
export type FileResolver =
  | ((reference: FileReference) => ResolvedFile | Promise<ResolvedFile>)
  | Record<string, ResolvedFile>;

/** HTML 文件处理中的错误上下文，可用于展示问题或重试关联、清理。 */
export interface FileWarning {
  /** 出错阶段：解析、上传、关联或清理。 */
  stage: 'resolve' | 'upload' | 'associate' | 'cleanup';
  /** SDK 或服务端错误码。 */
  code: string;
  /** 可读错误消息。 */
  message: string;
  /** HTML body 字段名。 */
  field?: string;
  /** 原始文件引用路径。 */
  path?: string;
  /** 文件名。 */
  name?: string;
  /** 本次上传产生的禅道文件 ID。 */
  fileID?: number;
  /** 文件应关联的对象类型。 */
  objectType?: string;
  /** 文件应关联的对象 ID。 */
  objectID?: number;
}

/** 高阶请求的 HTML 文件处理配置；单次请求优先于全局选项。 */
export interface FileHandlingOptions {
  /** 解析本地及自定义文件引用；HTTP(S) 和已有禅道文件链接直接保留。 */
  fileResolver?: FileResolver;
  /** 上传或读取本地文件失败后是否标注 HTML 并继续主请求，默认 true；解析器失败始终终止。 */
  continueOnFileUploadError?: boolean;
  /**
   * 文件错误通知；支持异步回调，回调异常不改变主请求结果。
   * 普通响应同时提供 fileWarnings；raw 模式仅通过此回调通知，不修改原始响应。
   */
  onFileError?: (warning: FileWarning) => void | Promise<void>;
}
