import type { PluginContext, PluginNavigationV1 } from '@personal/plugin-sdk';

let navigation: PluginNavigationV1 | undefined;
let clearCurrentPage: (() => void) | undefined;

/** Keep the bridge optional for older hosts and local preview. */
export function connectHostNavigation(context?: Pick<PluginContext, 'navigation'>): void {
  clearHostPage();
  navigation = context?.navigation;
}

export function showHostPage(state: { title?: string; onBack?: () => void | Promise<void> }): () => void {
  clearHostPage();
  const clear = navigation?.setPage(state);
  clearCurrentPage = clear;
  return () => {
    if (clearCurrentPage !== clear) return;
    clearHostPage();
  };
}

export function clearHostPage(): void {
  const clear = clearCurrentPage;
  clearCurrentPage = undefined;
  clear?.();
}

export function disconnectHostNavigation(): void {
  clearHostPage();
  navigation = undefined;
}
