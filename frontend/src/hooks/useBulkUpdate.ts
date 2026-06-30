import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketsService, UpdateTicketPayload } from '../services/tickets.service'

export function useBulkUpdate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ ids, payload }: { ids: string[]; payload: UpdateTicketPayload }) =>
      Promise.all(ids.map(id => ticketsService.update(id, payload))),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }),
  })
}
