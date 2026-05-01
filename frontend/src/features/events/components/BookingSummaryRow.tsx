import {Stack, Typography} from "@mui/material";

export function BookingSummaryRow({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
    return (
        <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Typography color="text.secondary">{label}</Typography>
            <Typography sx={{ textAlign: 'right', fontWeight: bold ? 600 : 400 }}>{value}</Typography>
        </Stack>
    )
}