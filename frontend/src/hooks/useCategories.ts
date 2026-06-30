import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesService, CreateCategoryPayload, UpdateCategoryPayload } from '../services/categories.service'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getAll,
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => categoriesService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) =>
      categoriesService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useRemoveCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => categoriesService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}
