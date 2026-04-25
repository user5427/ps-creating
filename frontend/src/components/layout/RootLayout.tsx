import { Box } from '@mui/material'
import { Outlet } from '@tanstack/react-router'
import { ErrorBoundary } from '../ErrorBoundary'
import { Footer } from './Footer'
import { TopNav } from './TopNav'

export function RootLayout() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopNav />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </Box>
      <Footer />
    </Box>
  )
}
