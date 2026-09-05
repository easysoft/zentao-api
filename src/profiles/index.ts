import { ZentaoError } from '../misc/errors.js';
import { isNodeRuntime } from '../misc/environment.js';
import { isRecord, normalizeSiteUrl } from '../utils/index.js';
import type { ServerConfig, ZentaoProfile, ZentaoProfileRecord, ZentaoProfilesStore } from '../types/index.js';

/**
 * 浏览器环境下用于在 `localStorage` 中保存 profile 数据的 key。
 *
 * Node.js 环境会改用文件 `~/.config/zentao/zentao.json`，与此常量无关。
 */
export const ZENTAO_PROFILES_STORAGE_KEY = 'ZENTAO_PROFILES';

const PROFILE_FILE_PARTS = ['.config', 'zentao', 'zentao.json'];

function cloneJson<T>(value: T): T {
  if (value === undefined) return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

function nowString(): string {
  return new Date().toISOString();
}

// 通过函数参数间接化 `import(specifier)`，避免打包器把 Node 内置模块拉进
// 浏览器 bundle；同时不依赖 `new Function`/`eval`，对严格 CSP 友好。
function importNodeModule<T>(specifier: string): Promise<T> {
  return import(specifier) as Promise<T>;
}

// 进程内串行锁：所有 read-modify-write 类的 profile 操作都通过这个队列，
// 避免并发 `addProfile`/`switchProfile` 出现 lost update（写文件本身是原子
// rename，但 read→modify→write 之间没有跨步保护）。跨进程并发不在保证范围内。
let storeMutex: Promise<unknown> = Promise.resolve();
function withStoreMutex<T>(operation: () => Promise<T>): Promise<T> {
  const next = storeMutex.then(operation, operation);
  storeMutex = next.catch(() => undefined);
  return next;
}

function getBrowserStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

async function getProfileFilePath(): Promise<string> {
  const path = await importNodeModule<typeof import('node:path')>('node:path');
  const home = process.env.HOME
    ?? process.env.USERPROFILE
    ?? (await importNodeModule<typeof import('node:os')>('node:os')).homedir();

  if (!home) {
    throw new ZentaoError('E_PROFILE_STORAGE_UNAVAILABLE');
  }

  return path.join(home, ...PROFILE_FILE_PARTS);
}

function profileKeyFromParts(account: string, server: string): string {
  const normalizedAccount = account.trim();
  const normalizedServer = normalizeSiteUrl(server);
  if (!normalizedAccount) throw new ZentaoError('E_INVALID_PROFILE');
  return `${normalizedAccount}@${normalizedServer}`;
}

function normalizeProfile(profile: ZentaoProfile): ZentaoProfile {
  if (!isRecord(profile) || typeof profile.server !== 'string' || typeof profile.account !== 'string' || typeof profile.token !== 'string') {
    throw new ZentaoError('E_INVALID_PROFILE');
  }

  const token = profile.token.trim();
  const account = profile.account.trim();
  if (!token || !account) throw new ZentaoError('E_INVALID_PROFILE');

  const copy = cloneJson(profile) as ZentaoProfile & { key?: string };
  delete copy.key;
  return {
    ...copy,
    server: normalizeSiteUrl(profile.server),
    account,
    token,
  };
}

function normalizeStore(raw: unknown): ZentaoProfilesStore {
  if (!isRecord(raw) || !Array.isArray(raw.profiles)
    || (raw.currentProfile !== undefined && typeof raw.currentProfile !== 'string')) {
    throw new ZentaoError('E_PROFILE_STORAGE_INVALID');
  }

  const profiles = raw.profiles.flatMap((profile) => {
    try {
      return [normalizeProfile(profile as ZentaoProfile)];
    } catch {
      return [];
    }
  });

  const currentProfile = typeof raw.currentProfile === 'string' ? raw.currentProfile : undefined;
  return currentProfile ? { currentProfile, profiles } : { profiles };
}

function parseStore(text: string): ZentaoProfilesStore {
  try {
    return normalizeStore(JSON.parse(text));
  } catch (error) {
    throw new ZentaoError('E_PROFILE_STORAGE_INVALID', undefined, error);
  }
}

async function readStore(): Promise<ZentaoProfilesStore> {
  if (isNodeRuntime()) {
    const fs = await importNodeModule<typeof import('node:fs/promises')>('node:fs/promises');
    const file = await getProfileFilePath();
    try {
      return parseStore(await fs.readFile(file, 'utf8'));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return { profiles: [] };
      }
      throw error;
    }
  }

  const storage = getBrowserStorage();
  if (!storage) {
    throw new ZentaoError('E_PROFILE_STORAGE_UNAVAILABLE');
  }

  const text = storage.getItem(ZENTAO_PROFILES_STORAGE_KEY);
  return text ? parseStore(text) : { profiles: [] };
}

