import { defineStore } from 'pinia'
import { useToast } from 'vue-toast-notification'
import api_call_methods from '@/assets/api_calls/api_calls'
import { openActionToast } from '@/assets/utils/toastUtils'

const toast = useToast()
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
          try {
           const user_id=this.userID
           const toastInstance = openActionToast(toast, {
                title: 'Session expired',
                message: 'You can stay logged in or log out.',
                type: 'warning',
                duration: 0,
                dismissible: false,
                actions: [
                  {
                    id: 'stayBtn',
                    label: 'Stay Logged In',
                    variant: 'primary',
                    onClick: async () => {
                      try {
                        await api_call_methods.refresh_token(user_id)
                        await api_call_methods.verify_user(user_id)
                        toast.success('Session refreshed successfully')
                        toastInstance.dismiss()
                      } catch (err) {
                        toast.error('Session refresh failed. Please login again.')
                        window.location.replace('/')
                      }
                    },
                  },
                  {
                    id: 'logoutBtn',
                    label: 'Logout',
                    variant: 'danger',
                    onClick: () => {
                      this.logout()
                      window.location.replace('/')
                    },
                  },
                ],
              })

          } catch  {
            toast.info('Session expired. Please login again.')
            this.logout()
          }
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
