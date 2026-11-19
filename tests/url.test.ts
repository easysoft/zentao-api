import { describe, expect, test } from 'bun:test';
import { extractFileIdFromUrl } from '../src/index';

describe('extractFileIdFromUrl', () => {
  test.each([
    '/file-read-298.png',
    '/sub-path/file-read-298.png',
    '/index.php?module=file&method=read&fileID=298',
    '/sub-path/?module=file&method=read&fileID=298',
    'images/file-read-298.JPG?size=small#preview',
    './file-read-298.webp',
    '/file-download-298.html',
    'sub-path/file-download-298-left.html?onlybody=yes#preview',
    '/index.php?module=file&method=download&fileID=298',
    '/sub-path/?fileID=00298&amp;mouse=left&amp;f=download&amp;m=file',
    '/sub-path/index.php?fileID=298&amp;t=png&amp;f=read&amp;m=file#preview',
  ])('extracts 298 from %s', url => {
    expect(extractFileIdFromUrl(url)).toBe(298);
  });

  const siteUrl = 'https://example.com/zentao/';
  test.each([
    ['https://EXAMPLE.com:443/zentao/file-read-298.png', 298],
    ['//example.com/zentao/nested/?m=file&f=read&fileID=37', 37],
    ['/file-read-298.png', 298],
    ['https://example.com/zentao/file-download-298.html', 298],
    ['//example.com/zentao/?m=file&f=download&fileID=298', 298],
    ['https://outside.example/zentao/file-download-298.html', undefined],
    ['https://example.com/zentao-old/file-download-298-left.html', undefined],
    ['https://other.example/zentao/file-read-298.png', undefined],
    ['https://example.com:8443/zentao/file-read-298.png', undefined],
    ['http://example.com/zentao/file-read-298.png', undefined],
    ['https://example.com/zentao-old/file-read-298.png', undefined],
    ['https://example.com/zentao/../file-read-298.png', undefined],
  ] as const)('checks the site for %s', (url, expected) => {
    expect(extractFileIdFromUrl(url, siteUrl)).toBe(expected);
  });

  test.each([
    '',
    'https://example.com/zentao/file-read-298.png',
    '//example.com/zentao/file-read-298.png',
    '/file-read-298.png/preview',
    '/photo.png?next=/file-read-298.png',
    '/other.php?module=file&method=read&fileID=298',
    '/?module=bug&method=read&fileID=298',
    '/?m=file&f=delete&fileID=298',
    '/?module=file&f=read&fileID=298',
    '/?module=file&method=read',
    '/index.php?module=story&method=download&fileID=298',
    '/?m=file&method=download&fileID=298',
    '/file-download-298-left.html/preview',
    '/file-download-298-other.html',
  ])('returns undefined for %s', url => {
    expect(extractFileIdFromUrl(url)).toBeUndefined();
  });

  test.each(['0', '-1', '1.5', '1e2', '298x', '9007199254740992'])('rejects invalid ID %s in both routes', id => {
    expect(extractFileIdFromUrl(`/file-read-${id}.png`)).toBeUndefined();
    expect(extractFileIdFromUrl(`/index.php?m=file&f=read&fileID=${id}`)).toBeUndefined();
    expect(extractFileIdFromUrl(`/file-download-${id}-left.html`)).toBeUndefined();
    expect(extractFileIdFromUrl(`/?module=file&method=download&fileID=${id}`)).toBeUndefined();
  });

  test('accepts the largest safe ID and ignores decimal leading zeros', () => {
    expect(extractFileIdFromUrl('/file-read-9007199254740991.png')).toBe(Number.MAX_SAFE_INTEGER);
    expect(extractFileIdFromUrl('/?m=file&f=read&fileID=00298')).toBe(298);
  });

  test('returns undefined for malformed addresses and unsupported schemes', () => {
    expect(extractFileIdFromUrl('https://[', siteUrl)).toBeUndefined();
    expect(extractFileIdFromUrl('https://example.com/zentao/file-read-298.png', 'invalid')).toBeUndefined();
    expect(extractFileIdFromUrl('file:///zentao/file-read-298.png', siteUrl)).toBeUndefined();
  });
});
