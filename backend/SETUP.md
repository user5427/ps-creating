# Backend Setup Guide

## Configuration

### Environment Variables

(NOTE: .env doesn't seem to work, just set env variables in run config) Copy `.env.example` to `.env` and configure:

Required variables:
- `TWILIO_ACCOUNT_SID` - Get from [Twilio Console](https://console.twilio.com)
- `TWILIO_AUTH_TOKEN` - Get from [Twilio Console](https://console.twilio.com)
- `TWILIO_PHONE_NUMBER` - Your Twilio phone number
- `STRIPE_API_KEY` - Get from [Stripe Dashboard](https://dashboard.stripe.com)
- `STRIPE_WEBHOOK_SECRET` - Get from Stripe Webhooks settings

Email (for ticket confirmation with QR code):
- `MAIL_HOST` - SMTP host (default `localhost`)
- `MAIL_PORT` - SMTP port (default `1025`)
- `MAIL_USERNAME` - SMTP username
- `MAIL_PASSWORD` - SMTP password
- `MAIL_SMTP_AUTH` - `true`/`false`
- `MAIL_SMTP_STARTTLS_ENABLE` - `true`/`false`
- `MAIL_FROM` - sender email address
- `FAKE_PAYMENTS_ENABLED` - *THIS IS FOR TESTING ONLY!!!* allows Stripe-free testing with fake payment IDs (default `true` in dev)

### Database

PostgreSQL is automatically configured to connect to the Docker Compose instance:
- URL: `jdbc:postgresql://localhost:5432/app_db`
- Username: `app_user`
- Password: `app_password`

## Running the Application

### Prerequisites

- Java 17+
- Maven 3.6+ (or use included `mvnw`)

### Start the Backend

```bash
cd backend
mvn spring-boot:run
```

The application will start at `http://localhost:8080`

## Ticket confirmation flow (US-06)

After a successful Stripe payment intent, confirm purchase to generate a unique ticket QR and send a confirmation email:

```bash
POST /api/codes/confirm-purchase
{
  "eventId": "<event-uuid>",
  "paymentIntentId": "<stripe-payment-intent-id>"
}
```

The endpoint validates that Stripe payment status is `succeeded`, creates a code, and emails a scannable QR image that encodes the ticket identifier payload.

### Fast local test without Stripe

With `FAKE_PAYMENTS_ENABLED=true`, use any `paymentIntentId` starting with `fake_succeeded_`.
Example:

```bash
POST /api/codes/confirm-purchase
{
  "eventId": "<event-uuid>",
  "paymentIntentId": "fake_succeeded_local-test"
}
```

This bypasses Stripe lookup in dev and still sends the confirmation email with QR.

## Debugging

Set log level in `application.yml`:

```yaml
logging:
  level:
    com.example: DEBUG
```