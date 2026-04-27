import { useMemo, useState } from 'react'
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
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe, type StripeError } from '@stripe/stripe-js'
import {
  useCheckoutPaymentStatus,
  useClaimFreeTickets,
  useCreateCheckoutPaymentIntent,
  useEvent,
} from '../hooks'

const TICKET_TYPE = 'General Admission'
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? ''
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null

function formatEuro(value: number) {
  return `EUR ${value.toFixed(2)}`
}

interface PaymentFormProps {
  disabled: boolean
  onSuccess: () => void
  onError: (error: StripeError) => void
}

function PaymentForm({ disabled, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!stripe || !elements || submitting || disabled) {
      return
    }

    setSubmitting(true)
    try {
      const result = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      })

      if (result.error) {
        onError(result.error)
        return
      }

      onSuccess()
    } catch {
      onError({ message: 'Unexpected payment error. Please try again.' } as StripeError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Stack spacing={2}>
      <PaymentElement />
      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={handleSubmit}
        disabled={disabled || !stripe || !elements || submitting}
      >
        {submitting ? 'Processing...' : 'Pay now'}
      </Button>
    </Stack>
  )
}

export function BookingSummaryPage() {
  const { eventId } = useParams({ from: '/events/$eventId/checkout' })
  const { quantity: requestedQuantity } = useSearch({ from: '/events/$eventId/checkout' })
  const navigate = useNavigate()
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

  const maxSelectableTickets = Math.max(event?.remainingSeats ?? 0, 1)
  const quantity = Math.min(Math.max(requestedQuantity, 1), maxSelectableTickets)
  const quantityAdjusted = quantity !== requestedQuantity
  const totalAmount = (event?.price ?? 0) * quantity
  const isFreeEvent = totalAmount === 0

  const elementsOptions = useMemo(() => {
    if (!clientSecret) {
      return undefined
    }
    return {
      clientSecret,
      appearance: { theme: 'stripe' as const },
    }
  }, [clientSecret])

  const handleStartCheckout = async () => {
    if (!event || event.soldOut || isFreeEvent) {
      return
    }

    setCheckoutError(null)
    try {
      const response = await createPaymentIntent.mutateAsync({ quantity })
      setClientSecret(response.clientSecret)
      setPaymentIntentId(response.paymentIntentId)
      setCheckoutStarted(true)
    } catch {
      setCheckoutError('Failed to initialize secure checkout. Please try again.')
      setClientSecret(null)
      setPaymentIntentId(null)
      setCheckoutStarted(false)
    }
  }

  const handleClaimFree = async () => {
    if (!event || !isFreeEvent || event.soldOut || quantity < 1) {
      return
    }

    setCheckoutError(null)
    try {
      const response = await claimFreeTickets.mutateAsync({
        eventId: event.id,
        quantity,
      })
      setFreeClaimedTickets(response.claimedTickets)
    } catch {
      setCheckoutError('Failed to claim free ticket(s). Please try again.')
      setFreeClaimedTickets(null)
    }
  }

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
          {notFound ? 'Event not found.' : 'Failed to load booking summary.'}
        </Alert>
      </Container>
    )
  }

  const startDate = format(new Date(event.startTime), 'EEEE, d MMMM yyyy')
  const fulfilled = paymentStatus.data?.status === 'FULFILLED'
  const failed = paymentStatus.data?.status === 'FAILED'
  const awaitingFulfillment = shouldPollStatus && !fulfilled && !failed

  const handleConfirmError = (stripeError: StripeError) => {
    if (stripeError.decline_code === 'insufficient_funds') {
      setCheckoutError('Payment declined: insufficient funds. Please try a different card.')
      return
    }
    setCheckoutError(stripeError.message ?? 'Payment failed. Please check your card details and retry.')
  }

  const handleConfirmSuccess = () => {
    setCheckoutError(null)
    setShouldPollStatus(true)
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Typography variant="h2" gutterBottom>
        Review your booking
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Confirm these details before you continue to secure payment.
      </Typography>
      {quantityAdjusted && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Ticket quantity was adjusted to match currently available seats.
        </Alert>
      )}

      {fulfilled && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Payment received.
        </Alert>
      )}

      {checkoutError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {checkoutError}
        </Alert>
      )}

      {!STRIPE_PUBLISHABLE_KEY && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Missing VITE_STRIPE_PUBLISHABLE_KEY in frontend environment.
        </Alert>
      )}

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <Box sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography color="text.secondary">Event</Typography>
              <Typography sx={{ textAlign: 'right', fontWeight: 600 }}>{event.title}</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography color="text.secondary">Date</Typography>
              <Typography sx={{ textAlign: 'right' }}>{startDate}</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography color="text.secondary">Venue</Typography>
              <Typography sx={{ textAlign: 'right' }}>{event.venue}</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography color="text.secondary">Ticket type</Typography>
              <Typography sx={{ textAlign: 'right' }}>{TICKET_TYPE}</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography color="text.secondary">Quantity</Typography>
              <Typography sx={{ textAlign: 'right' }}>{quantity}</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography color="text.secondary">Unit price</Typography>
              <Typography sx={{ textAlign: 'right' }}>
                {event.price === 0 ? 'Free' : formatEuro(event.price)}
              </Typography>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2.5 }} />

          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Typography variant="h6">Total amount</Typography>
            <Typography variant="h6">
              {totalAmount === 0 ? 'Free' : formatEuro(totalAmount)}
            </Typography>
          </Stack>
        </Box>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {isFreeEvent && (
          <Stack spacing={2} sx={{ mt: 2 }}>
            {freeClaimedTickets === null ? (
              <Button
                variant="contained"
                size="large"
                onClick={() => void handleClaimFree()}
                disabled={event.soldOut || quantity < 1 || claimFreeTickets.isPending}
                fullWidth
              >
                {claimFreeTickets.isPending ? 'Claiming...' : 'Claim for free'}
              </Button>
            ) : (
              <Alert severity="success">Ticket(s) claimed.</Alert>
            )}
          </Stack>
        )}

        {!isFreeEvent && !checkoutStarted && (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => void handleStartCheckout()}
              disabled={event.soldOut || quantity < 1 || createPaymentIntent.isPending}
              fullWidth
            >
              {createPaymentIntent.isPending ? 'Preparing secure checkout...' : 'Confirm and continue'}
            </Button>
          </Stack>
        )}

        {!isFreeEvent && checkoutStarted && !clientSecret && (
          <Stack alignItems="center" sx={{ py: 3 }}>
            <CircularProgress size={28} />
          </Stack>
        )}

        {!isFreeEvent && awaitingFulfillment && (
          <Paper variant="outlined" sx={{ mt: 2, borderRadius: 2 }}>
            <Box sx={{ p: 3 }}>
              <Stack spacing={2} alignItems="center" textAlign="center">
                <CircularProgress size={28} />
                <Typography variant="h6">Finalizing payment</Typography>
                <Typography color="text.secondary">Payment is processing...</Typography>
              </Stack>
            </Box>
          </Paper>
        )}

        {!isFreeEvent && checkoutStarted && clientSecret && stripePromise && !awaitingFulfillment && !fulfilled && !failed && (
          <Elements stripe={stripePromise} options={elementsOptions}>
            <PaymentForm
              disabled={event.soldOut || quantity < 1 || fulfilled}
              onSuccess={handleConfirmSuccess}
              onError={handleConfirmError}
            />
          </Elements>
        )}

        {!isFreeEvent && fulfilled && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Payment received!
          </Alert>
        )}

        {!isFreeEvent && failed && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {paymentStatus.data?.errorMessage ?? 'Payment failed. Please retry with a different card.'}
          </Alert>
        )}
      </Box>

      <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          size="large"
          onClick={() =>
            navigate({
              to: '/events/$eventId',
              params: { eventId },
            })
          }
          fullWidth
        >
          Back to event
        </Button>
      </Stack>
    </Container>
  )
}
