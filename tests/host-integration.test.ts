import { afterEach, expect, test, vi } from 'vitest';
import { connectHostNavigation, disconnectHostNavigation, showHostPage } from '../src/host-navigation';
import { requestHostedToken } from '../src/hosted-token';

afterEach(() => disconnectHostNavigation());

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

test('hosted token request uses same-origin session and registered release only', async () => {
  const fetcher = vi.fn(async () => new Response(JSON.stringify({ access_token: 'example', token_type: 'Bearer', expires_in: 300 })));
  const result = await requestHostedToken({ pluginId: 'com.example.starter', releaseId: 'reviewed-release' }, fetcher);
  expect(result.expires_in).toBe(300);
  expect(fetcher).toHaveBeenCalledWith('/api/v1/hosted-plugin-access-tokens', expect.objectContaining({
    method: 'POST', credentials: 'same-origin', redirect: 'error',
    body: JSON.stringify({ plugin_id: 'com.example.starter', release_id: 'reviewed-release' })
  }));
  await expect(requestHostedToken({ pluginId: 'com.example.starter', releaseId: 'reviewed-release' },
    async () => new Response('', { status: 403 }))).rejects.toMatchObject({ status: 403 });
  await expect(requestHostedToken({ pluginId: 'com.example.starter', releaseId: 'reviewed-release' },
    async () => new Response(JSON.stringify({ token: 'wrong-field' })))).rejects.toThrow('响应无效');
});
