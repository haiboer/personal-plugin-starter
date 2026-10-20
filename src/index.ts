import { definePlugin } from '@personal/plugin-sdk';
import StarterPage from './StarterPage.vue';
import DetailsPage from './DetailsPage.vue';
import { manifest } from './manifest';
import { startPluginResources, stopPluginResources } from './plugin-resources';

export const starterPlugin = definePlugin({
  manifest,
  menu: [
    { label: '打开插件模板', route: `/p/${manifest.id}` },
    { label: '查看详情', route: `/p/${manifest.id}/details` }
  ],
  routes: [
    { path: '', title: '插件模板', component: StarterPage },
    { path: 'details', title: '示例详情', component: DetailsPage }
  ],
  onEnable: startPluginResources,
  onDisable: stopPluginResources
});