async function writeStore(store: ZentaoProfilesStore): Promise<void> {
  const normalizedStore = normalizeStore(store);
  const text = `${JSON.stringify(normalizedStore, null, 2)}\n`;

  if (isNodeRuntime()) {
    const fs = await importNodeModule<typeof import('node:fs/promises')>('node:fs/promises');
    const path = await importNodeModule<typeof import('node:path')>('node:path');
    const file = await getProfileFilePath();
    const dir = path.dirname(file);
    const tempFile = path.join(dir, `.zentao.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`);

    await fs.mkdir(dir, { recursive: true, mode: 0o700 });
    await fs.chmod(dir, 0o700).catch(() => undefined);
    try {
      await fs.writeFile(tempFile, text, { encoding: 'utf8', mode: 0o600 });
      await fs.rename(tempFile, file);
      await fs.chmod(file, 0o600).catch(() => undefined);
    } catch (error) {
      await fs.rm(tempFile, { force: true }).catch(() => undefined);
      throw error;
    }
    return;
  }

  const storage = getBrowserStorage();
  if (!storage) {
    throw new ZentaoError('E_PROFILE_STORAGE_UNAVAILABLE');
  }
  storage.setItem(ZENTAO_PROFILES_STORAGE_KEY, text);
}

function toRecord(profile: ZentaoProfile): ZentaoProfileRecord {
  const normalized = normalizeProfile(profile);
  return {
    ...cloneJson(normalized),
    key: getProfileKey(normalized),
  };
}

function findProfile(store: ZentaoProfilesStore, profileKey: string): ZentaoProfile | undefined {
  return store.profiles.find((profile) => getProfileKey(profile) === profileKey);
}

function setFallbackCurrentProfile(store: ZentaoProfilesStore): void {
  if (!store.currentProfile || !findProfile(store, store.currentProfile)) {
    const fallback = store.profiles.at(-1);
    store.currentProfile = fallback ? getProfileKey(fallback) : undefined;
  }
}

/**
 * 根据 profile 的账号和禅道站点地址生成稳定 key。
 *
 * Key 格式为 `account@server`，其中 `server` 会经过 {@link normalizeSiteUrl} 规范化，
 * 因此即使传入末尾带 `/` 或 `/api.php/v2` 的地址，也会得到一致的结果。
 *
 * @param profile - 只需要包含 `account` 和 `server` 两个字段。
 * @returns 形如 `admin@https://zentao.example.com` 的 profile key。
 * @throws {ZentaoError} `E_INVALID_PROFILE`（账号为空白）或 `E_INVALID_BASE_URL`（`server` 不合法）。
 */
export function getProfileKey(profile: Pick<ZentaoProfile, 'account' | 'server'>): string {
  return profileKeyFromParts(profile.account, profile.server);
}

/**
 * 列出本地保存的所有 profile。
 *
 * Node.js 下从 `~/.config/zentao/zentao.json` 读取；浏览器下从 `localStorage` 读取。
 * 读取过程不会写回存储；存储中无法解析的条目会被静默忽略，不会影响其余 profile。
 *
 * @returns 当前存储中的所有 profile（带 `key` 字段），文件不存在时返回空数组。
 * @throws {ZentaoError} `E_PROFILE_STORAGE_INVALID`（存储内容不是合法 JSON 或根结构不合法）或
 *   `E_PROFILE_STORAGE_UNAVAILABLE`（运行时无法访问存储）。
 */
export async function getAllProfiles(): Promise<ZentaoProfileRecord[]> {
  const store = await readStore();
  return store.profiles.map(toRecord);
}

/**
 * 获取指定 profile。
 *
 * @param profileKey - 可选的 profile key（`account@server`）；不传时返回当前（最近一次切换的）profile。
 * @returns 命中的 profile（带 `key` 字段）；当 key 不存在或尚未配置当前 profile 时返回 `undefined`。
 * @throws {ZentaoError} `E_PROFILE_STORAGE_INVALID` / `E_PROFILE_STORAGE_UNAVAILABLE`。
 */
export async function getProfile(profileKey?: string): Promise<ZentaoProfileRecord | undefined> {
  const store = await readStore();
  const key = profileKey ?? store.currentProfile;
  if (!key) return undefined;
  const profile = findProfile(store, key);
  return profile ? toRecord(profile) : undefined;
}

/**
 * 添加或覆盖一个本地 profile，并把它设置为当前使用的 profile。
 *
 * 行为细节：
 * - 同 key（`account@server`）已存在时会**整体覆盖**而非合并字段。
 * - 写入时会自动补齐 `loginTime` 与 `lastUsedTime`（若调用方未提供则使用当前 ISO 时间）。
 * - 操作通过进程内串行锁保护 read-modify-write，避免并发调用导致的 lost update；跨进程并发不在保证范围。
 * - 实际写入使用临时文件 + `rename` 的原子方式，并将文件与目录权限收紧到 `0600`/`0700`（Node.js 下）。
 *
 * @param profile - 要写入的 profile，必须至少包含 `server`、`account`、`token`。
 * @returns 实际写入并附带 `key` 字段的 profile 记录。
 * @throws {ZentaoError} `E_INVALID_PROFILE`（必填字段缺失或 token 为空白）、
 *   `E_INVALID_BASE_URL`、`E_PROFILE_STORAGE_INVALID`、`E_PROFILE_STORAGE_UNAVAILABLE`。
 */
