import { Box, Container, Typography } from '@mui/material'

export default function App() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h1" component="h1" gutterBottom>
          Welcome to App
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Full-stack application with React, Spring Boot, PostgreSQL, Twilio, and Stripe
        </Typography>
      </Box>
    </Container>
  )
}
