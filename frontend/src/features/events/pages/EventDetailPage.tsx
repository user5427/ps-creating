import { Container, Typography } from '@mui/material'

export function EventDetailPage() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h2" gutterBottom>
        Event detail
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Coming in PR9.
      </Typography>
    </Container>
  )
}
