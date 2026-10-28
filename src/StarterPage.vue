<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
import { manifest } from './manifest';
import { usePluginNavigation } from './navigation';
import { onlineStatus } from './plugin-resources';

const open = usePluginNavigation();
import './starter-style.css';
</script>

<template>
  <ion-page>
    <ion-content class="starter-canvas">
      <main class="starter-layout">
        <p class="starter-intro">这里是插件业务区域。接入 Shell 后，平台在上方绘制固定导航。</p>
        <h2 class="starter-section-title">插件信息</h2>
        <section class="starter-card" aria-label="插件信息">
          <div class="starter-row"><span class="starter-row-label">名称</span><span class="starter-row-value">{{ manifest.name }}</span></div>
          <div class="starter-row"><span class="starter-row-label">版本</span><span class="starter-row-value">{{ manifest.version }}</span></div>
          <div class="starter-row"><span class="starter-row-label">资源状态</span><span class="starter-row-value">{{ onlineStatus }}</span></div>
        </section>
        <h2 class="starter-section-title">用户与数据</h2>
        <section class="starter-card" aria-label="用户与数据">
          <div class="starter-row"><span class="starter-row-label">当前用户</span><span class="starter-row-value">需接入身份适配器</span></div>
          <div class="starter-row"><span class="starter-row-label">我的数据</span><span class="starter-row-value">需接入插件后台</span></div>
        </section>
        <p class="starter-intro">独立预览不会创建真实账号或伪造平台授权。接入方法见开发指南。</p>
        <button type="button" class="starter-action" @click="open('details')">查看业务子页</button>
      </main>
    </ion-content>
  </ion-page>
</template>
