import { describe, expect, test } from 'bun:test';
import type { ModuleDefinition } from '../src/types';
import { renderZentaoApiDocs } from '../scripts/generate-zentao-api-docs';

describe('ZenTao API docs generator', () => {
  test('renders module index and action details from registry module definitions', () => {
    const modules: ModuleDefinition[] = [
      {
        name: 'bug',
        display: 'Bug',
        description: 'Bug 管理',
        actions: [
          {
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
    expect(docs.pages[0].content).toContain('"resolution": "<string>"');
  });
});
