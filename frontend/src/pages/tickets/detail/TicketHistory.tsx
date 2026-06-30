import { MessageSquare, User, Lock } from 'lucide-react'
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
      <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-slate-400" /> Historial de cambios
      </h3>
      <div className="space-y-3">
        {history.map(h => (
          <div
            key={h.id}
            className={`flex gap-3 text-xs ${h.isInternal ? 'opacity-80' : ''}`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
              h.isInternal
                ? 'bg-amber-50 text-amber-500'
                : 'bg-slate-100 text-slate-400'
            }`}>
              {h.isInternal ? <Lock className="w-3 h-3" /> : <User className="w-3 h-3" />}
            </div>
            <div className={`flex-1 rounded-lg px-3 py-2 ${
              h.isInternal
                ? 'bg-amber-50 border border-amber-100'
                : 'bg-transparent'
            }`}>
              <p className="text-slate-700">
                <span className="font-medium">{h.changedBy.name}</span>
                {h.fromCategory && h.toCategory && h.fromCategory.id !== h.toCategory.id && (
                  <> cambió categoría de <span className="font-medium">{h.fromCategory.name}</span> a <span className="font-medium">{h.toCategory.name}</span></>
                )}
                {h.fromStatus && h.toStatus && h.fromStatus !== h.toStatus && (
                  <> cambió estado a <span className="font-medium">{h.toStatus}</span></>
                )}
                {h.aiSuggested && <span className="ml-1 text-violet-500">✦ IA</span>}
                {h.isInternal && <span className="ml-1 text-amber-600 font-medium">· Interna</span>}
              </p>
              {h.reason && (
                <p className="text-slate-500 mt-0.5 italic">"{h.reason}"</p>
              )}
              <p className="text-slate-400 mt-0.5">
                {formatDistanceToNow(new Date(h.createdAt), { addSuffix: true, locale: es })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
