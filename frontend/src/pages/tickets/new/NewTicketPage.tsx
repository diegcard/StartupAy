import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react'
import { ticketsService } from '../../../services/tickets.service'
import { toast } from '../../../store/toast'
import { useCategories } from '../../../hooks/useCategories'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { FormField, inputClass } from '../../../components/ui/FormField'

const initialForm = {
  title: '',
  description: '',
  channel: 'WEB' as const,
  priority: 'MEDIUM' as const,
  merchantId: '',
  transactionId: '',
  contactEmail: '',
  contactPhone: '',
  categoryId: '',
}

type FormErrors = Partial<Record<keyof typeof initialForm, string>>

export function NewTicketPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState('')
  const { data: categories } = useCategories()

  function set(field: keyof typeof initialForm, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  function validate(): boolean {
    const next: FormErrors = {}
    if (!form.title.trim()) next.title = 'El título es obligatorio'
    else if (form.title.trim().length < 5) next.title = 'El título debe tener al menos 5 caracteres'
    if (!form.description.trim()) next.description = 'La descripción es obligatoria'
    else if (form.description.trim().length < 10) next.description = 'La descripción debe tener al menos 10 caracteres'
    if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
      next.contactEmail = 'Email inválido'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setServerError('')
    setLoading(true)
    try {
      const payload = {
        title: form.title,
        description: form.description,
        channel: form.channel,
        priority: form.priority,
        categoryId: form.categoryId || undefined,
        merchantId: form.merchantId || undefined,
        transactionId: form.transactionId || undefined,
        contactEmail: form.contactEmail || undefined,
        contactPhone: form.contactPhone || undefined,
      }
      const { ticket } = await ticketsService.create(payload)
      toast.success('Ticket creado — Gemini está clasificando')
      navigate(`/tickets/${ticket.id}`)
    } catch {
      setServerError('No se pudo crear el ticket. Verifica la conexión e intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Volver
      </button>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Nuevo Ticket</h1>
          <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" /> Gemini clasificará automáticamente
          </span>
        </div>

        {serverError && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Título" required error={errors.title}>
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className={`${inputClass} ${errors.title ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="Ej: No puedo procesar pagos desde ayer"
            />
          </FormField>

          <FormField label="Descripción" required error={errors.description}>
            <textarea
              rows={4}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className={`${inputClass} resize-none ${errors.description ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="Describe el problema con el mayor detalle posible..."
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Canal">
              <select value={form.channel} onChange={e => set('channel', e.target.value)} className={inputClass}>
                <option value="WEB">Portal Web</option>
                <option value="EMAIL">Email</option>
                <option value="WHATSAPP">WhatsApp</option>
              </select>
            </FormField>

            <FormField label="Prioridad">
              <select value={form.priority} onChange={e => set('priority', e.target.value)} className={inputClass}>
                <option value="LOW">Baja</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
                <option value="CRITICAL">Crítica</option>
              </select>
            </FormField>
          </div>

          <FormField label="Categoría (opcional)" hint="Si no seleccionas, Gemini clasificará automáticamente">
            <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)} className={inputClass}>
              <option value="">Dejar que Gemini clasifique</option>
              {categories?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Merchant ID">
              <input value={form.merchantId} onChange={e => set('merchantId', e.target.value)} className={inputClass} placeholder="MER-001234" />
            </FormField>
            <FormField label="Transaction ID">
              <input value={form.transactionId} onChange={e => set('transactionId', e.target.value)} className={inputClass} placeholder="TXN-987654" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email de contacto" error={errors.contactEmail}>
              <input
                type="email"
                value={form.contactEmail}
                onChange={e => set('contactEmail', e.target.value)}
                className={`${inputClass} ${errors.contactEmail ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
            </FormField>
            <FormField label="Teléfono">
              <input value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} className={inputClass} placeholder="+52 55 1234 5678" />
            </FormField>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} className="flex-1">
              Crear ticket
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
