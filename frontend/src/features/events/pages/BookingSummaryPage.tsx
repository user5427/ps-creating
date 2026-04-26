import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { format } from 'date-fns'
import { AxiosError } from 'axios'
import { useEvent } from '../hooks'

const TICKET_TYPE = 'General Admission'

function formatEuro(value: number) {
  return `EUR ${value.toFixed(2)}`
}

export function BookingSummaryPage() {
  const { eventId } = useParams({ from: '/events/$eventId/checkout' })
  const { quantity: requestedQuantity } = useSearch({ from: '/events/$eventId/checkout' })
  const navigate = useNavigate()
  const { data: event, isLoading, isError, error, refetch } = useEvent(eventId)

  if (isLoading) {
    return (
      <Container sx={{ py: 10, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (isError || !event) {
    const notFound = error instanceof AxiosError && error.response?.status === 404
    return (
      <Container maxWidth="md" sx={{ py: 10 }}>
        <Alert
          severity={notFound ? 'warning' : 'error'}
          action={
            notFound ? undefined : (
              <Button color="inherit" size="small" onClick={() => refetch()}>
                Retry
              </Button>
            )
          }
        >
          {notFound ? 'Event not found.' : 'Failed to load booking summary.'}
        </Alert>
      </Container>
    )
  }

  const startDate = format(new Date(event.startTime), 'EEEE, d MMMM yyyy')
  const maxSelectableTickets = Math.max(event.remainingSeats, 1)
  const quantity = Math.min(Math.max(requestedQuantity, 1), maxSelectableTickets)
  const quantityAdjusted = quantity !== requestedQuantity
  const totalAmount = event.price * quantity
  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Typography variant="h2" gutterBottom>
        Review your booking
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Confirm these details before you continue to payment.
      </Typography>
      {quantityAdjusted && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Ticket quantity was adjusted to match currently available seats.
        </Alert>
      )}

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <Box sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography color="text.secondary">Event</Typography>
              <Typography sx={{ textAlign: 'right', fontWeight: 600 }}>{event.title}</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography color="text.secondary">Date</Typography>
              <Typography sx={{ textAlign: 'right' }}>{startDate}</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography color="text.secondary">Venue</Typography>
              <Typography sx={{ textAlign: 'right' }}>{event.venue}</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography color="text.secondary">Ticket type</Typography>
              <Typography sx={{ textAlign: 'right' }}>{TICKET_TYPE}</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography color="text.secondary">Quantity</Typography>
              <Typography sx={{ textAlign: 'right' }}>{quantity}</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography color="text.secondary">Unit price</Typography>
              <Typography sx={{ textAlign: 'right' }}>
                {event.price === 0 ? 'Free' : formatEuro(event.price)}
              </Typography>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2.5 }} />

          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Typography variant="h6">Total amount</Typography>
            <Typography variant="h6">
              {totalAmount === 0 ? 'Free' : formatEuro(totalAmount)}
            </Typography>
          </Stack>
        </Box>
      </Paper>

      <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          size="large"
          onClick={() =>
            navigate({
              to: '/events/$eventId',
              params: { eventId },
            })
          }
          fullWidth
        >
          Back to event
        </Button>
        <Button variant="contained" size="large" fullWidth disabled={event.soldOut || quantity < 1}>
          Confirm payment
        </Button>
      </Stack>
    </Container>
  )
}
