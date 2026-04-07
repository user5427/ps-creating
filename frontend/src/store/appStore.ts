import { create } from 'zustand'

interface AppStore {
  userId: string | null
  setUserId: (id: string) => void
  clearUserId: () => void
}

export const useAppStore = create<AppStore>((set) => ({
  userId: null,
  setUserId: (id: string) => set({ userId: id }),
  clearUserId: () => set({ userId: null }),
}))
