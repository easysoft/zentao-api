import { describe, expect, test } from 'bun:test';
import type { ModuleDefinition } from '../src/types';
import { renderZentaoApiDocs } from '../scripts/generate-zentao-api-docs';

describe('ZenTao API docs generator', () => {
  test('renders fixed, default, absent and parameter-driven result types', () => {
    const base = { minVersion: ['22.0'], type: 'get' as const, path: '/fixture', resultType: 'object' as const };
    const { pages } = renderZentaoApiDocs([{ name: 'fixture', actions: [
      { ...base, name: 'default' },
      { ...base, name: 'fixed', resultObjectType: 'user' },
      { ...base, name: 'mixed', resultObjectType: null },
      { ...base, name: 'dynamic', resultObjectType: { param: 'kind', map: { projectdeliverable: 'deliverable' } } },
    ] }]);
    expect(pages[0].content).toContain('- 对象类型：`fixture`');
    expect(pages[0].content).toContain('- 对象类型：`user`');
    expect(pages[0].content).toContain('- 对象类型：无统一对象类型');
    expect(pages[0].content).toContain('读取调用参数 `params["kind"]`');
    expect(pages[0].content).toContain('`{"projectdeliverable":"deliverable"}`；未命中时保留参数值');
  });

  test('renders module index and action details from registry module definitions', () => {
    const modules: ModuleDefinition[] = [
      {
        name: 'bug',
        display: 'Bug',
        description: 'Bug 管理',
        actions: [
          {
            minVersion: ['22.0', 'biz13.0', 'max8.0', 'ipd5.0'],
            name: 'resolve',
            display: '解决Bug',
            type: 'action',
            method: 'put',
            path: '/bugs/{bugID}/resolve',
            pathParams: { bugID: 'Bug ID' },
            params: [
              {
                name: 'comment',
                description: '备注',
                required: false,
                type: 'string',
              },
            ],
            requestBody: {
              required: true,
              type: 'object',
              mediaType: 'multipart/form-data',
              example: {
                resolution: 'fixed',
              },
              schema: {
                type: 'object',
                properties: {
                  resolution: {
                    type: 'string',
                    description: '解决方案',
                  },
                },
                required: ['resolution'],
              },
            },
            resultType: 'text',
          },
        ],
      },
    ];

    const docs = renderZentaoApiDocs(modules);

    expect(docs.index).toContain('| [Bug](./bug.md) | `bug` | 1 | Bug 管理 |');
    expect(docs.pages).toHaveLength(1);
    expect(docs.pages[0].slug).toBe('bug');
    expect(docs.pages[0].content).toContain('## 解决Bug');
    expect(docs.pages[0].content).toContain('`request("bug/resolve", params)`');
    expect(docs.pages[0].content).toContain('| `bugID` | Bug ID |');
    expect(docs.pages[0].content).toContain('| `comment` | string | 否 |  | 备注 |');
    expect(docs.pages[0].content).toContain('请求媒体类型：`multipart/form-data`');
    expect(docs.pages[0].content).toContain('"resolution": "fixed"');
  });
});
