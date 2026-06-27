import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketsService, UpdateTicketPayload } from '../services/tickets.service'

export function useTicket(id: string) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketsService.getById(id),
    enabled: !!id,
  })
}

export function useUpdateTicket(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateTicketPayload) => ticketsService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ticket', id] }),
  })
}

export function useClassifyTicket(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => ticketsService.classify(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ticket', id] }),
  })
}
