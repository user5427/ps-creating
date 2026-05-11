import { AppBar, Box, Button, Stack, ToggleButton, ToggleButtonGroup, Toolbar, Typography } from '@mui/material'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAppStore, type Role } from '../../store/appStore'

export function TopNav() {
  const navigate = useNavigate()
  const role = useAppStore((s) => s.role)
  const setRole = useAppStore((s) => s.setRole)

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
          <Button component={Link} to="/events" color="inherit" sx={{ color: 'text.primary' }}>
            Events
          </Button>
          {role === 'ORGANIZER' && (
            <Button component={Link} to="/my-events" color="inherit" sx={{ color: 'text.primary' }}>
              My events
            </Button>
          )}
          {role === 'ORGANIZER' && (
            <Button component={Link} to="/codes/scan" color="inherit" sx={{ color: 'text.primary' }}>
              Scan QR code
            </Button>
          )}
          {role === 'ORGANIZER' && (
            <Button
              component={Link}
              to="/events/new"
              color="inherit"
              sx={{ color: 'text.primary' }}
            >
              Create event
            </Button>
          )}
          {role === 'ATTENDEE' && (
            <Button component={Link} to="/my-tickets" color="inherit" sx={{ color: 'text.primary' }}>
              My tickets
            </Button>
          )}
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          {import.meta.env.DEV && (
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <ToggleButtonGroup
                size="small"
                value={role}
                exclusive
                onChange={(_, next: Role | null) => next && setRole(next)}
                aria-label="Dev role toggle"
              >
                <ToggleButton value="ATTENDEE">Attendee</ToggleButton>
                <ToggleButton value="ORGANIZER">Organizer</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          )}
          <Button
            variant="contained"
            onClick={() => navigate({ to: '/events' })}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Browse
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
