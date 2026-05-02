# Backend Setup Guide

## Configuration

### Environment Variables

(NOTE: .env doesn't seem to work, just set env variables in run config if using intellij). configure:

Required variables:
- `TWILIO_ACCOUNT_SID` - Get from [Twilio Console](https://console.twilio.com)
- `TWILIO_AUTH_TOKEN` - Get from [Twilio Console](https://console.twilio.com)
- `TWILIO_PHONE_NUMBER` - Your Twilio phone number
- `STRIPE_API_KEY` - Get from [Stripe Dashboard](https://dashboard.stripe.com)
- `STRIPE_WEBHOOK_SECRET` - Get from Stripe Webhooks settings

(For local development, smtp configuration is not needed,
it will connect to the mailpit docker container with default credentials, web ui accessible at port 8025)
Email (for ticket confirmation with QR code):
- `MAIL_HOST` - SMTP host (default `localhost`)
- `MAIL_PORT` - SMTP port (default `1025`)
- `MAIL_USERNAME` - SMTP username
- `MAIL_PASSWORD` - SMTP password
- `MAIL_SMTP_AUTH` - `true`/`false`
- `MAIL_SMTP_STARTTLS_ENABLE` - `true`/`false`
- `MAIL_FROM` - sender email address

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

## Debugging

Set log level in `application.yml`:

```yaml
logging:
  level:
    com.example: DEBUG
```