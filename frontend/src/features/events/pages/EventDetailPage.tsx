import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useNavigate, useParams } from '@tanstack/react-router'
import { format } from 'date-fns'
import { AxiosError } from 'axios'
import { selectVisibleRole, useAppStore } from '../../../store/appStore'
import { SoldOutChip } from '../components/SoldOutChip'
import { useEvent } from '../hooks'

export function EventDetailPage() {
  const { eventId } = useParams({ from: '/events/$eventId' })
  const role = useAppStore(selectVisibleRole)
  const actorId = useAppStore((s) => s.actorId)
  const token = useAppStore((s) => s.token)
  const user = useAppStore((s) => s.user)
  const navigate = useNavigate()
  const { data: event, isLoading, isError, error, refetch } = useEvent(eventId)
  const [quantity, setQuantity] = useState(1)

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
          {notFound ? 'Event not found.' : 'Failed to load event.'}
        </Alert>
      </Container>
    )
  }

  const startDate = format(new Date(event.startTime), 'EEEE, MMMM d, yyyy')
  const startTime = format(new Date(event.startTime), 'HH:mm')
  const endTime = format(new Date(event.endTime), 'HH:mm')
  const isOrganizer = role === 'ORGANIZER'
  const isOwner = role === 'ORGANIZER' && event.organizerId === actorId
  const maxSelectableTickets = Math.max(event.remainingSeats, 1)
  const boundedQuantity = Math.min(Math.max(quantity, 1), maxSelectableTickets)
  const isAuthenticated = !!token && !!user

  return (
    <>
      <Box
        sx={{
          height: { xs: 220, md: 360 },
          backgroundColor: '#F3F4F6',
          backgroundImage: event.imageUrl ? `url(${event.imageUrl})` : 'url(https://lapena.org/wp-content/plugins/events-calendar-pro/src/resources/images/tribe-event-placeholder-image.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={8}>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip label={event.category} color="primary" variant="outlined" size="small" />
              {event.soldOut && <SoldOutChip />}
            </Stack>
            <Typography variant="h1" gutterBottom>
              {event.title}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
              <Typography variant="body1">
                <strong>{startDate}</strong> · {startTime}–{endTime}
              </Typography>
              <Typography variant="body1" sx={{ display: { xs: 'none', sm: 'block' } }}>
                ·
              </Typography>
              <Typography variant="body1">{event.venue}</Typography>
            </Stack>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="h3" gutterBottom>
              About this event
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {event.description}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 3,
                position: { md: 'sticky' },
                top: { md: 100 },
              }}
            >
              <Typography variant="h2" sx={{ color: 'primary.main', mb: 1 }}>
                {event.price === 0 ? 'Free' : `€${event.price.toFixed(2)}`}
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                {event.soldOut
                  ? 'No tickets available'
                  : `${event.remainingSeats} of ${event.capacity} seats remaining`}
              </Typography>
              <Stack spacing={1.5}>
                <TextField
                  label="Quantity"
                  type="number"
                  value={boundedQuantity}
                  onChange={(e) => {
                    const parsed = Number(e.target.value)
                    if (!Number.isFinite(parsed)) return
                    const clamped = Math.min(Math.max(Math.trunc(parsed), 1), maxSelectableTickets)
                    setQuantity(clamped)
                  }}
                  disabled={event.soldOut}
                  fullWidth
                  size="small"
                  inputProps={{ min: 1, max: maxSelectableTickets, step: 1 }}
                />
                    {!isOrganizer && <Button
                          variant="contained"
                          size="large"
                          fullWidth
                          disabled={event.soldOut}
                          onClick={() => {
                            if (!isAuthenticated) {
                              navigate({
                                to: '/login',
                                search: { returnTo: `/events/${eventId}/checkout?quantity=${boundedQuantity}` },
                              })
                              return
                            }
                            navigate({
                                to: '/events/$eventId/checkout',
                                params: {eventId},
                                search: {quantity: boundedQuantity},
                            })
                          }}
                      >
                          {event.soldOut ? 'Sold out' :
                              event.price === 0 ? 'Claim for free'
                                  : 'Purchase ticket'}
                      </Button>}
                {isOwner && (
                  <Button
                    onClick={() =>
                      navigate({
                        to: '/events/$eventId/edit',
                        params: { eventId },
                        search: { returnTo: '/events/$eventId' },
                      })
                    }
                    variant="outlined"
                    size="large"
                    fullWidth
                  >
                    Edit event
                  </Button>
                )}
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}
