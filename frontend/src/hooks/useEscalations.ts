import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { escalationsService, ResolveEscalationPayload } from '../services/escalations.service'
import { toast } from '../store/toast'

export function useTicketEscalations(ticketId: string) {
  return useQuery({
    queryKey: ['escalations', ticketId],
    queryFn: () => escalationsService.getByTicket(ticketId),
    enabled: !!ticketId,
  })
}

export function usePendingEscalations() {
  return useQuery({
    queryKey: ['escalations', 'pending'],
    queryFn: escalationsService.getPending,
    refetchInterval: 30000,
  })
}

export function useResolveEscalation(ticketId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ResolveEscalationPayload }) =>
      escalationsService.resolve(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['escalations', 'pending'] })
      if (ticketId) {
        qc.invalidateQueries({ queryKey: ['escalations', ticketId] })
        qc.invalidateQueries({ queryKey: ['ticket', ticketId] })
      }
      qc.invalidateQueries({ queryKey: ['tickets'] })
      qc.invalidateQueries({ queryKey: ['metrics'] })
      toast.success('Escalación resuelta')
    },
    onError: () => toast.error('No se pudo resolver la escalación'),
  })
}
