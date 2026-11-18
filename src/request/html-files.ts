import { parseFragment, type DefaultTreeAdapterMap } from 'parse5';
import type { ModuleAction } from '../types/module.js';

type HtmlNode = DefaultTreeAdapterMap['node'];
type HtmlElement = DefaultTreeAdapterMap['element'];
type SourceRange = { startOffset: number; endOffset: number };

/** HTML 中的文件引用；源码位置仅供内部定点改写。 */
export interface HtmlFileReference {
  field: string;
  path: string;
  name?: string;
  tag: 'img' | 'a';
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
  name?: string;
  error?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function nonempty(value: string | undefined): string | undefined {
  return value?.trim() || undefined;
}

function attribute(element: HtmlElement, name: string): string | undefined {
  return element.attrs.find(item => item.name === name && !item.namespace)?.value;
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

function linkText(element: HtmlElement): string | undefined {
  const parts: string[] = [];
  const stack: HtmlNode[] = [...element.childNodes].reverse();
  while (stack.length) {
    const node = stack.pop()!;
    if ('value' in node) parts.push(node.value);
    else if ('childNodes' in node) {
      for (let i = node.childNodes.length - 1; i >= 0; i--) stack.push(node.childNodes[i]);
    }
  }
  return nonempty(parts.join(''));
}

function parseReferences(field: string, html: string): HtmlFileReference[] {
  const fragment = parseFragment(html, { sourceCodeLocationInfo: true });
  const stack: HtmlNode[] = [...fragment.childNodes].reverse();
  const references: HtmlFileReference[] = [];
  const seenOffsets = new Set<number>();
  while (stack.length) {
    const node = stack.pop()!;
    if ('childNodes' in node) {
      for (let i = node.childNodes.length - 1; i >= 0; i--) stack.push(node.childNodes[i]);
    }
    if (!('tagName' in node)) continue;
    if ('content' in node) {
      const content = (node as DefaultTreeAdapterMap['template']).content;
      for (let i = content.childNodes.length - 1; i >= 0; i--) stack.push(content.childNodes[i]);
    }
    if (node.namespaceURI !== 'http://www.w3.org/1999/xhtml' || (node.tagName !== 'img' && node.tagName !== 'a')) continue;
    const sourceName = node.tagName === 'img' ? 'src' : 'href';
    const path = attribute(node, sourceName);
    const location = node.sourceCodeLocation;
    const source = location?.attrs?.[sourceName];
    const startTag = location?.startTag;
    if (!path || !source || !startTag || html[startTag.endOffset - 1] !== '>' || seenOffsets.has(source.startOffset)) continue;
    seenOffsets.add(source.startOffset);
    const name = node.tagName === 'img'
      ? nonempty(attribute(node, 'alt'))
      : nonempty(attribute(node, 'download')) || nonempty(attribute(node, 'title')) || linkText(node);
    let insertOffset = startTag.endOffset - 1;
    // An unquoted value may itself end in '/', which is not a self-closing marker.
    const slash = insertOffset - 1;
    if (html[slash] === '/' && !Object.values(location.attrs!).some(range => range.startOffset <= slash && range.endOffset > slash)) {
      insertOffset = slash;
    }
    references.push({
      field,
      path,
      name: name || sourceFilename(path),
      tag: node.tagName,
      attributes: location.attrs!,
      insertOffset,
    });
  }
  // HTML error recovery can reorder nodes; resolver calls still follow source order.
  return references.sort((a, b) => a.insertOffset - b.insertOffset);
}

/** 只扫描最终请求体里声明为 HTML 的顶层字符串字段，不创建浏览器 DOM。 */
export function parseHtmlFiles(data: Record<string, unknown> | undefined, action: ModuleAction): HtmlFileDocument[] {
  const properties = action.requestBody?.schema.properties;
  if (!data || !isRecord(properties)) return [];
  const documents: HtmlFileDocument[] = [];
  for (const [field, schema] of Object.entries(properties)) {
    if (!isRecord(schema) || (schema.textType !== 'html' && !(typeof schema.description === 'string' && schema.description.endsWith('(HTML)')))) continue;
    const html = data[field];
    if (typeof html !== 'string' || !/<(?:img|a)(?=[\t\n\f\r />])/i.test(html)) continue;
    const references = parseReferences(field, html);
    if (references.length) documents.push({ field, html, references });
  }
  return documents;
}

function escapeAttribute(value: string): string {
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
      const attributes: Array<[string, string]> = [];
      if (replacement.error !== undefined) {
        attributes.push([reference.tag === 'img' ? 'alt' : 'title', replacement.error]);
      } else if (replacement.url !== undefined) {
        attributes.push([reference.tag === 'img' ? 'src' : 'href', replacement.url]);
        const name = replacement.name ?? reference.name;
        if (reference.tag === 'a' && name) attributes.push(['download', name]);
      }
      let added = '';
      for (const [name, value] of attributes) {
        const range = reference.attributes[name];
        if (range) {
          const spelling = document.html.slice(range.startOffset, range.endOffset).match(/^[^\t\n\f\r =/>]+/)?.[0] || name;
          edits.push({ start: range.startOffset, end: range.endOffset, value: `${spelling}="${escapeAttribute(value)}"` });
        } else {
          added += ` ${name}="${escapeAttribute(value)}"`;
        }
      }
      if (added) edits.push({ start: reference.insertOffset, end: reference.insertOffset, value: added });
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
