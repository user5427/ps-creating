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

- Node.js 18+
- npm 9+

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

### Check API Requests

Open browser DevTools → Network tab to inspect API calls.

## Testing

Install testing dependencies:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

Create tests in `.test.tsx` files.

## Common Issues

### API Requests Failing

1. Verify backend is running at `http://localhost:8080`
2. Check `VITE_API_URL` in `.env.local`
3. Verify CORS is configured in backend

### Build Failing

Clear cache and reinstall:

```bash
rm -rf node_modules dist
npm install
npm run build
```

### Vite Dev Server Not Starting

Kill any process on port 5173:

```bash
lsof -i :5173
kill -9 <PID>
npm run dev
```

## Next Steps

1. Set up routing with TanStack Router
2. Create pages for your application
3. Build components for each page
4. Integrate with backend API endpoints
5. Add form validation with Zod
6. Implement state management for global data
7. Add error boundaries and loading states
8. Write tests for components and hooks
