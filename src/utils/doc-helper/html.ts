import { deltaToHtml } from './inline.js';
import {
  blockChildren,
  escapeHtml,
  escapeHtmlAttribute,
  formatFileSize,
  isEdgelessOnly,
  isRecord,
  normalizeSnapshot,
  pageTitleText,
  plainText,
  resolveAssetUrl,
  resolveDocumentUrl,
  resolveZuiImageUrl,
  safeLanguage,
  sanitizeUrl,
  toFiniteNumber,
  toRecord,
  toStringValue,
  validateSnapshotTree,
} from './shared.js';
import type {
  BlockSnapshot,
  HtmlOptions,
  JsonRecord,
  RenderBlockContext,
  SnapshotInput,
} from './types.js';

interface HtmlState {
  options: HtmlOptions;
}

const TRANSPARENT_FLAVOURS = new Set([
  'affine:surface',
  'affine:zui-layout-cell',
]);

const EMBED_LINK_FLAVOURS = new Set([
  'affine:bookmark',
  'affine:embed-figma',
  'affine:embed-github',
  'affine:embed-loom',
  'affine:embed-youtube',
]);

function joinHtml(parts: string[]): string {
  return parts.filter(Boolean).join('\n');
}

function attribute(name: string, value: unknown): string {
  return value === undefined || value === null || value === ''
    ? ''
    : ` ${name}="${escapeHtmlAttribute(value)}"`;
}

function dataAttribute(name: string, value: unknown): string {
  return isRecord(value)
    ? attribute(name, JSON.stringify(value))
    : attribute(name, value);
}

function positiveInteger(value: unknown): number | undefined {
  const number = toFiniteNumber(value);
  return number !== undefined && number > 0
    ? Math.min(10000, Math.round(number))
    : undefined;
}

function safeDimension(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return String(value);
  }
  if (typeof value !== 'string') return '';
  const dimension = value.trim();
  return /^(?:\d+(?:\.\d+)?(?:px|%|em|rem|vh|vw)?|auto)$/i.test(dimension)
    ? dimension
    : '';
}

function safeAlign(value: unknown): string {
  return ['left', 'center', 'right'].includes(String(value))
    ? String(value)
    : '';
}

function renderListGroup(items: BlockSnapshot[], state: HtmlState): string {
  const type = toStringValue(toRecord(items[0]?.props).type, 'bulleted');
  const tag = type === 'numbered' ? 'ol' : 'ul';
  const className = `${escapeHtmlAttribute(type)}-list`;
  const listItems = items.map(item => {
    const props = toRecord(item.props);
    const checkbox =
      type === 'todo'
        ? `<input type="checkbox" disabled${props.checked ? ' checked' : ''}> `
        : '';
    return `<li class="affine-list-block-container">${checkbox}${deltaToHtml(
      props.text,
      state.options,
      item
    )}${renderBlocks(blockChildren(item), state)}</li>`;
  });
  return `<${tag} class="${className}">${listItems.join('')}</${tag}>`;
}

function optionLabel(column: JsonRecord, value: unknown): string {
  const data = toRecord(column.data);
  const options = Array.isArray(data.options)
    ? data.options.filter(isRecord)
    : [];
  return toStringValue(options.find(option => option.id === value)?.value);
}

