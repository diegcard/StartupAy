import { api } from '../lib/api'
import { Category } from '../types'

export interface CreateCategoryPayload {
  name: string
  description: string
  requiresHuman?: boolean
  slaHours?: number
}

export interface UpdateCategoryPayload {
  name?: string
  description?: string
  requiresHuman?: boolean
  slaHours?: number
}

export const categoriesService = {
  getAll: () => api.get<Category[]>('/categories').then(r => r.data),

  getById: (id: string) => api.get<Category>(`/categories/${id}`).then(r => r.data),

  create: (payload: CreateCategoryPayload) =>
    api.post<Category>('/categories', payload).then(r => r.data),

  update: (id: string, payload: UpdateCategoryPayload) =>
    api.put<Category>(`/categories/${id}`, payload).then(r => r.data),

  remove: (id: string) =>
    api.delete<{ message: string }>(`/categories/${id}`).then(r => r.data),
}
