export type JsonRecord = Record<string, unknown>;

export interface DeltaInsert {
  insert?: unknown;
  attributes?: JsonRecord;
  retain?: number;
  delete?: number;
}

export interface TextSnapshot {
  '$blocksuite:internal:text$'?: true;
  delta: DeltaInsert[];
}

export interface BlockSnapshot {
  type?: 'block' | string;
  id?: string;
  flavour: string;
  version?: number;
  props?: JsonRecord;
  children?: BlockSnapshot[];
}

export interface DocSnapshotMeta extends JsonRecord {
  id?: string;
  title?: string;
  createDate?: number;
  tags?: string[];
}

export interface DocSnapshot {
  type?: 'page' | string;
  meta?: DocSnapshotMeta;
  blocks: BlockSnapshot;
}

export interface SliceSnapshot {
  type?: 'slice' | string;
  content: BlockSnapshot[];
}

export type Snapshot = DocSnapshot | BlockSnapshot | SliceSnapshot;
export interface SnapshotEnvelope {
  snapshot: Snapshot | readonly BlockSnapshot[];
}
export type SnapshotInput =
  | Snapshot
  | readonly BlockSnapshot[]
  | SnapshotEnvelope
  | string;

export type OutputFormat = 'markdown' | 'html';
export type UnknownBlockStrategy = 'children' | 'omit' | 'throw';

export interface DocumentReference {
  pageId: string;
  params: JsonRecord;
  title?: string;
}

export interface RenderBlockContext {
  format: OutputFormat;
  renderChildren(children?: readonly BlockSnapshot[]): string;
  renderInline(text: unknown): string;
}

export type BlockRenderer = (
  block: BlockSnapshot,
  context: RenderBlockContext
) => string | undefined;

export interface ConvertOptions {
  /** Include the page title. Defaults to true. */
  includeTitle?: boolean;

  /** Maximum nested block depth. Defaults to 256 and cannot exceed 1000. */
  maxDepth?: number;

  /** Maximum number of blocks rendered from one snapshot. Defaults to 50,000. */
  maxBlocks?: number;

  /** Used for standard image/attachment sourceId values. */
  resolveAssetUrl?: (
    sourceId: string,
    block: BlockSnapshot,
    kind: 'image' | 'attachment'
  ) => string | undefined;

  /** Resolve editor-specific affine:zui-image src placeholders. */
  resolveZuiImageUrl?: (
    src: string,
    block: BlockSnapshot
  ) => string | undefined;

  /** Resolve linked-document references without loading a BlockSuite collection. */
  resolveDocLink?: (
    reference: DocumentReference,
    block?: BlockSnapshot
  ) => string | undefined;

  /** Resolve the visible label of a linked document. */
  resolveDocTitle?: (pageId: string) => string | undefined;

  /** Base URL used when resolveDocLink is not supplied. */
  docLinkBaseUrl?: string;

  /** Override built-in rendering. Return undefined to continue normally. */
  renderBlock?: BlockRenderer;

  /** Unknown containers recurse by default; unknown leaves produce no output. */
  unknownBlock?: UnknownBlockStrategy;
}

export type MarkdownOptions = ConvertOptions;

export interface HtmlOptions extends ConvertOptions {
  /**
   * Defaults to true for a DocSnapshot/page root and false for block/slice input.
   */
  fullDocument?: boolean;

  /**
   * Render stored HTML from affine:embed-zui-html or zui-custom as trusted HTML.
   * Disabled by default.
   */
  allowUnsafeHtml?: boolean;
}
