import { useQuery } from '@tanstack/react-query'
import apiClient from '../api/client'

export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await apiClient.get('/health')
      return response.data
    },
  })
}
