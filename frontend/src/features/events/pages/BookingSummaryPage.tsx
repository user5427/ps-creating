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
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe, type StripeError } from '@stripe/stripe-js'
import { useQueryClient } from '@tanstack/react-query'
import {
  useCheckoutPaymentStatus,
  useClaimFreeTickets,
  useCreateCheckoutPaymentIntent,
  useEvent,
} from '../hooks'
import {PaymentForm} from "../components/PaymentForm";
import {BookingSummaryRow} from "../components/BookingSummaryRow";
import {useEffect, useMemo, useState} from "react";

const TICKET_TYPE = 'General Admission'
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? ''
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null

const formatEuro = (value: number) => `EUR ${value.toFixed(2)}`

export function BookingSummaryPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { eventId } = useParams({ from: '/events/$eventId/checkout' })
  const { quantity: requestedQuantity } = useSearch({ from: '/events/$eventId/checkout' })

  const { data: event, isLoading, isError, error, refetch } = useEvent(eventId)
  const createPaymentIntent = useCreateCheckoutPaymentIntent(eventId)
  const claimFreeTickets = useClaimFreeTickets()

  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [freeClaimedTickets, setFreeClaimedTickets] = useState<number | null>(null)
  const [checkoutStarted, setCheckoutStarted] = useState(false)
  const [shouldPollStatus, setShouldPollStatus] = useState(false)

  const paymentStatus = useCheckoutPaymentStatus(paymentIntentId, shouldPollStatus)

  const { quantity, totalAmount, isFreeEvent, quantityAdjusted } = useMemo(() => {
    const remaining = event?.remainingSeats ?? 0
    const qty = Math.min(Math.max(requestedQuantity, 1), Math.max(remaining, 1))
    const price = event?.price ?? 0
    return {
      quantity: qty,
      totalAmount: price * qty,
      isFreeEvent: price === 0,
      quantityAdjusted: qty !== requestedQuantity,
    }
  }, [event, requestedQuantity])

  const fulfilled = paymentStatus.data?.status === 'FULFILLED'
  const failed = paymentStatus.data?.status === 'FAILED'
  const awaitingFulfillment = shouldPollStatus && !fulfilled && !failed

  const elementsOptions = useMemo(() =>
          clientSecret ? { clientSecret, appearance: { theme: 'stripe' as const } } : undefined,
      [clientSecret])

  const refreshEvents = () => void queryClient.invalidateQueries({ queryKey: ['events'] })

  useEffect(() => {
    if (fulfilled) refreshEvents()
  }, [fulfilled])

  const handleStartCheckout = async () => {
    if (!event || event.soldOut || isFreeEvent) return
    setCheckoutError(null)
    try {
      const response = await createPaymentIntent.mutateAsync({ quantity })
      setClientSecret(response.clientSecret)
      setPaymentIntentId(response.paymentIntentId)
      setCheckoutStarted(true)
    } catch {
      setCheckoutError('Failed to initialize checkout. Please try again.')
      setCheckoutStarted(false)
    }
  }

  const handleClaimFree = async () => {
    if (!event || !isFreeEvent || event.soldOut || quantity < 1) return
    setCheckoutError(null)
    try {
      const response = await claimFreeTickets.mutateAsync({ eventId: event.id, quantity })
      refreshEvents()
      setFreeClaimedTickets(response.claimedTickets)
    } catch {
      setCheckoutError('Failed to claim free ticket(s). Please try again.')
    }
  }

  const handleConfirmError = (stripeError: StripeError) => {
    const message = stripeError.decline_code === 'insufficient_funds'
        ? 'Payment declined: insufficient funds. Please try a different card.'
        : (stripeError.message ?? 'Payment failed. Please check your card details and retry.')
    setCheckoutError(message)
  }

  if (isLoading) {
    return (
      <Container sx={{ py: 10, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (isError || !event) {
    const is404 = error instanceof AxiosError && error.response?.status === 404
    return (
        <Container maxWidth="md" sx={{ py: 10 }}>
          <Alert
              severity={is404 ? 'warning' : 'error'}
              action={!is404 && <Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>}
          >
            {is404 ? 'Event not found.' : 'Failed to load booking summary.'}
          </Alert>
        </Container>
    )
  }

  return (
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
        <Typography variant="h2" gutterBottom>Review your booking</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Confirm these details before you continue to payment.
        </Typography>

        {quantityAdjusted && <Alert severity="warning" sx={{ mb: 3 }}>Ticket quantity was adjusted to match availability.</Alert>}
        {checkoutError && <Alert severity="error" sx={{ mb: 3 }}>{checkoutError}</Alert>}
        {!STRIPE_PUBLISHABLE_KEY && <Alert severity="error" sx={{ mb: 3 }}>Invalid environment configuration.</Alert>}

        <Paper variant="outlined" sx={{ borderRadius: 2 }}>
          <Box sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack spacing={2}>
              <BookingSummaryRow label="Event" value={event.title} bold />
              <BookingSummaryRow label="Date" value={format(new Date(event.startTime), 'EEEE, d MMMM yyyy')} />
              <BookingSummaryRow label="Venue" value={event.venue} />
              <BookingSummaryRow label="Ticket type" value={TICKET_TYPE} />
              <BookingSummaryRow label="Quantity" value={quantity.toString()} />
              <BookingSummaryRow label="Unit price" value={event.price === 0 ? 'Free' : formatEuro(event.price)} />
            </Stack>
            <Divider sx={{ my: 2.5 }} />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="h6">Total amount</Typography>
              <Typography variant="h6">{totalAmount === 0 ? 'Free' : formatEuro(totalAmount)}</Typography>
            </Stack>
          </Box>
        </Paper>

        <Box sx={{ mt: 3 }}>
          {isFreeEvent ? (
              <Stack spacing={2} sx={{ mt: 2 }}>
                {freeClaimedTickets === null ? (
                    <Button
                        variant="contained" size="large" fullWidth
                        onClick={() => void handleClaimFree()}
                        disabled={event.soldOut || quantity < 1 || claimFreeTickets.isPending}
                    >
                      {claimFreeTickets.isPending ? 'Claiming...' : 'Confirm'}
                    </Button>
                ) : <Alert severity="success">Ticket(s) claimed.</Alert>}
              </Stack>
          ) : (
              <>
                {!checkoutStarted && (
                    <Button
                        variant="contained" size="large" fullWidth sx={{ mt: 2 }}
                        onClick={() => void handleStartCheckout()}
                        disabled={event.soldOut || quantity < 1 || createPaymentIntent.isPending}
                    >
                      {createPaymentIntent.isPending ? 'Preparing checkout...' : 'Confirm'}
                    </Button>
                )}

                {checkoutStarted && !clientSecret && (
                    <Stack alignItems="center" sx={{ py: 3 }}><CircularProgress size={28} /></Stack>
                )}

                {awaitingFulfillment && (
                    <Paper variant="outlined" sx={{ mt: 2, borderRadius: 2, p: 3, textAlign: 'center' }}>
                      <Stack spacing={2} alignItems="center">
                        <CircularProgress size={28} />
                        <Typography variant="h6">Finalizing payment</Typography>
                      </Stack>
                    </Paper>
                )}

                {checkoutStarted && !awaitingFulfillment && !fulfilled && !failed && clientSecret && (
                    <Elements stripe={stripePromise} options={elementsOptions}>
                      <PaymentForm
                          disabled={event.soldOut || quantity < 1 || fulfilled}
                          onSuccess={() => { setCheckoutError(null); setShouldPollStatus(true); }}
                          onError={handleConfirmError}
                      />
                    </Elements>
                )}

                {fulfilled && <Alert severity="success" sx={{ mt: 2 }}>Payment Successful!</Alert>}
                {failed && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {paymentStatus.data?.errorMessage ?? 'Payment failed. Please retry.'}
                    </Alert>
                )}
              </>
          )}
        </Box>

        <Button
            variant="outlined" size="large" fullWidth sx={{ mt: 3 }}
            onClick={() => navigate({ to: '/events/$eventId', params: { eventId } })}
        >
          Back to event
        </Button>
      </Container>
  )
}

