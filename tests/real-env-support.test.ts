import { describe, expect, test } from 'bun:test';
import {
  createRealEnvTestRun,
  createRealEnvLogger,
  resolveRealEnvRuntimeOptions,
  resolveRealEnvWorkflowGroup,
  createRealEnvCoverage,
  getMissingRealEnvModule,
  validateRealEnvResponse,
} from './real-env-support';

describe('real environment test support', () => {
  test('rejects HTML errors and invalid list data even when the SDK reports success', () => {
    const html = '<p>ERROR: the control file module/meeting/control.php not found.</p>';
    expect(getMissingRealEnvModule(html)).toBe('module/meeting/control.php');
    expect(getMissingRealEnvModule('<p>Fatal error: database failure</p>')).toBeUndefined();
    expect(() => validateRealEnvResponse({ status: 'success', data: html }, 'list')).toThrow('HTML/error page');
    expect(() => validateRealEnvResponse({ status: 'success', data: {} }, 'list')).toThrow('array');
    expect(() => validateRealEnvResponse({ status: 'fail', message: 'denied', data: {} })).toThrow('denied');
    expect(() => validateRealEnvResponse({ status: 'success', data: { result: 'fail', message: 'denied' } })).toThrow('result=fail');
    expect(() => validateRealEnvResponse({ status: 'success', data: [] }, 'list')).not.toThrow();
    expect(() => validateRealEnvResponse({ status: 'success', data: { content: '<p>Document content</p>' } }, 'object')).not.toThrow();
  });

  test('reports unique actions, scoped routes, exclusions and failures without hiding a failed attempt', () => {
    const coverage = createRealEnvCoverage(['story/list', 'bug/list', 'meeting/list', 'todo/create']);
    coverage.record('story/list', 'success', 'GET /products/{id}/stories');
    coverage.record('story/list', 'success', 'GET /projects/{id}/stories');
    coverage.record('bug/list', 'fail');
    coverage.record('bug/list', 'success');
    coverage.exclude('meeting/list', 'missing module');
    const report = coverage.report();
    expect(report.successful).toEqual(['story/list']);
    expect(report.exercised).toBe(2);
    expect(report.failed).toEqual(['bug/list']);
    expect(report.untested).toEqual(['todo/create']);
    expect(report.excluded).toEqual({ 'meeting/list': 'missing module' });
    expect(report.routes).toHaveLength(2);
    expect(report.calls).toHaveLength(4);
  });

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
