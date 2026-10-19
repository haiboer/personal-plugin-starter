import { definePlugin } from '@personal/plugin-sdk';
import StarterPage from './StarterPage.vue';
import { manifest } from './manifest';

export const starterPlugin = definePlugin({
  manifest,
  menu: [{ label: '打开插件模板', route: `/p/${manifest.id}` }],
  routes: [{ path: '', title: '插件模板', component: StarterPage }],
  onEnable() { /* 可在这里初始化插件业务资源。 */ },
  onDisable() { /* 可在这里释放插件业务资源；不要删除用户数据。 */ }
});
