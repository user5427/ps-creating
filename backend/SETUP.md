# Backend Setup Guide

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
- `TWILIO_ACCOUNT_SID` - Get from [Twilio Console](https://console.twilio.com)
- `TWILIO_AUTH_TOKEN` - Get from [Twilio Console](https://console.twilio.com)
- `TWILIO_PHONE_NUMBER` - Your Twilio phone number
- `STRIPE_API_KEY` - Get from [Stripe Dashboard](https://dashboard.stripe.com)
- `STRIPE_WEBHOOK_SECRET` - Get from Stripe Webhooks settings

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
./mvnw spring-boot:run
```

The application will start at `http://localhost:8080`

## Debugging

Set log level in `application.yml`:

```yaml
logging:
  level:
    com.example: DEBUG
```

Check database directly:

```bash
docker exec -it app_postgres psql -U app_user -d app_db
```

## Dependencies

Key dependencies included:

- **Spring Boot Starters**: Web, Data JPA, Validation
- **Twilio SDK**: SMS, voice, and video capabilities
- **Stripe Java SDK**: Payment processing
- **PostgreSQL Driver**: Database connectivity
- **Lombok**: Reduce boilerplate code
- **JUnit & Mockito**: Testing frameworks

Manage dependencies in `pom.xml`

## Common Issues

### Port 8080 Already in Use

Add to command line:
```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"
```

### Database Connection Failed

Verify PostgreSQL is running:
```bash
docker-compose ps
docker-compose logs postgres
```

### Twilio/Stripe Not Working

Ensure `.env` file is configured with correct credentials and the application has been restarted.

## Next Steps

1. Define your data models (entities)
2. Create repositories for data access
3. Implement business logic in services
4. Create REST controllers for API endpoints
5. Integrate Twilio and Stripe services
6. Add unit and integration tests
7. Set up webhook handlers for Stripe events
