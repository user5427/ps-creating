import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router'
import { RootLayout } from './components/layout/RootLayout'
import { EventsListPage } from './features/events/pages/EventsListPage'
import { EventDetailPage } from './features/events/pages/EventDetailPage'
import { EventFormPage } from './features/events/pages/EventFormPage'
import { MyEventsPage } from './features/events/pages/MyEventsPage'
import { EventDashboardPage } from './features/events/pages/EventDashboardPage'
import { BookingSummaryPage } from './features/events/pages/BookingSummaryPage'
import { CodeScanPage } from './features/code/pages/CodeScanPage'
import { MyTicketsPage } from './features/code/pages/MyTicketsPage'
import { MyTicketsEventPage } from './features/code/pages/MyTicketsEventPage'
import { LoginPage } from "./features/auth/pages/LoginPage";
import { RegisterPage } from "./features/auth/pages/RegisterPage";


function parseCheckoutSearch(search: Record<string, unknown>) {
  const quantityValue = Number(search.quantity)
  const quantity = Number.isInteger(quantityValue) && quantityValue > 0 ? quantityValue : 1
  return { quantity }
}

function parseEventFormSearch(search: Record<string, unknown>) {
  const returnTo = typeof search.returnTo === 'string' ? search.returnTo : '/events'
  return { returnTo }
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
  validateSearch: parseEventFormSearch,
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
  validateSearch: parseEventFormSearch,
  component: () => <EventFormPage mode="edit" />,
})

const codeScanRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/codes/scan',
  component: CodeScanPage,
})

const myTicketsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-tickets',
  component: MyTicketsPage,
})

const myTicketsEventRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-tickets/$eventId',
  component: MyTicketsEventPage,
})

const myEventsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-events',
  component: MyEventsPage,
})

const eventDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-events/$eventId',
  component: EventDashboardPage,
})

const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/login",
    component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  eventsListRoute,
  eventCreateRoute,
  eventDetailRoute,
  eventCheckoutRoute,
  eventEditRoute,
  codeScanRoute,
  myTicketsRoute,
  myTicketsEventRoute,
  myEventsRoute,
  eventDashboardRoute,
  loginRoute,
  registerRoute
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
