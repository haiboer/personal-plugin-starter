import { expect, test, vi } from 'vitest';
import { createUserApi } from '../src/user-api';
import type { AuthAdapter } from '../src/auth';

function auth(): { adapter: AuthAdapter; change(): void } {
  let listener = () => {};
  return {
    adapter: {
      async session() { return { identity: { source: 'shell' as const, subject: 'opaque-1' }, expiresAt: Date.now() + 60_000 }; },
      async getAccessToken(scope) { return `token-for-${scope}`; },
      onSessionChanged(callback) { listener = callback; return () => { listener = () => {}; }; },
      dispose() {}
    },
    change() { listener(); }
  };
}

test('uses a scoped credential only for the configured HTTPS backend', async () => {
  const current = auth();
  const fetcher = vi.fn(async () => new Response(JSON.stringify({ id: 'internal-1', displayName: '用户', identity: { source: 'shell', subject: 'opaque-1' } }), { status: 200 }));
  const api = createUserApi(current.adapter, 'https://plugin.example', fetcher);
  expect((await api.me()).id).toBe('internal-1');
  expect(fetcher).toHaveBeenCalledWith('https://plugin.example/v1/me', expect.objectContaining({
    headers: expect.objectContaining({ Authorization: 'Bearer token-for-profile.read' }),
    credentials: 'omit', cache: 'no-store', redirect: 'error'
  }));
  api.dispose();
  expect(() => createUserApi(current.adapter, 'https://plugin.example/elsewhere', fetcher)).toThrow();
  expect(() => createUserApi(current.adapter, 'http://plugin.example', fetcher)).toThrow();
});

test('reports authorization failure and drops results after account change', async () => {
  const current = auth();
  const denied = createUserApi(current.adapter, 'https://plugin.example', async () => new Response('', { status: 403 }));
  await expect(denied.myItems()).rejects.toMatchObject({ status: 403 });
  denied.dispose();

  let resolve!: (response: Response) => void;
  const pendingFetch = vi.fn(() => new Promise<Response>(done => { resolve = done; }));
  const api = createUserApi(current.adapter, 'https://plugin.example', pendingFetch);
  const pending = api.myItems();
  await vi.waitFor(() => expect(pendingFetch).toHaveBeenCalled());
  current.change();
  resolve(new Response('[]', { status: 200 }));
  await expect(pending).rejects.toThrow('会话已变化');
  api.dispose();
});
