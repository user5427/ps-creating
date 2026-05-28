import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router'
import { RootLayout } from './components/layout/RootLayout'
import { checkRoleAccess, getAuthSnapshot } from './hooks/useAuth'
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
import { AccessDeniedPage } from "./features/auth/pages/AccessDeniedPage";


function parseCheckoutSearch(search: Record<string, unknown>) {
  const quantityValue = Number(search.quantity)
  const quantity = Number.isInteger(quantityValue) && quantityValue > 0 ? quantityValue : 1
  return { quantity }
}

function parseEventFormSearch(search: Record<string, unknown>) {
  const returnTo = typeof search.returnTo === 'string' ? search.returnTo : '/events'
  return { returnTo }
}

function parseEventsListSearch(search: Record<string, unknown>) {
  const pageValue = Number(search.page)
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1
  const category = typeof search.category === 'string' ? search.category : undefined
  const location = typeof search.location === 'string' ? search.location : undefined
  const startDate = typeof search.startDate === 'string' ? search.startDate : undefined
  const endDate = typeof search.endDate === 'string' ? search.endDate : undefined
  const sortBy =
    search.sortBy === 'PRICE_ASC' || search.sortBy === 'PRICE_DESC' ? search.sortBy : 'NEW'

  return { page, category, location, startDate, endDate, sortBy }
}

export const defaultEventsSearch = {
  page: 1,
  category: undefined,
  location: undefined,
  startDate: undefined,
  endDate: undefined,
  sortBy: 'NEW' as const,
}

function redirectScannerToScanPage() {
  const { isAuthenticated, role } = getAuthSnapshot()
  if (isAuthenticated && role === 'SCANNER') {
    throw redirect({ to: '/codes/scan' })
  }
}

const rootRoute = createRootRoute({
  component: RootLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    const { isAuthenticated, role } = getAuthSnapshot()
    if (isAuthenticated && role === 'SCANNER') {
      throw redirect({ to: '/codes/scan' })
    }
    throw redirect({ to: '/events', search: defaultEventsSearch })
  },
})

const eventsListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/events',
  validateSearch: parseEventsListSearch,
  beforeLoad: () => {
    redirectScannerToScanPage()
  },
  component: EventsListPage,
})

const eventCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/events/new',
  validateSearch: parseEventFormSearch,
  beforeLoad: () => {
    const access = checkRoleAccess('ORGANIZER')
    if (!access.isAllowed) {
      throw redirect({ to: access.redirectTo ?? '/access-denied' })
    }
  },
  component: () => <EventFormPage mode="create" />,
})

const eventDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/events/$eventId',
  beforeLoad: () => {
    redirectScannerToScanPage()
  },
  component: EventDetailPage,
})

const eventCheckoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/events/$eventId/checkout',
  validateSearch: parseCheckoutSearch,
  beforeLoad: () => {
    const access = checkRoleAccess('ATTENDEE')
    if (!access.isAllowed) {
      throw redirect({ to: access.redirectTo ?? '/access-denied' })
    }
  },
  component: BookingSummaryPage,
})

const eventEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/events/$eventId/edit',
  validateSearch: parseEventFormSearch,
  beforeLoad: () => {
    const access = checkRoleAccess('ORGANIZER')
    if (!access.isAllowed) {
      throw redirect({ to: access.redirectTo ?? '/access-denied' })
    }
  },
  component: () => <EventFormPage mode="edit" />,
})

const codeScanRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/codes/scan',
  beforeLoad: () => {
    const access = checkRoleAccess('SCANNER')
    if (!access.isAllowed) {
      throw redirect({ to: access.redirectTo ?? '/access-denied' })
    }
  },
  component: CodeScanPage,
})

const myTicketsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-tickets',
  beforeLoad: () => {
    const access = checkRoleAccess('ATTENDEE')
    if (!access.isAllowed) {
      throw redirect({ to: access.redirectTo ?? '/access-denied' })
    }
  },
  component: MyTicketsPage,
})

const myTicketsEventRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-tickets/$eventId',
  beforeLoad: () => {
    const access = checkRoleAccess('ATTENDEE')
    if (!access.isAllowed) {
      throw redirect({ to: access.redirectTo ?? '/access-denied' })
    }
  },
  component: MyTicketsEventPage,
})

const myEventsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-events',
  beforeLoad: () => {
    const access = checkRoleAccess('ORGANIZER')
    if (!access.isAllowed) {
      throw redirect({ to: access.redirectTo ?? '/access-denied' })
    }
  },
  component: MyEventsPage,
})

const eventDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-events/$eventId',
  beforeLoad: () => {
    const access = checkRoleAccess('ORGANIZER')
    if (!access.isAllowed) {
      throw redirect({ to: access.redirectTo ?? '/access-denied' })
    }
  },
  component: EventDashboardPage,
})

const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/login",
    beforeLoad: () => {
      const { isAuthenticated, role } = getAuthSnapshot()
      if (isAuthenticated && role === 'SCANNER') {
        throw redirect({ to: '/codes/scan' })
      }
    },
    component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  beforeLoad: () => {
    const { isAuthenticated, role } = getAuthSnapshot()
    if (isAuthenticated && role === 'SCANNER') {
      throw redirect({ to: '/codes/scan' })
    }
  },
  component: RegisterPage,
});

const accessDeniedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/access-denied",
  component: AccessDeniedPage,
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
  registerRoute,
  accessDeniedRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
