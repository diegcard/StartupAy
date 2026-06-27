import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { ticketsService } from '../../../services/tickets.service'
import { useCategories } from '../../../hooks/useCategories'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { FormField, inputClass } from '../../../components/ui/FormField'

const initialForm = {
  title: '',
  description: '',
  channel: 'WEB' as const,
  merchantId: '',
  transactionId: '',
  contactEmail: '',
  contactPhone: '',
  categoryId: '',
}

export function NewTicketPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(initialForm)
  const { data: categories } = useCategories()

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        categoryId: form.categoryId || undefined,
        merchantId: form.merchantId || undefined,
        transactionId: form.transactionId || undefined,
        contactEmail: form.contactEmail || undefined,
        contactPhone: form.contactPhone || undefined,
      }
      const { ticket } = await ticketsService.create(payload)
      navigate(`/tickets/${ticket.id}`)
    } catch {
      alert('Error al crear el ticket')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-lg font-bold text-gray-900">Nuevo Ticket</h1>
          <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" /> Gemini clasificará automáticamente
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Título" required>
            <input
              required
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className={inputClass}
              placeholder="Ej: No puedo procesar pagos desde ayer"
            />
          </FormField>

          <FormField label="Descripción" required>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className={`${inputClass} resize-none`}
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

            <FormField label="Categoría (opcional)">
              <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)} className={inputClass}>
                <option value="">Dejar que Gemini clasifique</option>
                {categories?.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Merchant ID">
              <input value={form.merchantId} onChange={e => set('merchantId', e.target.value)} className={inputClass} placeholder="MER-001234" />
            </FormField>
            <FormField label="Transaction ID">
              <input value={form.transactionId} onChange={e => set('transactionId', e.target.value)} className={inputClass} placeholder="TXN-987654" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email de contacto">
              <input type="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} className={inputClass} />
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
