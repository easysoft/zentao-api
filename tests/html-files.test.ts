import { describe, expect, test } from 'bun:test';
import { parseHtmlFiles, rewriteHtmlFiles, type HtmlFileReplacement } from '../src/request/html-files';
import type { ModuleAction } from '../src/types/module';

const action: ModuleAction = {
  name: 'create', type: 'create', path: '/objects', minVersion: ['23.0'],
  requestBody: { schema: { type: 'object', properties: { content: { description: '正文 (HTML)' } } } },
};

function rewrite(html: string, replacement: HtmlFileReplacement) {
  const documents = parseHtmlFiles({ content: html }, action);
  return rewriteHtmlFiles(documents, new Map(documents.flatMap(document => document.references.map(reference => [reference, replacement])))).content;
}

describe('HTML file reference parsing', () => {
  test('limits parsing to declared top-level string HTML fields', () => {
    const current: ModuleAction = {
      ...action,
      requestBody: { schema: { properties: {
        html: { textType: 'html' },
        marked: { description: '(HTML)', textType: 'text' },
        plain: { type: 'string' },
        trailing: { description: '(HTML) ' },
        nested: { properties: { content: { textType: 'html' } } },
        wrong: { textType: 'html' },
      } } },
    };
    const html = '<img src="file:1">';
    expect(parseHtmlFiles({ html, marked: html, plain: html, trailing: html, nested: { content: html }, wrong: 1 }, current)
      .map(document => document.field)).toEqual(['html', 'marked']);
    expect(parseHtmlFiles(undefined, action)).toEqual([]);
    expect(parseHtmlFiles({ content: 'plain <address>text</address>' }, action)).toEqual([]);
  });

  test('decodes attributes and applies filename priority and source fallbacks', () => {
    const html = [
      '<IMG SRC="file://one&#38;two.png" ALT="a &quot;file&quot;.png">',
      '<a href=custom download="download.pdf" title="title.pdf"><strong>text</strong>.pdf</a>',
      '<a href=custom download title="title.pdf">text.pdf</a>',
      '<a href=custom><strong>nested &amp;</strong> text.pdf</a>',
      '<img src="https://example.com/hello%20world.png?size=1">',
      '<img src="file:5">',
      '<a href="https://example.com"></a>',
    ].join('');
    expect(parseHtmlFiles({ content: html }, action)[0].references.map(({ path, name, tag }) => ({ path, name, tag }))).toEqual([
      { path: 'file://one&two.png', name: 'a "file".png', tag: 'img' },
      { path: 'custom', name: 'download.pdf', tag: 'a' },
      { path: 'custom', name: 'title.pdf', tag: 'a' },
      { path: 'custom', name: 'nested & text.pdf', tag: 'a' },
      { path: 'https://example.com/hello%20world.png?size=1', name: 'hello world.png', tag: 'img' },
      { path: 'file:5', name: undefined, tag: 'img' },
      { path: 'https://example.com', name: undefined, tag: 'a' },
    ]);
  });

  test('ignores comments, foreign anchors and raw-text fake tags', () => {
    const rawTags = ['script', 'style', 'textarea', 'title', 'iframe', 'noembed', 'noframes', 'noscript'];
    const fake = '<img src="file:9"><a href="file:9">fake.pdf</a>';
    const html = `<!--${fake}--><svg><a href="file:9">foreign</a></svg>`
      + rawTags.map(tag => `<${tag}>${fake}</${tag}>`).join('')
      + '<template><img src="file:1"></template><img src="file:2"><plaintext>' + fake;
    expect(parseHtmlFiles({ content: html }, action)[0].references.map(reference => reference.path)).toEqual(['file:1', 'file:2']);
  });

  test('handles quoted angle brackets and uses only the first duplicate attribute', () => {
    const html = '<IMG SRC="one>two" sRc="ignored" ALT=first alt=ignored>';
    const documents = parseHtmlFiles({ content: html }, action);
    expect(documents[0].references[0]).toMatchObject({ path: 'one>two', name: 'first' });
    expect(rewriteHtmlFiles(documents, new Map([[documents[0].references[0], { url: '/file-read-1.png' }]])).content)
      .toBe('<IMG SRC="/file-read-1.png" sRc="ignored" ALT=first alt=ignored>');
  });

  test('keeps malformed unfinished tags untouched and accepts omitted closing anchor tags', () => {
    expect(parseHtmlFiles({ content: '<img src="file:1"' }, action)).toEqual([]);
    expect(rewrite('<a href=file:2>read.pdf', { url: '/file-read-2.pdf' }))
      .toBe('<a href="/file-read-2.pdf" download="read.pdf">read.pdf');
  });
});

