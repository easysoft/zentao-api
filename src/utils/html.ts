import { parseFragment, type DefaultTreeAdapterMap, type Token } from 'parse5';
import { parseFileIdFromUrl } from './url.js';

interface HtmlImage {
  src: string;
  alt?: string;
  attributes: Record<string, Token.Location>;
  endOffset: number;
}

function attribute(element: DefaultTreeAdapterMap['element'], name: string): string | undefined {
  return element.attrs.find(item => item.name === name && !item.namespace)?.value;
}

/** @internal 按源码顺序收集图片属性和起始标签位置。 */
export function findHtmlImages(html: string): HtmlImage[] {
  if (typeof html !== 'string' || !/<img(?=[\t\n\f\r />])/i.test(html)) return [];
  const fragment = parseFragment(html, { sourceCodeLocationInfo: true });
  const stack: DefaultTreeAdapterMap['node'][] = [...fragment.childNodes].reverse();
  const images: HtmlImage[] = [];
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
    if (node.namespaceURI !== 'http://www.w3.org/1999/xhtml' || node.tagName !== 'img') continue;
    const src = attribute(node, 'src');
    const attributes = node.sourceCodeLocation?.attrs;
    const startTag = node.sourceCodeLocation?.startTag;
    if (!src || !attributes?.src || !startTag || html[startTag.endOffset - 1] !== '>' || seenOffsets.has(startTag.startOffset)) continue;
    seenOffsets.add(startTag.startOffset);
    images.push({ src, alt: attribute(node, 'alt'), attributes, endOffset: startTag.endOffset });
  }
  // HTML error recovery can move elements ahead of earlier source tags.
  return images.sort((a, b) => a.endOffset - b.endOffset);
}

/**
 * 按富文本 HTML 中 `<img>` 的出现顺序提取禅道图片引用，保留重复项。
 *
 * @param html - 禅道富文本 HTML。
 * @param siteUrl - 禅道站点根地址，含安装目录，用于匹配带域名的图片地址。
 * @returns 每项为 `[imgSrc, zentaoFileID]`。src 使用 HTML 实体解码后的属性值，保留相对路径。没有匹配图片时返回空数组。
 */
export function extractFileIdsFromHtml(html: string, siteUrl: string): [imgSrc: string, zentaoFileID: number][] {
  const files: [string, number][] = [];
  for (const { src } of findHtmlImages(html)) {
    const id = parseFileIdFromUrl(src, siteUrl, 'imageSrc');
    if (id !== undefined) files.push([src, id]);
  }
  return files;
}
