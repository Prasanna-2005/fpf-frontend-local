import './assets/main.css'
import './assets/css/custom.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import VueToast from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Import specific icons (example: user and cog)
import { faUser, faFileLines, faTrash, faSearch, faBars, faAngleDown,faAngleUp,faCloudArrowUp,faFile,faXmark,faDownload,faCheckDouble,faArrowLeft,faUpload,faUserPlus,faPen} from '@fortawesome/free-solid-svg-icons'

library.add(faUser,faFileLines,faTrash,faSearch,faBars,faAngleDown,faAngleUp,faCloudArrowUp,faFile,faXmark,faDownload,faCheckDouble,faArrowLeft,faUpload,faUserPlus,faPen)

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
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')
