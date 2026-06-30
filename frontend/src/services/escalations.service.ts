import { api } from '../lib/api'
import { Escalation } from '../types'

export interface ResolveEscalationPayload {
  wasAiCorrect: boolean
  resolutionNote?: string
  correctCategoryId?: string
}

export const escalationsService = {
  getByTicket: (ticketId: string) =>
    api.get<Escalation[]>(`/escalations/ticket/${ticketId}`).then(r => r.data),

  getPending: () =>
    api.get<Escalation[]>('/escalations').then(r => r.data),

  resolve: (id: string, payload: ResolveEscalationPayload) =>
    api.put<Escalation>(`/escalations/${id}/resolve`, payload).then(r => r.data),
}
