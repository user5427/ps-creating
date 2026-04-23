import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role = 'ORGANIZER' | 'ATTENDEE'

// Dev-only UUIDs seeded by the backend's DevSeedRunner.
// Must stay in sync with application.yml: app.dev.{organizer-id, attendee-id}.
const SEEDED_ORGANIZER_ID = '00000000-0000-0000-0000-000000000001'
const SEEDED_ATTENDEE_ID = '00000000-0000-0000-0000-000000000002'

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
