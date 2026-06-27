import { useQuery } from '@tanstack/react-query'
import { metricsService } from '../services/metrics.service'

export function useMetrics() {
  return useQuery({
    queryKey: ['metrics'],
    queryFn: metricsService.getSummary,
    refetchInterval: 30000,
  })
}
