import { createApp, h } from 'vue';
import { IonApp } from '@ionic/vue';
import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import StarterPage from './StarterPage.vue';

// Local UI preview only. Shell navigation, identity, entitlement and capabilities are absent.
createApp({ render: () => h(IonApp, null, { default: () => h(StarterPage) }) }).mount('#app');
