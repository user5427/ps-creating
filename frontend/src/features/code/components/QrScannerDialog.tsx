import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import { Html5Qrcode } from 'html5-qrcode'
import { useEffect, useRef, useState } from 'react'

interface QrScannerDialogProps {
  open: boolean
  onClose: () => void
  onScanned: (qrData: string) => void
}

export function QrScannerDialog({ open, onClose, onScanned }: QrScannerDialogProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerElementIdRef = useRef(`qr-reader-${Math.random().toString(36).slice(2, 10)}`)
  const handledScanRef = useRef(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const scannerElementId = scannerElementIdRef.current

  useEffect(() => {
    if (!open) {
      return
    }

    handledScanRef.current = false
    setErrorMessage(null)

    let disposed = false

    const startScanner = async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))

      if (!document.getElementById(scannerElementId)) {
        if (!disposed) {
          setErrorMessage('Scanner container is not ready yet. Please try again.')
        }
        return
      }

      try {
        const scanner = new Html5Qrcode(scannerElementId)
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 240, height: 240 },
            aspectRatio: 1.333,
          },
          (decodedText) => {
            if (handledScanRef.current) {
              return
            }
            handledScanRef.current = true
            onScanned(decodedText)
          },
          () => {
            // Keep scanner running while waiting for a valid code.
          },
        )
      } catch {
        if (!disposed) {
          setErrorMessage('Unable to access camera. Check browser camera permissions.')
        }
      }
    }

    void startScanner()

    return () => {
      disposed = true
      const activeScanner = scannerRef.current
      scannerRef.current = null
      if (!activeScanner) {
        return
      }
      activeScanner
        .stop()
        .catch(() => undefined)
        .finally(() => {
          activeScanner.clear()
        })
    }
  }, [open, onScanned, scannerElementId])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" keepMounted>
      <DialogTitle>Scan QR code</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Point your camera at a QR code. The scanner closes automatically after a successful read.
        </Typography>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}
        <Box
          id={scannerElementId}
          sx={{
            width: '100%',
            minHeight: 300,
            '& video': {
              borderRadius: 1,
              maxHeight: 320,
            },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
