import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  const isLoggedIn = ref(false)

  const login = (userData, tokenValue) => {
    user.value = userData
    token.value = tokenValue
    isLoggedIn.value = true
    localStorage.setItem('token', tokenValue)
  }

  const logout = () => {
    user.value = null
    token.value = ''
    isLoggedIn.value = false
    localStorage.removeItem('token')
  }

  const updateProfile = (profileData) => {
    if (user.value) {
      user.value = { ...user.value, ...profileData }
    }
  }

  return {
    user,
    token,
    isLoggedIn,
    login,
    logout,
    updateProfile
  }
})