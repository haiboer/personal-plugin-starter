<script setup lang="ts">
import { IonButton, IonContent, IonPage } from '@ionic/vue';
import { manifest } from './manifest';
import { usePluginNavigation } from './navigation';
import { onlineStatus } from './plugin-resources';

const open = usePluginNavigation();
</script>

<template>
  <ion-page>
    <ion-content class="ion-padding">
      <main class="starter-page">
        <h1>{{ manifest.name }}</h1>
        <p>这里是插件开发者可自由设计的业务区域。</p>
        <p>插件资源状态：{{ onlineStatus }}</p>
        <ion-button @click="open('details')">查看详情</ion-button>
      </main>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.starter-page { max-width: 720px; margin: 0 auto; padding: 24px 8px; }
.starter-page h1 { font-size: 24px; }
</style>
