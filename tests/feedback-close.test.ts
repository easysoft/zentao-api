import { afterEach, expect, test } from 'bun:test';
import { ZentaoClient, request, setGlobalOptions } from '../src/index';
import { resetModuleDefinitions } from '../src/modules/registry';

afterEach(() => {
  resetModuleDefinitions();
  setGlobalOptions({ version: undefined });
});

test.each([
  ['omitted', {}, undefined],
  ['flat yes', { confirmClose: 'yes' }, 'yes'],
  ['flat no', { confirmClose: 'no' }, 'no'],
  ['object data', { data: Object.freeze({ confirmClose: 'yes' }) }, 'yes'],
  ['JSON data', { data: '{"confirmClose":"yes"}' }, 'yes'],
  ['data precedence', { confirmClose: 'no', data: { confirmClose: 'yes' } }, 'yes'],
] as const)('feedback close routes confirmClose from %s without writing it to the body', async (_name, params, expected) => {
  const received: { body?: unknown; query?: string | null } = {};
  const snapshot = JSON.stringify(params);
  const server = Bun.serve({
    port: 0,
    async fetch(req) {
      received.query = new URL(req.url).searchParams.get('confirmClose');
      received.body = await req.json();
      // A linked object may still be open: only explicit "yes" forces the close.
      return Response.json({ status: received.query === 'yes' ? 'success' : 'fail' });
    },
  });
  try {
    resetModuleDefinitions();
    setGlobalOptions({ version: 'ipd5.6' });
    const client = new ZentaoClient(server.url.href);
    const response = await request('feedback/close', { id: 7, closedReason: 'refuse', comment: 'Keep this comment', ...params }, { client });
    expect(received.query).toBe(expected ?? null);
    expect(received.body).toEqual({ closedReason: 'refuse', comment: 'Keep this comment' });
    expect(response.status).toBe(expected === 'yes' ? 'success' : 'fail');
    expect(JSON.stringify(params)).toBe(snapshot);
  } finally {
    server.stop(true);
  }
});
