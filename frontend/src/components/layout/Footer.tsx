import { Box, Container, Divider, Stack, Typography } from '@mui/material'

export function Footer() {
  return (
    <Box component="footer" sx={{ mt: 10, py: 6, backgroundColor: '#FAFAFA' }}>
      <Container maxWidth="lg">
        <Divider sx={{ mb: 4 }} />
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={4}
          justifyContent="space-between"
        >
          <Stack spacing={1}>
            <Typography variant="h6">eventingg</Typography>
            <Typography variant="body2">
              Direct event ticketing for organizers and attendees.
            </Typography>
          </Stack>
          <Stack direction="row" spacing={6}>
            <Stack spacing={1}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Explore
              </Typography>
              <Typography variant="body2">Events</Typography>
              <Typography variant="body2">Calendar</Typography>
              <Typography variant="body2">Pricing</Typography>
            </Stack>
            <Stack spacing={1}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Company
              </Typography>
              <Typography variant="body2">About</Typography>
              <Typography variant="body2">Contact</Typography>
              <Typography variant="body2">Privacy</Typography>
            </Stack>
          </Stack>
        </Stack>
        <Typography variant="body2" sx={{ mt: 6, color: 'text.secondary' }}>
          © {new Date().getFullYear()} PSK team · VU MIF · Coursework project
        </Typography>
      </Container>
    </Box>
  )
}