describe('HTML file reference rewriting', () => {
  test('preserves all other bytes while escaping changed attributes', () => {
    const html = 'before\n <IMG class = "x" SRC = \'file:1\' alt="old" /> <b>unchanged &copy;</b>';
    expect(rewrite(html, { url: '/file-read-1.png?a="x"&b=<>' }))
      .toBe('before\n <IMG class = "x" SRC="/file-read-1.png?a=&quot;x&quot;&amp;b=&lt;&gt;" alt="old" /> <b>unchanged &copy;</b>');
  });

  test('adds download names and replaces existing download attributes', () => {
    expect(rewrite('<a href="file:1" class=x>original.pdf</a>', { url: '/file-read-1.pdf', name: 'renamed & "new".pdf' }))
      .toBe('<a href="/file-read-1.pdf" class=x download="renamed &amp; &quot;new&quot;.pdf">original.pdf</a>');
    expect(rewrite('<a HREF="file:1" DOWNLOAD>original.pdf</a>', { url: '/file-read-1.pdf', name: 'name.pdf' }))
      .toBe('<a HREF="/file-read-1.pdf" DOWNLOAD="name.pdf">original.pdf</a>');
    expect(rewrite('<a href="file:1"></a>', { url: '/file-read-1.png' }))
      .toBe('<a href="/file-read-1.png"></a>');
  });

  test('failure messages retain the original source and only update alt or title', () => {
    expect(rewrite('<img src="file://a.png" alt="name.png" />', { error: 'No "file" <here> & gone' }))
      .toBe('<img src="file://a.png" alt="No &quot;file&quot; &lt;here&gt; &amp; gone" />');
    expect(rewrite('<a href=file://a.pdf download="name.pdf">Download</a>', { error: 'Failed' }))
      .toBe('<a href=file://a.pdf download="name.pdf" title="Failed">Download</a>');
  });

  test('inserts safely before self-closing markers and after unquoted attribute values', () => {
    expect(rewrite('<img src="file:1"/>', { error: 'Failed' })).toBe('<img src="file:1" alt="Failed"/>');
    expect(rewrite('<img src=path/>', { error: 'Failed' })).toBe('<img src=path/ alt="Failed">');
    expect(rewrite('<img src=path/>', { url: '/file-read-1.png' })).toBe('<img src="/file-read-1.png">');
  });

  test('only returns changed fields and never mutates source data', () => {
    const data = Object.freeze({ content: '<img src="file:1">' });
    const documents = parseHtmlFiles(data, action);
    expect(rewriteHtmlFiles(documents, new Map())).toEqual({});
    const before = JSON.stringify(documents);
    rewriteHtmlFiles(documents, new Map([[documents[0].references[0], { error: 'Failed' }]]));
    expect(JSON.stringify(documents)).toBe(before);
    expect(data.content).toBe('<img src="file:1">');
  });

  test('rewrites many references in a single source-preserving result', () => {
    const count = 3000;
    const html = Array.from({ length: count }, (_, i) => `<p>text &copy; ${i}<img src="file:${i + 1}"></p>`).join('');
    const documents = parseHtmlFiles({ content: html }, action);
    expect(documents[0].references).toHaveLength(count);
    const result = rewriteHtmlFiles(documents, new Map(documents[0].references.map(reference => [reference, { url: `/file-read-${reference.path.slice(5)}.png` }])));
    expect(result.content).toBe(Array.from({ length: count }, (_, i) => `<p>text &copy; ${i}<img src="/file-read-${i + 1}.png"></p>`).join(''));
  });
});
