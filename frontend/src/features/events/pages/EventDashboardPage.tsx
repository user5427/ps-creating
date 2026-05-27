import { useEffect } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Container,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { format } from 'date-fns'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import EventIcon from '@mui/icons-material/Event'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import PeopleIcon from '@mui/icons-material/People'
import { useAppStore } from '../../../store/appStore'
import { useEvent } from '../hooks'
import { defaultEventsSearch } from '../../../router'

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  tooltip?: string
}

function MetricCard({ icon, label, value, tooltip }: MetricCardProps) {
  return (
    <Tooltip title={tooltip || ''}>
      <Paper
        sx={{
          p: 2.5,
          textAlign: 'center',
          backgroundColor: 'background.paper',
          borderRadius: 2,
        }}
      >
        <Box sx={{ color: 'primary.main', mb: 1, display: 'flex', justifyContent: 'center' }}>
          {icon}
        </Box>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {value}
        </Typography>
      </Paper>
    </Tooltip>
  )
}

export function EventDashboardPage() {
  const { eventId } = useParams({ from: '/my-events/$eventId' })
  const { role } = useAppStore()
  const navigate = useNavigate()
  const { data: event, isLoading, isError, error } = useEvent(eventId)

  useEffect(() => {
    if (role !== 'ORGANIZER') {
      navigate({ to: '/events', search: defaultEventsSearch })
    }
  }, [role, navigate])

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (isError || !event) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Failed to load event: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate({ to: '/my-events' })}
          sx={{ mt: 2 }}
        >
          Back to My Events
        </Button>
      </Container>
    )
  }

  const startDate = new Date(event.startTime)
  const endDate = new Date(event.endTime)
  const capacityPercent = event.capacity > 0 ? (event.seatsSold / event.capacity) * 100 : 0
  const isSoldOut = event.remainingSeats === 0

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      {/* Header */}
    <Stack 
        direction="row" 
        alignItems="center" 
        justifyContent="space-between" 
        sx={{ mb: 4, width: '100%' }}  
        >
        <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate({ to: '/my-events' })}
            variant="text"
        >
            Back
        </Button>

        <Button
            startIcon={<EditIcon />}
            onClick={() => navigate({ to: `/events/${eventId}/edit`, search: { returnTo: `/my-events/${eventId}` } })}
            variant="contained"
        >
            Edit Event
        </Button>
    </Stack>

      {/* Event Image and Basic Info */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <CardMedia
            component="img"
            height="400"
            image={event.imageUrl || 'https://via.placeholder.com/600x400?text=Event'}
            alt={event.title}
            sx={{ borderRadius: 2, objectFit: 'cover' }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
                {event.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {event.description}
              </Typography>
            </Box>

            <Paper sx={{ p: 2, backgroundColor: 'background.default' }}>
              <Stack spacing={1}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <EventIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Date & Time
                    </Typography>
                    <Typography variant="body2">
                      {format(startDate, 'EEEE, MMMM dd, yyyy')}
                    </Typography>
                    <Typography variant="body2">
                      {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={2} alignItems="center">
                  <PeopleIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body2">{event.venue}</Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={2} alignItems="center">
                  <MonetizationOnIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Ticket Price
                    </Typography>
                    <Typography variant="body2">€{event.price.toFixed(2)}</Typography>
                  </Box>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* Metrics Section */}
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Sales Metrics
      </Typography>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            icon={<LocalFireDepartmentIcon sx={{ fontSize: 32 }} />}
            label="Tickets Sold"
            value={event.seatsSold}
            tooltip="Number of tickets sold for this event"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            icon={<PeopleIcon sx={{ fontSize: 32 }} />}
            label="Remaining Capacity"
            value={event.remainingSeats}
            tooltip="Number of tickets still available"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            icon={<MonetizationOnIcon sx={{ fontSize: 32 }} />}
            label="Total Revenue"
            value={`€${(event.seatsSold * event.price).toFixed(2)}`}
            tooltip="Total revenue from ticket sales"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            icon={<EventIcon sx={{ fontSize: 32 }} />}
            label="Capacity"
            value={`${event.capacity}`}
            tooltip="Total event capacity"
          />
        </Grid>
      </Grid>

      {/* Capacity Progress */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stack spacing={2}>
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h6">Capacity Status</Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.seatsSold} of {event.capacity} tickets ({capacityPercent.toFixed(1)}%)
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={Math.min(capacityPercent, 100)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    backgroundColor: isSoldOut ? '#d32f2f' : '#4caf50',
                  },
                }}
              />
            </Box>
            {isSoldOut && (
              <Alert severity="warning" sx={{ mb: 0 }}>
                This event is sold out!
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Event Status */}
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Category
                </Typography>
                <Typography variant="body2">{event.category}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Typography variant="body2">{event.status}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body2">
                  {format(new Date(event.createdAt), 'MMM dd, yyyy')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body2">
                  {format(new Date(event.updatedAt), 'MMM dd, yyyy')}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  )
}
