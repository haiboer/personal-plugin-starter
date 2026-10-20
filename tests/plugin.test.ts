import { afterEach, expect, test, vi } from 'vitest';
import { starterPlugin } from '../src/index';
import { pluginPath } from '../src/navigation-path';

afterEach(() => vi.unstubAllGlobals());

test('plugin routes, menu and shared navigation paths', () => {
  expect(starterPlugin.routes.map(({ path }) => path)).toEqual(['', 'details']);
  expect(starterPlugin.menu.map(({ route }) => route)).toEqual([
    `/p/${starterPlugin.manifest.id}`,
    `/p/${starterPlugin.manifest.id}/details`
  ]);
  expect(pluginPath('/', 'details', starterPlugin.manifest.id)).toBe('/details');
  expect(pluginPath('/details', '', starterPlugin.manifest.id)).toBe('/');
  expect(pluginPath(`/p/${starterPlugin.manifest.id}`, 'details', starterPlugin.manifest.id)).toBe(`/p/${starterPlugin.manifest.id}/details`);
  expect(pluginPath(`/p/${starterPlugin.manifest.id}/details`, '', starterPlugin.manifest.id)).toBe(`/p/${starterPlugin.manifest.id}`);
  expect(() => pluginPath('/', '../admin', starterPlugin.manifest.id)).toThrow();
});

test('enable registers and disable cleans up plugin resources', async () => {
  const addEventListener = vi.fn();
  const removeEventListener = vi.fn();
  vi.stubGlobal('window', { navigator: { onLine: true }, addEventListener, removeEventListener });
  await starterPlugin.onEnable?.();
  await starterPlugin.onEnable?.();
  expect(addEventListener.mock.calls.map(([type]) => type)).toEqual(['online', 'offline']);
  await starterPlugin.onDisable?.();
  expect(removeEventListener.mock.calls).toEqual(addEventListener.mock.calls);
});
