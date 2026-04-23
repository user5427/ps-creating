import { createTheme } from '@mui/material/styles'

/**
 * Design 2 theme (clean/minimal): white background, dark text, blue accent,
 * rounded cards without shadows. Typography uses a system sans-serif stack.
 */
export const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#6B7280',
    },
    primary: {
      main: '#3366FF',
      contrastText: '#FFFFFF',
    },
    divider: '#E5E7EB',
  },
  typography: {
    fontFamily:
      'Inter, Roboto, "Helvetica Neue", system-ui, -apple-system, "Segoe UI", sans-serif',
    h1: { fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 },
    h2: { fontSize: 32, fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontSize: 24, fontWeight: 600 },
    h4: { fontSize: 20, fontWeight: 600 },
    h5: { fontSize: 18, fontWeight: 600 },
    h6: { fontSize: 16, fontWeight: 600 },
    body1: { fontSize: 14, lineHeight: 1.6 },
    body2: { fontSize: 13, lineHeight: 1.5, color: '#6B7280' },
    button: { fontSize: 14, fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 6 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: '1px solid #E5E7EB',
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 6, fontWeight: 600 },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small', fullWidth: true },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'inherit' },
      styleOverrides: {
        root: {
          borderBottom: '1px solid #E5E7EB',
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500 },
      },
    },
  },
})
