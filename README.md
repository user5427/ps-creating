# Full-Stack Application

A modern full-stack application built with:

## Tech Stack

### Backend
- **Framework**: Spring Boot 3.2
- **Language**: Java 17
- **Database**: PostgreSQL
- **Build Tool**: Maven
- **Integrations**: Twilio (SMS/Voice), Stripe (Payments)

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: TanStack Router
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Validation**: Zod
- **UI Library**: Material-UI (MUI)
- **Language**: TypeScript

### Database
- **PostgreSQL** 17 (via Docker Compose)

## Project Structure

```
.
├── backend/                    # Spring Boot application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/          # Java source code
│   │   │   └── resources/     # Configuration files
│   │   └── test/              # Test code
│   ├── pom.xml                # Maven configuration
│   └── .env.example           # Environment variables template
├── frontend/                   # React + Vite application
│   ├── src/
│   │   ├── main.tsx           # Entry point
│   │   └── App.tsx            # Root component
│   ├── index.html             # HTML entry
│   ├── vite.config.ts         # Vite configuration
│   ├── tsconfig.json          # TypeScript configuration
│   ├── package.json           # Dependencies
│   └── .env.example           # Environment variables template
├── docker-compose.yml         # PostgreSQL container setup
└── README.md                  # This file
```

## Prerequisites

- Java 17+
- Node.js 18+
- Docker & Docker Compose
- Maven (or use `mvnw`)

## Getting Started

### 1. Start PostgreSQL with Docker Compose

```bash
docker-compose up -d
```

This will start a PostgreSQL instance at `localhost:5432` with:
- Database: `app_db`
- Username: `app_user`
- Password: `app_password`

### 2. Setup Backend

Navigate to the backend directory:

```bash
cd backend
```

Copy the environment variables template and configure with your credentials:

```bash
cp .env.example .env
```

Edit `.env` and add your:
- Twilio credentials (Account SID, Auth Token, Phone Number)
- Stripe API key and webhook secret

Run Maven to download dependencies and start the application:

```bash
./mvnw spring-boot:run
```

The backend will start at `http://localhost:8080`

### 3. Setup Frontend

Navigate to the frontend directory:

```bash
cd ../frontend
```

Install dependencies:

```bash
npm install
```

Copy the environment variables template:

```bash
cp .env.example .env.local
```

Start the development server:

```bash
npm run dev
```

The frontend will start at `http://localhost:5173`

## Environment Variables

### Backend (.env)
- `TWILIO_ACCOUNT_SID` - Your Twilio account SID
- `TWILIO_AUTH_TOKEN` - Your Twilio auth token
- `TWILIO_PHONE_NUMBER` - Your Twilio phone number
- `STRIPE_API_KEY` - Your Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret

### Frontend (.env.local)
- `VITE_API_URL` - Backend API URL (default: http://localhost:8080/api)

## Database

PostgreSQL is managed via Docker Compose. The database automatically initializes with the Spring Hibernate DDL strategy configured in `application.yml`.
