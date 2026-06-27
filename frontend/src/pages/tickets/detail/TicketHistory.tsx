import { MessageSquare, User } from 'lucide-react'
import { TicketHistoryEntry } from '../../../types'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card } from '../../../components/ui/Card'

interface TicketHistoryProps {
  history: TicketHistoryEntry[]
}

export function TicketHistory({ history }: TicketHistoryProps) {
  if (!history || history.length === 0) return null

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <MessageSquare className="w-4 h-4" /> Historial de cambios
      </h3>
      <div className="space-y-3">
        {history.map(h => (
          <div key={h.id} className="flex gap-3 text-xs">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">
              <User className="w-3 h-3" />
            </div>
            <div>
              <p className="text-gray-700">
                <span className="font-medium">{h.changedBy.name}</span>
                {h.fromCategory && h.toCategory && h.fromCategory.id !== h.toCategory.id && (
                  <> cambió categoría de <span className="font-medium">{h.fromCategory.name}</span> a <span className="font-medium">{h.toCategory.name}</span></>
                )}
                {h.fromStatus && h.toStatus && h.fromStatus !== h.toStatus && (
                  <> cambió estado a <span className="font-medium">{h.toStatus}</span></>
                )}
                {h.aiSuggested && <span className="ml-1 text-blue-500">✦ IA</span>}
              </p>
              {h.reason && <p className="text-gray-500 mt-0.5 italic">"{h.reason}"</p>}
              <p className="text-gray-400 mt-0.5">
                {formatDistanceToNow(new Date(h.createdAt), { addSuffix: true, locale: es })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
