import axios from 'axios'
import { useAppStore } from '../store/appStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Dev-only: attach the current actor's UUID on every request.
// The backend's ActorInterceptor consumes it; real auth replaces this later.
apiClient.interceptors.request.use((config) => {
  const actorId = useAppStore.getState().actorId
  if (actorId) {
    config.headers.set('X-Actor-Id', actorId)
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // eslint-disable-next-line no-console
    console.error('API Error:', error)
    return Promise.reject(error)
  },
)

export default apiClient
