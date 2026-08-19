import { deltaToMarkdown } from './inline.js';
import {
  blockChildren,
  deltaFrom,
  escapeMarkdownMath,
  formatFileSize,
  isEdgelessOnly,
  isRecord,
  normalizeSnapshot,
  pageTitleDelta,
  plainText,
  resolveAssetUrl,
  resolveDocumentUrl,
  resolveZuiImageUrl,
  safeLanguage,
  sanitizeUrl,
  toRecord,
  toStringValue,
  validateSnapshotTree,
} from './shared.js';
import type {
  BlockSnapshot,
  JsonRecord,
  MarkdownOptions,
  RenderBlockContext,
  SnapshotInput,
} from './types.js';

interface MarkdownState {
  options: MarkdownOptions;
}

const TRANSPARENT_FLAVOURS = new Set([
  'affine:surface',
  'affine:zui-layout',
  'affine:zui-layout-cell',
  'affine:zui-panel',
]);

const EMBED_LINK_FLAVOURS = new Set([
  'affine:bookmark',
  'affine:embed-figma',
  'affine:embed-github',
  'affine:embed-loom',
  'affine:embed-youtube',
]);

function trimBlock(value: string): string {
  return value.replace(/^\n+|\n+$/g, '');
}

function trimProse(value: string): string {
  return value.replace(/[ \t]+$/gm, whitespace =>
    whitespace.length >= 2 ? whitespace : ''
  );
}

function joinBlocks(blocks: string[]): string {
  return blocks
    .map(trimBlock)
    .filter(Boolean)
    .join('\n\n');
}

function escapeTableCell(value: string): string {
  return value.replace(/(^|[^\\])\|/g, '$1\\|').replace(/\r?\n/g, '<br>');
}

function markdownText(
  value: unknown,
  state: MarkdownState,
  block?: BlockSnapshot
): string {
  return deltaToMarkdown(toStringValue(value), state.options, block);
}

function markdownUrl(
  value: unknown,
  kind: 'link' | 'image' = 'link'
): string {
  return sanitizeUrl(value, kind)
    .replace(/\\/g, '%5C')
    .replace(/ /g, '%20')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E');
}

function renderTable(rows: string[][]): string {
  if (!rows.length) return '';
  const columnCount = Math.max(...rows.map(row => row.length), 0);
  if (!columnCount) return '';
  const normalized = rows.map(row =>
    Array.from({ length: columnCount }, (_, index) =>
      escapeTableCell(row[index] ?? '')
    )
  );
  const widths = Array.from({ length: columnCount }, (_, index) =>
    Math.max(3, ...normalized.map(row => row[index]?.length ?? 0))
  );
  const line = (row: string[]) =>
    `| ${row
      .map((cell, index) => cell.padEnd(widths[index] ?? 3))
      .join(' | ')} |`;
  const header = normalized[0] ?? [];
  const separator = widths.map(width => '-'.repeat(width));
  return [line(header), line(separator), ...normalized.slice(1).map(line)].join(
    '\n'
  );
}

