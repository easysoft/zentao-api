import { describe, expect, test } from 'bun:test';
import {
  createRealEnvTestRun,
  createRealEnvLogger,
  resolveRealEnvRuntimeOptions,
  resolveRealEnvWorkflowGroup,
} from './real-env-support';

describe('real environment test support', () => {
  test('uses a valid Scrum workflow group or an explicit environment override', () => {
    const projects = [
      { model: 'waterfall', workflowGroup: 4 },
      { model: 'scrum', workflowGroup: 0 },
      { model: 'scrum', workflowGroup: 'invalid' },
      { model: 'scrum', workflowGroup: '2' },
    ];

    expect(resolveRealEnvWorkflowGroup(projects)).toBe(2);
    expect(resolveRealEnvWorkflowGroup(projects, '13')).toBe(13);
    expect(resolveRealEnvWorkflowGroup(projects, '0')).toBe(0);
    expect(resolveRealEnvWorkflowGroup([])).toBe(0);
    expect(resolveRealEnvWorkflowGroup([{ model: 'waterfall', workflowGroup: 4 }])).toBe(0);
    for (const value of ['invalid', '-1', '1.5', 'Infinity', '']) {
      expect(() => resolveRealEnvWorkflowGroup(projects, value)).toThrow('ZENTAO_WORKFLOW_GROUP');
    }
  });

  test('parses the keep-test-data CLI flag', () => {
    expect(resolveRealEnvRuntimeOptions(['bun', 'test', '--keep-test-data']).keepTestData).toBe(true);
    expect(resolveRealEnvRuntimeOptions(['bun', 'test']).keepTestData).toBe(false);
  });

  test('builds a bun test run with keep-test-data forwarded through the environment', () => {
    const run = createRealEnvTestRun('/usr/bin/bun', ['bun', 'runner', '--keep-test-data'], {
      EXISTING: '1',
    });

    expect(run.cmd).toEqual(['/usr/bin/bun', 'test', './tests/real-env.ts']);
    expect(run.env).toEqual({
      EXISTING: '1',
      ZENTAO_KEEP_TEST_DATA: '1',
    });
  });

  test('logs environment metadata without secrets', () => {
    const lines: string[] = [];
    const logger = createRealEnvLogger((line) => lines.push(line));

    logger.environment({
      envFiles: ['.env.local', 'env.local'],
      baseUrl: 'https://zentao.example.com',
      authMode: 'token',
      account: 'admin',
      reviewer: 'productManager',
      timeout: 30000,
      insecure: false,
      keepTestData: true,
      token: 'secret-token',
      password: 'secret-password',
    });

    const output = lines.join('\n');
    expect(output).toContain('baseUrl: https://zentao.example.com');
    expect(output).toContain('auth: token');
    expect(output).toContain('keepTestData: true');
    expect(output).not.toContain('secret-token');
    expect(output).not.toContain('secret-password');
  });
});
