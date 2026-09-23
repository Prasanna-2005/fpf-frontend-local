import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import ResetView from '@/views/ResetView.vue'
import HomeView from '@/views/HomeView.vue'
import EditingView from '@/views/EditingView.vue'
import AdminView from '@/views/AdminView.vue'
import PreviewView from '@/views/PreviewView.vue'
import CompareView from '@/views/CompareView.vue'
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
        title: 'Home-FormPf',
        roles: ['contributor','approver'],
     }
    },
    {
      path: '/editing',
      name: 'editing',
      component: EditingView,
      meta: { 
        requiresAuth: true,
        title: 'Editor-FormPf',
        roles: ['contributor','approver'],
       }
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: { 
        requiresAuth: true,
        title: 'Admin-FormPf',
        roles: ['admin'],
       }
    },
    {
      path:'/preview',
      name:'preview',
      component: PreviewView,
      meta: { 
        requiresAuth: true,
        title: 'Preview-FormPf',
        roles: ['contributor','approver'],
       }
    },
    {
      path:'/compare',
      name:'compare',
      component: CompareView,
      meta: { 
        requiresAuth: true,
        title: 'Compare-FormPf',
        roles: ['contributor','approver'],
       }
    }
  ],
})


router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'FormPF'

  const userStore = useUserStore()

  // 1️⃣ Not logged in
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    return next('/')
  }

  // 2️⃣ Role restricted route
  if (to.meta.roles && !to.meta.roles.includes(userStore.role)) {
    // redirect based on role
    if (userStore.role === 'admin') {
      return next('/admin')
    }
    return next('/home')
  }

  next()
})



export default router
