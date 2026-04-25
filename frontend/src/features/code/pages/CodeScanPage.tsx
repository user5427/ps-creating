import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { format } from 'date-fns'
import { QRCodeSVG } from 'qrcode.react'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useAppStore } from '../../../store/appStore'
import { QrScannerDialog } from '../components/QrScannerDialog'
import { useGenerateCode, useScanCode, useViewCode } from '../hooks'
import {
  GenerateCodeFormSchema,
  ViewCodeFormSchema,
  type CodeResponse,
  type GenerateCodeFormValues,
  type ViewCodeFormValues,
} from '../schemas'

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
  const role = useAppStore((s) => s.role)
  const isOrganizer = role === 'ORGANIZER'

  const [scannerOpen, setScannerOpen] = useState(false)
  const [latestScan, setLatestScan] = useState<string>('')
  const [scanResultCode, setScanResultCode] = useState<CodeResponse | null>(null)
  const [generatedCode, setGeneratedCode] = useState<CodeResponse | null>(null)
  const [viewedCode, setViewedCode] = useState<CodeResponse | null>(null)

  const generateMutation = useGenerateCode()
  const scanMutation = useScanCode()
  const viewMutation = useViewCode()

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

  const generateForm = useForm<GenerateCodeFormValues>({
    resolver: zodResolver(GenerateCodeFormSchema),
    defaultValues: {
      id: '',
      userId: '',
      eventId: '',
    },
  })

  const viewForm = useForm<ViewCodeFormValues>({
    resolver: zodResolver(ViewCodeFormSchema),
    defaultValues: {
      codeId: '',
    },
  })

  const onGenerate = generateForm.handleSubmit(async (values) => {
    const created = await generateMutation.mutateAsync(values)
    setGeneratedCode(created)
  })

  const onView = viewForm.handleSubmit(async (values) => {
    const code = await viewMutation.mutateAsync(values.codeId)
    setViewedCode(code)
  })

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
        Scan event QR codes and verify them with the backend.
      </Typography>

      {!isOrganizer && (
        <Alert severity="info" sx={{ mb: 4 }}>
          Only organizers can scan and generate QR codes. You can still view a QR code by ID if it belongs to you.
        </Alert>
      )}

      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 2 }}>
            QR code scanning
          </Typography>
          {isOrganizer ? (
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
          ) : (
            <Alert severity="warning">Scanning is available only for organizers.</Alert>
          )}
        </CardContent>
      </Card>

      <Divider sx={{ mb: 4 }} />

      <Typography variant="h4" sx={{ mb: 2 }}>
        Admin testing tools
      </Typography>

      {isOrganizer ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  Create QR code (test)
                </Typography>
                <Box component="form" onSubmit={onGenerate}>
                  <Stack spacing={2}>
                    <Controller
                      name="id"
                      control={generateForm.control}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label="Code ID (optional UUID)"
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />
                    <Controller
                      name="userId"
                      control={generateForm.control}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label="User ID"
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />
                    <Controller
                      name="eventId"
                      control={generateForm.control}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label="Event ID"
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />
                    <Button type="submit" variant="contained" disabled={generateMutation.isPending}>
                      Generate QR code
                    </Button>
                    {generateMutation.error && (
                      <Alert severity="error">Failed to generate QR code.</Alert>
                    )}
                    {generatedCode && <CodeCard title="Generated QR code" code={generatedCode} />}
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  View QR code by ID
                </Typography>
                <Box component="form" onSubmit={onView}>
                  <Stack spacing={2}>
                    <Controller
                      name="codeId"
                      control={viewForm.control}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label="Code ID"
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />
                    <Button type="submit" variant="outlined" disabled={viewMutation.isPending}>
                      View QR code
                    </Button>
                    {viewMutation.error && <Alert severity="error">Failed to view QR code.</Alert>}
                    {viewedCode && <CodeCard title="Viewed QR code" code={viewedCode} />}
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Alert severity="warning">Admin testing forms are available only to organizers.</Alert>
      )}

      <QrScannerDialog open={scannerOpen} onClose={() => setScannerOpen(false)} onScanned={onScanned} />
    </Container>
  )
}
