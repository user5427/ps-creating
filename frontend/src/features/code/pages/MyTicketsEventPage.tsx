import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Pagination,
  Stack,
  Typography,
} from '@mui/material'
import { Link, useParams } from '@tanstack/react-router'
import { format } from 'date-fns'
import { QRCodeSVG } from 'qrcode.react'
import { useMyTicketsByEvent } from '../hooks'

const PAGE_SIZE = 6

export function MyTicketsEventPage() {
  const { eventId } = useParams({ from: '/my-tickets/$eventId' })
  const [page, setPage] = useState(0)
  const { data, isLoading, isError, refetch } = useMyTicketsByEvent(eventId, page, PAGE_SIZE)
  const [fullscreenQr, setFullscreenQr] = useState<string | null>(null)

  return (
    <>
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 }, displayPrint: 'none' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h2">Ticket QR codes</Typography>
          <Button variant="outlined" component={Link} to="/my-tickets">
            Back
          </Button>
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
            Failed to load ticket details.
          </Alert>
        )}

        {isLoading ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : !data || data.tickets.content.length === 0 ? (
          <Alert severity="info">No tickets found for this event.</Alert>
        ) : (
          <>
            <Typography variant="h5">{data.event.title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {format(new Date(data.event.startTime), 'EEEE, d MMM yyyy, HH:mm')} to{' '}
              {format(new Date(data.event.endTime), 'HH:mm')} - {data.event.venue}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {data.tickets.totalElements} ticket(s)
            </Typography>

            <Stack spacing={2}>
              {data.tickets.content.map((ticket, index) => (
                <Card key={ticket.qrData} variant="outlined">
                  <CardContent>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
                      <QRCodeSVG value={ticket.qrData} size={180} marginSize={4} />
                      <Stack spacing={1} sx={{ flex: 1 }}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Ticket #{(page * PAGE_SIZE) + index + 1}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {ticket.qrData.substring(0, 12)}...
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Scanned: {ticket.scanCount}
                        </Typography>
                      </Stack>
                      <Button variant="contained" onClick={() => setFullscreenQr(ticket.qrData)}>
                        Full screen
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>

            {data.tickets.totalPages > 1 && (
              <Stack alignItems="center" sx={{ mt: 6 }}>
                <Pagination
                  count={data.tickets.totalPages}
                  page={page + 1}
                  onChange={(_, next) => setPage(next - 1)}
                  color="primary"
                />
              </Stack>
            )}
          </>
        )}
      </Container>

      <Box
        sx={{
          display: 'none',
          displayPrint: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 3,
          p: 4,
        }}
      >
        {fullscreenQr && (
          <>
            <Typography variant="h4">Ticket QR code</Typography>
            <QRCodeSVG value={fullscreenQr} size={420} marginSize={4} />
          </>
        )}
      </Box>

      <Dialog fullScreen open={!!fullscreenQr} onClose={() => setFullscreenQr(null)} sx={{ displayPrint: 'none' }}>
        <DialogTitle>Ticket QR</DialogTitle>
        <DialogContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {fullscreenQr && <QRCodeSVG value={fullscreenQr} size={420} marginSize={4} />}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-start', px: 3, pb: 3 }}>
          <Button variant="outlined" onClick={() => setFullscreenQr(null)}>
            Back
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
