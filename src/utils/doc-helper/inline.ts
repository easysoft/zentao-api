import type { BlockSnapshot, ConvertOptions, DeltaInsert } from './types.js';
import {
  deltaFrom,
  escapeMarkdownMath,
  resolveDocumentUrl,
  sanitizeUrl,
  toRecord,
  toStringValue,
} from './shared.js';

function escapeMarkdownText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/([`*_[\]<>|~])/g, '\\$1')
    .replace(/(^|\n)([ \t]*)([#>+-]|\d+[.)])(?=\s)/g, '$1$2\\$3');
}

function markdownUrl(url: string): string {
  return url
    .replace(/\\/g, '%5C')
    .replace(/ /g, '%20')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E');
}

function markdownInlineCode(value: string): string {
  const text = value.replace(/\n/g, ' ');
  const runs = text.match(/`+/g) ?? [];
  const fence = '`'.repeat(
    Math.max(1, ...runs.map(run => run.length + 1))
  );
  const needsPadding =
    text.startsWith('`') ||
    text.endsWith('`') ||
    (text.startsWith(' ') && text.endsWith(' ') && text.trim().length > 0);
  return `${fence}${needsPadding ? ' ' : ''}${text}${needsPadding ? ' ' : ''}${fence}`;
}

function mentionText(delta: DeltaInsert): string | undefined {
  const mention = toRecord(delta.attributes?.mention);
  if (!Object.keys(mention).length) return undefined;
  const label = toStringValue(mention.label) || toStringValue(mention.name);
  return label ? `@${label}` : undefined;
}

function referenceFrom(delta: DeltaInsert) {
  const reference = toRecord(delta.attributes?.reference);
  const pageId = toStringValue(reference.pageId);
  if (!pageId) return undefined;
  return {
    pageId,
    params: toRecord(reference.params),
  };
}

function renderMarkdownDelta(
  delta: DeltaInsert,
  options: ConvertOptions,
  block?: BlockSnapshot
): string {
  if (typeof delta.insert !== 'string') return '';
  const attributes = toRecord(delta.attributes);

  const mention = mentionText(delta);
  const latex = toStringValue(attributes.latex);
  const reference = referenceFrom(delta);
  const rawLink = toStringValue(attributes.link);

  // The Markdown adapter has no holder matcher and therefore keeps the
  // underlying insert (normally a single space).
  let raw = mention ?? delta.insert;
  const linkIsPlainText = !reference && (raw === '' || raw === rawLink);
  if (!reference && raw === '' && rawLink) raw = rawLink;
  let referenceTitle: string | undefined;
  if (reference) {
    referenceTitle = options.resolveDocTitle?.(reference.pageId);
    raw = referenceTitle || raw.trim() || reference.pageId;
  }
  if (latex) return `$${escapeMarkdownMath(latex)}$`;

  let output = attributes.code
    ? markdownInlineCode(raw)
    : escapeMarkdownText(raw);

  if (attributes.bold) output = `**${output}**`;
  if (attributes.italic) output = `*${output}*`;
  if (attributes.strike) output = `~~${output}~~`;
  // This mirrors the 0.19.5 adapter's readable, escaped HTML fallback.
  if (attributes.underline) output = `\\<u>${output}\\</u>`;

  let url = sanitizeUrl(rawLink);
  if (reference) {
    url = resolveDocumentUrl(
      options,
      { ...reference, title: referenceTitle },
      block
    );
  }
  if (url) {
    if (!linkIsPlainText) output = `[${output}](${markdownUrl(url)})`;
  }
  return output;
}

export function deltaToMarkdown(
  value: unknown,
  options: ConvertOptions,
  block?: BlockSnapshot
): string {
  return deltaFrom(value)
    .map(delta => renderMarkdownDelta(delta, options, block))
    .join('');
}
