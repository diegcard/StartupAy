import { api } from '../lib/api'
import { Category } from '../types'

export const categoriesService = {
  getAll: () => api.get<Category[]>('/categories').then(r => r.data),
}
