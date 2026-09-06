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
