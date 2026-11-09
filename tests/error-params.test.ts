import { expect, test } from 'bun:test';
import { ZentaoError } from '../src/misc/errors.js';

test('error params retain original values without changing serialization', () => {
  const values = { param: '禅道 zentao', value: 'https://zentao.example.com' };
  const details = { raw: values.value };
  const error = new ZentaoError('E_INVALID_PARAM', values, details);
  values.param = 'changed';
  expect(error.params).toEqual({ param: '禅道 zentao', value: 'https://zentao.example.com' });
  expect(Object.isFrozen(error.params)).toBe(true);
  expect(error.message).toBe('Invalid value for parameter 禅道 zentao: https://zentao.example.com');
  expect(error.details).toBe(details);
  expect(Object.keys(error)).not.toContain('params');
  expect(JSON.stringify(error)).not.toContain('params');
  expect(new ZentaoError('E_TIMEOUT').params).toEqual({});
});
