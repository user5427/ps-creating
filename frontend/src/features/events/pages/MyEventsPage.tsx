import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  Pagination,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import { useAppStore } from '../../../store/appStore'
import { useOrganizerEvents } from '../hooks'
import { MyEventCard } from '../components/MyEventCard'
import { defaultEventsSearch } from '../../../router'

const PAGE_SIZE = 12

export function MyEventsPage() {
  const [page, setPage] = useState(1)
  const { role } = useAppStore()
  const navigate = useNavigate()
  const { data, isLoading, isError, error } = useOrganizerEvents(page - 1, PAGE_SIZE)

  useEffect(() => {
    if (role !== 'ORGANIZER') {
      navigate({ to: '/events', search: defaultEventsSearch })
    }
  }, [role, navigate])

  const handlePageChange = (_: any, pageNum: number) => {
    setPage(pageNum)
  }

  if (isError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Failed to load events: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </Container>
    )
  }

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
            My Events
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your events and view sales metrics.
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate({ to: '/events/new', search: { returnTo: '/my-events' } })}
        >
          Create event
        </Button>
      </Stack>

      {isLoading ? (
        <Grid container spacing={3}>
          {Array.from({ length: PAGE_SIZE }).map((_, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Skeleton variant="rounded" height={300} />
            </Grid>
          ))}
        </Grid>
      ) : data && data.content.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {data.content.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <MyEventCard event={event} />
              </Grid>
            ))}
          </Grid>
          {data.totalPages > 1 && (
            <Stack alignItems="center" sx={{ mt: 6 }}>
              <Pagination
                count={data.totalPages}
                page={page}
                onChange={handlePageChange}
                size="large"
              />
            </Stack>
          )}
        </>
      ) : (
        <Stack spacing={2} alignItems="center" sx={{ py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No events created yet
          </Typography>
          <Button variant="contained" onClick={() => navigate({ to: '/events/new', search: { returnTo: '/my-events' } })}/>
          <Button
            variant="contained"
            onClick={() => navigate({ to: '/events/new', search: { returnTo: '/my-events' } })}
          >
            Create your first event
          </Button>
        </Stack>
      )}
    </Container>
  )
}
