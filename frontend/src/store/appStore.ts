import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role = 'ORGANIZER' | 'ATTENDEE'

// Read seeded actor UUIDs from Vite env vars when provided so backend seed
// changes don't require a frontend code change. Defaults match the UUIDs
// written by the backend's DevSeedRunner (app.dev.{organizer-id, attendee-id}).
const SEEDED_ORGANIZER_ID =
  import.meta.env.VITE_DEV_ORGANIZER_ID ?? '00000000-0000-0000-0000-000000000001'
const SEEDED_ATTENDEE_ID =
  import.meta.env.VITE_DEV_ATTENDEE_ID ?? '00000000-0000-0000-0000-000000000002'

interface AppState {
  actorId: string
  role: Role
  setRole: (role: Role) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      actorId: SEEDED_ORGANIZER_ID,
      role: 'ORGANIZER',
      setRole: (role) =>
        set({
          role,
          actorId: role === 'ORGANIZER' ? SEEDED_ORGANIZER_ID : SEEDED_ATTENDEE_ID,
        }),
    }),
    { name: 'psk-app-store' },
  ),
)
