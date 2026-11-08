/** Shell-hosted identity is opt-in. The plugin backend must verify this token before use. */
export interface HostedTokenRequest { pluginId: string; releaseId: string; signal?: AbortSignal }
export interface HostedTokenResponse { access_token: string; token_type: 'Bearer'; expires_in: number }

export class HostedTokenError extends Error {
  constructor(readonly status: number) { super(status === 401 ? 'Shell 登录已失效' : status === 403 ? '未获插件使用资格' : 'Shell 授权暂不可用'); }
}

/** Use only when the platform has registered this plugin for the hosted identity mode. */
export async function requestHostedToken(
  request: HostedTokenRequest,
  fetcher: typeof fetch = fetch
): Promise<HostedTokenResponse> {
  if (!request.pluginId || !request.releaseId) throw new Error('缺少已登记的插件或发布标识');
  const response = await fetcher('/api/v1/hosted-plugin-access-tokens', {
    method: 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
    redirect: 'error',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ plugin_id: request.pluginId, release_id: request.releaseId }),
    signal: request.signal
  });
  if (!response.ok) throw new HostedTokenError(response.status);
  const value: unknown = await response.json();
  if (!value || typeof value !== 'object') throw new Error('Shell 授权响应无效');
  const token = value as Partial<HostedTokenResponse>;
  if (typeof token.access_token !== 'string' || !token.access_token || token.token_type !== 'Bearer' ||
      typeof token.expires_in !== 'number' || !Number.isFinite(token.expires_in) || token.expires_in <= 0) {
    throw new Error('Shell 授权响应无效');
  }
  return { access_token: token.access_token, token_type: token.token_type, expires_in: token.expires_in };
}
