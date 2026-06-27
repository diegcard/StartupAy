import { Sparkles, AlertTriangle } from 'lucide-react'
import { Ticket } from '../../../types'

interface AiBannerProps {
  ticket: Ticket
  onReclassify: () => void
  isReclassifying: boolean
}

export function AiBanner({ ticket, onReclassify, isReclassifying }: AiBannerProps) {
  if (!ticket.aiSummary) return null

  const requiresHuman = ticket.category?.requiresHuman

  return (
    <div className={`rounded-xl p-4 border ${requiresHuman ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
      <div className="flex items-start gap-3">
        {requiresHuman
          ? <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
          : <Sparkles className="w-5 h-5 text-blue-500 mt-0.5" />
        }
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-gray-900">
              {requiresHuman ? 'Requiere revisión humana' : 'Clasificación sugerida por Gemini'}
            </p>
            {ticket.aiConfidence != null && (
              <span className="text-xs bg-white border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full">
                {Math.round(ticket.aiConfidence * 100)}% confianza
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{ticket.aiSummary}</p>
          {ticket.aiSuggestedCategory && ticket.aiSuggestedCategory !== ticket.categoryId && (
            <p className="text-xs text-blue-600 mt-1">Categoría sugerida vs. asignada difieren — revisar</p>
          )}
        </div>
        <button
          onClick={onReclassify}
          disabled={isReclassifying}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
        >
          {isReclassifying ? 'Reclasificando...' : 'Re-clasificar'}
        </button>
      </div>
    </div>
  )
}
