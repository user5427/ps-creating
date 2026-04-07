# Frontend Setup Guide

## Configuration

### Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Available variables:
- `VITE_API_URL` - Backend API URL (default: http://localhost:8080/api)

## Running the Application

### Prerequisites

- Node.js
- npm 

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output is in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Debugging

### Enable Source Maps

Already enabled for development. For production, set in `vite.config.ts`:

```typescript
build: {
  sourcemap: true
}
```