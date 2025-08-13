import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import ResetView from '@/views/ResetView.vue'
import HomeView from '@/views/HomeView.vue'
import EditingView from '@/views/EditingView.vue'
import AdminView from '@/views/AdminView.vue'
import PreviewView from '@/views/PreviewView.vue'

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
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/editing',
      name: 'editing',
      component: EditingView,
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
    },
    {
      path:'/preview',
      name:'preview',
      component: PreviewView
    }
  ],
})

export default router
