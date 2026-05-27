import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Container,
  Pagination,
  Stack,
  Typography,
} from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { useMyTicketGroups } from '../hooks'

const PAGE_SIZE = 12

export function MyTicketsPage() {
  const [page, setPage] = useState(0)
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch } = useMyTicketGroups(page, PAGE_SIZE)

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Typography variant="h2" gutterBottom>
        My tickets
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Access your purchased and claimed tickets any time.
      </Typography>

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
          Failed to load your tickets.
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      ) : data && data.content.length === 0 ? (
        <Alert severity="info">No tickets found yet.</Alert>
      ) : (
        <>
          <Stack spacing={2}>
            {data?.content.map((group) => (
              <Card key={group.eventId} variant="outlined">
                <CardActionArea
                  onClick={() => navigate({ to: '/my-tickets/$eventId', params: { eventId: group.eventId } })}
                >
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                      <Box>
                        <Typography variant="h5">{group.eventTitle}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(group.eventStartTime), 'EEEE, d MMM yyyy, HH:mm')}
                        </Typography>
                      </Box>
                      <Typography variant="h6">{group.ticketQuantity} ticket(s)</Typography>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Stack>

          {data && data.totalPages > 1 && (
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
      )}
    </Container>
  )
}
