import axios from 'axios'
import { useAppStore } from '../store/appStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Dev-only: attach the current actor's UUID on every request so the backend's
// ActorInterceptor can resolve the acting user. Disabled in production builds
// so real auth isn't bypassed by a fake header.
if (import.meta.env.DEV) {
  apiClient.interceptors.request.use((config) => {
    const actorId = useAppStore.getState().actorId
    if (actorId) {
      config.headers = config.headers ?? {}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(config.headers as any)['X-Actor-Id'] = actorId
    }
    return config
  })
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // eslint-disable-next-line no-console
    console.error('API Error:', error)
    return Promise.reject(error)
  },
)

// Attach Authorization header when token is present in the app store
apiClient.interceptors.request.use((config) => {
  // cast to any to avoid circular-type resolution issues in TS
  const token = (useAppStore.getState() as any).token
  if (token) {
    config.headers = config.headers ?? {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(config.headers as any)['Authorization'] = `Bearer ${token}`
  }
  return config
})

export default apiClient
