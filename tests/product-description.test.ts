import { afterEach, expect, test } from 'bun:test';
import { ZentaoClient, request, setGlobalOptions } from '../src/index';
import { resetModuleDefinitions } from '../src/modules/registry';

afterEach(() => {
  resetModuleDefinitions();
  setGlobalOptions({ version: undefined });
});

test.each(['', 'Description, with commas\nand a second line'])('product create and partial updates preserve description %p', async desc => {
  let product: Record<string, unknown> = {};
  const writes: Record<string, unknown>[] = [];
  const server = Bun.serve({
    port: 0,
    async fetch(req) {
      if (req.method === 'GET') return Response.json({ status: 'success', product });
      const body = await req.json() as Record<string, unknown>;
      writes.push(body);
      // Model the server's string field: an array input would become "Array".
      product = { ...product, ...body, id: 7, desc: Array.isArray(body.desc) ? 'Array' : body.desc };
      return Response.json({ status: 'success', id: 7 });
    },
  });
  try {
    const client = new ZentaoClient(server.url.href);
    setGlobalOptions({ version: 'ipd5.6' });
    await request('product/create', { name: 'Original', desc }, { client });
    // The description override must survive registry resets before autoFill runs.
    resetModuleDefinitions();
    await request('product/update', { id: 7, name: 'Renamed' }, { client, autoFill: true });
    expect((await request('product/get', { id: 7 }, { client })).data?.desc).toBe(desc);
    expect(writes.map(body => body.desc)).toEqual([desc, desc]);

    const replacement = 'Explicit description, with commas\nnext line';
    await request('product/update', { id: 7, data: JSON.stringify({ desc: replacement }) }, { client, autoFill: true });
    expect(writes[2].desc).toBe(replacement);
    expect((await request('product/get', { id: 7 }, { client })).data?.desc).toBe(replacement);
  } finally {
    server.stop(true);
  }
});
