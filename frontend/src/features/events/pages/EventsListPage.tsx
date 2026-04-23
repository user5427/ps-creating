import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Pagination,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { Link } from '@tanstack/react-router'
import { useAppStore } from '../../../store/appStore'
import { EventCard } from '../components/EventCard'
import { useEvents } from '../hooks'

const PAGE_SIZE = 12

export function EventsListPage() {
  const [page, setPage] = useState(0)
  const role = useAppStore((s) => s.role)
  const { data, isLoading, isError, refetch } = useEvents(page, PAGE_SIZE)

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: { xs: 4, md: 6 } }}
      >
        <Box>
          <Typography variant="h1" gutterBottom>
            Events
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Explore upcoming events near you.
          </Typography>
        </Box>
        {role === 'ORGANIZER' && (
          <Button
            component={Link}
            to="/events/new"
            variant="contained"
            size="large"
          >
            Create event
          </Button>
        )}
      </Stack>

      {isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
          sx={{ mb: 3 }}
        >
          Failed to load events.
        </Alert>
      )}

      {isLoading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : data && data.content.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="h3" gutterBottom>
            No upcoming events yet.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {role === 'ORGANIZER'
              ? 'Be the first — create an event to get started.'
              : 'Check back soon.'}
          </Typography>
          {role === 'ORGANIZER' && (
            <Button component={Link} to="/events/new" variant="contained">
              Create event
            </Button>
          )}
        </Box>
      ) : data ? (
        <>
          <Grid container spacing={3}>
            {data.content.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <EventCard event={event} />
              </Grid>
            ))}
          </Grid>
          {data.totalPages > 1 && (
            <Stack alignItems="center" sx={{ mt: 6 }}>
              <Pagination
                count={data.totalPages}
                page={page + 1}
                onChange={(_, next) => setPage(next - 1)}
                color="primary"
              />
            </Stack>
          )}
        </>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}
    </Container>
  )
}
