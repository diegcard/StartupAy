import { useNavigate } from 'react-router-dom'
import { Ticket } from '../../../types'
import { PriorityBadge, StatusBadge, ChannelBadge } from '../../../components/ui/Badge'
import { SlaIndicator } from '../../../components/ui/SlaIndicator'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export type SortKey = 'slaDeadline' | 'priority' | 'createdAt' | 'status'
export type SortDir = 'asc' | 'desc'

interface TicketTableProps {
  tickets: Ticket[]
  isLoading: boolean
  sortBy?: SortKey
  sortDir?: SortDir
  onSort?: (key: SortKey) => void
  selectedIds?: string[]
  onToggle?: (id: string) => void
  onToggleAll?: () => void
}

const HEADERS = ['Ticket', 'Canal', 'Categoría', 'Estado', 'Prioridad', 'SLA', 'Asignado', 'Creado']

export function TicketTable({ tickets, isLoading, selectedIds, onToggle, onToggleAll }: TicketTableProps) {
  const navigate = useNavigate()
  const allSelected = tickets.length > 0 && selectedIds !== undefined && tickets.every(t => selectedIds.includes(t.id))

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 text-sm">Cargando tickets...</div>
  }

  if (tickets.length === 0) {
    return <div className="p-8 text-center text-gray-500 text-sm">No hay tickets que coincidan</div>
  }

  return (
    <table className="w-full">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          {onToggle && (
            <th className="px-4 py-3 w-10">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                className="rounded border-slate-300 text-blue-600 cursor-pointer"
              />
            </th>
          )}
          {HEADERS.map(h => (
            <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {tickets.map(ticket => {
          const isSelected = selectedIds?.includes(ticket.id) ?? false
          return (
            <tr
              key={ticket.id}
              className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50/60' : ''}`}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
            >
              {onToggle && (
                <td className="px-4 py-3 w-10" onClick={e => { e.stopPropagation(); onToggle(ticket.id) }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(ticket.id)}
                    className="rounded border-slate-300 text-blue-600 cursor-pointer"
                    onClick={e => e.stopPropagation()}
                  />
                </td>
              )}
              <td className="px-4 py-3">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[220px]">{ticket.title}</p>
                {ticket.merchantId && <p className="text-xs text-gray-400">#{ticket.merchantId}</p>}
                {ticket.aiSummary && (
                  <p className="text-xs text-blue-600 mt-0.5 truncate max-w-[220px]">✦ {ticket.aiSummary}</p>
                )}
              </td>
              <td className="px-4 py-3"><ChannelBadge channel={ticket.channel} /></td>
              <td className="px-4 py-3">
                <span className="text-xs text-gray-600">
                  {ticket.category?.name ?? <span className="text-gray-400 italic">Sin categoría</span>}
                </span>
                {ticket.aiConfidence != null && (
                  <p className="text-xs text-gray-400">{Math.round(ticket.aiConfidence * 100)}% conf.</p>
                )}
              </td>
              <td className="px-4 py-3"><StatusBadge status={ticket.status} /></td>
              <td className="px-4 py-3"><PriorityBadge priority={ticket.priority} /></td>
              <td className="px-4 py-3"><SlaIndicator deadline={ticket.slaDeadline} /></td>
              <td className="px-4 py-3">
                <span className="text-xs text-gray-600">{ticket.agent?.name ?? <span className="text-gray-400">—</span>}</span>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true, locale: es })}
                </span>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
