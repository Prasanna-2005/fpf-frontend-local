import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import ResetView from '@/views/ResetView.vue'
import HomeView from '@/views/HomeView.vue'
import EditingView from '@/views/EditingView.vue'
import AdminView from '@/views/AdminView.vue'
import PreviewView from '@/views/PreviewView.vue'
import { useUserStore } from '@/stores/userStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
      meta: { title: 'Login-FormPf' }
    },
    { 
      path: '/reset',
      name: 'reset',
      component: ResetView,
      meta: { 
        requiresAuth: true,
        title: 'Reset-FormPf'
       }
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: {  
        requiresAuth: true,
        title: 'Home-FormPf'
     }
    },
    {
      path: '/editing',
      name: 'editing',
      component: EditingView,
      meta: { 
        requiresAuth: true,
        title: 'Editor-FormPf'
       }
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: { 
        requiresAuth: true,
        title: 'Admin-FormPf'
       }
    },
    {
      path:'/preview',
      name:'preview',
      component: PreviewView,
      meta: { 
        requiresAuth: true,
        title: 'Preview-FormPf'
       }
    }
  ],
})


router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'FormPF'
    const userStore = useUserStore()
    if (to.meta.requiresAuth && !userStore.isAuthenticated) {
        next('/') 
    } else {
        next()
    }
})



export default router
