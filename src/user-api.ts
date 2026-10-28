import type { AuthAdapter, BusinessIdentity } from './auth';

/** Plugin-owned data. The backend derives the owner from the verified credential. */
export interface CurrentUser { id: string; displayName: string; identity: BusinessIdentity }
export interface UserItem { id: string; title: string; updatedAt: string }
export interface UserApi {
  me(): Promise<CurrentUser>;
  myItems(): Promise<UserItem[]>;
  dispose(): void;
}

export class UserApiError extends Error {
  constructor(public readonly status: number, message: string) { super(message); }
}

export function createUserApi(auth: AuthAdapter, backendOrigin: string, fetcher: typeof fetch = fetch): UserApi {
  const origin = new URL(backendOrigin);
  if (origin.origin !== backendOrigin || origin.protocol !== 'https:') throw new Error('后台地址必须是 HTTPS 来源');
  const pending = new Set<AbortController>();
  let version = 0;
  let disposed = false;
  const abort = () => { version++; for (const controller of pending) controller.abort(); pending.clear(); };
  const unsubscribe = auth.onSessionChanged(abort);

  async function request<T>(path: '/v1/me' | '/v1/me/items', scope: 'profile.read' | 'items.read'): Promise<T> {
    if (disposed) throw new Error('用户接口已关闭');
    const epoch = version;
    const controller = new AbortController();
    pending.add(controller);
    try {
      const session = await auth.session();
      if (!session) throw new UserApiError(401, '请先登录');
      const token = await auth.getAccessToken(scope);
      if (disposed || epoch !== version) throw new Error('会话已变化');
      const response = await fetcher(`${origin.origin}${path}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        credentials: 'omit', cache: 'no-store', redirect: 'error', signal: controller.signal
      });
      if (disposed || epoch !== version) throw new Error('会话已变化');
      if (!response.ok) {
        const message = response.status === 401 ? '登录已过期' : response.status === 403 ? '没有访问权限' : '用户接口请求失败';
        throw new UserApiError(response.status, message);
      }
      const body = await response.json() as T;
      if (disposed || epoch !== version) throw new Error('会话已变化');
      return body;
    } finally { pending.delete(controller); }
  }

  return {
    me: () => request<CurrentUser>('/v1/me', 'profile.read'),
    myItems: () => request<UserItem[]>('/v1/me/items', 'items.read'),
    dispose() { if (disposed) return; disposed = true; abort(); unsubscribe(); }
  };
}
