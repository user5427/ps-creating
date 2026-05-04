import {PaymentElement, useElements, useStripe} from "@stripe/react-stripe-js"
import {useState} from "react";
import {StripeError} from "@stripe/stripe-js";
import {Button, Stack} from "@mui/material";

interface PaymentFormProps {
    disabled: boolean
    onSuccess: () => void
    onError: (error: StripeError) => void
}

export function PaymentForm({ disabled, onSuccess, onError }: PaymentFormProps) {
    const stripe = useStripe()
    const elements = useElements()
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!stripe || !elements || submitting || disabled) return

        setSubmitting(true)
        try {
            const result = await stripe.confirmPayment({
                elements,
                redirect: 'if_required',
            })

            if (result.error) {
                onError(result.error)
            } else {
                onSuccess()
            }
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