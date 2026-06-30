import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTickets } from '../../../hooks/useTickets'
import { useDebounce } from '../../../hooks/useDebounce'
import { useAuthStore } from '../../../store/auth'
import { useTicketNavStore } from '../../../store/ticketNav'
import { useCommandPaletteStore } from '../../../store/commandPalette'
import { useBulkUpdate } from '../../../hooks/useBulkUpdate'
import { TicketFilters } from './TicketFilters'
import { TicketTable } from './TicketTable'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { BulkActionBar } from '../../../components/ui/BulkActionBar'
import { SavedFilterChips } from '../../../components/ui/SavedFilterChips'
import { SavedFilter } from '../../../store/savedFilters'

export type SortKey = 'slaDeadline' | 'priority' | 'createdAt' | 'status'
export type SortDir = 'asc' | 'desc'

type QuickKey = 'mine' | 'critical' | 'escalated'

const QUICK_FILTERS: { label: string; key: QuickKey }[] = [
  { label: 'Mis tickets', key: 'mine' },
  { label: 'Críticos',    key: 'critical' },
  { label: 'Escalados',   key: 'escalated' },
]

const LIMIT = 20

export function TicketListPage() {
  const navigate    = useNavigate()
  const { agent }   = useAuthStore()
  const searchRef   = useRef<HTMLInputElement>(null)
  const setNavIds   = useTicketNavStore(s => s.setIds)
  const openPalette = useCommandPaletteStore(s => s.open)
  const isSupervisor = agent?.role === 'SUPERVISOR' || agent?.role === 'ADMIN'

  const [search,      setSearch]      = useState('')
  const [status,      setStatus]      = useState('')
  const [priority,    setPriority]    = useState('')
  const [categoryId,  setCategoryId]  = useState('')
  const [channel,     setChannel]     = useState('')
  const [myTickets,   setMyTickets]   = useState(false)
  const [sortBy,      setSortBy]      = useState<SortKey>('slaDeadline')
  const [sortDir,     setSortDir]     = useState<SortDir>('asc')
  const [page,        setPage]        = useState(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => { setPage(1) }, [status, priority, categoryId, channel, debouncedSearch, myTickets, sortBy, sortDir])
  useEffect(() => { setSelectedIds([]) }, [page, status, priority, categoryId, channel, debouncedSearch])

  const { data, isLoading, isFetching } = useTickets({
    status:     status || undefined,
    priority:   priority || undefined,
    categoryId: categoryId || undefined,
    channel:    channel || undefined,
    search:     debouncedSearch || undefined,
    assignedTo: myTickets ? agent?.id : undefined,
    sortBy,
    sortDir,
    page: String(page),
    limit: String(LIMIT),
  })

  const tickets    = data?.tickets ?? []
  const totalPages = data?.totalPages ?? 1

  useEffect(() => { setNavIds(tickets.map(t => t.id)) }, [tickets, setNavIds])

  const bulkUpdate = useBulkUpdate()

  function handleSort(key: SortKey) {
    if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(key); setSortDir('asc') }
  }

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) { e.preventDefault(); searchRef.current?.focus() }
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !e.altKey) navigate('/tickets/new')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate])

  function toggleQuick(key: QuickKey) {
    if (key === 'mine')      setMyTickets(v => !v)
    if (key === 'critical')  setPriority(v => v === 'CRITICAL' ? '' : 'CRITICAL')
    if (key === 'escalated') setStatus(v => v === 'ESCALATED' ? '' : 'ESCALATED')
  }

  const quickActive: Record<QuickKey, boolean> = {
    mine:      myTickets,
    critical:  priority === 'CRITICAL',
    escalated: status === 'ESCALATED',
  }

  function toggleSelect(id: string) {
    setSelectedIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id])
  }

  function toggleAll() {
    const allIds = tickets.map(t => t.id)
    const allSelected = allIds.every(id => selectedIds.includes(id))
    setSelectedIds(allSelected ? [] : allIds)
  }

  function handleBulkStatus(newStatus: string) {
    bulkUpdate.mutate(
      { ids: selectedIds, payload: { status: newStatus, aiSuggested: false } },
      { onSuccess: () => setSelectedIds([]) },
    )
  }

  function handleBulkAssign(agentId: string) {
    bulkUpdate.mutate(
      { ids: selectedIds, payload: { assignedTo: agentId, aiSuggested: false } },
      { onSuccess: () => setSelectedIds([]) },
    )
  }

  function applyFilter(filter: SavedFilter) {
    if (filter.status !== undefined)     setStatus(filter.status ?? '')
    if (filter.priority !== undefined)   setPriority(filter.priority ?? '')
    if (filter.categoryId !== undefined) setCategoryId(filter.categoryId ?? '')
    if (filter.channel !== undefined)    setChannel(filter.channel ?? '')
    if (filter.myTickets !== undefined)  setMyTickets(filter.myTickets ?? false)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
        <div className="flex items-baseline gap-3">
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Tickets</h1>
          <span className="text-xs text-slate-400 tabular-nums">
            {isLoading ? '—' : `${data?.total ?? 0} en total`}
          </span>
          {isFetching && !isLoading && (
            <span className="flex items-center gap-1.5 text-[11px] text-blue-500">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block" />
              Actualizando
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openPalette}
            className="hidden sm:flex items-center gap-2 text-xs text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5 bg-white hover:bg-slate-50 transition-colors"
          >
            <span>Buscar…</span>
            <kbd className="text-[10px] bg-slate-100 border border-slate-200 rounded px-1 font-mono">⌘K</kbd>
          </button>
          <Button onClick={() => navigate('/tickets/new')}>
            <Plus className="w-4 h-4" />
            Nuevo
            <kbd className="hidden sm:inline ml-0.5 text-[10px] opacity-50 border border-white/40 rounded px-1 leading-none font-mono">n</kbd>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        {QUICK_FILTERS.map(({ label, key }) => (
          <button
            key={key}
            onClick={() => toggleQuick(key)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
              quickActive[key]
                ? 'bg-[#0f1c2e] border-[#0f1c2e] text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <SavedFilterChips
        currentFilters={{ status, priority, categoryId, channel, myTickets }}
        onApply={applyFilter}
      />

      <TicketFilters
        searchRef={searchRef}
        search={search}
        status={status}
        priority={priority}
        categoryId={categoryId}
        channel={channel}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onPriorityChange={setPriority}
        onCategoryChange={setCategoryId}
        onChannelChange={setChannel}
      />

      <Card className="overflow-hidden">
        <TicketTable
          tickets={tickets}
          isLoading={isLoading}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          selectedIds={selectedIds}
          onToggle={toggleSelect}
          onToggleAll={toggleAll}
        />
      </Card>

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-slate-500 tabular-nums">
            Página {page} de {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 text-xs text-slate-600 border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Anterior
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`min-w-[32px] h-8 text-xs rounded-lg border font-medium transition-colors ${
                    p === page
                      ? 'bg-[#0f1c2e] border-[#0f1c2e] text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              )
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 text-xs text-slate-600 border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <p className="mt-2.5 text-[11px] text-slate-400 text-right select-none">
        <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono">/</kbd>
        {' '}buscar{'  ·  '}
        <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono">n</kbd>
        {' '}nuevo{'  ·  '}
        <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono">⌘K</kbd>
        {' '}paleta
      </p>

      {selectedIds.length > 0 && (
        <BulkActionBar
          selectedCount={selectedIds.length}
          onClear={() => setSelectedIds([])}
          onChangeStatus={handleBulkStatus}
          onAssign={isSupervisor ? handleBulkAssign : undefined}
          loading={bulkUpdate.isPending}
        />
      )}
    </div>
  )
}
