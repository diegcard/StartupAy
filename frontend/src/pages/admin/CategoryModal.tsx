import { useState, FormEvent } from 'react'
import { Category } from '../../types'
import { Button } from '../../components/ui/Button'
import { FormField, inputClass } from '../../components/ui/FormField'
import { CreateCategoryPayload, UpdateCategoryPayload } from '../../services/categories.service'
import { X } from 'lucide-react'

interface CategoryModalProps {
  category?: Category | null
  onClose: () => void
  onSubmit: (data: CreateCategoryPayload | UpdateCategoryPayload) => Promise<void>
  loading: boolean
}

export function CategoryModal({ category, onClose, onSubmit, loading }: CategoryModalProps) {
  const isEdit = !!category
  const [form, setForm] = useState({
    name: category?.name ?? '',
    description: category?.description ?? '',
    requiresHuman: category?.requiresHuman ?? false,
    slaHours: category?.slaHours ?? 24,
  })
  const [error, setError] = useState('')

  const set = (key: string, val: unknown) => setForm(f => ({ ...f, [key]: val }))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await onSubmit(form)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Error al guardar la categoría')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">
            {isEdit ? 'Editar categoría' : 'Nueva categoría'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FormField label="Nombre" required>
            <input className={inputClass} value={form.name} onChange={e => set('name', e.target.value)} required />
          </FormField>

          <FormField label="Descripción" required>
            <textarea
              className={inputClass}
              rows={3}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              required
            />
          </FormField>

          <FormField label="SLA (horas)">
            <input className={inputClass} type="number" min={1} max={720} value={form.slaHours} onChange={e => set('slaHours', parseInt(e.target.value) || 24)} />
          </FormField>

          <FormField label="Requiere revisión humana">
            <label className="flex items-center gap-2 cursor-pointer mt-1">
              <input type="checkbox" checked={form.requiresHuman} onChange={e => set('requiresHuman', e.target.checked)} className="w-4 h-4 accent-blue-600" />
              <span className="text-sm text-slate-700">Esta categoría siempre escala a un humano</span>
            </label>
          </FormField>

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" loading={loading} className="flex-1">
              {isEdit ? 'Guardar cambios' : 'Crear categoría'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
