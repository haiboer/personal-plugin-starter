import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: { entry: 'src/shell-entry.ts', formats: ['es'], fileName: () => 'shell-entry.js' },
    rollupOptions: { external: ['vue', 'vue-router', '@ionic/vue', '@personal/plugin-sdk', '@personal/core'] }
  }
});
