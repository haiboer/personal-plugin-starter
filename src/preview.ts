import { createApp, h } from 'vue';
import { createRouter, createWebHistory, RouterView } from 'vue-router';
import { IonApp } from '@ionic/vue';
import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import { starterPlugin } from './index';

// Local preview exercises the plugin's actual routes and lifecycle. It does not emulate Shell authorization.
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: starterPlugin.routes.map((route) => ({
    path: route.path ? `/${route.path}` : '/',
    component: route.component
  }))
});
const app = createApp({ render: () => h(IonApp, null, { default: () => h(RouterView) }) });
app.use(router);
void router.isReady().then(async () => {
  await starterPlugin.onEnable?.();
  app.mount('#app');
});
window.addEventListener('pagehide', () => {
  void starterPlugin.onDisable?.();
}, { once: true });
