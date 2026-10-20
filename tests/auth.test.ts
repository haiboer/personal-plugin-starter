import { describe, expect, it } from 'vitest';
import { createStandaloneAuthAdapter, createShellAuthAdapter, type IdentityProvider } from '../src/auth';

function provider(): { value: IdentityProvider; change(): void; resolve(token: string): void } {
  let changed = () => {};
  let resolve = (_token: { token: string; expiresAt: number }) => {};
  return {
    value: {
      async session() { return { subject: 'verified-subject', expiresAt: Date.now() + 60_000 }; },
      accessToken() { return new Promise(done => { resolve = done; }); },
      onChanged(listener) { changed = listener; return () => { changed = () => {}; }; }
    },
    change() { changed(); },
    resolve(token) { resolve({ token, expiresAt: Date.now() + 60_000 }); }
  };
}

describe('identity adapters', () => {
  it('keeps standalone and Shell identity sources separate', async () => {
    const own = provider(); const shell = provider();
    const ownAdapter = createStandaloneAuthAdapter(own.value);
    const shellAdapter = createShellAuthAdapter(shell.value);
    expect((await ownAdapter.session())?.identity).toEqual({ source: 'standalone', subject: 'verified-subject' });
    expect((await shellAdapter.session())?.identity).toEqual({ source: 'shell', subject: 'verified-subject' });
    ownAdapter.dispose(); shellAdapter.dispose();
  });
  it('discards credentials that arrive after account change and closes on disable', async () => {
    const current = provider(); const adapter = createShellAuthAdapter(current.value);
    const pending = adapter.getAccessToken('items.read');
    current.change(); current.resolve('old-token');
    await expect(pending).rejects.toThrow('会话已变化');
    adapter.dispose();
    await expect(adapter.getAccessToken('items.read')).rejects.toThrow('授权适配器已关闭');
  });
});
