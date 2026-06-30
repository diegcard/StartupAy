import { api } from '../lib/api'
import { Agent } from '../types'

export const agentsService = {
  getAll: () => api.get<Agent[]>('/agents').then(r => r.data),
  suggestByCategory: (categoryId: string) =>
    api.get<{ agent: Pick<Agent, 'id' | 'name' | 'email' | 'role'>; activeTickets: number; loadRatio: number }>(
      `/agents/suggest?categoryId=${categoryId}`
    ).then(r => r.data),
}
