import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { useNavigate, useParams } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import { ConflictDialog } from '../components/ConflictDialog'
import {
  ConflictErrorSchema,
  EventFormSchema,
  ValidationErrorSchema,
  type EventFormValues,
  type EventResponse,
} from '../schemas'
import { useCreateEvent, useEvent, useUpdateEvent } from '../hooks'

type Mode = 'create' | 'edit'

interface Props {
  mode: Mode
}

const DEFAULTS: EventFormValues = {
  title: '',
  description: '',
  category: '',
  venue: '',
  imageUrl: undefined,
  startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
  capacity: 100,
  price: 0,
}

export function EventFormPage({ mode }: Props) {
  const params = useParams({ strict: false })
  const eventId = params.eventId as string | undefined
  const navigate = useNavigate()

  const { data: existing, isLoading } = useEvent(mode === 'edit' ? eventId : undefined)
  const createMutation = useCreateEvent()
  const updateMutation = useUpdateEvent(eventId ?? '')

  const [serverError, setServerError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [conflict, setConflict] = useState<EventResponse | null>(null)

  const form = useForm<EventFormValues>({
    resolver: zodResolver(EventFormSchema),
    defaultValues: DEFAULTS,
  })

  useEffect(() => {
    if (mode === 'edit' && existing) {
      form.reset({
        title: existing.title,
        description: existing.description,
        category: existing.category,
        venue: existing.venue,
        imageUrl: existing.imageUrl ?? undefined,
        startTime: new Date(existing.startTime),
        endTime: new Date(existing.endTime),
        capacity: existing.capacity,
        price: existing.price,
      })
    }
  }, [mode, existing, form])

  async function submit(values: EventFormValues, overwriteVersion?: number) {
    setServerError(null)
    setFieldErrors({})
    const payload = {
      ...values,
      startTime: values.startTime.toISOString(),
      endTime: values.endTime.toISOString(),
    }

    try {
      if (mode === 'create') {
        const created = await createMutation.mutateAsync(payload)
        navigate({ to: '/events/$eventId', params: { eventId: created.id } })
      } else if (eventId) {
        const version = overwriteVersion ?? existing?.version
        if (version == null) throw new Error('Missing version')
        const updated = await updateMutation.mutateAsync({ ...payload, version })
        navigate({ to: '/events/$eventId', params: { eventId: updated.id } })
      }
    } catch (err) {
      handleError(err)
    }
  }

  function handleError(err: unknown) {
    if (err instanceof AxiosError && err.response) {
      const data = err.response.data
      const conflictParsed = ConflictErrorSchema.safeParse(data)
      if (err.response.status === 409 && conflictParsed.success) {
        setConflict(conflictParsed.data.currentServerState)
        return
      }
      const validationParsed = ValidationErrorSchema.safeParse(data)
      if (validationParsed.success) {
        setFieldErrors(validationParsed.data.fieldErrors)
        setServerError('Please fix the highlighted fields.')
        return
      }
      setServerError(data?.message ?? err.message)
      return
    }
    setServerError(err instanceof Error ? err.message : 'Unexpected error')
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  if (mode === 'edit' && isLoading) {
    return (
      <Container sx={{ py: 10, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
      <Typography variant="h1" gutterBottom>
        {mode === 'create' ? 'Create event' : 'Edit event'}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {mode === 'create'
          ? 'Fill in the event details. Required fields are marked.'
          : 'Update any of the event details below.'}
      </Typography>

      {serverError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {serverError}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={form.handleSubmit((v) => submit(v))}
        noValidate
      >
        <Stack spacing={3}>
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Title"
                error={!!fieldState.error || !!fieldErrors.title}
                helperText={fieldState.error?.message ?? fieldErrors.title}
                required
              />
            )}
          />
          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Description"
                multiline
                rows={5}
                error={!!fieldState.error || !!fieldErrors.description}
                helperText={fieldState.error?.message ?? fieldErrors.description}
                required
              />
            )}
          />
          <Controller
            name="category"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Category"
                error={!!fieldState.error || !!fieldErrors.category}
                helperText={
                  fieldState.error?.message ??
                  fieldErrors.category ??
                  'e.g. Music, Tech, Sports'
                }
                required
              />
            )}
          />
          <Controller
            name="venue"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Venue"
                error={!!fieldState.error || !!fieldErrors.venue}
                helperText={fieldState.error?.message ?? fieldErrors.venue}
                required
              />
            )}
          />
          <Controller
            name="imageUrl"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                label="Image URL (optional)"
                error={!!fieldState.error || !!fieldErrors.imageUrl}
                helperText={fieldState.error?.message ?? fieldErrors.imageUrl}
              />
            )}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Controller
              name="startTime"
              control={form.control}
              render={({ field, fieldState }) => (
                <DateTimePicker
                  label="Start time"
                  value={field.value}
                  onChange={(v) => field.onChange(v)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!fieldState.error || !!fieldErrors.startTime,
                      helperText: fieldState.error?.message ?? fieldErrors.startTime,
                    },
                  }}
                />
              )}
            />
            <Controller
              name="endTime"
              control={form.control}
              render={({ field, fieldState }) => (
                <DateTimePicker
                  label="End time"
                  value={field.value}
                  onChange={(v) => field.onChange(v)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!fieldState.error || !!fieldErrors.endTime,
                      helperText: fieldState.error?.message ?? fieldErrors.endTime,
                    },
                  }}
                />
              )}
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Controller
              name="capacity"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Capacity"
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                  }
                  error={!!fieldState.error || !!fieldErrors.capacity}
                  helperText={fieldState.error?.message ?? fieldErrors.capacity}
                  required
                />
              )}
            />
            <Controller
              name="price"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Price"
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                  }
                  InputProps={{
                    startAdornment: <InputAdornment position="start">€</InputAdornment>,
                  }}
                  error={!!fieldState.error || !!fieldErrors.price}
                  helperText={fieldState.error?.message ?? fieldErrors.price}
                  required
                />
              )}
            />
          </Stack>
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
            >
              {mode === 'create' ? 'Create event' : 'Save changes'}
            </Button>
            <Button
              color="inherit"
              onClick={() => navigate({ to: '/events' })}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Box>

      {conflict && (
        <ConflictDialog
          open
          current={conflict}
          localValues={form.getValues()}
          onClose={() => setConflict(null)}
          onRefresh={() => {
            form.reset({
              title: conflict.title,
              description: conflict.description,
              category: conflict.category,
              venue: conflict.venue,
              imageUrl: conflict.imageUrl ?? undefined,
              startTime: new Date(conflict.startTime),
              endTime: new Date(conflict.endTime),
              capacity: conflict.capacity,
              price: conflict.price,
            })
            setConflict(null)
          }}
          onOverwrite={async () => {
            const version = conflict.version
            setConflict(null)
            await submit(form.getValues(), version)
          }}
        />
      )}
    </Container>
  )
}
