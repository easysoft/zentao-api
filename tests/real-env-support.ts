export interface RealEnvRuntimeOptions {
  keepTestData: boolean;
}

export interface RealEnvLogEnvironment {
  envFiles: readonly string[];
  baseUrl: string;
  authMode: 'token' | 'account-password';
  account?: string;
  reviewer?: string;
  timeout?: number;
  insecure?: boolean;
  keepTestData: boolean;
  token?: string;
  password?: string;
}

export interface RealEnvLogger {
  environment(info: RealEnvLogEnvironment): void;
  step(name: string, details?: Record<string, unknown>): void;
  result(details?: Record<string, unknown>): void;
  info(message: string, details?: Record<string, unknown>): void;
}

export interface RealEnvTestRun {
  cmd: string[];
  env: Record<string, string>;
}

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);

export function getMissingRealEnvModule(data: unknown): string | undefined {
  return typeof data === 'string'
    ? data.match(/the control file (module\/[a-z0-9_]+\/control\.php) not found/i)?.[1]
    : undefined;
}

export function validateRealEnvResponse(
  response: { status: string; message?: string; data?: unknown },
  resultType?: 'list' | 'object' | 'text',
): void {
  if (response.status !== 'success') throw new Error(response.message ?? 'ZenTao API returned failure.');
  if (response.data && typeof response.data === 'object' && 'result' in response.data && response.data.result === 'fail') {
    throw new Error(`ZenTao API returned result=fail: ${JSON.stringify(response.data)}`);
  }
  if (typeof response.data === 'string' && /<[^>]+>|Fatal error|ERROR:/i.test(response.data)) {
    const text = response.data.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
    throw new Error(`Expected JSON API response, got an HTML/error page: ${text.slice(Math.max(0, text.lastIndexOf('ERROR:')), Math.max(0, text.lastIndexOf('ERROR:')) + 600)}`);
  }
  if (resultType === 'list' && !Array.isArray(response.data)) {
    throw new Error('Expected API data to be an array.');
  }
  if (resultType === 'object' && (!response.data || typeof response.data !== 'object' || Array.isArray(response.data))) {
    throw new Error('Expected API data to be an object.');
  }
}

export function createRealEnvCoverage(actions: readonly string[]) {
  const calls: { action: string; outcome: 'success' | 'fail'; route?: string; error?: string }[] = [];
  const excluded = new Map<string, string>();
  return {
    record(action: string, outcome: 'success' | 'fail', route?: string, error?: string) {
      calls.push({ action, outcome, route, error });
    },
    exclude(action: string, reason: string) {
      excluded.set(action, reason);
    },
    report() {
      const failed = [...new Set(calls.filter(call => call.outcome === 'fail').map(call => call.action))].sort();
      const successful = [...new Set(calls.filter(call => call.outcome === 'success').map(call => call.action))].filter(action => !failed.includes(action)).sort();
      return {
        total: actions.length,
        exercised: new Set(calls.map(call => call.action)).size,
        successful,
        failed,
        excluded: Object.fromEntries(excluded),
        untested: actions.filter(action => !successful.includes(action) && !failed.includes(action) && !excluded.has(action)).sort(),
        routes: [...new Set(calls.filter(call => call.outcome === 'success' && call.route).map(call => call.route!))].sort(),
        calls,
      };
    },
  };
}

export function resolveRealEnvWorkflowGroup(
  projects: readonly Record<string, unknown>[],
  configured?: string,
): number {
  const project = projects.find((item) => (
    item.model === 'scrum' && Number.isSafeInteger(Number(item.workflowGroup)) && Number(item.workflowGroup) > 0
  ));
  const workflowGroup = Number(configured ?? project?.workflowGroup ?? 0);
  if (!Number.isSafeInteger(workflowGroup) || workflowGroup < 0 || configured?.trim() === '') {
    throw new Error('ZENTAO_WORKFLOW_GROUP must be a non-negative integer.');
  }
  return workflowGroup;
}

export function resolveRealEnvRuntimeOptions(
  argv: readonly string[] = Bun.argv,
  env: Record<string, string | undefined> = process.env,
): RealEnvRuntimeOptions {
  const envValue = env.ZENTAO_KEEP_TEST_DATA?.trim().toLowerCase();

  return {
    keepTestData: argv.includes('--keep-test-data') || TRUE_VALUES.has(envValue ?? ''),
  };
}

export function createRealEnvTestRun(
  bunExecutable: string,
  argv: readonly string[] = Bun.argv,
  env: Record<string, string | undefined> = process.env,
): RealEnvTestRun {
  const options = resolveRealEnvRuntimeOptions(argv, env);
  const nextEnv: Record<string, string> = {};

  for (const [key, value] of Object.entries(env)) {
    if (value !== undefined) nextEnv[key] = value;
  }
  if (options.keepTestData) {
    nextEnv.ZENTAO_KEEP_TEST_DATA = '1';
  }

  return {
    cmd: [bunExecutable, 'test', './tests/real-env.ts'],
    env: nextEnv,
  };
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value === undefined || value === null || value === '') return '(unset)';
  return String(value);
}

function formatDetails(details?: Record<string, unknown>): string {
  if (!details) return '';
  const entries = Object.entries(details)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${formatValue(value)}`);
  return entries.length > 0 ? ` ${entries.join(' ')}` : '';
}

export function createRealEnvLogger(write: (line: string) => void = console.log): RealEnvLogger {
  let stepNumber = 0;

  return {
    environment(info) {
      write('[real-env] Environment');
      write(`[real-env]   envFiles: ${formatValue(info.envFiles)}`);
      write(`[real-env]   baseUrl: ${formatValue(info.baseUrl)}`);
      write(`[real-env]   auth: ${info.authMode}`);
      write(`[real-env]   account: ${formatValue(info.account)}`);
      write(`[real-env]   reviewer: ${formatValue(info.reviewer)}`);
      write(`[real-env]   timeout: ${formatValue(info.timeout)}ms`);
      write(`[real-env]   insecureTLS: ${formatValue(info.insecure)}`);
      write(`[real-env]   keepTestData: ${formatValue(info.keepTestData)}`);
    },
    step(name, details) {
      stepNumber += 1;
      write(`[real-env] Step ${String(stepNumber).padStart(2, '0')} ${name}${formatDetails(details)}`);
    },
    result(details) {
      write(`[real-env]   result:${formatDetails(details)}`);
    },
    info(message, details) {
      write(`[real-env] ${message}${formatDetails(details)}`);
    },
  };
}
