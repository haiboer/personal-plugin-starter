import { afterEach, expect, test, vi } from 'vitest';
import { connectHostNavigation, disconnectHostNavigation, showHostPage } from '../src/host-navigation';
import { requestHostedToken } from '../src/hosted-token';
import { connectHostIdentity, disconnectHostIdentity, hostedTokenFor, shellSessionState } from '../src/host-identity';
import type { PluginIdentityProvider, PluginIdentitySession } from '@personal/plugin-sdk';

afterEach(() => { disconnectHostNavigation(); disconnectHostIdentity(); });

test('only the current page can clear the Shell title and back action', () => {
  const clearFirst = vi.fn();
  const clearSecond = vi.fn();
  const setPage = vi.fn().mockReturnValueOnce(clearFirst).mockReturnValueOnce(clearSecond);
  connectHostNavigation({ navigation: { setPage } });
  const leaveFirst = showHostPage({ title: '列表' });
  const leaveSecond = showHostPage({ title: '详情', onBack: () => {} });
  expect(clearFirst).toHaveBeenCalledOnce();
  leaveFirst();
  expect(clearSecond).not.toHaveBeenCalled();
  leaveSecond();
  expect(clearSecond).toHaveBeenCalledOnce();
});

test('hosted token comes only from the current plugin host, not from a page supplied release', async () => {
  let state: PluginIdentitySession = { state: 'signed-in', pluginId: 'com.example.starter' };
  let changed = () => {};
  let resolve!: (value: string) => void;
  const getHostedAccessToken = vi.fn(() => new Promise<string>(done => { resolve = done; }));
  const identity: PluginIdentityProvider = {
    session: () => state,
    getAccessToken: async () => { throw Error('wrong identity mode'); },
    getHostedAccessToken,
    onChanged(listener) { changed = () => listener(state); return () => { changed = () => {}; }; }
  };
  connectHostIdentity({ identity });
  expect(shellSessionState.value).toBe('signed-in');
  await expect(requestHostedToken(identity, 'com.example.other')).rejects.toThrow('尚未就绪');
  const pending = hostedTokenFor('com.example.starter');
  expect(getHostedAccessToken).toHaveBeenCalledWith(expect.any(AbortSignal));
  state = { state: 'guest' }; changed(); resolve('late-token');
  await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  expect(shellSessionState.value).toBe('guest');
  await expect(hostedTokenFor('com.example.starter')).rejects.toThrow('尚未就绪');
});
