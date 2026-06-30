import { RefObject } from 'react'
import { Search, Filter } from 'lucide-react'
import { inputClass } from '../../../components/ui/FormField'
import { useCategories } from '../../../hooks/useCategories'

interface TicketFiltersProps {
  searchRef?: RefObject<HTMLInputElement>
  search: string
  status: string
  priority: string
  categoryId?: string
  channel?: string
  onSearchChange: (v: string) => void
  onStatusChange: (v: string) => void
  onPriorityChange: (v: string) => void
  onCategoryChange?: (v: string) => void
  onChannelChange?: (v: string) => void
}

export function TicketFilters({
  searchRef,
  search, status, priority, categoryId, channel,
  onSearchChange, onStatusChange, onPriorityChange, onCategoryChange, onChannelChange,
}: TicketFiltersProps) {
  const { data: categories } = useCategories()

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <div className="relative flex-1 min-w-[180px] max-w-xs">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <input
          ref={searchRef}
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Buscar por título o merchant ID..."
          className={`${inputClass} pl-9`}
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-slate-400" />
        <select
          value={status}
          onChange={e => onStatusChange(e.target.value)}
          className={inputClass}
        >
          <option value="">Todos los estados</option>
          <option value="OPEN">Abierto</option>
          <option value="IN_PROGRESS">En progreso</option>
          <option value="WAITING_CLIENT">Esperando cliente</option>
          <option value="ESCALATED">Escalado</option>
          <option value="RESOLVED">Resuelto</option>
          <option value="CLOSED">Cerrado</option>
        </select>

        <select
          value={priority}
          onChange={e => onPriorityChange(e.target.value)}
          className={inputClass}
        >
          <option value="">Todas las prioridades</option>
          <option value="CRITICAL">Crítico</option>
          <option value="HIGH">Alto</option>
          <option value="MEDIUM">Medio</option>
          <option value="LOW">Bajo</option>
        </select>

        {onCategoryChange && (
          <select
            value={categoryId ?? ''}
            onChange={e => onCategoryChange(e.target.value)}
            className={inputClass}
          >
            <option value="">Todas las categorías</option>
            {categories?.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}

        {onChannelChange && (
          <select
            value={channel ?? ''}
            onChange={e => onChannelChange(e.target.value)}
            className={inputClass}
          >
            <option value="">Todos los canales</option>
            <option value="WEB">Web</option>
            <option value="EMAIL">Email</option>
            <option value="WHATSAPP">WhatsApp</option>
          </select>
        )}
      </div>
    </div>
  )
}
