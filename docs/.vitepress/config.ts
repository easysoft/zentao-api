import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { defineConfig } from 'vitepress';

const docsRoot = fileURLToPath(new URL('../', import.meta.url));

function readSidebar(relativePath: string, fallback: unknown[]) {
  const path = resolve(docsRoot, relativePath);
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, 'utf8'));
}

const referenceSidebar = readSidebar('reference/typedoc-sidebar.json', [
  { text: 'Reference', items: [{ text: '概览', link: '/reference/' }] },
]);

const zentaoApiSidebar = readSidebar('zentao-api/sidebar.json', [
  { text: 'ZenTao API', items: [{ text: '概览', link: '/zentao-api/' }] },
]);

export default defineConfig({
  lang: 'zh-CN',
  title: 'zentao-api',
  description: 'Browser and Node.js SDK for ZenTao API v2',
  base: '/',
  lastUpdated: true,
  cleanUrls: true,
  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
  },
  themeConfig: {
    siteTitle: 'zentao-api',
    nav: [
      { text: 'Guide', link: '/guide/', activeMatch: '/guide/' },
      { text: 'Reference', link: '/reference/', activeMatch: '/reference/' },
      { text: 'ZenTao API', link: '/zentao-api/', activeMatch: '/zentao-api/' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: '快速开始', link: '/guide/' },
            { text: '安装与配置', link: '/guide/installation' },
            { text: '运行环境', link: '/guide/environments' },
            { text: '常见 API 示例', link: '/guide/examples' },
            { text: 'Profile 与错误处理', link: '/guide/profiles-and-errors' },
          ],
        },
      ],
      '/reference/': referenceSidebar,
      '/zentao-api/': zentaoApiSidebar,
    },
    search: {
      provider: 'local',
    },
    outline: {
      level: [2, 3],
      label: '本页目录',
    },
    editLink: {
      pattern: 'https://github.com/catouse/zentao-api/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/catouse/zentao-api' },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026-present zentao-api contributors',
    },
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short',
      },
    },
  },
});
