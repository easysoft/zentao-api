import { createRealEnvTestRun } from './real-env-support';
import { mkdirSync, rmSync } from 'node:fs';

const reportPath = 'coverage/real-env.json';
mkdirSync('coverage', { recursive: true });
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
await Bun.write(reportPath, `${JSON.stringify({ ...report, startedAt: startedAt.toISOString(),
  durationMs: Date.now() - startedAt.getTime(), exitCode: subprocess.exitCode }, null, 2)}\n`);
process.exit(subprocess.exitCode);