function codeFence(text: string): string {
  const longest = Math.max(
    0,
    ...(text.match(/`+/g) ?? []).map(run => run.length)
  );
  return '`'.repeat(Math.max(3, longest + 1));
}

function indentLines(value: string, size: number): string {
  const indent = ' '.repeat(size);
  return value
    .split('\n')
    .map(line => (line ? `${indent}${line}` : line))
    .join('\n');
}

function indentNestedBlocks(value: string): string {
  const entity = '&#x20;';
  return trimBlock(value)
    .split('\n')
    .map(line => {
      if (!line) return line;
      return line.startsWith(entity)
        ? `${entity}    ${line.slice(entity.length)}`
        : `${entity}   ${line}`;
    })
    .join('\n');
}

function renderListGroup(items: BlockSnapshot[], state: MarkdownState): string {
  const type = toStringValue(toRecord(items[0]?.props).type, 'bulleted');
  return items
    .map((item, index) => {
      const props = toRecord(item.props);
      const marker = type === 'numbered' ? `${index + 1}.` : '*';
      const task = type === 'todo' ? `[${props.checked ? 'x' : ' '}] ` : '';
      const text = trimProse(
        deltaToMarkdown(props.text, state.options, item)
      );
      const lines = text.split('\n');
      let output = `${marker} ${task}${lines[0] ?? ''}`;
      const continuationIndent = ' '.repeat(marker.length + 1);
      if (lines.length > 1) {
        output += `\n${lines
          .slice(1)
          .map(line => `${continuationIndent}${line}`)
          .join('\n')}`;
      }

      const children = renderBlocks(blockChildren(item), state);
      if (children) output += `\n${indentLines(children, marker.length + 1)}`;
      return output;
    })
    .join('\n');
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
  state: MarkdownState
): string {
  const columnId = toStringValue(column.id);
  const rowCells = toRecord(cells[toStringValue(row.id)]);
  const cell = toRecord(rowCells[columnId]);
  const value = cell.value;

  switch (column.type) {
    case 'title':
      return deltaToMarkdown(toRecord(row.props).text, state.options, row);
    case 'rich-text':
      return deltaToMarkdown(value, state.options, row);
    case 'date': {
      const date = new Date(typeof value === 'number' ? value : Number.NaN);
      if (Number.isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    case 'select':
      return markdownText(optionLabel(column, value), state, row);
    case 'multi-select':
      return markdownText(
        Array.isArray(value)
          ? value.map(item => optionLabel(column, item)).filter(Boolean).join(',')
          : '',
        state,
        row
      );
    case 'checkbox':
      return markdownText(value === undefined ? '' : String(value), state, row);
    default:
      return markdownText(
        value === undefined || value === null ? '' : String(value),
        state,
        row
      );
  }
}

function renderDatabase(block: BlockSnapshot, state: MarkdownState): string {
  const props = toRecord(block.props);
  const columns = Array.isArray(props.columns)
    ? props.columns.filter(isRecord)
    : [];
  const cells = toRecord(props.cells);
  const rows = blockChildren(block);
  const tableRows = [
    columns.map(column => markdownText(column.name, state, block)),
    ...rows.map(row =>
      columns.map(column => databaseCell(row, column, cells, state))
    ),
  ];
  const title = deltaToMarkdown(props.title, state.options, block);
  return joinBlocks([title ? `##### ${title}` : '', renderTable(tableRows)]);
}

function renderZuiTable(block: BlockSnapshot, state: MarkdownState): string {
  const rows = Array.isArray(toRecord(block.props).rows)
    ? (toRecord(block.props).rows as unknown[]).filter(isRecord)
    : [];
  return renderTable(
    rows.map(row => {
      const cells = Array.isArray(row.cells) ? row.cells.filter(isRecord) : [];
      return cells.map(cell => deltaToMarkdown(cell.text, state.options, block));
    })
  );
}

function renderCustomExportNodes(
  nodes: unknown[],
  state: MarkdownState
): string {
  const rendered = nodes.filter(isRecord).map(node => {
    const props = toRecord(node.props);
    if (node.type === 'heading') {
      const depth = Math.min(
        6,
        Math.max(1, typeof props.depth === 'number' ? props.depth : 2)
      );
      return `${'#'.repeat(depth)} ${markdownText(props.text, state)}`;
    }
    if (node.type === 'table') {
      const columns = Array.isArray(props.cols)
        ? props.cols.filter(isRecord)
        : [];
      const data = Array.isArray(props.data) ? props.data.filter(isRecord) : [];
      return renderTable([
        columns.map(column =>
          markdownText(column.text ?? column.name, state)
        ),
        ...data.map(row =>
          columns.map(column => {
            const cell = toRecord(row[toStringValue(column.name)]);
            return markdownText(cell.text, state);
          })
        ),
      ]);
    }
    if (node.type === 'link') {
      const url = markdownUrl(props.href);
      const label = markdownText(props.text, state) || url;
      return url ? `[${label}](${url})` : label;
    }
    return markdownText(props.text, state);
  });
  return joinBlocks(rendered);
}

function renderCustomBlock(block: BlockSnapshot, state: MarkdownState): string {
  const contentValue = toRecord(block.props).content;
  if (typeof contentValue === 'string') {
    return markdownText(contentValue, state, block);
  }
  const content = toRecord(contentValue);
  const html = toStringValue(content.html);
  if (html) {
    const fence = codeFence(html);
    return `${fence}html\n${html}\n${fence}`;
  }
  const exported = Array.isArray(content.export) ? content.export : [];
  if (exported.length) return renderCustomExportNodes(exported, state);

  const title = markdownText(content.title, state, block);
  const fetcher = content.fetcher;
  const fetcherUrl =
    typeof fetcher === 'string' ? fetcher : toRecord(fetcher).url;
  const url = markdownUrl(content.exportUrl) || markdownUrl(fetcherUrl);
  const component = markdownText(content.component, state, block);
  return joinBlocks([
    title ? `##### ${title}` : '',
    component ? `[Component: ${component}]` : '',
    url ? `[${url}](${url})` : '',
  ]);
}

function renderEmbedLink(block: BlockSnapshot, state: MarkdownState): string {
  const props = toRecord(block.props);
  const url = markdownUrl(props.url);
  if (!url) return '';
  const title = markdownText(props.title, state, block) || url;
  return `[${title}](${url})`;
}

function customRenderer(
  block: BlockSnapshot,
  state: MarkdownState
): string | undefined {
  const renderer = state.options.renderBlock;
  if (!renderer) return undefined;
  const context: RenderBlockContext = {
    format: 'markdown',
    renderChildren: children => renderBlocks(children ?? blockChildren(block), state),
    renderInline: text => deltaToMarkdown(text, state.options, block),
  };
  return renderer(block, context);
}

function renderUnknown(block: BlockSnapshot, state: MarkdownState): string {
  const strategy = state.options.unknownBlock ?? 'children';
  if (strategy === 'throw') {
    throw new TypeError(`Unsupported BlockSuite block flavour: ${block.flavour}`);
  }
  return strategy === 'children' ? renderBlocks(blockChildren(block), state) : '';
}

function renderBlock(block: BlockSnapshot, state: MarkdownState): string {
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
      const text = trimProse(
        deltaToMarkdown(props.text, state.options, block)
      );
      const type = toStringValue(props.type, 'text');
      let own = text;
      if (/^h[1-6]$/.test(type)) {
        own = `${'#'.repeat(Number(type[1]))} ${text}`;
      } else if (type === 'quote') {
        own = text
          .split('\n')
          .map(line => `> ${line}`.trimEnd())
          .join('\n');
      }
      const children = renderBlocks(blockChildren(block), state);
      return joinBlocks([own, children ? indentNestedBlocks(children) : '']);
    }
    case 'affine:code': {
      const text = plainText(props.text);
      const fence = codeFence(text);
      const language = safeLanguage(props.language);
      return `${fence}${language}\n${text}\n${fence}`;
    }
    case 'affine:divider':
      return '***';
    case 'affine:latex':
      return `$$\n${escapeMarkdownMath(props.latex)}\n$$`;
    case 'affine:image': {
      const url = resolveAssetUrl(state.options, block, 'image');
      if (!url) return '';
      const caption = deltaToMarkdown(
        toStringValue(props.caption),
        state.options,
        block
      );
      return `![${caption}](${markdownUrl(url, 'image')})`;
    }
    case 'affine:zui-image': {
      const url = resolveZuiImageUrl(state.options, block);
      const caption = deltaToMarkdown(
        toStringValue(props.caption),
        state.options,
        block
      );
      return url ? `![${caption}](${markdownUrl(url, 'image')})` : '';
    }
    case 'affine:attachment': {
      const name = markdownText(
        toStringValue(props.name, 'Attachment'),
        state,
        block
      );
      const url = resolveAssetUrl(state.options, block, 'attachment');
      const label = `**${name}**`;
      const attachment = url ? `[${label}](${markdownUrl(url)})` : label;
      const caption = markdownText(props.caption, state, block);
      return `${attachment} (${formatFileSize(props.size)}${
        caption ? `, ${caption}` : ''
      })`;
    }
    case 'affine:database':
      return renderDatabase(block, state);
    case 'affine:zui-table':
      return renderZuiTable(block, state);
    case 'affine:zui-holder':
      return renderBlocks(blockChildren(block), state);
    case 'affine:zui-expand':
      return renderBlocks(blockChildren(block), state);
    case 'affine:embed-zui-whiteboard': {
      const image = sanitizeUrl(props.sceneImage, 'image');
      if (image) {
        const caption = markdownText(
          toStringValue(props.caption, 'whiteboard'),
          state,
          block
        );
        return `![${caption}](${markdownUrl(image, 'image')})`;
      }
      return props.sceneData ? '[Whiteboard]' : '[Empty Whiteboard]';
    }
    case 'affine:embed-zui-custom':
      return renderCustomBlock(block, state);
    case 'affine:embed-zui-html': {
      const html = toStringValue(props.html);
      return html ? `${codeFence(html)}html\n${html}\n${codeFence(html)}` : '';
    }
    case 'affine:embed-zui-iframe': {
      const url = markdownUrl(props.src);
      return url ? `[${url}](${url})` : '';
    }
    case 'affine:embed-zui-component': {
      const name = markdownText(props.name, state, block);
      return name ? `[Component: ${name}]` : '';
    }
    case 'affine:embed-linked-doc': {
      const pageId = toStringValue(props.pageId);
      if (!pageId) return '';
      const rawTitle = state.options.resolveDocTitle?.(pageId) ?? 'untitled';
      const title = markdownText(rawTitle, state, block);
      const url = resolveDocumentUrl(
        state.options,
        { pageId, params: toRecord(props.params), title: rawTitle },
        block
      );
      return url ? `[${title}](${markdownUrl(url)})` : title;
    }
    case 'affine:embed-synced-doc': {
      const children = blockChildren(block);
      if (children.length) return renderBlocks(children, state);
      const pageId = toStringValue(props.pageId);
      if (!pageId) return '';
      const rawTitle = state.options.resolveDocTitle?.(pageId) ?? pageId;
      const title = markdownText(rawTitle, state, block);
      const url = resolveDocumentUrl(
        state.options,
        { pageId, params: toRecord(props.params), title: rawTitle },
        block
      );
      return url ? `[${title}](${markdownUrl(url)})` : title;
    }
    default:
      return EMBED_LINK_FLAVOURS.has(block.flavour)
        ? renderEmbedLink(block, state)
        : renderUnknown(block, state);
  }
}

function renderBlocks(
  blocks: readonly BlockSnapshot[],
  state: MarkdownState
): string {
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
  return joinBlocks(rendered);
}

/** Convert a BlockSuite 0.19.x snapshot to Markdown without a BlockSuite runtime. */
export function snapshotToMarkdown(
  input: SnapshotInput,
  options: MarkdownOptions = {}
): string {
  const normalized = normalizeSnapshot(input);
  validateSnapshotTree(normalized.blocks, options);
  const state: MarkdownState = { options };
  const title =
    options.includeTitle === false
      ? ''
      : deltaToMarkdown(pageTitleDelta(normalized), options, normalized.root);
  const body = renderBlocks(normalized.blocks, state);
  const markdown = joinBlocks([title ? `# ${title}` : '', body]);
  return markdown ? `${markdown}\n` : '';
}
