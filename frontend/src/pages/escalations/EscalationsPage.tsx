import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert, CheckCircle2, XCircle, ExternalLink, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { usePendingEscalations, useResolveEscalation } from '../../hooks/useEscalations'
import { useCategories } from '../../hooks/useCategories'
import { Spinner } from '../../components/ui/Spinner'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { inputClass } from '../../components/ui/FormField'
import { EscalationWithTicket } from '../../types'

const TRIGGER_META = {
  REQUIRES_HUMAN: { label: 'Categoría sensible', color: 'bg-red-100 text-red-700 border-red-200' },
  LOW_CONFIDENCE: { label: 'Baja confianza IA', color: 'bg-amber-100 text-amber-700 border-amber-200' },
}

interface ResolveFormProps {
  escalationId: string
  onClose: () => void
  isResolving: boolean
  onResolve: (wasAiCorrect: boolean, note: string, correctCategoryId?: string) => void
}

function ResolveForm({ escalationId, onClose, isResolving, onResolve }: ResolveFormProps) {
  const [note, setNote] = useState('')
  const [correctCategoryId, setCorrectCategoryId] = useState('')
  const { data: categories } = useCategories()

  return (
    <div className="mt-3 border-t border-orange-200 pt-3 space-y-3">
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
          className="flex-1 text-xs py-1.5 bg-emerald-600 hover:bg-emerald-700"
        >
          <CheckCircle2 className="w-3 h-3" /> IA correcta
        </Button>
        <Button
          onClick={() => onResolve(false, note, correctCategoryId || undefined)}
          loading={isResolving}
          className="flex-1 text-xs py-1.5 bg-red-600 hover:bg-red-700"
        >
          <XCircle className="w-3 h-3" /> IA incorrecta
        </Button>
      </div>
      <button onClick={onClose} className="text-xs text-slate-400 hover:text-slate-600">
        Cancelar
      </button>
    </div>
  )
}

export function EscalationsPage() {
  const { data: escalations, isLoading } = usePendingEscalations()
  const resolveMutation = useResolveEscalation()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (isLoading) return <Spinner text="Cargando escalaciones..." />

  const list = (escalations ?? []) as EscalationWithTicket[]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-orange-500" />
            Escalaciones pendientes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wide">Requieren decisión de un especialista</p>
        </div>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${
          list.length > 0
            ? 'bg-orange-50 text-orange-700 border-orange-200'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          {list.length} pendiente{list.length !== 1 ? 's' : ''}
        </span>
      </div>

      {list.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <p className="text-slate-700 font-medium">Sin escalaciones pendientes</p>
          <p className="text-sm text-slate-400 mt-1">Todas las escalaciones están resueltas</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {list.map(esc => {
            const meta = TRIGGER_META[esc.trigger] ?? { label: esc.trigger, color: 'bg-slate-100 text-slate-600 border-slate-200' }
            const isExpanded = expandedId === esc.id

            return (
              <Card key={esc.id} className="p-4 border-l-4 border-l-orange-400">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs border px-2 py-0.5 rounded-full font-medium ${meta.color}`}>
                        {meta.label}
                      </span>
                      {esc.aiConfidence != null && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          Confianza IA: <strong>{Math.round(esc.aiConfidence * 100)}%</strong>
                        </span>
                      )}
                      {esc.ticket?.category && (
                        <span className="text-xs text-slate-500">
                          Categoría: <strong>{esc.ticket.category.name}</strong>
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-medium text-slate-900 truncate">
                      {esc.ticket?.title ?? '(sin título)'}
                    </p>

                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(esc.createdAt), { addSuffix: true, locale: es })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/tickets/${esc.ticketId}`}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      Ver ticket <ExternalLink className="w-3 h-3" />
                    </Link>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : esc.id)}
                      className="text-xs font-medium text-orange-700 hover:text-orange-900 border border-orange-200 bg-orange-50 px-2.5 py-1 rounded-lg"
                    >
                      {isExpanded ? 'Cancelar' : 'Resolver'}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <ResolveForm
                    escalationId={esc.id}
                    onClose={() => setExpandedId(null)}
                    isResolving={resolveMutation.isPending}
                    onResolve={(wasAiCorrect, note, correctCategoryId) => {
                      resolveMutation.mutate({
                        id: esc.id,
                        payload: { wasAiCorrect, resolutionNote: note || undefined, correctCategoryId },
                      }, { onSuccess: () => setExpandedId(null) })
                    }}
                  />
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
