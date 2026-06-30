import { Sparkles, AlertTriangle, ShieldAlert } from 'lucide-react'
import { Ticket } from '../../../types'

interface AiBannerProps {
  ticket: Ticket
  onReclassify: () => void
  isReclassifying: boolean
}

function ConfidencePill({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100)
  const colorClass =
    confidence >= 0.90 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
    confidence >= 0.70 ? 'bg-amber-50 border-amber-200 text-amber-700' :
                         'bg-red-50 border-red-200 text-red-700'
  const label =
    confidence >= 0.90 ? `${pct}% · A2 auto` :
    confidence >= 0.70 ? `${pct}% · A1 sugerido` :
                         `${pct}% · baja confianza`

  return (
    <span className={`text-xs border px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
      {label}
    </span>
  )
}

export function AiBanner({ ticket, onReclassify, isReclassifying }: AiBannerProps) {
  if (!ticket.aiSummary) return null

  const requiresHuman = ticket.category?.requiresHuman
  const confidence = ticket.aiConfidence ?? 0
  const isLowConfidence = confidence < 0.70 && !requiresHuman

  if (requiresHuman) {
    return (
      <div className="rounded-xl p-4 border bg-red-50 border-red-200">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <p className="text-sm font-semibold text-red-800">
                Revisión humana obligatoria
              </p>
              {ticket.aiConfidence != null && <ConfidencePill confidence={ticket.aiConfidence} />}
            </div>
            <p className="text-sm text-red-700">{ticket.aiSummary}</p>
            <p className="text-xs text-red-500 mt-1">
              Esta categoría requiere que un especialista tome la decisión.
              El agente no puede enrutar ni cerrar este ticket.
            </p>
          </div>
          <button
            onClick={onReclassify}
            disabled={isReclassifying}
            className="text-xs text-red-600 hover:text-red-800 font-medium whitespace-nowrap shrink-0"
          >
            {isReclassifying ? 'Reclasificando...' : 'Re-clasificar'}
          </button>
        </div>
      </div>
    )
  }

  if (isLowConfidence) {
    return (
      <div className="rounded-xl p-4 border bg-amber-50 border-amber-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <p className="text-sm font-semibold text-amber-800">
                Confianza insuficiente — requiere revisión
              </p>
              {ticket.aiConfidence != null && <ConfidencePill confidence={ticket.aiConfidence} />}
            </div>
            <p className="text-sm text-amber-700">{ticket.aiSummary}</p>
            <p className="text-xs text-amber-600 mt-1">
              La categoría sugerida es{' '}
              <strong>{ticket.aiSuggestedCategory ?? '—'}</strong> pero la confianza es
              insuficiente. Se creó una escalación para revisión manual.
            </p>
          </div>
          <button
            onClick={onReclassify}
            disabled={isReclassifying}
            className="text-xs text-amber-700 hover:text-amber-900 font-medium whitespace-nowrap shrink-0"
          >
            {isReclassifying ? 'Reclasificando...' : 'Re-clasificar'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl p-4 border bg-blue-50 border-blue-200">
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-sm font-semibold text-slate-900">
              Clasificación sugerida por Gemini
            </p>
            {ticket.aiConfidence != null && <ConfidencePill confidence={ticket.aiConfidence} />}
          </div>
          <p className="text-sm text-slate-600">{ticket.aiSummary}</p>
          {ticket.aiSuggestedCategory && ticket.aiSuggestedCategory !== ticket.categoryId && (
            <p className="text-xs text-blue-600 mt-1">
              La categoría sugerida difiere de la asignada — revisar
            </p>
          )}
        </div>
        <button
          onClick={onReclassify}
          disabled={isReclassifying}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap shrink-0"
        >
          {isReclassifying ? 'Reclasificando...' : 'Re-clasificar'}
        </button>
      </div>
    </div>
  )
}
