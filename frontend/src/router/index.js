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
    },
    { 
      path: '/reset',
      name: 'reset',
      component: ResetView,
      meta: { requiresAuth: true }
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/editing',
      name: 'editing',
      component: EditingView,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: { requiresAuth: true }
    },
    {
      path:'/preview',
      name:'preview',
      component: PreviewView,
      meta: { requiresAuth: true }
    }
  ],
})


// router.beforeEach((to, from, next) => {
//     const userStore = useUserStore()
//     if (to.meta.requiresAuth && !userStore.isAuthenticated) {
//         next('/') 
//     } else {
//         next()
//     }
// })

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // Route requires login
  if (to.meta.requiresAuth) {

    // Not logged in at all
    if (!userStore.isAuthenticated || !userStore.user?.expiry) {
      userStore.logout()
      return next("/")
    }

    // Session expired
    if (Date.now() > userStore.user.expiry) {
      userStore.logout()
      return next("/")
    }

    // Session OK → allow
    return next()
  }

  // Public route → allow
  next()
})

export default router
