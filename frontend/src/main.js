import './assets/main.css'
import './assets/css/custom.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap'; 
import VueToast from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'



import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(router)
app.use(VueToast, {
    position: 'top-right',
    duration: 10000,
  })

app.mount('#app')
