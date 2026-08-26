import { describe, expect, test } from 'bun:test';
import {
  snapshotToMarkdown,
  type BlockSnapshot,
  type DeltaInsert,
  type DocSnapshot,
} from '../src/utils/doc-helper';

function text(...delta: DeltaInsert[]) {
  return { '$blocksuite:internal:text$': true as const, delta };
}

function paragraph(
  value: string | DeltaInsert[],
  type = 'text',
): BlockSnapshot {
  return {
    type: 'block',
    flavour: 'affine:paragraph',
    props: {
      type,
      text: text(...(typeof value === 'string' ? [{ insert: value }] : value)),
    },
  };
}

function createDoc(children: BlockSnapshot[]): DocSnapshot {
  return {
    type: 'page',
    meta: { title: 'Metadata & title' },
    blocks: {
      type: 'block',
      id: 'page-1',
      flavour: 'affine:page',
      props: { title: text({ insert: 'Page title' }) },
      children: [{
        type: 'block',
        id: 'note-1',
        flavour: 'affine:note',
        props: {},
        children,
      }],
    },
  };
}

describe('doc-helper Markdown conversion', () => {
  test('renders titles, inline marks, lists, code, dividers, and math', () => {
    const snapshot = createDoc([
      paragraph('Overview', 'h2'),
      paragraph([
        { insert: 'Bold', attributes: { bold: true } },
        { insert: ' & ' },
        { insert: 'italic', attributes: { italic: true } },
        { insert: ' ' },
        { insert: 'site', attributes: { link: 'https://example.com/a b' } },
      ]),
      {
        type: 'block',
        flavour: 'affine:list',
        props: { type: 'bulleted', text: text({ insert: 'first' }) },
      },
      {
        type: 'block',
        flavour: 'affine:list',
        props: { type: 'bulleted', text: text({ insert: 'second' }) },
      },
      {
        type: 'block',
        flavour: 'affine:code',
        props: { language: 'ts', text: text({ insert: 'const value = 1;' }) },
      },
      { type: 'block', flavour: 'affine:divider', props: {} },
      { type: 'block', flavour: 'affine:latex', props: { latex: 'a < b' } },
    ]);

    const markdown = snapshotToMarkdown(snapshot);

    expect(markdown).toStartWith('# Page title\n');
    expect(markdown).toContain('## Overview');
    expect(markdown).toContain('**Bold** & *italic* [site](https://example.com/a%20b)');
    expect(markdown).toContain('* first\n* second');
    expect(markdown).toContain('```ts\nconst value = 1;\n```');
    expect(markdown).toContain('***');
    expect(markdown).toContain('$$\na \\lt{} b\n$$');
  });

  test('resolves assets and document references without network access', () => {
    const snapshot = createDoc([
      {
        type: 'block',
        flavour: 'affine:image',
        props: { sourceId: 'image-1', caption: 'Diagram' },
      },
      {
        type: 'block',
        flavour: 'affine:attachment',
        props: { sourceId: 'file-1', name: 'spec.pdf', size: 2048 },
      },
      {
        type: 'block',
        flavour: 'affine:zui-image',
        props: { src: 'zui:image-2', caption: 'ZUI image' },
      },
      {
        type: 'block',
        flavour: 'affine:embed-linked-doc',
        props: { pageId: 'doc-2', params: { version: 3 } },
      },
    ]);

    const markdown = snapshotToMarkdown(snapshot, {
      resolveAssetUrl: (sourceId, _block, kind) => `/files/${sourceId}?kind=${kind}`,
      resolveZuiImageUrl: src => `/zui/${encodeURIComponent(src)}`,
      resolveDocTitle: pageId => `Document ${pageId}`,
      docLinkBaseUrl: 'https://zentao.example.com/docs/',
    });

    expect(markdown).toContain('![Diagram](/files/image-1?kind=image)');
    expect(markdown).toContain('[**spec.pdf**](/files/file-1?kind=attachment) (2.0 kB)');
    expect(markdown).toContain('![ZUI image](/zui/zui%3Aimage-2)');
    expect(markdown).toContain('[Document doc-2](https://zentao.example.com/docs/doc-2?version=3)');

    const withoutResolvers = snapshotToMarkdown(snapshot);
    expect(withoutResolvers).not.toContain('Diagram');
    expect(withoutResolvers).toContain('**spec.pdf** (2.0 kB)');
  });

  test('renders database, ZUI table, custom export, and transparent containers', () => {
    const snapshot = createDoc([
      {
        type: 'block',
        flavour: 'affine:database',
        props: {
          title: text({ insert: 'Inventory' }),
          columns: [
            { id: 'title', name: 'Name', type: 'title' },
            {
              id: 'status',
              name: 'Status',
              type: 'select',
              data: { options: [{ id: 'done', value: 'Done' }] },
            },
          ],
          cells: { row1: { status: { value: 'done' } } },
        },
        children: [{
          type: 'block',
          id: 'row1',
          flavour: 'affine:paragraph',
          props: { text: text({ insert: 'Task A' }) },
        }],
      },
      {
        type: 'block',
        id: 'table-1',
        flavour: 'affine:zui-table',
        props: {
          rows: [
            { cells: [{ text: text({ insert: 'Key' }) }, { text: text({ insert: 'Value' }) }] },
            { cells: [{ text: text({ insert: 'owner' }) }, { text: text({ insert: 'admin' }) }] },
          ],
        },
      },
      {
        type: 'block',
        flavour: 'affine:embed-zui-custom',
        props: {
          content: {
            export: [
              { type: 'heading', props: { depth: 3, text: 'Custom title' } },
              { type: 'link', props: { text: 'Details', href: 'https://example.com/details' } },
            ],
          },
        },
      },
      {
        type: 'block',
        flavour: 'affine:zui-expand',
        props: { title: text({ insert: 'More' }) },
        children: [paragraph('Expanded body')],
      },
    ]);

    const markdown = snapshotToMarkdown(snapshot);
    expect(markdown).toContain('##### Inventory');
    expect(markdown).toContain('| Name');
    expect(markdown).toContain('Task A');
    expect(markdown).toContain('Done');
    expect(markdown).toContain('| Key');
    expect(markdown).toContain('### Custom title');
    expect(markdown).toContain('[Details](https://example.com/details)');
    expect(markdown).toContain('Expanded body');

  });

  test('renders media, embeds, containers, and inline editor metadata', () => {
    const snapshot = createDoc([
      paragraph([
        { insert: 'Hello ' },
        { insert: ' ', attributes: { mention: { id: 'u1', label: 'Alice', type: 'user' } } },
        { insert: ' ', attributes: { holder: { id: 'h1', name: 'version', text: 'Version', data: { value: 2 } } } },
        { insert: 'x+y', attributes: { latex: 'x+y' } },
      ]),
      {
        type: 'block',
        flavour: 'affine:list',
        props: { type: 'todo', checked: true, text: text({ insert: 'Finished' }) },
      },
      {
        type: 'block',
        flavour: 'affine:code',
        props: { language: 'js', text: text({ insert: 'console.log(1);' }) },
      },
      { type: 'block', flavour: 'affine:divider', props: {} },
      { type: 'block', flavour: 'affine:latex', props: { latex: 'x^2' } },
      {
        type: 'block',
        flavour: 'affine:image',
        props: { sourceId: 'image-2', caption: 'Screenshot', width: 640, height: 480 },
      },
      {
        type: 'block',
        flavour: 'affine:attachment',
        props: { sourceId: 'file-2', name: 'notes.txt', size: 10, caption: 'Notes' },
      },
      {
        type: 'block',
        flavour: 'affine:zui-image',
        props: { src: 'zui:image-3', caption: 'ZUI', align: 'center', width: 320 },
      },
      {
        type: 'block',
        flavour: 'affine:zui-holder',
        props: { name: 'owner', text: 'Owner', data: { account: 'admin' } },
        children: [paragraph('Holder child')],
      },
      {
        type: 'block',
        flavour: 'affine:zui-layout',
        props: { type: 'columns' },
        children: [paragraph('Layout child')],
      },
      {
        type: 'block',
        flavour: 'affine:zui-panel',
        props: { type: 'info' },
        children: [paragraph('Panel child')],
      },
      {
        type: 'block',
        flavour: 'affine:embed-zui-whiteboard',
        props: { sceneImage: 'data:image/png;base64,AA==', caption: 'Board' },
      },
      {
        type: 'block',
        flavour: 'affine:embed-zui-iframe',
        props: {
          src: 'https://example.com/embed',
          sandbox: 'allow-scripts allow-same-origin allow-popups unknown-token',
          width: '100%',
          height: 240,
          allowfullscreen: true,
        },
      },
      {
        type: 'block',
        flavour: 'affine:embed-zui-component',
        props: { name: 'BurndownChart' },
      },
      {
        type: 'block',
        flavour: 'affine:embed-synced-doc',
        props: { pageId: 'doc-3' },
      },
      {
        type: 'block',
        flavour: 'affine:bookmark',
        props: { title: 'Example', url: 'https://example.com' },
      },
      {
        type: 'block',
        flavour: 'affine:embed-zui-custom',
        props: { content: 'Plain custom content' },
      },
      {
        type: 'block',
        flavour: 'affine:embed-zui-custom',
        props: {
          content: {
            title: 'Remote widget',
            component: 'Widget',
            exportUrl: 'https://example.com/widget',
          },
        },
      },
    ]);
    const options = {
      resolveAssetUrl: (sourceId: string) => `/files/${sourceId}`,
      resolveZuiImageUrl: (src: string) => `/zui/${encodeURIComponent(src)}`,
      resolveDocTitle: (pageId: string) => `Document ${pageId}`,
      docLinkBaseUrl: 'https://zentao.example.com/docs',
    };

    const markdown = snapshotToMarkdown(snapshot, options);
    expect(markdown).toContain('Hello @Alice');
    expect(markdown).toContain('$x+y$');
    expect(markdown).toContain('* [x] Finished');
    expect(markdown).toContain('![Screenshot](/files/image-2)');
    expect(markdown).toContain('[**notes.txt**](/files/file-2) (10 B, Notes)');
    expect(markdown).toContain('![Board](data:image/png;base64,AA==)');
    expect(markdown).toContain('[https://example.com/embed](https://example.com/embed)');
    expect(markdown).toContain('[Component: BurndownChart]');
    expect(markdown).toContain('[Document doc-3](https://zentao.example.com/docs/doc-3)');
    expect(markdown).toContain('[Example](https://example.com)');
    expect(markdown).toContain('Plain custom content');
    expect(markdown).toContain('##### Remote widget');

  });

  test('supports custom Markdown renderers', () => {
    const block: BlockSnapshot = {
      type: 'block',
      flavour: 'custom:callout',
      children: [paragraph('Custom child')],
    };

    const markdown = snapshotToMarkdown(block, {
      renderBlock: (current, context) => current.flavour === 'custom:callout'
        ? `> ${context.renderChildren()}`
        : undefined,
    });
    expect(markdown).toContain('> Custom child');
  });
});

