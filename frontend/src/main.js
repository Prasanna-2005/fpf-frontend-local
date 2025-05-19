import './assets/main.css'
import './assets/css/custom.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap'; 
import VueToast from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueToast, {
    position: 'top-right',
    duration: 10000,
  })

app.mount('#app')
