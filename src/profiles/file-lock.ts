import { ZentaoError } from '../misc/errors.js';

// 间接导入，避免浏览器打包器解析 Node 内置模块。
function importNodeModule<T>(specifier: string): Promise<T> {
  return import(specifier) as Promise<T>;
}

/**
 * 在同一主机的本地文件系统上保护 profile 的 read-modify-write。
 * 仅回收已确认退出的本机进程；不以锁的年龄判断进程是否仍在写入。
 * @internal
 */
export async function withProfileFileLock<T>(
  file: string,
  operation: () => Promise<T>,
  timeoutMs = 5000,
): Promise<T> {
  const [fs, path, os, crypto] = await Promise.all([
    importNodeModule<typeof import('node:fs/promises')>('node:fs/promises'),
    importNodeModule<typeof import('node:path')>('node:path'),
    importNodeModule<typeof import('node:os')>('node:os'),
    importNodeModule<typeof import('node:crypto')>('node:crypto'),
  ]);
  await fs.mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
  const directory = await fs.realpath(path.dirname(file));
  const lock = path.join(directory, `${path.basename(file)}.lock`);
  const ownerName = `${process.pid}-${crypto.randomUUID()}.json`;
  const candidate = `${lock}.${ownerName}`;
  const hostname = os.hostname();

  async function removeOwner(name: string): Promise<void> {
    try {
      await fs.unlink(path.join(lock, name));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
      throw error;
    }
    try {
      // 迟到的释放者/回收者不能删除后继持有者的非空目录。
      await fs.rmdir(lock);
    } catch (error) {
      if (!['ENOENT', 'ENOTEMPTY', 'EEXIST'].includes((error as NodeJS.ErrnoException).code ?? '')) throw error;
    }
  }

  async function reclaimDeadOwner(): Promise<void> {
    try {
      const entries = await fs.readdir(lock, { withFileTypes: true });
      if (entries.length !== 1 || !entries[0].isFile()) return;
      const name = entries[0].name;
      if (!/^[1-9]\d*-[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}\.json$/.test(name)) return;
      let owner: { pid?: unknown; hostname?: unknown } | null;
      try {
        owner = JSON.parse(await fs.readFile(path.join(lock, name), 'utf8'));
      } catch (error) {
        if (error instanceof SyntaxError) return;
        throw error;
      }
      if (!owner || typeof owner.pid !== 'number' || !Number.isSafeInteger(owner.pid)
        || owner.pid <= 0 || !name.startsWith(`${owner.pid}-`) || owner.hostname !== hostname) return;
      try {
        process.kill(owner.pid, 0);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ESRCH') await removeOwner(name);
        // EPERM 或未知错误都不能证明进程已退出。
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }

  await fs.mkdir(candidate, { mode: 0o700 });
  let acquired = false;
  try {
    await fs.writeFile(path.join(candidate, ownerName), JSON.stringify({ pid: process.pid, hostname }), {
      flag: 'wx', mode: 0o600,
    });
    const started = performance.now();
    while (performance.now() - started < timeoutMs) {
      try {
        // 先准备非空目录再原子 rename，不留下“已有锁但尚无 owner”的窗口。
        await fs.rename(candidate, lock);
        acquired = true;
        break;
      } catch (error) {
        const code = (error as NodeJS.ErrnoException).code;
        if (code === 'EPERM') {
          // Windows 对已有目录可能返回 EPERM；没有目标目录时保留真实权限错误。
          const existing = await fs.stat(lock).catch(statError => {
            if ((statError as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
            throw statError;
          });
          if (!existing?.isDirectory()) throw error;
        } else if (code !== 'EEXIST' && code !== 'ENOTEMPTY') {
          throw error;
        }
        await reclaimDeadOwner();
        const remaining = timeoutMs - (performance.now() - started);
        if (remaining > 0) {
          await new Promise(resolve => setTimeout(resolve, Math.min(remaining, 25 + Math.random() * 25)));
        }
      }
    }
    if (!acquired) {
      throw new ZentaoError('E_PROFILE_STORAGE_UNAVAILABLE', undefined, new Error('Timed out waiting for the profile file lock.'));
    }
    try {
      return await operation();
    } finally {
      await removeOwner(ownerName);
    }
  } finally {
    // 此候选目录只属于本次调用；固定锁目录绝不能递归删除。
    if (!acquired) await fs.rm(candidate, { recursive: true, force: true });
  }
}