function databaseCell(
  row: BlockSnapshot,
  column: JsonRecord,
  cells: JsonRecord,
  state: HtmlState
): string {
  const columnId = toStringValue(column.id);
  const rowCells = toRecord(cells[toStringValue(row.id)]);
  const cell = toRecord(rowCells[columnId]);
  const value = cell.value;
  switch (column.type) {
    case 'title':
      return deltaToHtml(toRecord(row.props).text, state.options, row);
    case 'rich-text':
      return deltaToHtml(value, state.options, row);
    case 'date': {
      const date = new Date(typeof value === 'number' ? value : Number.NaN);
      if (Number.isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    case 'select':
      return escapeHtml(optionLabel(column, value));
    case 'multi-select':
      return escapeHtml(
        Array.isArray(value)
          ? value.map(item => optionLabel(column, item)).filter(Boolean).join(',')
          : ''
      );
    case 'checkbox':
      return value === undefined ? '' : escapeHtml(String(value));
    default:
      return value === undefined || value === null
        ? ''
        : escapeHtml(String(value));
  }
}

function renderDatabase(block: BlockSnapshot, state: HtmlState): string {
  const props = toRecord(block.props);
  const columns = Array.isArray(props.columns)
    ? props.columns.filter(isRecord)
    : [];
  const cells = toRecord(props.cells);
  const header = `<tr>${columns
    .map(column => `<th>${escapeHtml(toStringValue(column.name))}</th>`)
    .join('')}</tr>`;
  const body = blockChildren(block)
    .map(
      row =>
        `<tr>${columns
          .map(
            column =>
              `<td>${databaseCell(row, column, cells, state)}</td>`
          )
          .join('')}</tr>`
    )
    .join('');
  const title = deltaToHtml(props.title, state.options, block);
  return joinHtml([
    title ? `<h5>${title}</h5>` : '',
    `<table class="affine-database-block-container"><thead>${header}</thead><tbody>${body}</tbody></table>`,
  ]);
}

function renderZuiTable(block: BlockSnapshot, state: HtmlState): string {
  const props = toRecord(block.props);
  const rows = Array.isArray(props.rows) ? props.rows.filter(isRecord) : [];
  const firstRowHead = props.firstRowHead !== false;
  const body = rows
    .map((row, rowIndex) => {
      const cells = Array.isArray(row.cells) ? row.cells.filter(isRecord) : [];
      return `<tr>${cells
        .map(cell => {
          const tag = cell.head ?? (rowIndex === 0 && firstRowHead) ? 'th' : 'td';
          const colspan = positiveInteger(cell.colspan);
          const rowspan = positiveInteger(cell.rowspan);
          const width = safeDimension(cell.width);
          const align = safeAlign(cell.align);
          const style = align ? `text-align:${align}` : '';
          return `<${tag}${attribute('colspan', colspan)}${attribute(
            'rowspan',
            rowspan
          )}${attribute('width', width)}${attribute(
            'style',
            style
          )}>${deltaToHtml(cell.text, state.options, block)}</${tag}>`;
        })
        .join('')}</tr>`;
    })
    .join('');
  return `<table class="affine-table-block-container"${attribute(
    'data-block-id',
    block.id
  )}><tbody>${body}</tbody></table>`;
}

function renderCustomExportNodes(nodes: unknown[], state: HtmlState): string {
  return nodes
    .filter(isRecord)
    .map(node => {
      const props = toRecord(node.props);
      if (node.type === 'heading') {
        const depth = Math.min(
          6,
          Math.max(1, typeof props.depth === 'number' ? props.depth : 2)
        );
        return `<h${depth}>${escapeHtml(toStringValue(props.text))}</h${depth}>`;
      }
      if (node.type === 'table') {
        const columns = Array.isArray(props.cols)
          ? props.cols.filter(isRecord)
          : [];
        const data = Array.isArray(props.data) ? props.data.filter(isRecord) : [];
        const header = `<tr>${columns
          .map(
            column =>
              `<th>${escapeHtml(
                toStringValue(column.text) || toStringValue(column.name)
              )}</th>`
          )
          .join('')}</tr>`;
        const body = data
          .map(
            row =>
              `<tr>${columns
                .map(column => {
                  const cell = toRecord(row[toStringValue(column.name)]);
                  return `<td>${escapeHtml(toStringValue(cell.text))}</td>`;
                })
                .join('')}</tr>`
          )
          .join('');
        return `<table class="affine-zui-custom-block-table"><thead>${header}</thead><tbody>${body}</tbody></table>`;
      }
      if (node.type === 'link') {
        const url = sanitizeUrl(props.href);
        const label = toStringValue(props.text) || url;
        return url
          ? `<a href="${escapeHtmlAttribute(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(
              label
            )}</a>`
          : escapeHtml(label);
      }
      return `<div>${escapeHtml(toStringValue(props.text))}</div>`;
    })
    .join('');
}

function renderCustomBlock(block: BlockSnapshot, state: HtmlState): string {
  const contentValue = toRecord(block.props).content;
  if (typeof contentValue === 'string') {
    return `<div class="affine-zui-custom-block">${escapeHtml(contentValue)}</div>`;
  }
  const content = toRecord(contentValue);
  const html = toStringValue(content.html);
  if (html) {
    return state.options.allowUnsafeHtml
      ? html
      : `<pre class="affine-zui-html-source"><code>${escapeHtml(html)}</code></pre>`;
  }
  const exported = Array.isArray(content.export) ? content.export : [];
  if (exported.length) {
    return `<div class="affine-zui-custom-block">${renderCustomExportNodes(
      exported,
      state
    )}</div>`;
  }
  const title = toStringValue(content.title);
  const fetcher = content.fetcher;
  const fetcherUrl =
    typeof fetcher === 'string' ? fetcher : toRecord(fetcher).url;
  const url = sanitizeUrl(content.exportUrl) || sanitizeUrl(fetcherUrl);
  const component = toStringValue(content.component);
  return `<div class="affine-zui-custom-block">${
    title ? `<h5>${escapeHtml(title)}</h5>` : ''
  }${
    component
      ? `<div class="affine-zui-component-placeholder" data-component="${escapeHtmlAttribute(
          component
        )}">[Component: ${escapeHtml(component)}]</div>`
      : ''
  }${
    url
      ? `<a href="${escapeHtmlAttribute(
          url
        )}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a>`
      : ''
  }</div>`;
}

function renderEmbedLink(block: BlockSnapshot): string {
  const props = toRecord(block.props);
  const url = sanitizeUrl(props.url);
  if (!url) return '';
  const title = toStringValue(props.title) || url;
  return `<div class="affine-paragraph-block-container"><a href="${escapeHtmlAttribute(
    url
  )}">${escapeHtml(title)}</a></div>`;
}

