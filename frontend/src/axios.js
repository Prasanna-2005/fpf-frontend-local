import axios from 'axios'
import { useToast } from 'vue-toast-notification'

const API_BASE_URL = `/api/`;

const api = axios.create({
  baseURL: API_BASE_URL,
})

function getApiErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.detail ||
    error?.message ||
    'Something went wrong. Please try again.'
  )
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error?.config?.skipErrorToast) {
      try {
        const toast = useToast()
        toast.error(getApiErrorMessage(error))
        error.__toastShown = true
      } catch {
        // Toast plugin may be unavailable during early bootstrap
      }
    }
    return Promise.reject(error)
  }
)

export default api
