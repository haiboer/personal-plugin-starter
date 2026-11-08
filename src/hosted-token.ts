import type { PluginIdentityProvider } from '@personal/plugin-sdk';

/** Request only the token for the current reviewed plugin instance. */
export async function requestHostedToken(identity: PluginIdentityProvider | undefined, pluginId: string, signal?: AbortSignal): Promise<string> {
  const before = identity?.session();
  if (before?.state !== 'signed-in' || before.pluginId !== pluginId || !identity?.getHostedAccessToken) {
    throw new Error('Shell 托管授权尚未就绪');
  }
  const token = await identity.getHostedAccessToken(signal);
  const after = identity.session();
  if (signal?.aborted || after.state !== 'signed-in' || after.pluginId !== pluginId) {
    throw new DOMException('插件会话已变化', 'AbortError');
  }
  if (!token || /[\r\n]/.test(token)) throw new Error('Shell 插件凭证响应无效');
  return token;
}
