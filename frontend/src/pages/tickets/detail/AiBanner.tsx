import { useState } from 'react'
import { Sparkles, AlertTriangle, ShieldAlert, Copy, Check, MessageSquare } from 'lucide-react'
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

function DraftResponseBox({ draft }: { draft: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(draft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-3 border border-blue-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-blue-100/60 border-b border-blue-200">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 uppercase tracking-wide">
          <MessageSquare className="w-3 h-3" />
          Borrador de respuesta sugerido por IA
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          {copied ? <><Check className="w-3 h-3" />Copiado</> : <><Copy className="w-3 h-3" />Copiar</>}
        </button>
      </div>
      <p className="px-3 py-2.5 text-sm text-slate-700 leading-relaxed italic bg-white">
        "{draft}"
      </p>
    </div>
  )
}

export function AiBanner({ ticket, onReclassify, isReclassifying }: AiBannerProps) {
  if (!ticket.aiSummary) return null

  const requiresHuman    = ticket.category?.requiresHuman
  const confidence       = ticket.aiConfidence ?? 0
  const isLowConfidence  = confidence < 0.70 && !requiresHuman
  const hasDraft         = !!ticket.aiDraftResponse

  if (requiresHuman) {
    return (
      <div className="rounded-xl p-4 border bg-red-50 border-red-200">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <p className="text-sm font-semibold text-red-800">Revisión humana obligatoria</p>
              {ticket.aiConfidence != null && <ConfidencePill confidence={ticket.aiConfidence} />}
            </div>
            <p className="text-sm text-red-700">{ticket.aiSummary}</p>
            <p className="text-xs text-red-500 mt-1">
              Categoría sensible — el especialista debe tomar la decisión. El agente no puede enrutar ni cerrar este ticket.
            </p>
          </div>
          <button onClick={onReclassify} disabled={isReclassifying}
            className="text-xs text-red-600 hover:text-red-800 font-medium whitespace-nowrap shrink-0">
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
              <p className="text-sm font-semibold text-amber-800">Confianza insuficiente — requiere revisión</p>
              {ticket.aiConfidence != null && <ConfidencePill confidence={ticket.aiConfidence} />}
            </div>
            <p className="text-sm text-amber-700">{ticket.aiSummary}</p>
            <p className="text-xs text-amber-600 mt-1">
              Categoría sugerida: <strong>{ticket.aiSuggestedCategory ?? '—'}</strong> · Se creó escalación para revisión manual.
            </p>
          </div>
          <button onClick={onReclassify} disabled={isReclassifying}
            className="text-xs text-amber-700 hover:text-amber-900 font-medium whitespace-nowrap shrink-0">
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
            <p className="text-sm font-semibold text-slate-900">Clasificación sugerida por Gemini</p>
            {ticket.aiConfidence != null && <ConfidencePill confidence={ticket.aiConfidence} />}
          </div>
          <p className="text-sm text-slate-600">{ticket.aiSummary}</p>
          {ticket.aiSuggestedCategory && ticket.aiSuggestedCategory !== ticket.categoryId && (
            <p className="text-xs text-blue-600 mt-1">La categoría sugerida difiere de la asignada — revisar</p>
          )}
          {hasDraft && <DraftResponseBox draft={ticket.aiDraftResponse!} />}
        </div>
        <button onClick={onReclassify} disabled={isReclassifying}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap shrink-0">
          {isReclassifying ? 'Reclasificando...' : 'Re-clasificar'}
        </button>
      </div>
    </div>
  )
}
