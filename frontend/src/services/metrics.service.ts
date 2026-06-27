import { api } from '../lib/api'
import { Metrics } from '../types'

export const metricsService = {
  getSummary: () => api.get<Metrics>('/metrics').then(r => r.data),
}
