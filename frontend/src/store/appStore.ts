import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User as AuthUser } from '../features/auth/schemas'

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
  token?: string | null
  user?: AuthUser | null
  setRole: (role: Role) => void
  setAuth: (token: string, user: AuthUser) => void
  logout: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      actorId: SEEDED_ORGANIZER_ID,
      role: 'ORGANIZER',
      token: null,
      user: null,
      setRole: (role) =>
        set({
          role,
          actorId: role === 'ORGANIZER' ? SEEDED_ORGANIZER_ID : SEEDED_ATTENDEE_ID,
        }),
      setAuth: (token, user) =>
        set({
          token,
          user,
          actorId: user.id,
          role: user.role as Role,
        }),
      logout: () =>
        set({
          token: null,
          user: null,
          actorId: SEEDED_ATTENDEE_ID,
          role: 'ATTENDEE',
        }),
    }),
    { name: 'psk-app-store' },
  ),
)
