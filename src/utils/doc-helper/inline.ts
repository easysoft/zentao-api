import type { BlockSnapshot, ConvertOptions, DeltaInsert } from './types.js';
import {
  deltaFrom,
  escapeMarkdownMath,
  escapeHtml,
  escapeHtmlAttribute,
  isRecord,
  resolveDocumentUrl,
  safeCssColor,
  safeFontSize,
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

  // The existing Markdown adapter has no holder matcher and therefore keeps
  // the underlying insert (normally a single space). HTML has a dedicated
  // readable holder representation below.
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

function htmlDataAttributes(data: unknown): string {
  if (!isRecord(data)) return '';
  return ` data-holder-data="${escapeHtmlAttribute(JSON.stringify(data))}"`;
}

function renderHtmlDelta(
  delta: DeltaInsert,
  options: ConvertOptions,
  block?: BlockSnapshot
): string {
  if (typeof delta.insert !== 'string') return '';
  const attributes = toRecord(delta.attributes);
  const holder = toRecord(attributes.holder);
  if (Object.keys(holder).length) {
    const text =
      toStringValue(holder.text) || toStringValue(holder.name) || delta.insert;
    const id = toStringValue(holder.id);
    const name = toStringValue(holder.name);
    const hint = toStringValue(holder.hint);
    return `<code class="affine-zui-holder"${
      id ? ` data-holder-id="${escapeHtmlAttribute(id)}"` : ''
    }${name ? ` data-holder-name="${escapeHtmlAttribute(name)}"` : ''}${
      hint ? ` title="${escapeHtmlAttribute(hint)}"` : ''
    }${htmlDataAttributes(holder.data)}>${escapeHtml(text)}</code>`;
  }

  const mention = toRecord(attributes.mention);
  if (Object.keys(mention).length) {
    const label = toStringValue(mention.label) || toStringValue(mention.name);
    const id = toStringValue(mention.id);
    const type = toStringValue(mention.type);
    return `<span class="affine-zui-mention-label"${
      id ? ` data-id="${escapeHtmlAttribute(id)}"` : ''
    }${type ? ` data-type="${escapeHtmlAttribute(type)}"` : ''}>@${escapeHtml(
      label
    )}</span>`;
  }

  const latex = toStringValue(attributes.latex);
  if (latex) {
    return `<span class="affine-inline-latex" data-latex="${escapeHtmlAttribute(
      latex
    )}">${escapeHtml(latex)}</span>`;
  }

  const reference = referenceFrom(delta);
  const visibleText = reference
    ? options.resolveDocTitle?.(reference.pageId) ||
      delta.insert.trim() ||
      reference.pageId
    : delta.insert;
  let output = escapeHtml(visibleText).replace(/\n/g, '<br>');
  if (attributes.bold) output = `<strong>${output}</strong>`;
  if (attributes.italic) output = `<em>${output}</em>`;
  if (attributes.strike) output = `<del>${output}</del>`;
  if (attributes.underline) output = `<u>${output}</u>`;
  if (attributes.code) output = `<code>${output}</code>`;
  if (attributes.sub) output = `<sub>${output}</sub>`;
  if (attributes.sup) output = `<sup>${output}</sup>`;

  const styles: string[] = [];
  const color = safeCssColor(attributes.color);
  const background = safeCssColor(attributes.background);
  const fontSize = safeFontSize(attributes.fontSize);
  if (color) styles.push(`color:${color}`);
  if (background) styles.push(`background-color:${background}`);
  if (fontSize) styles.push(`font-size:${fontSize}`);
  if (styles.length) output = `<span style="${styles.join(';')}">${output}</span>`;

  let url = sanitizeUrl(attributes.link);
  if (reference) {
    url = resolveDocumentUrl(
      options,
      {
        ...reference,
        title: options.resolveDocTitle?.(reference.pageId),
      },
      block
    );
  }
  return url
    ? `<a href="${escapeHtmlAttribute(url)}">${output}</a>`
    : output;
}

export function deltaToHtml(
  value: unknown,
  options: ConvertOptions,
  block?: BlockSnapshot
): string {
  return deltaFrom(value)
    .map(delta => renderHtmlDelta(delta, options, block))
    .join('');
}
