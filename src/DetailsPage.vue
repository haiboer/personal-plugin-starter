<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
import { usePluginNavigation } from './navigation';
import './starter-style.css';

const open = usePluginNavigation();
</script>

<template>
  <ion-page>
    <ion-content class="starter-canvas">
      <main class="starter-layout">
        <h2 class="starter-section-title">业务子页</h2>
        <section class="starter-card" aria-label="业务子页说明">
          <div class="starter-row"><span class="starter-row-label">导航</span><span class="starter-row-value">独立与 Shell 共用页面</span></div>
          <div class="starter-row"><span class="starter-row-label">数据</span><span class="starter-row-value">经用户接口读取</span></div>
        </section>
        <button type="button" class="starter-action" @click="open('')">返回插件首页</button>
      </main>
    </ion-content>
  </ion-page>
</template>
