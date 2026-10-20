import { useRouter, type Router } from 'vue-router';
import { manifest } from './manifest';
import { pluginPath } from './navigation-path';

export function navigatePlugin(router: Router, relativePath: string): Promise<unknown> {
  return router.push(pluginPath(router.currentRoute.value.path, relativePath, manifest.id));
}

export function usePluginNavigation(): (relativePath: string) => Promise<unknown> {
  const router = useRouter();
  return (relativePath) => navigatePlugin(router, relativePath);
}
