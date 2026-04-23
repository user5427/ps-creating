import { Component, type ReactNode } from 'react'
import { Alert, Box, Button, Typography } from '@mui/material'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      return (
        <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body2">{this.state.error.message}</Typography>
          </Alert>
          <Button variant="contained" onClick={this.reset}>
            Try again
          </Button>
        </Box>
      )
    }
    return this.props.children
  }
}
