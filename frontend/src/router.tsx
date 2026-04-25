import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router'
import { RootLayout } from './components/layout/RootLayout'
import { EventsListPage } from './features/events/pages/EventsListPage'
import { EventDetailPage } from './features/events/pages/EventDetailPage'
import { EventFormPage } from './features/events/pages/EventFormPage'
import { CodeScanPage } from './features/code/pages/CodeScanPage'

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
  eventEditRoute,
  codeScanRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