export function addProfile(profile: ZentaoProfile): Promise<ZentaoProfileRecord> {
  return saveProfile(profile);
}

/** 登录只更新会话字段和显式偏好，保留同账号的应用数据。 @internal */
export function saveLoginProfile(profile: ZentaoProfile): Promise<ZentaoProfileRecord> {
  return saveProfile(profile, true);
}

function saveProfile(profile: ZentaoProfile, preservePreferences = false): Promise<ZentaoProfileRecord> {
  return withStoreMutex(async () => {
    const store = await readStore();
    const timestamp = nowString();
    let normalized = normalizeProfile({
      ...profile,
      loginTime: profile.loginTime ?? timestamp,
      lastUsedTime: profile.lastUsedTime ?? timestamp,
    });
    const profileKey = getProfileKey(normalized);
    const index = store.profiles.findIndex((item) => getProfileKey(item) === profileKey);

    if (index >= 0) {
      if (preservePreferences) {
        const previous = store.profiles[index];
        const config = { ...(isRecord(previous.config) ? previous.config : {}), ...normalized.config };
        normalized = normalizeProfile({ ...previous, ...profile, ...normalized,
          config: Object.keys(config).length ? config : undefined });
      }
      store.profiles[index] = normalized;
    } else {
      store.profiles.push(normalized);
    }

    store.currentProfile = profileKey;
    await writeStore(store);
    return toRecord(normalized);
  });
}

/** 只刷新已有 profile 的服务器配置，不切换当前账号或重建已删除的记录。 @internal */
export function updateProfileServerConfig(profileKey: string, serverConfig: ServerConfig, fetchedAt: string): Promise<void> {
  return withStoreMutex(async () => {
    const store = await readStore();
    const profile = findProfile(store, profileKey);
    if (!profile) return;
    profile.serverConfig = cloneJson(serverConfig);
    profile.serverConfigFetchedAt = fetchedAt;
    await writeStore(store);
  });
}

/**
 * 删除指定 profile。
 *
 * 若被删除的是当前 profile，会回退为列表中最近一次写入的 profile；若已无任何 profile，
 * 当前 profile 会被清空。操作同样通过进程内串行锁保护。
 *
 * @param profileKey - 要删除的 profile key。
 * @returns 当且仅当确实删除了某条记录时返回 `true`；key 不存在时返回 `false` 且不会写盘。
 * @throws {ZentaoError} `E_PROFILE_STORAGE_INVALID` / `E_PROFILE_STORAGE_UNAVAILABLE`。
 */
export function deleteProfile(profileKey: string): Promise<boolean> {
  return withStoreMutex(async () => {
    const store = await readStore();
    const nextProfiles = store.profiles.filter((profile) => getProfileKey(profile) !== profileKey);
    if (nextProfiles.length === store.profiles.length) return false;

    store.profiles = nextProfiles;
    setFallbackCurrentProfile(store);
    await writeStore(store);
    return true;
  });
}

/**
 * 切换当前使用的 profile，并刷新其 `lastUsedTime`。
 *
 * 不传 `profileKey` 时使用当前 profile（相当于把当前 profile 的 `lastUsedTime` 刷新一遍）。
 * 切换成功后会立即写回存储，由进程内串行锁保护。
 *
 * @param profileKey - 可选的目标 profile key；不传则使用当前 profile。
 * @returns 切换后生效的 profile 记录（带 `key` 字段）。
 * @throws {ZentaoError} `E_NO_PROFILE`（未配置任何当前 profile 且未传 key）、
 *   `E_PROFILE_NOT_FOUND`（目标 key 不存在）、`E_PROFILE_STORAGE_INVALID` /
 *   `E_PROFILE_STORAGE_UNAVAILABLE`。
 */
export function switchProfile(profileKey?: string): Promise<ZentaoProfileRecord> {
  return withStoreMutex(async () => {
    const store = await readStore();
    const key = profileKey ?? store.currentProfile;
    if (!key) {
      throw new ZentaoError('E_NO_PROFILE');
    }
    const profile = findProfile(store, key);
    if (!profile) {
      throw new ZentaoError('E_PROFILE_NOT_FOUND', { profileKey: key });
    }

    profile.lastUsedTime = nowString();
    store.currentProfile = key;
    await writeStore(store);
    return toRecord(profile);
  });
}
