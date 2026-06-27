import { api } from '../lib/api'
import { Agent } from '../types'

export const agentsService = {
  getAll: () => api.get<Agent[]>('/agents').then(r => r.data),
}
