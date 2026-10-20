import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from 'vitest';
import manifestJson from '../plugin-manifest.json';
import { starterPlugin } from '../src/index';

function consistencyErrors(json: typeof manifestJson): string[] {
  const errors: string[] = [];
  for (const key of ['id', 'name', 'version', 'description'] as const) {
    if (json[key] !== starterPlugin.manifest[key]) errors.push(`${key} differs`);
  }
  const runtimeRoutes = starterPlugin.routes.map(({ path, title }) => ({ path, title }));
  if (JSON.stringify(json.routes) !== JSON.stringify(runtimeRoutes)) errors.push('routes differ');
  const prefix = `/p/${json.id}`;
  const runtimeMenu = starterPlugin.menu.map(({ label, route }) => ({
    label,
    route: route === prefix ? '' : route.startsWith(`${prefix}/`) ? route.slice(prefix.length + 1) : `INVALID:${route}`
  }));
  if (JSON.stringify(json.menu) !== JSON.stringify(runtimeMenu)) errors.push('menu differs');
  if (json.entry.shell !== './dist/shell-entry.js') errors.push('entry.shell is not the configured plugin output');
  else {
    const entry = resolve(import.meta.dirname, '..', json.entry.shell);
    if (!existsSync(entry) || statSync(entry).size === 0) errors.push('entry.shell is missing or empty');
  }
  return errors;
}

test('submission manifest matches the actual plugin and build output', () => {
  expect(consistencyErrors(manifestJson)).toEqual([]);
});

test('inconsistent identity and routes are rejected', () => {
  expect(consistencyErrors({ ...manifestJson, id: 'com.example.other' })).toContain('id differs');
  expect(consistencyErrors({ ...manifestJson, routes: [{ path: '', title: 'Wrong' }] })).toContain('routes differ');
});
