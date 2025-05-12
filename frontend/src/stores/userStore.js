import { defineStore } from 'pinia'

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
    role: (state) => state.user?.role || '',
    userID: (state) => state.user?.userID || '',
    access_token:(state) => state.user?.access_token || '',
    refresh_token:(state) => state.user?.refresh_token || '',
  }
})