function renderHolder(block: BlockSnapshot): string {
  const props = toRecord(block.props);
  const text = toStringValue(props.text) || toStringValue(props.name);
  return `<pre class="affine-zui-holder-block-container"${attribute(
    'data-holder-name',
    props.name
  )}${dataAttribute(
    'data-holder-data',
    props.data
  )}><code class="affine-zui-holder-block-content">${escapeHtml(
    text
  )}</code></pre>`;
}

function customRenderer(
  block: BlockSnapshot,
  state: HtmlState
): string | undefined {
  const renderer = state.options.renderBlock;
  if (!renderer) return undefined;
  const context: RenderBlockContext = {
    format: 'html',
    renderChildren: children => renderBlocks(children ?? blockChildren(block), state),
    renderInline: text => deltaToHtml(text, state.options, block),
  };
  return renderer(block, context);
}

function renderUnknown(block: BlockSnapshot, state: HtmlState): string {
  const strategy = state.options.unknownBlock ?? 'children';
  if (strategy === 'throw') {
    throw new TypeError(`Unsupported BlockSuite block flavour: ${block.flavour}`);
  }
  return strategy === 'children' ? renderBlocks(blockChildren(block), state) : '';
}

function renderBlock(block: BlockSnapshot, state: HtmlState): string {
  const overridden = customRenderer(block, state);
  if (overridden !== undefined) return overridden;

  const props = toRecord(block.props);
  if (block.flavour === 'affine:page') {
    return renderBlocks(blockChildren(block), state);
  }
  if (block.flavour === 'affine:note') {
    return isEdgelessOnly(block) ? '' : renderBlocks(blockChildren(block), state);
  }
  if (TRANSPARENT_FLAVOURS.has(block.flavour)) {
    return renderBlocks(blockChildren(block), state);
  }

  switch (block.flavour) {
    case 'affine:paragraph': {
      const text = deltaToHtml(props.text, state.options, block);
      const type = toStringValue(props.type, 'text');
      const align = safeAlign(props.align);
      const style = align ? attribute('style', `text-align:${align}`) : '';
      let own: string;
      if (/^h[1-6]$/.test(type)) {
        own = `<${type}${style}>${text}</${type}>`;
      } else if (type === 'quote') {
        own = `<blockquote class="quote"><p${style}>${text}</p></blockquote>`;
      } else {
        own = `<p${style}>${text}</p>`;
      }
      const children = renderBlocks(blockChildren(block), state);
      return `<div class="affine-paragraph-block-container">${own}${
        children
          ? `<div class="affine-block-children-container">${children}</div>`
          : ''
      }</div>`;
    }
    case 'affine:code': {
      const text = plainText(props.text);
      const language = safeLanguage(props.language);
      return `<pre><code${
        language ? ` class="language-${escapeHtmlAttribute(language)}"` : ''
      }>${escapeHtml(text)}</code></pre>`;
    }
    case 'affine:divider':
      return '<hr>';
    case 'affine:latex':
      return `<div class="affine-latex-block" data-latex="${escapeHtmlAttribute(
        toStringValue(props.latex)
      )}">${escapeHtml(toStringValue(props.latex))}</div>`;
    case 'affine:image': {
      const url = resolveAssetUrl(state.options, block, 'image');
      if (!url) return '';
      const width = positiveInteger(props.width);
      const height = positiveInteger(props.height);
      const caption = toStringValue(props.caption);
      return `<figure class="affine-image-block-container"><img src="${escapeHtmlAttribute(
        url
      )}" alt="${escapeHtmlAttribute(caption)}"${attribute(
        'title',
        caption
      )}${attribute('width', width)}${attribute('height', height)}></figure>`;
    }
    case 'affine:zui-image': {
      const url = resolveZuiImageUrl(state.options, block);
      if (!url) return '';
      return `<figure class="affine-image-block-container"${
        safeAlign(props.align)
          ? attribute('style', `text-align:${safeAlign(props.align)}`)
          : ''
      }><img src="${escapeHtmlAttribute(url)}" alt="${escapeHtmlAttribute(
        toStringValue(props.caption)
      )}"${attribute('width', positiveInteger(props.width))}${attribute(
        'height',
        positiveInteger(props.height)
      )}></figure>`;
    }
    case 'affine:attachment': {
      const name = toStringValue(props.name, 'Attachment');
      const url = resolveAssetUrl(state.options, block, 'attachment');
      const caption = toStringValue(props.caption);
      const label = url
        ? `<a href="${escapeHtmlAttribute(
            url
          )}" target="_blank" rel="noopener noreferrer">${escapeHtml(name)}</a>`
        : escapeHtml(name);
      return `<div class="affine-attachment-block-container"><p><strong>${label}</strong> <em>(${escapeHtml(
        formatFileSize(props.size)
      )}${caption ? `, ${escapeHtml(caption)}` : ''})</em></p></div>`;
    }
    case 'affine:database':
      return renderDatabase(block, state);
    case 'affine:zui-table':
      return renderZuiTable(block, state);
    case 'affine:zui-holder':
      return joinHtml([
        renderHolder(block),
        renderBlocks(blockChildren(block), state),
      ]);
    case 'affine:zui-layout':
      return `<div class="affine-zui-layout"${attribute(
        'data-layout',
        props.type
      )}>${renderBlocks(blockChildren(block), state)}</div>`;
    case 'affine:zui-panel':
      return `<aside class="affine-zui-panel"${attribute(
        'data-type',
        props.type
      )}>${renderBlocks(blockChildren(block), state)}</aside>`;
    case 'affine:zui-expand': {
      const title = deltaToHtml(props.title, state.options, block);
      return `<details class="affine-zui-expand"${props.open === false ? '' : ' open'}><summary>${title}</summary>${renderBlocks(
        blockChildren(block),
        state
      )}</details>`;
    }
    case 'affine:embed-zui-whiteboard': {
      const image = sanitizeUrl(props.sceneImage, 'image');
      if (image) {
        return `<img class="affine-whiteboard-block-image" src="${escapeHtmlAttribute(
          image
        )}" alt="${escapeHtmlAttribute(
          toStringValue(props.caption, 'whiteboard')
        )}">`;
      }
      return `<div class="affine-whiteboard-block-container">${
        props.sceneData ? '[Whiteboard]' : '[Empty Whiteboard]'
      }</div>`;
    }
    case 'affine:embed-zui-custom':
      return renderCustomBlock(block, state);
    case 'affine:embed-zui-html': {
      const html = toStringValue(props.html);
      if (!html) return '';
      return state.options.allowUnsafeHtml
        ? html
        : `<pre class="affine-zui-html-source"><code>${escapeHtml(html)}</code></pre>`;
    }
    case 'affine:embed-zui-iframe': {
      const url = sanitizeUrl(props.src);
      if (!url) return '';
      const sandbox = toStringValue(props.sandbox);
      let sandboxTokens = sandbox
        .split(/\s+/)
        .filter(token =>
          [
            'allow-forms',
            'allow-modals',
            'allow-pointer-lock',
            'allow-popups',
            'allow-same-origin',
            'allow-scripts',
          ].includes(token)
        );
      // A same-origin scripted frame can remove its own sandbox attribute.
      if (
        sandboxTokens.includes('allow-scripts') &&
        sandboxTokens.includes('allow-same-origin')
      ) {
        sandboxTokens = sandboxTokens.filter(token => token !== 'allow-same-origin');
      }
      const sandboxAttribute = sandboxTokens.length
        ? attribute('sandbox', sandboxTokens.join(' '))
        : ' sandbox';
      return `<iframe src="${escapeHtmlAttribute(url)}"${sandboxAttribute}${attribute('width', safeDimension(props.width))}${attribute(
        'height',
        safeDimension(props.height)
      )}${props.allowfullscreen ? ' allowfullscreen' : ''}></iframe>`;
    }
    case 'affine:embed-zui-component': {
      const name = toStringValue(props.name);
      return name
        ? `<div class="affine-zui-component-placeholder" data-component="${escapeHtmlAttribute(
            name
          )}">[Component: ${escapeHtml(name)}]</div>`
        : '';
    }
    case 'affine:embed-linked-doc': {
      const pageId = toStringValue(props.pageId);
      if (!pageId) return '';
      const title = state.options.resolveDocTitle?.(pageId) ?? 'untitled';
      const url = resolveDocumentUrl(
        state.options,
        { pageId, params: toRecord(props.params), title },
        block
      );
      return url
        ? `<a href="${escapeHtmlAttribute(url)}">${escapeHtml(title)}</a>`
        : escapeHtml(title);
    }
    case 'affine:embed-synced-doc': {
      const children = blockChildren(block);
      if (children.length) return renderBlocks(children, state);
      const pageId = toStringValue(props.pageId);
      if (!pageId) return '';
      const title = state.options.resolveDocTitle?.(pageId) ?? pageId;
      const url = resolveDocumentUrl(
        state.options,
        { pageId, params: toRecord(props.params), title },
        block
      );
      return url
        ? `<a class="affine-synced-doc-link" href="${escapeHtmlAttribute(
            url
          )}">${escapeHtml(title)}</a>`
        : `<span class="affine-synced-doc-link">${escapeHtml(title)}</span>`;
    }
    default:
      return EMBED_LINK_FLAVOURS.has(block.flavour)
        ? renderEmbedLink(block)
        : renderUnknown(block, state);
  }
}

