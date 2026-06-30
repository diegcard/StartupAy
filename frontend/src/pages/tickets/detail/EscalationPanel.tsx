import { useState } from 'react'
import { ShieldAlert, CheckCircle2, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Escalation } from '../../../types'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { inputClass } from '../../../components/ui/FormField'
import { useCategories } from '../../../hooks/useCategories'

interface EscalationPanelProps {
  escalations: Escalation[]
  canResolve: boolean
  onResolve: (id: string, wasAiCorrect: boolean, note: string, correctCategoryId?: string) => void
  isResolving: boolean
}

const TRIGGER_LABELS: Record<string, { label: string; color: string }> = {
  REQUIRES_HUMAN: { label: 'Categoría sensible', color: 'text-red-700 bg-red-50 border-red-200' },
  LOW_CONFIDENCE: { label: 'Baja confianza IA', color: 'text-amber-700 bg-amber-50 border-amber-200' },
}

function ResolveForm({ isResolving, onResolve, onCancel }: {
  escalationId?: string
  isResolving: boolean
  onResolve: (wasAiCorrect: boolean, note: string, correctCategoryId?: string) => void
  onCancel: () => void
}) {
  const [note, setNote] = useState('')
  const [correctCategoryId, setCorrectCategoryId] = useState('')
  const { data: categories } = useCategories()

  return (
    <div className="space-y-2 pt-1">
      <select
        value={correctCategoryId}
        onChange={e => setCorrectCategoryId(e.target.value)}
        className={`${inputClass} text-xs`}
      >
        <option value="">Categoría correcta (opcional)</option>
        {categories?.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Nota de resolución (opcional)..."
        rows={2}
        className={`${inputClass} resize-none text-xs`}
      />
      <div className="flex gap-2">
        <Button
          onClick={() => onResolve(true, note, correctCategoryId || undefined)}
          loading={isResolving}
          className="flex-1 text-xs py-1"
        >
          <CheckCircle2 className="w-3 h-3" /> IA correcta
        </Button>
        <Button
          onClick={() => onResolve(false, note, correctCategoryId || undefined)}
          loading={isResolving}
          className="flex-1 text-xs py-1 bg-red-600 hover:bg-red-700"
        >
          <XCircle className="w-3 h-3" /> IA incorrecta
        </Button>
      </div>
      <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600">
        Cancelar
      </button>
    </div>
  )
}

export function EscalationPanel({ escalations, canResolve, onResolve, isResolving }: EscalationPanelProps) {
  const [resolvingId, setResolvingId] = useState<string | null>(null)

  const pending = escalations.filter(e => !e.resolvedAt)
  const resolved = escalations.filter(e => e.resolvedAt)

  if (!escalations.length) return null

  return (
    <Card className="p-4 space-y-3 border-l-4 border-l-orange-400">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-orange-500" />
        <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
          Escalaciones
        </h3>
        {pending.length > 0 && (
          <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium">
            {pending.length} pendiente{pending.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {pending.map(esc => {
        const meta = TRIGGER_LABELS[esc.trigger] ?? { label: esc.trigger, color: 'text-slate-600 bg-slate-50 border-slate-200' }
        const isExpanded = resolvingId === esc.id

        return (
          <div key={esc.id} className="border border-orange-200 rounded-lg p-3 bg-orange-50 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className={`text-xs border px-2 py-0.5 rounded-full font-medium ${meta.color}`}>
                {meta.label}
              </span>
              {esc.aiConfidence != null && (
                <span className="text-xs text-slate-500">
                  Confianza IA: {Math.round(esc.aiConfidence * 100)}%
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Creada {format(new Date(esc.createdAt), "d MMM yyyy 'a las' HH:mm", { locale: es })}
            </p>

            {canResolve && !isExpanded && (
              <button
                onClick={() => setResolvingId(esc.id)}
                className="text-xs text-orange-700 hover:text-orange-900 font-medium"
              >
                Resolver escalación
              </button>
            )}

            {canResolve && isExpanded && (
              <ResolveForm
                escalationId={esc.id}
                isResolving={isResolving}
                onResolve={(wasAiCorrect, note, correctCategoryId) => {
                  onResolve(esc.id, wasAiCorrect, note, correctCategoryId)
                  setResolvingId(null)
                }}
                onCancel={() => setResolvingId(null)}
              />
            )}
          </div>
        )
      })}

      {resolved.length > 0 && (
        <details className="text-xs text-slate-400 cursor-pointer">
          <summary className="hover:text-slate-600">
            {resolved.length} resuelta{resolved.length !== 1 ? 's' : ''}
          </summary>
          <div className="mt-2 space-y-1">
            {resolved.map(esc => (
              <div key={esc.id} className="flex items-center gap-2 text-slate-500">
                {esc.wasAiCorrect
                  ? <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                  : <XCircle className="w-3 h-3 text-red-400 shrink-0" />
                }
                <span>
                  {TRIGGER_LABELS[esc.trigger]?.label ?? esc.trigger} ·{' '}
                  IA {esc.wasAiCorrect ? 'correcta' : 'incorrecta'}
                  {esc.resolutionNote ? ` — ${esc.resolutionNote}` : ''}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </Card>
  )
}
