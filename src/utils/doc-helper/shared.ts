import type {
  BlockSnapshot,
  ConvertOptions,
  DeltaInsert,
  DocSnapshotMeta,
  DocumentReference,
  JsonRecord,
  SnapshotInput,
} from './types.js';

export interface NormalizedSnapshot {
  kind: 'doc' | 'block' | 'slice';
  blocks: BlockSnapshot[];
  root?: BlockSnapshot;
  meta?: DocSnapshotMeta;
  documentLike: boolean;
}

const DEFAULT_MAX_DEPTH = 256;
const MAX_ALLOWED_DEPTH = 1000;
const DEFAULT_MAX_BLOCKS = 50_000;
const MAX_ALLOWED_BLOCKS = 1_000_000;

export function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function toRecord(value: unknown): JsonRecord {
  return isRecord(value) ? value : {};
}

export function toStringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export function toFiniteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : undefined;
}

export function blockChildren(block: BlockSnapshot): BlockSnapshot[] {
  return Array.isArray(block.children)
    ? block.children.filter(isBlockSnapshot)
    : [];
}

export function isBlockSnapshot(value: unknown): value is BlockSnapshot {
  return isRecord(value) && typeof value.flavour === 'string';
}

function parseJson(value: string): unknown {
  let parsed: unknown = value;
  // The product loader accepts content that was JSON-stringified more than once.
  for (let depth = 0; depth < 3 && typeof parsed === 'string'; depth += 1) {
    try {
      parsed = JSON.parse(parsed);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new TypeError(`Invalid BlockSuite snapshot JSON: ${message}`);
    }
  }
  return parsed;
}

export function normalizeSnapshot(input: SnapshotInput): NormalizedSnapshot {
  let value: unknown = typeof input === 'string' ? parseJson(input) : input;

  if (isRecord(value) && !isBlockSnapshot(value) && 'snapshot' in value) {
    value = value.snapshot;
  }

  if (Array.isArray(value) && value.every(isBlockSnapshot)) {
    return {
      kind: 'slice',
      blocks: value,
      documentLike: false,
    };
  }

  if (isRecord(value) && isBlockSnapshot(value.blocks)) {
    const root = value.blocks;
    return {
      kind: 'doc',
      blocks: [root],
      root,
      meta: isRecord(value.meta) ? (value.meta as DocSnapshotMeta) : undefined,
      documentLike: true,
    };
  }

  if (isRecord(value) && Array.isArray(value.content)) {
    const blocks = value.content.filter(isBlockSnapshot);
    if (blocks.length !== value.content.length) {
      throw new TypeError('Invalid BlockSuite slice: content must contain blocks');
    }
    return {
      kind: 'slice',
      blocks,
      documentLike: false,
    };
  }

  if (isBlockSnapshot(value)) {
    return {
      kind: 'block',
      blocks: [value],
      root: value,
      documentLike: value.flavour === 'affine:page',
    };
  }

  throw new TypeError(
    'Invalid BlockSuite snapshot: expected a DocSnapshot, BlockSnapshot, SliceSnapshot, or JSON string'
  );
}

function conversionLimit(
  value: unknown,
  fallback: number,
  maximum: number,
  name: string
): number {
  if (value === undefined) return fallback;
  if (!Number.isInteger(value) || Number(value) < 1 || Number(value) > maximum) {
    throw new TypeError(`${name} must be an integer between 1 and ${maximum}`);
  }
  return Number(value);
}

/**
 * Validate limits iteratively before recursive rendering. Besides making error
 * messages deterministic, this prevents deeply nested untrusted JSON from
 * exhausting the JavaScript call stack.
 */
export function validateSnapshotTree(
  blocks: readonly BlockSnapshot[],
  options: ConvertOptions
): void {
  const maxDepth = conversionLimit(
    options.maxDepth,
    DEFAULT_MAX_DEPTH,
    MAX_ALLOWED_DEPTH,
    'maxDepth'
  );
  const maxBlocks = conversionLimit(
    options.maxBlocks,
    DEFAULT_MAX_BLOCKS,
    MAX_ALLOWED_BLOCKS,
    'maxBlocks'
  );
  const active = new WeakSet<object>();
  const stack: Array<
    | { block: BlockSnapshot; depth: number; exit?: false }
    | { block: BlockSnapshot; depth: number; exit: true }
  > = [];
  for (let index = blocks.length - 1; index >= 0; index -= 1) {
    const block = blocks[index];
    if (block) stack.push({ block, depth: 1 });
  }

  let count = 0;
  while (stack.length) {
    const frame = stack.pop();
    if (!frame) continue;
    if (frame.exit) {
      active.delete(frame.block);
      continue;
    }
    if (active.has(frame.block)) {
      throw new TypeError('Invalid BlockSuite snapshot: cyclic block children');
    }
    count += 1;
    if (count > maxBlocks) {
      throw new RangeError(
        `BlockSuite snapshot exceeds maxBlocks (${maxBlocks})`
      );
    }
    if (frame.depth > maxDepth) {
      throw new RangeError(
        `BlockSuite snapshot exceeds maxDepth (${maxDepth})`
      );
    }

    active.add(frame.block);
    stack.push({ ...frame, exit: true });
    const children = blockChildren(frame.block);
    for (let index = children.length - 1; index >= 0; index -= 1) {
      const child = children[index];
      if (child) stack.push({ block: child, depth: frame.depth + 1 });
    }
  }
}

