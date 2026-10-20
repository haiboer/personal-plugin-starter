<script setup lang="ts">
import { IonButton, IonContent, IonPage } from '@ionic/vue';
import { usePluginNavigation } from './navigation';

const open = usePluginNavigation();
</script>

<template>
  <ion-page>
    <ion-content class="ion-padding">
      <main class="starter-page">
        <h1>示例详情</h1>
        <p>独立网页和 Shell 插件共用此业务页面。</p>
        <ion-button @click="open('')">返回插件首页</ion-button>
      </main>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.starter-page { max-width: 720px; margin: 0 auto; padding: 24px 8px; }
</style>
