#!/usr/bin/env bun

import { BUILTIN_MODULES } from '../../../../src/modules/generated.ts';

const problems: string[] = [];
const moduleNames = new Set<string>();
const fullActionNames = new Set<string>();
let actionCount = 0;
let getActionCount = 0;

for (const module of BUILTIN_MODULES) {
  if (moduleNames.has(module.name)) problems.push(`duplicate module: ${module.name}`);
  moduleNames.add(module.name);
  if (!/^[a-z][A-Za-z0-9]*$/.test(module.name)) {
    problems.push(`invalid module name: ${module.name}; use a lower camelCase name without hyphens`);
  }

  const actionNames = new Set<string>();
  for (const action of module.actions) {
    actionCount += 1;
    const fullName = `${module.name}-${action.name}`;

    if (actionNames.has(action.name)) problems.push(`duplicate action: ${fullName}`);
    actionNames.add(action.name);
    if (fullActionNames.has(fullName)) problems.push(`duplicate full action name: ${fullName}`);
    fullActionNames.add(fullName);

    if (!/^[a-z][A-Za-z0-9]*$/.test(action.name)) {
      problems.push(`invalid action name: ${fullName}; use a lower camelCase action name without hyphens`);
    }

    if (action.method?.toLowerCase() !== 'get') continue;
    getActionCount += 1;
    if (!('resultGetter' in action)
      || typeof action.resultGetter !== 'string'
      || action.resultGetter.trim() === '') {
      problems.push(`missing resultGetter: ${fullName} (${action.path})`);
    }
  }
}

if (problems.length > 0) {
  console.error(`Registry audit failed with ${problems.length} problem(s):`);
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(
  `Registry audit passed: ${moduleNames.size} modules, ${actionCount} actions, `
  + `${getActionCount} GET actions; <moduleName>-<actionName> values are unique `
  + 'and every GET has resultGetter.',
);
