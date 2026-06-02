import { Link } from '@tanstack/react-router'
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Stack,
  Typography,
  Chip,
} from '@mui/material'
import { format } from 'date-fns'
import type { EventDashboardResponse } from '../schemas'

interface MyEventCardProps {
  event: EventDashboardResponse
}

export function MyEventCard({ event }: MyEventCardProps) {
  const startDate = new Date(event.startTime)
  const formattedDate = format(startDate, 'MMM dd, yyyy')
  const formattedTime = format(startDate, 'h:mm a')

  const capacityPercent = event.capacity > 0 ? (event.ticketsSold / event.capacity) * 100 : 0
  const isSoldOut = event.remainingCapacity === 0

  return (
    <Card
      component={Link}
      to={`/my-events/${event.id}`}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={event.imageUrl || 'https://lapena.org/wp-content/plugins/events-calendar-pro/src/resources/images/tribe-event-placeholder-image.svg'}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Chip label={event.category} size="small" variant="outlined" />
            {isSoldOut && <Chip label="Sold Out" size="small" color="error" />}
          </Stack>
          <Typography variant="h6" component="h2" sx={{ mb: 0.5 }}>
            {event.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formattedDate} at {formattedTime}
          </Typography>
        </Box>

        {/* Metrics Grid */}
        <Grid container spacing={1.5} sx={{ mt: 'auto' }}>
          <Grid item xs={6}>
            <Stack>
              <Typography variant="caption" color="text.secondary">
                Tickets Sold
              </Typography>
              <Typography variant="h6">
                {event.ticketsSold}/{event.capacity}
              </Typography>
              <Box
                sx={{
                  height: 4,
                  backgroundColor: '#e0e0e0',
                  borderRadius: 2,
                  mt: 0.5,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    width: `${Math.min(capacityPercent, 100)}%`,
                    backgroundColor: isSoldOut ? '#d32f2f' : '#4caf50',
                    transition: 'width 0.3s ease',
                  }}
                />
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={6}>
            <Stack>
              <Typography variant="caption" color="text.secondary">
                Total Revenue
              </Typography>
              <Typography variant="h6">
                €{event.totalRevenue.toFixed(2)}
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={6}>
            <Stack>
              <Typography variant="caption" color="text.secondary">
                Remaining Capacity
              </Typography>
              <Typography variant="h6">
                {event.remainingCapacity}
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={6}>
            <Stack>
              <Typography variant="caption" color="text.secondary">
                Price per Ticket
              </Typography>
              <Typography variant="h6">
                €{event.price.toFixed(2)}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
