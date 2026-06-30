import { create } from 'zustand'

interface TicketNavStore {
  ids: string[]
  setIds: (ids: string[]) => void
}

export const useTicketNavStore = create<TicketNavStore>(set => ({
  ids: [],
  setIds: (ids) => set({ ids }),
}))
