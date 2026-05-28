import {
  Alert,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from '@mui/material'
import { format } from 'date-fns'
import { QRCodeSVG } from 'qrcode.react'
import { useMemo, useState } from 'react'
import { QrScannerDialog } from '../components/QrScannerDialog'
import { useScanCode } from '../hooks'
import { type CodeResponse } from '../schemas'

function firstUserLabel(code: CodeResponse): string {
  const user = code.user
  return `${user.firstName} ${user.lastName}`.trim() || user.email
}

function firstEventLabel(code: CodeResponse): string {
  return code.event.title
}

function firstEventTime(code: CodeResponse): string {
  const event = code.event
  const start = format(new Date(event.startTime), 'yyyy-MM-dd HH:mm')
  const end = format(new Date(event.endTime), 'HH:mm')
  return `${start} - ${end}`
}

function CodeCard({ title, code }: { title: string; code: CodeResponse }) {
  return (
    <Card variant="outlined" sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }}>
          <QRCodeSVG value={code.qrData} size={180} includeMargin />
          <Stack spacing={0.8}>
            <Typography variant="body1">
              <strong>Code ID:</strong> {code.id}
            </Typography>
            <Typography variant="body1">
              <strong>User:</strong> {firstUserLabel(code)}
            </Typography>
            <Typography variant="body1">
              <strong>Event:</strong> {firstEventLabel(code)}
            </Typography>
            <Typography variant="body1">
              <strong>Time:</strong> {firstEventTime(code)}
            </Typography>
            <Typography variant="body1">
              <strong>Scan count:</strong> {code.scanCount}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export function CodeScanPage() {
  const [scannerOpen, setScannerOpen] = useState(false)
  const [latestScan, setLatestScan] = useState<string>('')
  const [scanResultCode, setScanResultCode] = useState<CodeResponse | null>(null)

  const scanMutation = useScanCode()

  const scanStatus = useMemo(() => {
    if (scanMutation.isPending) {
      return { severity: 'info' as const, text: 'Validating QR code...' }
    }
    if (!scanMutation.data && !scanMutation.error) {
      return null
    }
    if (scanMutation.error) {
      return { severity: 'error' as const, text: 'Failed to validate QR code.' }
    }
    if (scanMutation.data.valid) {
      return { severity: 'success' as const, text: 'QR code is valid.' }
    }
    return { severity: 'error' as const, text: 'QR code is invalid.' }
  }, [scanMutation.data, scanMutation.error, scanMutation.isPending])

  const onScanned = (qrData: string) => {
    setScannerOpen(false)
    setLatestScan(qrData)
    scanMutation.mutate(
      { qrData },
      {
        onSuccess: (result) => {
          setScanResultCode(result.valid ? result.code : null)
        },
        onError: () => {
          setScanResultCode(null)
        },
      },
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Typography variant="h2" sx={{ mb: 1 }}>
        Scan QR code
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Scan attendee QR codes and validate them in real time.
      </Typography>

      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 2 }}>
            QR code scanning
          </Typography>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button variant="contained" onClick={() => setScannerOpen(true)}>
                Open scanner
              </Button>
              {latestScan && (
                <Typography variant="body2" sx={{ alignSelf: 'center' }}>
                  Last scan payload: {latestScan}
                </Typography>
              )}
            </Stack>

            {scanStatus && <Alert severity={scanStatus.severity}>{scanStatus.text}</Alert>}

            {scanResultCode && <CodeCard title="Scanned code details" code={scanResultCode} />}
          </Stack>
        </CardContent>
      </Card>


      <QrScannerDialog open={scannerOpen} onClose={() => setScannerOpen(false)} onScanned={onScanned} />
    </Container>
  )
}
