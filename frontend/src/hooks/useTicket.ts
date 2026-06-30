import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketsService, UpdateTicketPayload } from '../services/tickets.service'
import { toast } from '../store/toast'

export function useTicket(id: string) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketsService.getById(id),
    enabled: !!id,
    retry: 1,
  })
}

export function useUpdateTicket(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateTicketPayload) => ticketsService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ticket', id] })
      qc.invalidateQueries({ queryKey: ['tickets'] })
      toast.success('Ticket actualizado correctamente')
    },
    onError: () => toast.error('No se pudo actualizar el ticket'),
  })
}

export function useClassifyTicket(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => ticketsService.classify(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ticket', id] })
      qc.invalidateQueries({ queryKey: ['tickets'] })
      toast.success('Ticket reclasificado por Gemini')
    },
    onError: () => toast.error('No se pudo reclasificar el ticket'),
  })
}
