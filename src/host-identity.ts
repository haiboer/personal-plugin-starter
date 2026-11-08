import { ref } from 'vue';
import type { PluginContext, PluginIdentityProvider } from '@personal/plugin-sdk';
import { requestHostedToken } from './hosted-token';

export const shellSessionState = ref<'unavailable' | 'guest' | 'signed-in'>('unavailable');
let identity: PluginIdentityProvider | undefined;
let unsubscribe: (() => void) | undefined;
const pending = new Set<AbortController>();

function reset(): void {
  for (const controller of pending) controller.abort();
  pending.clear();
  shellSessionState.value = identity?.session().state ?? 'unavailable';
}

export function connectHostIdentity(context?: Pick<PluginContext, 'identity'>): void {
  disconnectHostIdentity();
  identity = context?.identity;
  unsubscribe = identity?.onChanged(reset);
  reset();
}

export function disconnectHostIdentity(): void {
  unsubscribe?.();
  unsubscribe = undefined;
  identity = undefined;
  reset();
}

/** A plugin backend still must exchange and verify this short-lived Shell credential. */
export async function hostedTokenFor(pluginId: string): Promise<string> {
  const provider = identity;
  const controller = new AbortController();
  pending.add(controller);
  try {
    const token = await requestHostedToken(provider, pluginId, controller.signal);
    if (controller.signal.aborted || provider !== identity) throw new DOMException('插件会话已变化', 'AbortError');
    return token;
  } finally { pending.delete(controller); }
}
