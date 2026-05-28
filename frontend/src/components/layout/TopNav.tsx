import { AppBar, Button, Stack, Toolbar, Typography, Chip } from '@mui/material'
import { Link, useNavigate } from '@tanstack/react-router'
import { selectVisibleRole } from '../../store/appStore'
import { defaultEventsSearch } from '../../router'
import { useAppStore } from '../../store/appStore'

export function TopNav() {
  const navigate = useNavigate()
  const token = useAppStore((s) => s.token)
  const user = useAppStore((s) => s.user)
  const logout = useAppStore((s) => s.logout)
  const displayRole = useAppStore(selectVisibleRole)

  const isAuthenticated = !!token && !!user

  return (
    <AppBar position="sticky">
      <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
        <Typography
          variant="h5"
          component={Link}
          to="/"
          sx={{
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: 'text.primary',
            textDecoration: 'none',
            mr: 4,
          }}
        >
          eventingg
        </Typography>

        <Stack direction="row" spacing={3} sx={{ flexGrow: 1 }}>
          <Button
            color="inherit"
            sx={{ color: 'text.primary' }}
            onClick={() => navigate({ to: '/events', search: defaultEventsSearch })}
          >
            Events
          </Button>
          {displayRole === 'ORGANIZER' && (
            <Button component={Link} to="/my-events" color="inherit" sx={{ color: 'text.primary' }}>
              My events
            </Button>
          )}
          {displayRole === 'ORGANIZER' && (
            <Button component={Link} to="/codes/scan" color="inherit" sx={{ color: 'text.primary' }}>
              Scan QR code
            </Button>
          )}
          {displayRole === 'ORGANIZER' && (
            <Button
              component={Link}
              to="/events/new"
              color="inherit"
              sx={{ color: 'text.primary' }}
            >
              Create event
            </Button>
          )}
          {displayRole === 'ATTENDEE' && (
            <Button component={Link} to="/my-tickets" color="inherit" sx={{ color: 'text.primary' }}>
              My tickets
            </Button>
          )}
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
           {isAuthenticated ? (
             <>
               <Chip
                 label={`${user?.email} (${displayRole})`}
                 size="small"
                 sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
               />
              <Button
                color="inherit"
                onClick={() => {
                  logout()
                  navigate({ to: '/events', search: defaultEventsSearch })
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate({ to: '/login' })}>
                Login
              </Button>
              <Button color="inherit" onClick={() => navigate({ to: '/register' })}>
                Register
              </Button>
            </>
          )}

          <Button
            variant="contained"
            onClick={() => navigate({ to: '/events', search: defaultEventsSearch })}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Browse
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
