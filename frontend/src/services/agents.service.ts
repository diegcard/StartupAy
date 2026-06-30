import { api } from '../lib/api'
import { Agent } from '../types'

export interface CreateAgentPayload {
  name: string
  email: string
  password: string
  role?: string
  maxCapacity?: number
  categoryIds?: string[]
}

export interface UpdateAgentPayload {
  name?: string
  role?: string
  isAvailable?: boolean
  maxCapacity?: number
  password?: string
  categoryIds?: string[]
}

export const agentsService = {
  getAll: () => api.get<Agent[]>('/agents').then(r => r.data),

  getById: (id: string) => api.get<Agent>(`/agents/${id}`).then(r => r.data),

  create: (payload: CreateAgentPayload) =>
    api.post<Agent>('/agents', payload).then(r => r.data),

  update: (id: string, payload: UpdateAgentPayload) =>
    api.put<Agent>(`/agents/${id}`, payload).then(r => r.data),

  remove: (id: string) =>
    api.delete<{ message: string }>(`/agents/${id}`).then(r => r.data),

  suggestByCategory: (categoryId: string) =>
    api.get<{ agent: Pick<Agent, 'id' | 'name' | 'email' | 'role'>; activeTickets: number; loadRatio: number }>(
      `/agents/suggest?categoryId=${categoryId}`
    ).then(r => r.data),
}
