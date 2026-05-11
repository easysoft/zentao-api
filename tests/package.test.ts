import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('package exports', () => {
  test('does not expose the removed Node directory loader entrypoint', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      exports: Record<string, unknown>;
    };

    expect(Object.hasOwn(packageJson.exports, './node')).toBe(false);
  });

  test('defines a complete local and publish verification gate', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>;
    };

    expect(packageJson.scripts).toEqual(expect.objectContaining({
      check: expect.stringContaining('typecheck:tests'),
      'registry:check': 'bun run scripts/update-registry.ts --check',
      'smoke:node': 'node scripts/smoke-node.mjs',
      'smoke:package': 'bun run scripts/smoke-package.ts',
      'test:coverage': 'bun test --coverage',
      'typecheck:tests': 'tsc -p tsconfig.test.json --noEmit',
    }));
    expect(packageJson.scripts.check).toContain('registry:check');
    expect(packageJson.scripts.check).toContain('smoke:node');
    expect(packageJson.scripts.check).toContain('smoke:package');
    expect(packageJson.scripts.prepublishOnly).toBe('bun run check');
  });

  test('prevents partial build artifacts when type checking fails', () => {
    const tsconfig = JSON.parse(readFileSync(join(process.cwd(), 'tsconfig.json'), 'utf8')) as {
      compilerOptions: Record<string, unknown>;
    };

    expect(tsconfig.compilerOptions.noEmitOnError).toBe(true);
  });

  test('package smoke test verifies the configured browser export target', () => {
    const smokePackageScript = readFileSync(join(process.cwd(), 'scripts/smoke-package.ts'), 'utf8');

    expect(smokePackageScript).toContain("packageJson.exports['./browser']");
  });
});
