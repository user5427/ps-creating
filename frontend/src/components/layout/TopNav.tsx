import { useState } from 'react'
import {
  AppBar,
  Button,
  Stack,
  Toolbar,
  Typography,
  Chip,
  Drawer,
  IconButton,
  Box,
  Divider,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isAuthenticated = !!token && !!user

  const handleNavClick = (action: () => void) => {
    action()
    setMobileMenuOpen(false)
  }

  const navItems = (
    <Stack spacing={1} sx={{ width: '100%' }}>
      <Button
        color="inherit"
        fullWidth
        sx={{ justifyContent: 'flex-start', color: 'text.primary' }}
        onClick={() => handleNavClick(() => navigate({ to: '/events', search: defaultEventsSearch }))}
      >
        Events
      </Button>

      {displayRole === 'ORGANIZER' && (
        <>
          <Button
            component={Link}
            to="/my-events"
            color="inherit"
            fullWidth
            sx={{ justifyContent: 'flex-start', color: 'text.primary' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            My events
          </Button>
          <Button
            component={Link}
            to="/codes/scan"
            color="inherit"
            fullWidth
            sx={{ justifyContent: 'flex-start', color: 'text.primary' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Scan QR code
          </Button>
          <Button
            component={Link}
            to="/events/new"
            color="inherit"
            fullWidth
            sx={{ justifyContent: 'flex-start', color: 'text.primary' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Create event
          </Button>
        </>
      )}

      {displayRole === 'ATTENDEE' && (
        <Button
          component={Link}
          to="/my-tickets"
          color="inherit"
          fullWidth
          sx={{ justifyContent: 'flex-start', color: 'text.primary' }}
          onClick={() => setMobileMenuOpen(false)}
        >
          My tickets
        </Button>
      )}
    </Stack>
  )

  return (
    <AppBar position="sticky">
      <Toolbar sx={{ px: { xs: 1.5, sm: 2, md: 4 }, display: 'flex', justifyContent: 'space-between', minHeight: { xs: 56, sm: 64 } }}>
        {/* Logo */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: 'text.primary',
            textDecoration: 'none',
            flexShrink: 0,
            fontSize: { xs: '1.2rem', sm: '1.5rem' },
          }}
        >
          eventingg
        </Typography>

        {/* Desktop Navigation */}
        <Stack direction="row" spacing={{ xs: 1, md: 3 }} sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 4, justifyContent: 'center' }}>
          <Button
            color="inherit"
            sx={{ color: 'text.primary', fontSize: '0.9rem' }}
            onClick={() => navigate({ to: '/events', search: defaultEventsSearch })}
          >
            Events
          </Button>
          {displayRole === 'ORGANIZER' && (
            <>
              <Button component={Link} to="/my-events" color="inherit" sx={{ color: 'text.primary', fontSize: '0.9rem' }}>
                My events
              </Button>
              <Button component={Link} to="/codes/scan" color="inherit" sx={{ color: 'text.primary', fontSize: '0.9rem' }}>
                Scan QR
              </Button>
              <Button component={Link} to="/events/new" color="inherit" sx={{ color: 'text.primary', fontSize: '0.9rem' }}>
                Create
              </Button>
            </>
          )}
          {displayRole === 'ATTENDEE' && (
            <Button component={Link} to="/my-tickets" color="inherit" sx={{ color: 'text.primary', fontSize: '0.9rem' }}>
              My tickets
            </Button>
          )}
        </Stack>

        {/* Desktop Auth Section */}
        <Stack direction="row" spacing={{ xs: 0.5, sm: 1, md: 2 }} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
          {isAuthenticated ? (
            <>
              <Chip
                label={`${user?.email} (${displayRole})`}
                size="small"
                sx={{ display: { md: 'inline-flex' } }}
              />
              <Button
                color="inherit"
                size="small"
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
              <Button color="inherit" size="small" onClick={() => navigate({ to: '/login' })}>
                Login
              </Button>
              <Button color="inherit" size="small" onClick={() => navigate({ to: '/register' })}>
                Register
              </Button>
            </>
          )}
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate({ to: '/events', search: defaultEventsSearch })}
          >
            Browse
          </Button>
        </Stack>

        {/* Mobile Auth & Menu Button */}
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ display: { xs: 'flex', md: 'none' } }}>
          {isAuthenticated && (
            <Chip
              label={displayRole}
              size="small"
              sx={{ fontSize: '0.75rem' }}
            />
          )}
          <IconButton
            color="inherit"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            sx={{ p: 0.5 }}
          >
            {mobileMenuOpen ? <CloseIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
          </IconButton>
        </Stack>
      </Toolbar>

      {/* Mobile Drawer Menu */}
      <Drawer
        anchor="top"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            marginTop: '56px',
            maxHeight: 'calc(100vh - 56px)',
            overflowY: 'auto',
          },
        }}
      >
        <Box sx={{ p: 2, width: '100%' }}>
          {/* Navigation Items */}
          {navItems}

          {/* Divider */}
          <Divider sx={{ my: 2 }} />

          {/* Mobile Auth Buttons */}
          <Stack spacing={1}>
            {isAuthenticated ? (
              <>
                <Typography variant="caption" sx={{ px: 1, color: 'text.secondary' }}>
                  {user?.email}
                </Typography>
                <Button
                  color="inherit"
                  fullWidth
                  sx={{ justifyContent: 'flex-start', color: 'error.main' }}
                  onClick={() => {
                    logout()
                    handleNavClick(() => navigate({ to: '/events', search: defaultEventsSearch }))
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  color="primary"
                  variant="outlined"
                  fullWidth
                  onClick={() => handleNavClick(() => navigate({ to: '/login' }))}
                >
                  Login
                </Button>
                <Button
                  color="primary"
                  variant="contained"
                  fullWidth
                  onClick={() => handleNavClick(() => navigate({ to: '/register' }))}
                >
                  Register
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </Drawer>
    </AppBar>
  )
}
