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
          try {
           const user_id=this.userID
           const toastInstance = toast.open({
                message: `
                  <div style="display:flex; flex-direction:column; gap:6px;">
                    <strong>Session expired</strong>
                    <div>You can stay logged in or log out.</div>
                    <div style="margin-top:8px; display:flex; gap:8px;">
                      <button id="stayBtn" class="btn btn-success btn-sm">Stay Logged In</button>
                      <button id="logoutBtn" class="btn btn-danger btn-sm">Logout</button>
                    </div>
                  </div>
                `,
                type: 'warning',
                duration: 0,
                dismissible: false,
              })

              setTimeout(() => {
                const stayBtn = document.getElementById('stayBtn')
                const logoutBtn = document.getElementById('logoutBtn')

                if (stayBtn) {
                  stayBtn.addEventListener('click', async () => {
                    try {
                      await api_call_methods.refresh_token(user_id)
                      await api_call_methods.verify_user(user_id)
                      toast.success("Session refreshed successfully!")
                      toastInstance.dismiss()
                    } catch (err) {
                      toast.error("Session refresh failed. Please login again.")
                      window.location.replace('/')
                    }
                  })
                }

                if (logoutBtn) {
                  logoutBtn.addEventListener('click', () => {
                    this.logout()
                    window.location.replace('/')
                  })
                }
              }, 50)

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
