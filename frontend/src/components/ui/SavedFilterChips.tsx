import { useState } from 'react'
import { Bookmark, X, Plus } from 'lucide-react'
import { SavedFilter, useSavedFiltersStore } from '../../store/savedFilters'

interface SavedFilterChipsProps {
  currentFilters: {
    status: string
    priority: string
    categoryId: string
    channel: string
    myTickets: boolean
  }
  onApply: (filter: SavedFilter) => void
}

export function SavedFilterChips({ currentFilters, onApply }: SavedFilterChipsProps) {
  const { filters, save, remove } = useSavedFiltersStore()
  const [naming, setNaming] = useState(false)
  const [name, setName] = useState('')

  const hasActiveFilters = currentFilters.status || currentFilters.priority || currentFilters.categoryId || currentFilters.channel || currentFilters.myTickets

  function handleSave() {
    if (!name.trim()) return
    save({ name: name.trim(), ...currentFilters })
    setName('')
    setNaming(false)
  }

  if (!filters.length && !hasActiveFilters) return null

  return (
    <div className="flex items-center gap-2 flex-wrap mb-2">
      <Bookmark className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
      {filters.map(f => (
        <div key={f.id} className="flex items-center gap-0.5 group">
          <button
            onClick={() => onApply(f)}
            className="text-xs px-2.5 py-1 rounded-full border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700 transition-colors font-medium"
          >
            {f.name}
          </button>
          <button
            onClick={() => remove(f.id)}
            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}

      {hasActiveFilters && !naming && (
        <button
          onClick={() => setNaming(true)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-600 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Guardar filtro actual
        </button>
      )}

      {naming && (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setNaming(false) }}
            placeholder="Nombre del filtro..."
            className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-36"
          />
          <button onClick={handleSave} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Guardar</button>
          <button onClick={() => setNaming(false)} className="text-xs text-slate-400 hover:text-slate-600">Cancelar</button>
        </div>
      )}
    </div>
  )
}
