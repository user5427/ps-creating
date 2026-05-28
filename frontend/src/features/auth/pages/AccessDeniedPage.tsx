import { Box, Button, Container, Typography } from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import { defaultEventsSearch } from '../../../router'

export function AccessDeniedPage() {
  const navigate = useNavigate()

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h3" fontWeight={700} mb={2}>
            Access Denied
          </Typography>
          <Typography variant="body1" color="textSecondary" mb={4}>
            You don't have permission to access this page. Your account role may not have the required permissions.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate({ to: '/events', search: defaultEventsSearch })}
          >
            Back to Events
          </Button>
        </Box>
      </Box>
    </Container>
  )
}