describe('doc-helper input safety', () => {
  test('normalizes wrapped and repeatedly encoded snapshots', () => {
    const wrapped = { snapshot: [paragraph('Wrapped content')] };
    const encoded = JSON.stringify(JSON.stringify(wrapped));

    expect(snapshotToMarkdown(encoded)).toBe('Wrapped content\n');
  });

  test('supports unknown-block policies and validates input limits', () => {
    const unknownContainer: BlockSnapshot = {
      type: 'block',
      flavour: 'custom:container',
      children: [paragraph('Kept child')],
    };

    expect(snapshotToMarkdown(unknownContainer)).toBe('Kept child\n');
    expect(snapshotToMarkdown(unknownContainer, { unknownBlock: 'omit' })).toBe('');
    expect(() => snapshotToMarkdown(unknownContainer, { unknownBlock: 'throw' }))
      .toThrow('Unsupported BlockSuite block flavour');
    expect(() => snapshotToMarkdown('{invalid json')).toThrow('Invalid BlockSuite snapshot JSON');
    expect(() => snapshotToMarkdown(createDoc([paragraph('Too deep')]), { maxDepth: 2 }))
      .toThrow('maxDepth');
    expect(() => snapshotToMarkdown([paragraph('one'), paragraph('two')], { maxBlocks: 1 }))
      .toThrow('maxBlocks');

    const cyclic: BlockSnapshot = { type: 'block', flavour: 'custom:cyclic', children: [] };
    cyclic.children = [cyclic];
    expect(() => snapshotToMarkdown(cyclic)).toThrow('cyclic block children');
  });
});
