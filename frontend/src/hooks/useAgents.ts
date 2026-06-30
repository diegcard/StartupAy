import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { agentsService, CreateAgentPayload, UpdateAgentPayload } from '../services/agents.service'

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: agentsService.getAll,
  })
}

export function useCreateAgent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAgentPayload) => agentsService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agents'] }),
  })
}

export function useUpdateAgent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAgentPayload }) =>
      agentsService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agents'] }),
  })
}

export function useRemoveAgent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => agentsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agents'] }),
  })
}
