import { ref } from 'vue';

export const onlineStatus = ref('未知');
let active = false;

function refreshStatus(): void {
  onlineStatus.value = window.navigator.onLine ? '在线' : '离线';
}

export function startPluginResources(): void {
  if (active || typeof window === 'undefined') return;
  active = true;
  window.addEventListener('online', refreshStatus);
  window.addEventListener('offline', refreshStatus);
  refreshStatus();
}

export function stopPluginResources(): void {
  if (!active || typeof window === 'undefined') return;
  window.removeEventListener('online', refreshStatus);
  window.removeEventListener('offline', refreshStatus);
  active = false;
  onlineStatus.value = '未启用';
}
