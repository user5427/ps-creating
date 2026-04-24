import { Container, Typography } from '@mui/material'

interface Props {
  mode: 'create' | 'edit'
}

export function EventFormPage({ mode }: Props) {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h2" gutterBottom>
        {mode === 'create' ? 'Create event' : 'Edit event'}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Loading form…
      </Typography>
    </Container>
  )
}