function renderBlocks(blocks: readonly BlockSnapshot[], state: HtmlState): string {
  const rendered: string[] = [];
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    if (!block) continue;
    if (block.flavour === 'affine:list') {
      const type = toStringValue(toRecord(block.props).type, 'bulleted');
      const group = [block];
      while (index + 1 < blocks.length) {
        const next = blocks[index + 1];
        if (
          next?.flavour !== 'affine:list' ||
          toStringValue(toRecord(next.props).type, 'bulleted') !== type
        ) {
          break;
        }
        group.push(next);
        index += 1;
      }
      rendered.push(renderListGroup(group, state));
    } else {
      rendered.push(renderBlock(block, state));
    }
  }
  return joinHtml(rendered);
}

/** Convert a BlockSuite 0.19.x snapshot to semantic, escaped HTML. */
export function snapshotToHtml(
  input: SnapshotInput,
  options: HtmlOptions = {}
): string {
  const normalized = normalizeSnapshot(input);
  validateSnapshotTree(normalized.blocks, options);
  const state: HtmlState = { options };
  const title = pageTitleText(normalized);
  const heading =
    options.includeTitle === false || !title ? '' : `<h1>${escapeHtml(title)}</h1>`;
  const body = joinHtml([heading, renderBlocks(normalized.blocks, state)]);
  const fullDocument = options.fullDocument ?? normalized.documentLike;
  if (!fullDocument) return body;

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(
    title
  )}</title></head><body><main class="blocksuite-document">${body}</main></body></html>`;
}
