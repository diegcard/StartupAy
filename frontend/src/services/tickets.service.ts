import { api } from '../lib/api'
import { Ticket } from '../types'

export interface TicketFilters {
  status?: string
  priority?: string
  categoryId?: string
  assignedTo?: string
}

export interface PaginatedTickets {
  tickets: Ticket[]
  total: number
  page: number
  limit: number
}

export interface CreateTicketPayload {
  title: string
  description: string
  channel: string
  merchantId?: string
  transactionId?: string
  contactEmail?: string
  contactPhone?: string
  categoryId?: string
}

export interface UpdateTicketPayload {
  status?: string
  priority?: string
  categoryId?: string
  assignedTo?: string
  reason?: string
}

export const ticketsService = {
  getAll: (filters: TicketFilters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    return api.get<PaginatedTickets>(`/tickets?${params}`).then(r => r.data)
  },

  getById: (id: string) =>
    api.get<Ticket>(`/tickets/${id}`).then(r => r.data),

  create: (payload: CreateTicketPayload) =>
    api.post<{ ticket: Ticket; aiClassification: unknown }>('/tickets', payload).then(r => r.data),

  update: (id: string, payload: UpdateTicketPayload) =>
    api.put<Ticket>(`/tickets/${id}`, payload).then(r => r.data),

  classify: (id: string) =>
    api.post(`/tickets/${id}/classify`, {}).then(r => r.data),
}
