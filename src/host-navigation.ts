/** Optional navigation bridge supplied by a compatible Shell host. */
export interface HostNavigation {
  setPage(state: { title?: string; onBack?: () => void | Promise<void> }): () => void;
}

let navigation: HostNavigation | undefined;
let clearCurrentPage: (() => void) | undefined;

/** The bundled SDK is a snapshot; keep the bridge optional for older hosts and local preview. */
export function connectHostNavigation(context?: { navigation?: HostNavigation }): void {
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
