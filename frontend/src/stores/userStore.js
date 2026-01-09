import { defineStore } from 'pinia'
import { useToast } from 'vue-toast-notification'
import api_call_methods from '@/assets/api_calls/api_calls'
const toast=useToast()
let sessionInterval=null   
export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isAuthenticated: false, 
  }),

  actions: {
    login(userData) {
      this.user = userData
      this.isAuthenticated = true
    },
    startSessionPolling() {
      if (sessionInterval) {
        return
      }

      sessionInterval = setInterval(async () => {
        try {
          if (!this.userID) return
          await api_call_methods.verify_user(this.userID)
        } 
        catch{
          toast.info('Session expired. Please login again.')
          this.logout()
          window.location.replace('/')
        }
      }, 5 * 60 * 1000) // every 5 min
    },

    logout() {
      this.user = null
      this.isAuthenticated = false
      clearInterval(sessionInterval)
      sessionInterval = null
    },

    setUser(data) {
      this.user = data
      this.isAuthenticated = true

    }
  },

  getters: {
    username: (state) => state.user?.username || '',
    email: (state) => state.user?.email || '',
    role: (state) => state.user?.role || '',
    userID: (state) => state.user?.userID || '',
    expiry:(state)=>state.user?.expiry || '',
    clientCode: (state)=>state.user?.clientCode || '',
    
  },

  persist: true
})
