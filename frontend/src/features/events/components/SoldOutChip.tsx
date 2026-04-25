import { Chip, type ChipProps } from '@mui/material'

export function SoldOutChip({ sx, size = 'small', ...rest }: Omit<ChipProps, 'label'>) {
  return (
    <Chip
      {...rest}
      size={size}
      label="Sold out"
      sx={[
        (theme) => ({
          backgroundColor: theme.palette.text.primary,
          color: theme.palette.primary.contrastText,
          fontWeight: 600,
        }),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    />
  )
}
