import { useState, useEffect } from 'react'
import { CheckCircle, Sparkles, Lock, Globe, Loader2, ArrowRight } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { inputClass } from '../../../components/ui/FormField'
import { Button } from '../../../components/ui/Button'
import { UpdateTicketPayload, ticketsService } from '../../../services/tickets.service'
import { useCategories } from '../../../hooks/useCategories'
import { useAgents } from '../../../hooks/useAgents'
import { useParams } from 'react-router-dom'
import { toast } from '../../../store/toast'
import { Ticket } from '../../../types'

type Status = 'OPEN' | 'IN_PROGRESS' | 'WAITING_CLIENT' | 'ESCALATED' | 'RESOLVED' | 'CLOSED'

const STATUS_LABELS: Record<Status, string> = {
  OPEN:           'Abierto',
  IN_PROGRESS:    'En progreso',
  WAITING_CLIENT: 'Esperando cliente',
  ESCALATED:      'Escalado',
  RESOLVED:       'Resuelto',
  CLOSED:         'Cerrado',
}

const STATUS_COLORS: Record<Status, string> = {
  OPEN:           'bg-blue-100 text-blue-700 border-blue-200',
  IN_PROGRESS:    'bg-indigo-100 text-indigo-700 border-indigo-200',
  WAITING_CLIENT: 'bg-amber-100 text-amber-700 border-amber-200',
  ESCALATED:      'bg-red-100 text-red-700 border-red-200',
  RESOLVED:       'bg-emerald-100 text-emerald-700 border-emerald-200',
  CLOSED:         'bg-slate-100 text-slate-600 border-slate-200',
}

// Máquina de estados: transiciones válidas desde cada estado
const STATE_TRANSITIONS: Record<Status, Status[]> = {
  OPEN:           ['IN_PROGRESS', 'WAITING_CLIENT', 'ESCALATED', 'CLOSED'],
  IN_PROGRESS:    ['WAITING_CLIENT', 'ESCALATED', 'RESOLVED'],
  WAITING_CLIENT: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
  ESCALATED:      ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
  RESOLVED:       ['CLOSED', 'OPEN'],
  CLOSED:         ['OPEN'],
}

interface UpdateTicketFormProps {
  ticket: Ticket
  onUpdate: (payload: UpdateTicketPayload) => void
  isPending: boolean
}

