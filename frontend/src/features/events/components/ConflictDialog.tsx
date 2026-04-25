import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
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

const DATE_FIELDS = new Set(['startTime', 'endTime'])
const PLACEHOLDER = '—'

function toDateOrNull(value: unknown): Date | null {
  if (value == null || value === '') return null
  const d = value instanceof Date ? value : new Date(String(value))
  return isNaN(d.getTime()) ? null : d
}

function display(field: string, value: unknown): string {
  if (DATE_FIELDS.has(field)) {
    const d = toDateOrNull(value)
    return d ? format(d, 'yyyy-MM-dd HH:mm') : PLACEHOLDER
  }
  if (value == null || value === '') return PLACEHOLDER
  if (field === 'price' && typeof value === 'number') return `€${value.toFixed(2)}`
  const str = String(value)
  return str.length > 80 ? str.slice(0, 77) + '…' : str
}

/** Normalize a value into a canonical form so trivial differences don't trigger the dialog. */
function canonical(field: string, value: unknown): unknown {
  if (DATE_FIELDS.has(field)) {
    const d = toDateOrNull(value)
    return d ? d.getTime() : null
  }
  // Treat null / undefined / '' as equivalent for optional strings.
  if (value == null || value === '') return null
  return value
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
    const server = canonical(field, (current as Record<string, unknown>)[field])
    const local = canonical(field, localValues[field])
    return server !== local
  })

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Someone else edited this event</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          This event was updated after you started editing it. Compare your
          changes with the current server values, then refresh or overwrite as
          needed.
        </Alert>
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
