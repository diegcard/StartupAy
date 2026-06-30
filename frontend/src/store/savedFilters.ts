import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SavedFilter {
  id: string
  name: string
  status?: string
  priority?: string
  categoryId?: string
  channel?: string
  myTickets?: boolean
}

interface SavedFiltersState {
  filters: SavedFilter[]
  save: (filter: Omit<SavedFilter, 'id'>) => void
  remove: (id: string) => void
}

export const useSavedFiltersStore = create<SavedFiltersState>()(
  persist(
    set => ({
      filters: [],
      save: (filter) => set(s => ({
        filters: [...s.filters, { ...filter, id: crypto.randomUUID() }]
      })),
      remove: (id) => set(s => ({ filters: s.filters.filter(f => f.id !== id) })),
    }),
    { name: 'saved-filters' }
  )
)