export function UpdateTicketForm({ ticket, onUpdate, isPending }: UpdateTicketFormProps) {
  const { id } = useParams<{ id: string }>()

  const [status,     setStatus]     = useState<Status | ''>('')
  const [categoryId, setCategoryId] = useState(ticket.categoryId ?? '')
  const [assignedTo, setAssignedTo] = useState(ticket.assignedTo ?? '')
  const [reason,     setReason]     = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [autoAssigning, setAutoAssigning] = useState(false)

  const { data: categories } = useCategories()
  const { data: agents }     = useAgents()

  // Sincronizar con el ticket cuando cambia (navegación entre tickets)
  useEffect(() => {
    setStatus('')
    setCategoryId(ticket.categoryId ?? '')
    setAssignedTo(ticket.assignedTo ?? '')
    setReason('')
    setIsInternal(false)
  }, [ticket.id])

  const currentStatus = ticket.status as Status
  const allowedTransitions = STATE_TRANSITIONS[currentStatus] ?? []

  async function handleAutoAssign() {
    if (!id) return
    setAutoAssigning(true)
    try {
      const result = await ticketsService.suggestSpecialist(id)
      if (result?.agent) {
        setAssignedTo(result.agent.id)
        toast.info(`Sugerido: ${result.agent.name} (${result.loadRatio}% carga)`)
      } else {
        toast.warning('No hay agentes disponibles con las habilidades necesarias')
      }
    } catch {
      toast.error('No se pudo obtener sugerencia de agente')
    } finally {
      setAutoAssigning(false)
    }
  }

  function handleSubmit() {
    const payload: UpdateTicketPayload = { aiSuggested: false }

    if (status)                              payload.status = status
    if (categoryId !== (ticket.categoryId ?? '')) payload.categoryId = categoryId
    if (assignedTo !== (ticket.assignedTo  ?? '')) payload.assignedTo = assignedTo
    if (reason)                              payload.reason = reason
    payload.isInternal = isInternal

    const hasChanges = payload.status || payload.categoryId || payload.assignedTo || payload.reason
    if (!hasChanges) return

    onUpdate(payload)
    setStatus('')
    setReason('')
    setIsInternal(false)
  }

  return (
    <Card className="p-4 space-y-3">
      <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Actualizar</h3>

      {/* Estado actual + máquina de estados */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">Estado actual:</span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[currentStatus]}`}>
            {STATUS_LABELS[currentStatus]}
          </span>
        </div>

        {/* Flujo de transiciones válidas */}
        <div className="flex flex-wrap items-center gap-1 p-2 rounded-lg bg-slate-50 border border-slate-100">
          {allowedTransitions.length === 0 ? (
            <span className="text-[11px] text-slate-400 italic">No hay transiciones disponibles</span>
          ) : (
            allowedTransitions.map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                {i > 0 && <span className="text-slate-300 text-[10px]">·</span>}
                <button
                  type="button"
                  onClick={() => setStatus(s === status ? '' : s)}
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full border transition-all ${
                    status === s
                      ? STATUS_COLORS[s] + ' ring-2 ring-offset-1 ring-current'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              </div>
            ))
          )}
        </div>

        {status && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className={`px-1.5 py-0.5 rounded-full border text-[10px] font-semibold ${STATUS_COLORS[currentStatus]}`}>
              {STATUS_LABELS[currentStatus]}
            </span>
            <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className={`px-1.5 py-0.5 rounded-full border text-[10px] font-semibold ${STATUS_COLORS[status]}`}>
              {STATUS_LABELS[status]}
            </span>
          </div>
        )}
      </div>

      {/* Categoría — pre-seleccionada con la actual */}
      <select
        value={categoryId}
        onChange={e => setCategoryId(e.target.value)}
        className={inputClass}
      >
        <option value="">— Sin categoría —</option>
        {categories?.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {/* Agente — pre-seleccionado con el actual */}
      <div className="space-y-1.5">
        <select
          value={assignedTo}
          onChange={e => setAssignedTo(e.target.value)}
          className={inputClass}
        >
          <option value="">— Sin asignar —</option>
          {agents?.filter(a => a.role === 'AGENT' || a.role === 'SUPERVISOR').map(a => (
            <option key={a.id} value={a.id}>
              {a.name}{(a as any).loadRatio != null ? ` (${Math.round((a as any).loadRatio * 100)}% carga)` : ''}
            </option>
          ))}
        </select>
        <button
          onClick={handleAutoAssign}
          disabled={autoAssigning}
          className="flex items-center gap-1.5 text-[11px] text-violet-600 hover:text-violet-800 font-medium transition-colors disabled:opacity-50"
        >
          {autoAssigning
            ? <Loader2 className="w-3 h-3 animate-spin" />
            : <Sparkles className="w-3 h-3" />
          }
          Auto-asignar por especialidad
        </button>
      </div>

      {/* Nota */}
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-1 p-1 bg-slate-50 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setIsInternal(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all flex-1 justify-center ${
              !isInternal
                ? 'bg-white shadow-sm text-slate-700 border border-slate-200'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Globe className="w-3 h-3" />
            Nota pública
          </button>
          <button
            type="button"
            onClick={() => setIsInternal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all flex-1 justify-center ${
              isInternal
                ? 'bg-amber-500 shadow-sm text-white'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Lock className="w-3 h-3" />
            Nota interna
          </button>
        </div>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder={isInternal
            ? 'Nota interna — solo visible para el equipo de soporte…'
            : 'Motivo del cambio o respuesta al cliente…'
          }
          rows={3}
          className={`w-full px-3 py-2.5 text-sm bg-white text-slate-800 placeholder-slate-400 focus:outline-none resize-none ${
            isInternal ? 'bg-amber-50/40' : ''
          }`}
        />
        {isInternal && (
          <div className="px-3 py-1.5 bg-amber-50 border-t border-amber-100">
            <p className="text-[10px] text-amber-600 font-medium flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" />
              Visible solo para agentes — no se mostrará al cliente
            </p>
          </div>
        )}
      </div>

      <Button onClick={handleSubmit} loading={isPending} className="w-full">
        <CheckCircle className="w-4 h-4" />
        Guardar cambios
      </Button>
    </Card>
  )
}
