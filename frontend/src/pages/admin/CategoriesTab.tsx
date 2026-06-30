import { useState } from 'react'
import { Category } from '../../types'
import { useCategories, useCreateCategory, useUpdateCategory, useRemoveCategory } from '../../hooks/useCategories'
import { CategoryModal } from './CategoryModal'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { Plus, Edit2, Trash2, AlertTriangle, Tag } from 'lucide-react'

export function CategoriesTab() {
  const { data: categories, isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const removeCategory = useRemoveCategory()

  const [modal, setModal] = useState<{ open: boolean; category?: Category | null }>({ open: false })
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>

  const handleCreate = async (payload: any) => {
    await createCategory.mutateAsync(payload)
    setModal({ open: false })
  }

  const handleUpdate = async (payload: any) => {
    if (!modal.category) return
    await updateCategory.mutateAsync({ id: modal.category.id, payload })
    setModal({ open: false })
  }

  const handleDelete = async (id: string) => {
    await removeCategory.mutateAsync(id)
    setConfirmDelete(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-500">{categories?.length ?? 0} categorías</span>
        </div>
        <Button size="sm" onClick={() => setModal({ open: true, category: null })}>
          <Plus className="w-3.5 h-3.5" />
          Nueva categoría
        </Button>
      </div>

      <div className="space-y-2">
        {categories?.map(cat => (
          <div key={cat.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">{cat.name}</p>
                {cat.requiresHuman && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    Revisión humana
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{cat.description}</p>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-sm font-semibold text-slate-700">{cat.slaHours}h</p>
              <p className="text-[10px] text-slate-400">SLA</p>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setModal({ open: true, category: cat })}
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Editar"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setConfirmDelete(cat.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Eliminar"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {!categories?.length && (
          <div className="text-center py-12 text-slate-400">
            <Tag className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No hay categorías registradas</p>
          </div>
        )}
      </div>

      {modal.open && (
        <CategoryModal
          category={modal.category}
          onClose={() => setModal({ open: false })}
          onSubmit={modal.category ? handleUpdate : handleCreate}
          loading={createCategory.isPending || updateCategory.isPending}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-base font-semibold text-slate-900 mb-2">¿Eliminar categoría?</h3>
            <p className="text-sm text-slate-500 mb-5">Esta acción no se puede deshacer. Los tickets asignados a esta categoría quedarán sin categoría.</p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setConfirmDelete(null)} className="flex-1">Cancelar</Button>
              <Button variant="danger" loading={removeCategory.isPending} onClick={() => handleDelete(confirmDelete)} className="flex-1">
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
