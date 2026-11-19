import { parseFragment } from 'parse5';
import { ZentaoError } from '../misc/errors.js';
import { explicitBodyFieldSource, parseRequestData } from '../modules/resolve.js';
import type { MarkdownRenderer, ModuleAction } from '../types/index.js';
import { getHtmlFields } from './html-files.js';

// Inspect only text outside HTML elements. Markdown-looking text inside an existing element is literal.
const blockMarkdown = /^ {0,3}(?:#{1,6}(?:\s|$)|>|(?:[-+*]|\d{1,9}[.)])\s|~{3,}|(?:-{3,}|={3,})\s*$)/m;
const inlineMarkdown = /`|\\<|\]\s*[(\[]|\*\*|~~|(?:^|\s)[*_](?=\S)/;

function isHtmlFragment(value: string): boolean {
  // Fragment parsing drops the document's outer html, head and body tags.
  if (/^\s*<(?:!doctype\s+html|html|head|body)(?=[\s/>])/i.test(value)) return true;
  // Also rules out Markdown autolinks such as <https://example.com> before parsing.
  if (!/<(?:[a-z][\w-]*(?=[\s/>])|!--)/i.test(value)) return false;
  const { childNodes } = parseFragment(value, { sourceCodeLocationInfo: true });
  const outside: string[] = [];
  let hasMarkup = false;
  for (const node of childNodes) {
    if ('value' in node && node.sourceCodeLocation) {
      const { startOffset, endOffset } = node.sourceCodeLocation;
      outside.push(value.slice(startOffset, endOffset));
    } else {
      // HTML error recovery treats Markdown autolinks as elements named "https:" or "a@example.test".
      if ('tagName' in node && !/^[a-z][\w-]*$/i.test(node.tagName)) return false;
      hasMarkup = true;
      outside.push('<');
    }
  }
  const text = outside.join('');
  return hasMarkup && !blockMarkdown.test(text) && !inlineMarkdown.test(text);
}

/** Render into the request's private params. Return the native Markdown field to exclude from HTML image handling. */
export async function renderExplicitMarkdown(
  module: string,
  action: ModuleAction,
  params: Record<string, unknown>,
  render: MarkdownRenderer,
): Promise<string | undefined> {
  const method = action.method?.toUpperCase();
  if ((method !== 'POST' && method !== 'PUT') || action.requestBody?.schema.type !== 'object') return;
  const fields = getHtmlFields(action);
  if (!fields.length) return;
  const data = parseRequestData(params.data);
  const nativeDoc = module.toLowerCase() === 'doc'
    && explicitBodyFieldSource(params, data, 'contentType')?.contentType !== 'html';
  const markdownField = nativeDoc ? 'content' : undefined;
  let updatedData: Record<string, unknown> | undefined;
  for (const field of fields) {
    if (field === markdownField) continue;
    const owner = explicitBodyFieldSource(params, data, field);
    const value = owner?.[field];
    if (typeof value !== 'string' || !value.trim()) continue;
    if (isHtmlFragment(value)) continue;
    const html = await render(value, { module, action: action.name, field });
    if (typeof html !== 'string') {
      throw new ZentaoError('E_INVALID_PARAM', { param: `renderMarkdown(${field})`, value: typeof html });
    }
    if (html === value) continue;
    if (owner === data) {
      updatedData ??= { ...data };
      updatedData[field] = html;
    } else {
      params[field] = html;
    }
  }
  if (updatedData) params.data = typeof params.data === 'string' ? JSON.stringify(updatedData) : updatedData;
  return markdownField;
}
