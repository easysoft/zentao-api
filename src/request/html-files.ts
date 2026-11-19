import type { ModuleAction } from '../types/module.js';
import { findHtmlImages } from '../utils/html.js';
import { isRecord } from '../utils/object.js';

type SourceRange = { startOffset: number; endOffset: number };

/** HTML 中的文件引用；源码位置仅供内部定点改写。 */
export interface HtmlFileReference {
  field: string;
  path: string;
  name?: string;
  alt?: string;
  startTag: SourceRange;
  attributes: Readonly<Record<string, SourceRange>>;
  insertOffset: number;
}

/** 单个富文本字段及其中真实 HTML 元素的引用。 */
export interface HtmlFileDocument {
  field: string;
  html: string;
  references: HtmlFileReference[];
}

export interface HtmlFileReplacement {
  url?: string;
  error?: string;
  text?: string;
}

function nonempty(value: string | undefined): string | undefined {
  return value?.trim() || undefined;
}

function sourceFilename(path: string): string | undefined {
  if (/^file:(?!\/\/)/i.test(path)) return undefined;
  let pathname = path;
  if (/^(?:https?:)?\/\//i.test(path)) {
    try {
      pathname = new URL(path, 'https://localhost').pathname;
    } catch {
      return undefined;
    }
  } else if (/^[a-z][a-z\d+.-]*:/i.test(path) && !/^file:\/\//i.test(path) && !/^[a-z]:[\\/]/i.test(path)) {
    return undefined;
  } else {
    pathname = path.replace(/^file:\/\//i, '').split(/[?#]/, 1)[0];
  }
  const name = pathname.split(/[\\/]/).at(-1);
  if (!name) return undefined;
  try {
    return nonempty(decodeURIComponent(name));
  } catch {
    return nonempty(name);
  }
}

function parseReferences(field: string, html: string): HtmlFileReference[] {
  return findHtmlImages(html).map(({ src, alt, attributes, startTag }) => {
    const { endOffset } = startTag;
    let insertOffset = endOffset - 1;
    // An unquoted value may itself end in '/', which is not a self-closing marker.
    const slash = insertOffset - 1;
    if (html[slash] === '/' && !Object.values(attributes).some(range => range.startOffset <= slash && range.endOffset > slash)) {
      insertOffset = slash;
    }
    return { field, path: src, name: nonempty(alt) || sourceFilename(src), alt, startTag, attributes, insertOffset };
  });
}

/** 请求体 schema 声明的顶层富文本字段，兼容旧注册表的 (HTML) 说明。 */
export function getHtmlFields(action: ModuleAction): string[] {
  const properties = action.requestBody?.schema.properties;
  if (!isRecord(properties)) return [];
  return Object.keys(properties).filter(field => {
    const schema = properties[field];
    return isRecord(schema) && (schema.textType === 'html' || (typeof schema.description === 'string' && schema.description.endsWith('(HTML)')));
  });
}

/** 只扫描最终请求体里声明为 HTML 的顶层字符串字段，不创建浏览器 DOM。 */
export function parseHtmlFiles(data: Record<string, unknown> | undefined, action: ModuleAction, markdownField?: string): HtmlFileDocument[] {
  if (!data) return [];
  const documents: HtmlFileDocument[] = [];
  for (const field of getHtmlFields(action)) {
    if (field === markdownField) continue;
    const html = data[field];
    if (typeof html !== 'string') continue;
    const references = parseReferences(field, html);
    if (references.length) documents.push({ field, html, references });
  }
  return documents;
}

function escapeHtml(value: string): string {
  return value.replace(/[&"<>]/g, char => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' })[char]!);
}

/** 按源码区间一次拼接，仅返回发生改写的字段；其余 HTML 字节保持原样。 */
export function rewriteHtmlFiles(
  documents: HtmlFileDocument[],
  replacements: ReadonlyMap<HtmlFileReference, HtmlFileReplacement>,
): Record<string, string> {
  const result: Record<string, string> = Object.create(null);
  for (const document of documents) {
    const edits: Array<{ start: number; end: number; value: string }> = [];
    for (const reference of document.references) {
      const replacement = replacements.get(reference);
      if (!replacement) continue;
      if (replacement.text !== undefined) {
        const { startOffset, endOffset } = reference.startTag;
        edits.push({ start: startOffset, end: endOffset, value: escapeHtml(replacement.text) });
        continue;
      }
      const name = replacement.error === undefined ? 'src' : 'alt';
      const value = replacement.error ?? replacement.url;
      if (value === undefined) continue;
      const range = reference.attributes[name];
      if (range) {
        const spelling = document.html.slice(range.startOffset, range.endOffset).match(/^[^\t\n\f\r =/>]+/)?.[0] || name;
        edits.push({ start: range.startOffset, end: range.endOffset, value: `${spelling}="${escapeHtml(value)}"` });
      } else {
        edits.push({ start: reference.insertOffset, end: reference.insertOffset, value: ` ${name}="${escapeHtml(value)}"` });
      }
    }
    if (!edits.length) continue;
    edits.sort((a, b) => a.start - b.start || a.end - b.end);
    const parts: string[] = [];
    let offset = 0;
    for (const edit of edits) {
      parts.push(document.html.slice(offset, edit.start), edit.value);
      offset = edit.end;
    }
    parts.push(document.html.slice(offset));
    result[document.field] = parts.join('');
  }
  return result;
}
