import { createRealEnvTestRun } from './real-env-support';
import { mkdirSync, rmSync } from 'node:fs';

const reportPath = 'coverage/real-env.json';
mkdirSync('coverage/real-env', { recursive: true });
rmSync(reportPath, { force: true });
const startedAt = new Date();
const run = createRealEnvTestRun(Bun.argv[0]);
const subprocess = Bun.spawnSync({
  cmd: run.cmd,
  env: run.env,
  stdin: 'inherit',
  stdout: 'inherit',
  stderr: 'inherit',
});

const reportFile = Bun.file(reportPath);
const report = await reportFile.exists() ? await reportFile.json() : { abortedBeforeReport: true };
const passed = subprocess.exitCode === 0 && !report.abortedBeforeReport && !report.keepTestData
  && report.failed.length === 0 && report.untested.length === 0 && report.cleanupErrors.length === 0;
const result = `${JSON.stringify({ ...report, startedAt: startedAt.toISOString(),
  durationMs: Date.now() - startedAt.getTime(), exitCode: subprocess.exitCode, passed }, null, 2)}\n`;
await Bun.write(reportPath, result);
await Bun.write(`coverage/real-env/${startedAt.toISOString().replace(/[:.]/g, '-')}.json`, result);
process.exit(subprocess.exitCode);