export function deltaFrom(value: unknown): DeltaInsert[] {
  if (Array.isArray(value)) {
    return value.filter(isRecord) as DeltaInsert[];
  }
  if (isRecord(value) && Array.isArray(value.delta)) {
    return value.delta.filter(isRecord) as DeltaInsert[];
  }
  if (typeof value === 'string') {
    return [{ insert: value }];
  }
  return [];
}

export function plainText(value: unknown): string {
  return deltaFrom(value)
    .map(delta => (typeof delta.insert === 'string' ? delta.insert : ''))
    .join('');
}

export function pageTitleDelta(normalized: NormalizedSnapshot): DeltaInsert[] {
  const root = normalized.root;
  if (root?.flavour === 'affine:page') {
    const rootTitle = deltaFrom(toRecord(root.props).title);
    if (rootTitle.length > 0) return rootTitle;
  }
  const metaTitle = normalized.meta?.title;
  return typeof metaTitle === 'string' ? [{ insert: metaTitle }] : [];
}

export function sanitizeUrl(
  value: unknown,
  kind: 'link' | 'image' = 'link'
): string {
  if (typeof value !== 'string') return '';
  const url = value.trim().replace(/[\u0000-\u001F\u007F]/g, '');
  if (!url) return '';

  if (
    url.startsWith('/') ||
    url.startsWith('./') ||
    url.startsWith('../') ||
    url.startsWith('#') ||
    url.startsWith('?')
  ) {
    return url;
  }

  const scheme = /^([a-z][a-z\d+.-]*):/i.exec(url)?.[1]?.toLowerCase();
  if (!scheme) return url;
  if (['http', 'https', 'mailto', 'tel', 'blob'].includes(scheme)) return url;
  if (kind === 'image' && scheme === 'data' && /^data:image\//i.test(url)) {
    return url;
  }
  return '';
}

export function resolveAssetUrl(
  options: ConvertOptions,
  block: BlockSnapshot,
  kind: 'image' | 'attachment'
): string {
  const props = toRecord(block.props);
  const sourceId = toStringValue(props.sourceId);
  if (!sourceId) return '';
  const resolved = options.resolveAssetUrl?.(sourceId, block, kind);
  return sanitizeUrl(resolved, kind === 'image' ? 'image' : 'link');
}

export function resolveZuiImageUrl(
  options: ConvertOptions,
  block: BlockSnapshot
): string {
  const src = toStringValue(toRecord(block.props).src);
  if (!src) return '';
  const resolved = options.resolveZuiImageUrl
    ? options.resolveZuiImageUrl(src, block)
    : src;
  return sanitizeUrl(resolved, 'image');
}

function appendReferenceParams(url: string, params: JsonRecord): string {
  const search = new URLSearchParams();
  for (const [key, raw] of Object.entries(params)) {
    if (raw === undefined || raw === null || raw === '') continue;
    if (Array.isArray(raw)) {
      const values = raw.filter(
        (item): item is string | number | boolean =>
          ['string', 'number', 'boolean'].includes(typeof item)
      );
      if (values.length) search.set(key, values.join(','));
    } else if (['string', 'number', 'boolean'].includes(typeof raw)) {
      search.set(key, String(raw));
    }
  }
  const query = search.toString();
  if (!query) return url;
  return `${url}${url.includes('?') ? '&' : '?'}${query}`;
}

export function resolveDocumentUrl(
  options: ConvertOptions,
  reference: DocumentReference,
  block?: BlockSnapshot
): string {
  const custom = options.resolveDocLink?.(reference, block);
  if (custom !== undefined) return sanitizeUrl(custom);

  const base = options.docLinkBaseUrl?.replace(/\/$/, '');
  if (!base) return '';
  return sanitizeUrl(
    appendReferenceParams(
      `${base}/${encodeURIComponent(reference.pageId)}`,
      reference.params
    )
  );
}

export function formatFileSize(value: unknown): string {
  const bytes = toFiniteNumber(value) ?? 0;
  if (bytes === 0) return '0 B';
  const units = ['B', 'kB', 'MB', 'GB', 'TB'];
  const index = Math.min(
    Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024)),
    units.length - 1
  );
  const size = bytes / 1024 ** index;
  const rounded = size >= 10 || index === 0 ? size.toFixed(0) : size.toFixed(1);
  return `${rounded} ${units[index]}`;
}

export function isEdgelessOnly(block: BlockSnapshot): boolean {
  return toRecord(block.props).displayMode === 'edgeless';
}

export function safeLanguage(value: unknown): string {
  return typeof value === 'string'
    ? value.trim().replace(/[^a-z\d_+#.-]/gi, '').slice(0, 50)
    : '';
}

export function escapeMarkdownMath(value: unknown): string {
  return toStringValue(value)
    .replace(/\$/g, '\\$')
    .replace(/</g, '\\lt{}')
    .replace(/>/g, '\\gt{}')
    .replace(/(\]\(\s*)([^)\s]*)/gi, (match, prefix: string, target: string) => {
      const decoded = target
        .replace(/&#x([\da-f]+);/gi, (_, hex: string) => {
          const code = Number.parseInt(hex, 16);
          return code <= 0x7f ? String.fromCharCode(code) : '';
        })
        .replace(/&#(\d+);/g, (_, decimal: string) => {
          const code = Number.parseInt(decimal, 10);
          return code <= 0x7f ? String.fromCharCode(code) : '';
        })
        .replace(/&colon;/gi, ':')
        .replace(/[\u0000-\u0020\u007f]/g, '')
        .toLowerCase();
      if (!/^(?:javascript|vbscript|data):/.test(decoded)) return match;
      return `${prefix}${target.replace(
        /:|&(?:#0*58|#x0*3a|colon);/i,
        '%3A'
      )}`;
    });
}
