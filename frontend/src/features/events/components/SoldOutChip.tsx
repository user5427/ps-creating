import { Chip } from '@mui/material'

export function SoldOutChip() {
  return (
    <Chip
      label="Sold out"
      sx={{
        backgroundColor: '#1A1A1A',
        color: '#FFFFFF',
        fontWeight: 600,
      }}
    />
  )
}
