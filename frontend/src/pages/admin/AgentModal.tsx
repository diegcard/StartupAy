import { useState, FormEvent } from 'react'
import { Agent, AgentRole, Category } from '../../types'
import { Button } from '../../components/ui/Button'
import { FormField, inputClass } from '../../components/ui/FormField'
import { CreateAgentPayload, UpdateAgentPayload } from '../../services/agents.service'
import { X } from 'lucide-react'

interface AgentModalProps {
  agent?: Agent | null
  categories: Category[]
  onClose: () => void
  onSubmit: (data: CreateAgentPayload | UpdateAgentPayload) => Promise<void>
  loading: boolean
}

const ROLE_OPTIONS: { value: AgentRole; label: string }[] = [
  { value: 'AGENT', label: 'Agente' },
  { value: 'SUPERVISOR', label: 'Supervisor' },
  { value: 'ADMIN', label: 'Administrador' },
]

export function AgentModal({ agent, categories, onClose, onSubmit, loading }: AgentModalProps) {
  const isEdit = !!agent
  const [form, setForm] = useState({
    name: agent?.name ?? '',
    email: agent?.email ?? '',
    password: '',
    role: agent?.role ?? 'AGENT' as AgentRole,
    maxCapacity: agent?.maxCapacity ?? 10,
    isAvailable: agent?.isAvailable ?? true,
    categoryIds: agent?.skills?.map(s => s.category.id) ?? [] as string[],
  })
  const [error, setError] = useState('')

  const set = (key: string, val: unknown) => setForm(f => ({ ...f, [key]: val }))

  const toggleCategory = (id: string) => {
    setForm(f => ({
      ...f,
      categoryIds: f.categoryIds.includes(id)
        ? f.categoryIds.filter(c => c !== id)
        : [...f.categoryIds, id],
    }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      if (isEdit) {
        const payload: UpdateAgentPayload = {
          name: form.name,
          role: form.role,
          maxCapacity: form.maxCapacity,
          isAvailable: form.isAvailable,
          categoryIds: form.categoryIds,
        }
        if (form.password) payload.password = form.password
        await onSubmit(payload)
      } else {
        if (!form.password) { setError('La contraseña es requerida'); return }
        await onSubmit({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          maxCapacity: form.maxCapacity,
          categoryIds: form.categoryIds,
        })
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Error al guardar el agente')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">
            {isEdit ? 'Editar agente' : 'Nuevo agente'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FormField label="Nombre" required>
            <input className={inputClass} value={form.name} onChange={e => set('name', e.target.value)} required />
          </FormField>

          {!isEdit && (
            <FormField label="Email" required>
              <input className={inputClass} type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
            </FormField>
          )}

          <FormField label={isEdit ? 'Nueva contraseña (opcional)' : 'Contraseña'} required={!isEdit}>
            <input className={inputClass} type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder={isEdit ? 'Dejar vacío para no cambiar' : ''} />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Rol" required>
              <select className={inputClass} value={form.role} onChange={e => set('role', e.target.value as AgentRole)}>
                {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </FormField>

            <FormField label="Capacidad máx.">
              <input className={inputClass} type="number" min={1} max={100} value={form.maxCapacity} onChange={e => set('maxCapacity', parseInt(e.target.value) || 10)} />
            </FormField>
          </div>

          {isEdit && (
            <FormField label="Disponibilidad">
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input type="checkbox" checked={form.isAvailable} onChange={e => set('isAvailable', e.target.checked)} className="w-4 h-4 accent-blue-600" />
                <span className="text-sm text-slate-700">Disponible para recibir tickets</span>
              </label>
            </FormField>
          )}

          {categories.length > 0 && (
            <FormField label="Categorías especializadas">
              <div className="flex flex-wrap gap-2 mt-1">
                {categories.map(cat => {
                  const selected = form.categoryIds.includes(cat.id)
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                        selected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      {cat.name}
                    </button>
                  )
                })}
              </div>
            </FormField>
          )}

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" loading={loading} className="flex-1">
              {isEdit ? 'Guardar cambios' : 'Crear agente'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
