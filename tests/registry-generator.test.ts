import { describe, expect, test } from 'bun:test';
import { requireMatchingScopedListValue } from '../scripts/update-registry';

describe('registry generator scoped-list merge', () => {
  test('keeps matching response extractors', () => {
    expect(requireMatchingScopedListValue(['items', 'items'], 'widget', 'resultGetter'))
      .toBe('items');
    expect(requireMatchingScopedListValue([undefined, undefined], 'widget', 'pagerGetter'))
      .toBeUndefined();
  });

  test('rejects conflicting response extractors', () => {
    expect(() => requireMatchingScopedListValue(
      ['items', 'data'],
      'widget',
      'resultGetter',
    )).toThrow('Conflicting resultGetter for merged widget/list action.');
  });
});
