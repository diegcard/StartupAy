import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { inputClass } from '../../../components/ui/FormField'
import { Button } from '../../../components/ui/Button'
import { UpdateTicketPayload } from '../../../services/tickets.service'

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'WAITING_CLIENT', 'ESCALATED', 'RESOLVED', 'CLOSED']

interface UpdateTicketFormProps {
  onUpdate: (payload: UpdateTicketPayload) => void
  isPending: boolean
}

export function UpdateTicketForm({ onUpdate, isPending }: UpdateTicketFormProps) {
  const [status, setStatus] = useState('')
  const [reason, setReason] = useState('')

  function handleSubmit() {
    const payload: UpdateTicketPayload = {}
    if (status) payload.status = status
    if (reason) payload.reason = reason
    if (!status && !reason) return
    onUpdate(payload)
    setReason('')
    setStatus('')
  }

  return (
    <Card className="p-4 space-y-3">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Actualizar</h3>

      <select
        value={status}
        onChange={e => setStatus(e.target.value)}
        className={inputClass}
      >
        <option value="">— Estado —</option>
        {STATUS_OPTIONS.map(s => (
          <option key={s} value={s}>{s.replace('_', ' ')}</option>
        ))}
      </select>

      <textarea
        value={reason}
        onChange={e => setReason(e.target.value)}
        placeholder="Motivo del cambio..."
        rows={3}
        className={`${inputClass} resize-none`}
      />

      <Button onClick={handleSubmit} loading={isPending} className="w-full">
        <CheckCircle className="w-4 h-4" />
        Guardar cambios
      </Button>
    </Card>
  )
}
