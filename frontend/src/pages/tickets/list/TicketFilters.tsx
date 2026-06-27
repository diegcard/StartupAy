import { Search, Filter } from 'lucide-react'
import { inputClass } from '../../../components/ui/FormField'

interface TicketFiltersProps {
  search: string
  status: string
  priority: string
  onSearchChange: (v: string) => void
  onStatusChange: (v: string) => void
  onPriorityChange: (v: string) => void
}

export function TicketFilters({
  search, status, priority,
  onSearchChange, onStatusChange, onPriorityChange,
}: TicketFiltersProps) {
  return (
    <div className="flex gap-3 mb-4">
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Buscar por título o merchant ID..."
          className={`${inputClass} pl-9`}
        />
      </div>

      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-400" />
        <select
          value={status}
          onChange={e => onStatusChange(e.target.value)}
          className="border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los estados</option>
          <option value="OPEN">Abierto</option>
          <option value="IN_PROGRESS">En progreso</option>
          <option value="ESCALATED">Escalado</option>
          <option value="RESOLVED">Resuelto</option>
        </select>

        <select
          value={priority}
          onChange={e => onPriorityChange(e.target.value)}
          className="border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas las prioridades</option>
          <option value="CRITICAL">Crítico</option>
          <option value="HIGH">Alto</option>
          <option value="MEDIUM">Medio</option>
          <option value="LOW">Bajo</option>
        </select>
      </div>
    </div>
  )
}
