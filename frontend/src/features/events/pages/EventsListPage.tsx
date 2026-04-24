import { Box, Container, Typography } from '@mui/material'

export function EventsListPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box textAlign="center">
        <Typography variant="h1" gutterBottom>
          Events
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Loading catalog…
        </Typography>
      </Box>
    </Container>
  )
}
