import { useQuery } from '@tanstack/react-query'
import { ticketsService, TicketFilters } from '../services/tickets.service'

export function useTickets(filters: TicketFilters = {}) {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => ticketsService.getAll(filters),
  })
}
