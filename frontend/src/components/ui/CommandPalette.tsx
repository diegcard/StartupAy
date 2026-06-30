import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, ArrowRight } from 'lucide-react'
import { useCommandPaletteStore } from '../../store/commandPalette'
import { useDebounce } from '../../hooks/useDebounce'
import { ticketsService } from '../../services/tickets.service'
import { PriorityBadge, StatusBadge } from './Badge'

export function CommandPalette() {
  const { isOpen, close } = useCommandPaletteStore()
  const navigate  = useNavigate()
  const inputRef  = useRef<HTMLInputElement>(null)
  const [query, setQuery]   = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)
  const debouncedQuery = useDebounce(query, 200)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setResults([])
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    ticketsService.getAll({ search: debouncedQuery, limit: '8', page: '1' })
      .then(data => {
        setResults(data.tickets)
        setSelected(0)
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [debouncedQuery])

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (!isOpen) return
      if (e.key === 'Escape') { close(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
      if (e.key === 'Enter' && results[selected]) {
        navigate(`/tickets/${results[selected].id}`)
        close()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, results, selected, navigate, close])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4"
      onClick={close}
    >
      <div className="absolute inset-0 bg-[#0f1c2e]/50 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-[0_20px_60px_0_rgb(0_0_0/0.25)] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar tickets por título, ID o merchant…"
            className="flex-1 text-sm text-slate-900 placeholder-slate-400 outline-none bg-transparent"
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin shrink-0" />
          )}
          <button onClick={close} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <ul className="max-h-[360px] overflow-y-auto py-1.5">
            {results.map((ticket, i) => (
              <li key={ticket.id}>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    i === selected ? 'bg-blue-50' : 'hover:bg-slate-50'
                  }`}
                  onClick={() => { navigate(`/tickets/${ticket.id}`); close() }}
                  onMouseEnter={() => setSelected(i)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{ticket.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {ticket.category?.name ?? 'Sin categoría'}
                      {ticket.merchantId && ` · #${ticket.merchantId}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                  {i === selected && <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Empty state */}
        {!loading && query.length >= 2 && results.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-slate-500">Sin resultados para "{query}"</p>
          </div>
        )}

        {/* Hint */}
        {query.length === 0 && (
          <div className="px-4 py-5 text-center">
            <p className="text-xs text-slate-400">Escribe al menos 2 caracteres para buscar</p>
          </div>
        )}

        {/* Footer hints */}
        <div className="flex items-center gap-3 px-4 py-2 border-t border-slate-100 bg-slate-50/50">
          <span className="text-[11px] text-slate-400">
            <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">↑↓</kbd> navegar
          </span>
          <span className="text-[11px] text-slate-400">
            <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">Enter</kbd> abrir
          </span>
          <span className="text-[11px] text-slate-400">
            <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">Esc</kbd> cerrar
          </span>
        </div>
      </div>
    </div>
  )
}
