import { Alert, AlertTitle } from '@mui/material'
import type { AxiosError } from 'axios'

interface ApiErrorViewProps {
  error: unknown
}

export function ApiErrorView({ error }: ApiErrorViewProps) {
  const axiosError = error as AxiosError
  const status = axiosError?.response?.status
  const message = (axiosError?.response?.data as any)?.message || axiosError?.message

  if (!axiosError) {
    return (
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        An unexpected error occurred. Please try again.
      </Alert>
    )
  }

  if (status === 403) {
    return (
      <Alert severity="warning">
        <AlertTitle>Access Denied</AlertTitle>
        You don't have permission to perform this action. This action may require a different user role.
        {message && ` (${message})`}
      </Alert>
    )
  }

  if (status === 401) {
    return (
      <Alert severity="error">
        <AlertTitle>Session Expired</AlertTitle>
        Your session has expired. Please log in again to continue.
      </Alert>
    )
  }

  if (status === 404) {
    return (
      <Alert severity="warning">
        <AlertTitle>Not Found</AlertTitle>
        The requested resource was not found.
        {message && ` (${message})`}
      </Alert>
    )
  }

  if (status && status >= 500) {
    return (
      <Alert severity="error">
        <AlertTitle>Server Error</AlertTitle>
        A server error occurred. Please try again later.
        {message && ` (${message})`}
      </Alert>
    )
  }

  return (
    <Alert severity="error">
      <AlertTitle>Error</AlertTitle>
      {message || 'An error occurred. Please try again.'}
    </Alert>
  )
}

