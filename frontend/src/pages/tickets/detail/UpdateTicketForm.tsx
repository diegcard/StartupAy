import { useState } from 'react'
import { CheckCircle, Sparkles, Lock, Globe, Loader2 } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { inputClass } from '../../../components/ui/FormField'
import { Button } from '../../../components/ui/Button'
import { UpdateTicketPayload } from '../../../services/tickets.service'
import { ticketsService } from '../../../services/tickets.service'
import { useCategories } from '../../../hooks/useCategories'
import { useAgents } from '../../../hooks/useAgents'
import { useParams } from 'react-router-dom'
import { toast } from '../../../store/toast'

const STATUS_LABELS: Record<string, string> = {
  OPEN:           'Abierto',
  IN_PROGRESS:    'En progreso',
  WAITING_CLIENT: 'Esperando cliente',
  ESCALATED:      'Escalado',
  RESOLVED:       'Resuelto',
  CLOSED:         'Cerrado',
}

interface UpdateTicketFormProps {
  onUpdate: (payload: UpdateTicketPayload) => void
  isPending: boolean
}

export function UpdateTicketForm({ onUpdate, isPending }: UpdateTicketFormProps) {
  const { id } = useParams<{ id: string }>()
  const [status,     setStatus]     = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [reason,     setReason]     = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [autoAssigning, setAutoAssigning] = useState(false)

  const { data: categories } = useCategories()
  const { data: agents }     = useAgents()

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
    if (status)     payload.status = status
    if (categoryId) payload.categoryId = categoryId
    if (assignedTo) payload.assignedTo = assignedTo
    if (reason)     payload.reason = reason
    payload.isInternal = isInternal
    if (!status && !categoryId && !assignedTo && !reason) return
    onUpdate(payload)
    setStatus('')
    setCategoryId('')
    setAssignedTo('')
    setReason('')
    setIsInternal(false)
  }

  return (
    <Card className="p-4 space-y-3">
      <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Actualizar</h3>

      <select value={status} onChange={e => setStatus(e.target.value)} className={inputClass}>
        <option value="">— Estado —</option>
        {Object.entries(STATUS_LABELS).map(([val, label]) => (
          <option key={val} value={val}>{label}</option>
        ))}
      </select>

      <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className={inputClass}>
        <option value="">— Categoría —</option>
        {categories?.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <div className="space-y-1.5">
        <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className={inputClass}>
          <option value="">— Asignar a —</option>
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

      {/* Improved notes section */}
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
