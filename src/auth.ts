/** Business code consumes this interface and never reads Shell cookies or storage. */
export interface BusinessIdentity { source: 'standalone' | 'shell'; subject: string }
export interface AuthSession { identity: BusinessIdentity; expiresAt: number }
export interface AuthAdapter {
  session(): Promise<AuthSession | null>;
  getAccessToken(scope: string): Promise<string>;
  onSessionChanged(listener: () => void): () => void;
  dispose(): void;
}
export interface IdentityProvider {
  session(signal: AbortSignal): Promise<{ subject: string; expiresAt: number } | null>;
  accessToken(scope: string, signal: AbortSignal): Promise<{ token: string; expiresAt: number }>;
  onChanged(listener: () => void): () => void;
}

function createAdapter(source: BusinessIdentity['source'], provider: IdentityProvider): AuthAdapter {
  const pending = new Set<AbortController>();
  const listeners = new Set<() => void>();
  let version = 0;
  let disposed = false;
  const reset = () => { version++; for (const controller of pending) controller.abort(); pending.clear(); for (const listener of listeners) listener(); };
  const unsubscribe = provider.onChanged(reset);
  async function guarded<T>(call: (signal: AbortSignal) => Promise<T>): Promise<T> {
    if (disposed) throw new Error('授权适配器已关闭');
    const epoch = version;
    const controller = new AbortController();
    pending.add(controller);
    try {
      const result = await call(controller.signal);
      if (disposed || epoch !== version || controller.signal.aborted) throw new Error('会话已变化');
      return result;
    } finally { pending.delete(controller); }
  }
  return {
    async session() {
      const value = await guarded(signal => provider.session(signal));
      return value ? { identity: { source, subject: value.subject }, expiresAt: value.expiresAt } : null;
    },
    async getAccessToken(scope) {
      if (!/^[a-z][a-z0-9.:_-]*$/.test(scope)) throw new Error('无效权限范围');
      const value = await guarded(signal => provider.accessToken(scope, signal));
      if (!value.token || !Number.isFinite(value.expiresAt) || value.expiresAt <= Date.now()) throw new Error('授权已过期');
      return value.token;
    },
    onSessionChanged(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    dispose() { if (disposed) return; disposed = true; reset(); unsubscribe(); listeners.clear(); }
  };
}

/** Implement provider with the standalone product's own login service. No development identity is created implicitly. */
export function createStandaloneAuthAdapter(provider: IdentityProvider): AuthAdapter { return createAdapter('standalone', provider); }

/** Shell host supplies this capability after plugin instance and entitlement checks. */
export function createShellAuthAdapter(hostProvider: IdentityProvider): AuthAdapter { return createAdapter('shell', hostProvider); }
