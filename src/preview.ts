import { createApp, h, computed } from 'vue';
import { createRouter, createWebHistory, RouterView } from 'vue-router';
import { IonApp } from '@ionic/vue';
import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import { starterPlugin } from './index';
import './preview-style.css';

// Local preview exercises the plugin's actual routes and lifecycle. It does not emulate Shell authorization.
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: starterPlugin.routes.map((route) => ({
    path: route.path ? `/${route.path}` : '/',
    component: route.component,
    meta: { title: route.title }
  }))
});
const app = createApp({
  setup() {
    const title = computed(() => String(router.currentRoute.value.meta.title ?? starterPlugin.manifest.name));
    return () => h(IonApp, { class: 'standalone-preview' }, { default: () => [
      h('header', { class: 'preview-topbar', 'aria-label': '独立预览顶部导航' }, [
        h('button', { type: 'button', 'aria-label': '返回', onClick: () => void router.push('/') }, '‹'),
        h('strong', title.value),
        h('button', { type: 'button', 'aria-label': '更多', onClick: () => window.alert('独立预览：平台管理菜单由 Shell 提供') }, '⋯'),
        h('button', { type: 'button', 'aria-label': '关闭', onClick: () => void router.push('/') }, '×')
      ]),
      h(RouterView)
    ] });
  }
});
app.use(router);
void router.isReady().then(async () => {
  await starterPlugin.onEnable?.();
  app.mount('#app');
});
window.addEventListener('pagehide', () => {
  void starterPlugin.onDisable?.();
}, { once: true });
