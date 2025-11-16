import { defineStore } from 'pinia'

let autoLogoutTimer = null   
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
    startAutoLogoutTimer() {
      if (!this.user?.expiry) return

      // Clear existing timer
      if (autoLogoutTimer) clearTimeout(autoLogoutTimer)

      const remaining = this.user.expiry - Date.now()

      if (remaining <= 0) {
        this.logout()
        return
      }

      autoLogoutTimer = setTimeout(() => {
        this.logout()
      }, remaining)
    },

    // --- RESTORE USER AFTER REFRESH ---
    restoreSession() {
      if (this.user?.expiry) {
        this.startAutoLogoutTimer()
      }
    },


    logout() {
      this.user = null
      this.isAuthenticated = false
    },

    setUser(data) {
      this.user = data
    }
  },

  getters: {
    username: (state) => state.user?.username || '',
    email: (state) => state.user?.email || '',
    role: (state) => state.user?.role || '',
    userID: (state) => state.user?.userID || '',
    expiry:(state)=>state.user?.expiry || '',
  },

  persist: true
})
