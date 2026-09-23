import './assets/main.css'
import './assets/css/custom.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import VueToast from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
import './assets/css/toast-theme.css'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Import specific icons (example: user and cog)
import { faUser, faFileLines, faTrash, faSearch, faBars, faAngleDown,faAngleUp,faCloudArrowUp,faFilePdf,faXmark,faDownload,faCheckDouble,faArrowLeft,faUpload,faUserPlus,faPen,faRotateLeft,faFloppyDisk,faFileExcel,faFileArchive,faCopy,faCheckCircle,faCheck,faEye,faArrowDown,faArrowUp,faArrowRight,faEyeSlash,faInfoCircle,faCalculator,faClockRotateLeft, faFile, faTableCells, faChartLine, faFolderPlus, faGear, faRightFromBracket, faAngleLeft, faAngleRight, faLock, faCircle, faFilter, faPaperPlane, faEnvelope, faAnglesLeft, faAnglesRight, faTriangleExclamation, faCodeCompare, faBell} from '@fortawesome/free-solid-svg-icons'

library.add(faUser,faFileLines,faTrash,faSearch,faBars,faAngleDown,faAngleUp,faCloudArrowUp,faFilePdf,faXmark,faDownload,faCheckDouble,faArrowLeft,faUpload,faUserPlus,faPen,faRotateLeft,faFloppyDisk,faFileExcel,faFileArchive,faCopy,faCheckCircle,faCheck,faEye,faArrowDown,faArrowUp,faArrowRight,faEyeSlash,faInfoCircle,faCalculator,faClockRotateLeft, faFile, faTableCells, faChartLine, faFolderPlus, faGear, faRightFromBracket, faAngleLeft, faAngleRight, faLock, faCircle, faFilter, faPaperPlane, faEnvelope, faAnglesLeft, faAnglesRight, faTriangleExclamation, faCodeCompare, faBell)

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
  duration: 4500,
  dismissible: true,
  pauseOnHover: true,
})
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')
