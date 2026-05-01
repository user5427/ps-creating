import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router'
import { RootLayout } from './components/layout/RootLayout'
import { EventsListPage } from './features/events/pages/EventsListPage'
import { EventDetailPage } from './features/events/pages/EventDetailPage'
import { EventFormPage } from './features/events/pages/EventFormPage'
import { BookingSummaryPage } from './features/events/pages/BookingSummaryPage'
import { CodeScanPage } from './features/code/pages/CodeScanPage'

function parseCheckoutSearch(search: Record<string, unknown>) {
  const quantityValue = Number(search.quantity)
  const quantity = Number.isInteger(quantityValue) && quantityValue > 0 ? quantityValue : 1
  return { quantity }
}

const rootRoute = createRootRoute({
  component: RootLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/events' })
  },
})

const eventsListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/events',
  component: EventsListPage,
})

const eventCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/events/new',
  component: () => <EventFormPage mode="create" />,
})

const eventDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/events/$eventId',
  component: EventDetailPage,
})

const eventCheckoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/events/$eventId/checkout',
  validateSearch: parseCheckoutSearch,
  component: BookingSummaryPage,
})

const eventEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/events/$eventId/edit',
  component: () => <EventFormPage mode="edit" />,
})

const codeScanRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/codes/scan',
  component: CodeScanPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  eventsListRoute,
  eventCreateRoute,
  eventDetailRoute,
  eventCheckoutRoute,
  eventEditRoute,
  codeScanRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
