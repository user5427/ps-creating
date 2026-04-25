import { Box, Card, CardActionArea, Stack, Typography } from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import type { EventResponse } from '../schemas'
import { SoldOutChip } from './SoldOutChip'

interface Props {
  event: EventResponse
}

export function EventCard({ event }: Props) {
  const navigate = useNavigate()
  const date = format(new Date(event.startTime), 'MMM d, yyyy')
  const time = format(new Date(event.startTime), 'HH:mm')

  return (
    <Card>
      <CardActionArea
        onClick={() =>
          navigate({ to: '/events/$eventId', params: { eventId: event.id } })
        }
      >
        <Box
          sx={{
            position: 'relative',
            aspectRatio: '16 / 9',
            backgroundColor: '#F3F4F6',
            backgroundImage: event.imageUrl ? `url(${event.imageUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {event.soldOut && (
            <SoldOutChip sx={{ position: 'absolute', top: 12, left: 12 }} />
          )}
        </Box>
        <Box sx={{ p: 2.5 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
              {event.category}
            </Typography>
            <Typography variant="body2">·</Typography>
            <Typography variant="body2">
              {date} · {time}
            </Typography>
          </Stack>
          <Typography variant="h5" sx={{ mb: 1, lineHeight: 1.3 }} noWrap>
            {event.title}
          </Typography>
          <Typography variant="body2" noWrap>
            {event.venue}
          </Typography>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ color: 'primary.main' }}>
              {event.price === 0 ? 'Free' : `€${event.price.toFixed(2)}`}
            </Typography>
            <Typography variant="body2">
              {event.remainingSeats} seats left
            </Typography>
          </Stack>
        </Box>
      </CardActionArea>
    </Card>
  )
}
