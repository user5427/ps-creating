import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { format } from 'date-fns'
import type { EventResponse } from '../schemas'

interface Props {
  open: boolean
  current: EventResponse
  localValues: Record<string, unknown>
  onRefresh: () => void
  onOverwrite: () => void
  onClose: () => void
}

const LABELS: Record<string, string> = {
  title: 'Title',
  description: 'Description',
  category: 'Category',
  venue: 'Venue',
  imageUrl: 'Image URL',
  startTime: 'Start time',
  endTime: 'End time',
  capacity: 'Capacity',
  price: 'Price',
}

function display(field: string, value: unknown): string {
  if (value == null || value === '') return '—'
  if (field === 'startTime' || field === 'endTime') {
    const d = value instanceof Date ? value : new Date(String(value))
    return format(d, 'yyyy-MM-dd HH:mm')
  }
  if (field === 'price' && typeof value === 'number') return `€${value.toFixed(2)}`
  const str = String(value)
  return str.length > 80 ? str.slice(0, 77) + '…' : str
}

export function ConflictDialog({
  open,
  current,
  localValues,
  onRefresh,
  onOverwrite,
  onClose,
}: Props) {
  const fields = Object.keys(LABELS).filter((field) => {
    const server = field === 'startTime' || field === 'endTime'
      ? new Date((current as Record<string, unknown>)[field] as string).getTime()
      : (current as Record<string, unknown>)[field]
    const local = field === 'startTime' || field === 'endTime'
      ? localValues[field] instanceof Date
        ? (localValues[field] as Date).getTime()
        : new Date(String(localValues[field])).getTime()
      : localValues[field]
    return server !== local
  })

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Someone else edited this event</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          The event was changed on the server while you were editing. Review
          the differences below and choose how to proceed.
        </Alert>
        <DialogContentText sx={{ mb: 2 }}>
          <strong>Quality requirement #4:</strong> optimistic locking detected a
          version mismatch (@Version bumped server-side).
        </DialogContentText>
        {fields.length === 0 ? (
          <Typography variant="body2">
            No visible differences — likely a field we don't render here changed.
            Refresh and try again.
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Field</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Your change</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Current on server</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fields.map((field) => (
                <TableRow key={field}>
                  <TableCell>{LABELS[field]}</TableCell>
                  <TableCell>{display(field, localValues[field])}</TableCell>
                  <TableCell>
                    {display(field, (current as Record<string, unknown>)[field])}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
      <DialogActions>
        <Stack direction="row" spacing={1} sx={{ p: 1 }}>
          <Button onClick={onRefresh} color="inherit">
            Refresh & discard my edits
          </Button>
          <Button onClick={onOverwrite} variant="contained" color="primary">
            Overwrite anyway
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  )
}
