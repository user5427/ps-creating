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
  Typography,
} from '@mui/material'
import { useNavigate, useParams } from '@tanstack/react-router'
import { format } from 'date-fns'
import { useAppStore } from '../../../store/appStore'
import { SoldOutChip } from '../components/SoldOutChip'
import { useEvent } from '../hooks'

export function EventDetailPage() {
  const { eventId } = useParams({ from: '/events/$eventId' })
  const role = useAppStore((s) => s.role)
  const actorId = useAppStore((s) => s.actorId)
  const navigate = useNavigate()
  const { data: event, isLoading, isError, refetch } = useEvent(eventId)

  if (isLoading) {
    return (
      <Container sx={{ py: 10, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (isError || !event) {
    return (
      <Container maxWidth="md" sx={{ py: 10 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Event not found.
        </Alert>
      </Container>
    )
  }

  const startDate = format(new Date(event.startTime), 'EEEE, MMMM d, yyyy')
  const startTime = format(new Date(event.startTime), 'HH:mm')
  const endTime = format(new Date(event.endTime), 'HH:mm')
  const isOwner = role === 'ORGANIZER' && event.organizerId === actorId

  return (
    <>
      <Box
        sx={{
          height: { xs: 220, md: 360 },
          backgroundColor: '#F3F4F6',
          backgroundImage: event.imageUrl ? `url(${event.imageUrl})` : 'none',
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
              <Typography variant="body1">·</Typography>
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
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={event.soldOut}
                >
                  {event.soldOut ? 'Sold out' : 'Purchase ticket'}
                </Button>
                {isOwner && (
                  <Button
                    onClick={() =>
                      navigate({
                        to: '/events/$eventId/edit',
                        params: { eventId: event.id },
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
