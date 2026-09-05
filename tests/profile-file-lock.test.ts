import { afterEach, expect, spyOn, test } from 'bun:test';
import * as fs from 'node:fs/promises';
import { mkdirSync, rmdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { hostname, tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { withProfileFileLock } from '../src/profiles/file-lock';

const directories: string[] = [];
const children: Bun.Subprocess<'ignore', 'pipe', 'pipe'>[] = [];
const modulePath = fileURLToPath(new URL('../src/profiles/file-lock.ts', import.meta.url));

afterEach(async () => {
  for (const child of children.splice(0)) {
    if (child.exitCode === null) child.kill('SIGKILL');
    await child.exited;
  }
  await Promise.all(directories.splice(0).map(dir => fs.rm(dir, { recursive: true, force: true })));
});

async function fixture(): Promise<string> {
  const directory = await fs.mkdtemp(join(tmpdir(), 'zentao-profile-lock-'));
  directories.push(directory);
  return join(directory, 'zentao.json');
}

async function worker(file: string, mode: 'increment' | 'hold' | 'exit') {
  const script = join(dirname(file), `worker-${randomUUID()}.ts`);
  await fs.writeFile(script, `
    import { readFile, writeFile } from 'node:fs/promises';
    import { withProfileFileLock } from ${JSON.stringify(modulePath)};
    const [file, mode] = process.argv.slice(2);
    if (mode === 'hold') await withProfileFileLock(file, async () => {
      console.log('locked');
      await Bun.sleep(60000);
    });
    if (mode === 'increment') for (let i = 0; i < 10; i++) await withProfileFileLock(file, async () => {
      const value = Number(await readFile(file, 'utf8'));
      await Bun.sleep(8);
      await writeFile(file, String(value + 1));
    });
  `);
  const child = Bun.spawn({ cmd: [process.execPath, script, file, mode], stdin: 'ignore', stdout: 'pipe', stderr: 'pipe' });
  children.push(child);
  return child;
}

async function seedOwner(file: string, pid: number, host = hostname()): Promise<string> {
  const name = `${pid}-${randomUUID()}.json`;
  await fs.mkdir(`${file}.lock`, { mode: 0o700 });
  await fs.writeFile(join(`${file}.lock`, name), JSON.stringify({ pid, hostname: host }), { mode: 0o600 });
  return name;
}

test('two Bun processes preserve every read-modify-write update', async () => {
  const file = await fixture();
  await fs.writeFile(file, '0');
  const first = await worker(file, 'increment');
  const second = await worker(file, 'increment');
  expect(await Promise.all([first.exited, second.exited])).toEqual([0, 0]);
  expect(await fs.readFile(file, 'utf8')).toBe('20');
  expect((await fs.readdir(dirname(file))).some(name => name.includes('.lock'))).toBe(false);
});

test('recovers a lock after its holding process is killed', async () => {
  const file = await fixture();
  const child = await worker(file, 'hold');
  const reader = child.stdout.getReader();
  const ready = await reader.read();
  reader.releaseLock();
  expect(new TextDecoder().decode(ready.value)).toContain('locked');
  child.kill('SIGKILL');
  await child.exited;
  await expect(withProfileFileLock(file, async () => 'recovered')).resolves.toBe('recovered');
  await expect(fs.stat(`${file}.lock`)).rejects.toMatchObject({ code: 'ENOENT' });
});

test('an old live owner times out without changing its lock or stored data', async () => {
  const file = await fixture();
  await fs.writeFile(file, 'original');
  const owner = await seedOwner(file, process.pid);
  await fs.utimes(`${file}.lock`, new Date(0), new Date(0));
  await expect(withProfileFileLock(file, async () => fs.writeFile(file, 'changed'), 80))
    .rejects.toMatchObject({ code: 'E_PROFILE_STORAGE_UNAVAILABLE', details: expect.any(Error) });
  expect(await fs.readFile(file, 'utf8')).toBe('original');
  expect(await fs.readdir(`${file}.lock`)).toEqual([owner]);
});

test('releases a lock when its callback throws and restricts owner permissions', async () => {
  const file = await fixture();
  const failure = new Error('callback failed');
  await expect(withProfileFileLock(file, async () => {
    const [owner] = await fs.readdir(`${file}.lock`);
    if (process.platform !== 'win32') {
      expect((await fs.stat(`${file}.lock`)).mode & 0o777).toBe(0o700);
      expect((await fs.stat(join(`${file}.lock`, owner))).mode & 0o777).toBe(0o600);
    }
    throw failure;
  })).rejects.toBe(failure);
  await expect(withProfileFileLock(file, async () => 'next')).resolves.toBe('next');
});

test.each(['foreign host', 'malformed owner', 'extra file'])('does not reclaim an unknown lock: %s', async kind => {
  const file = await fixture();
  const child = await worker(file, 'exit');
  await child.exited;
  const owner = await seedOwner(file, child.pid, kind === 'foreign host' ? `${hostname()}-other` : hostname());
  if (kind === 'malformed owner') await fs.writeFile(join(`${file}.lock`, owner), 'null');
  if (kind === 'extra file') await fs.writeFile(join(`${file}.lock`, 'unknown'), 'preserve');
  const before = await fs.readdir(`${file}.lock`);
  await expect(withProfileFileLock(file, async () => 'unexpected', 60))
    .rejects.toMatchObject({ code: 'E_PROFILE_STORAGE_UNAVAILABLE' });
  expect(await fs.readdir(`${file}.lock`)).toEqual(before);
});

test('a delayed stale owner cleanup cannot remove the successor lock', async () => {
  const file = await fixture();
  const child = await worker(file, 'exit');
  await child.exited;
  const oldOwner = await seedOwner(file, child.pid);
  const successor = `${process.pid}-${randomUUID()}.json`;
  const kill = process.kill;
  const intercepted = spyOn(process, 'kill').mockImplementation((pid, signal) => {
    if (pid === child.pid) {
      // 已读取旧 owner 后，模拟另一回收者先完成清理且后继进程已取得锁。
      unlinkSync(join(`${file}.lock`, oldOwner));
      rmdirSync(`${file}.lock`);
      mkdirSync(`${file}.lock`);
      writeFileSync(join(`${file}.lock`, successor), JSON.stringify({ pid: process.pid, hostname: hostname() }));
    }
    return kill(pid, signal);
  });
  try {
    await expect(withProfileFileLock(file, async () => 'unexpected', 80))
      .rejects.toMatchObject({ code: 'E_PROFILE_STORAGE_UNAVAILABLE' });
    expect(await fs.readdir(`${file}.lock`)).toEqual([successor]);
  } finally {
    intercepted.mockRestore();
  }
});

test('directory aliases share the same lock', async () => {
  if (process.platform === 'win32') return;
  const file = await fixture();
  const alias = `${dirname(file)}-alias`;
  await fs.symlink(dirname(file), alias);
  directories.push(alias);
  await withProfileFileLock(file, async () => {
    await expect(withProfileFileLock(join(alias, 'zentao.json'), async () => 'unexpected', 60))
      .rejects.toMatchObject({ code: 'E_PROFILE_STORAGE_UNAVAILABLE' });
  });
});
