import { api } from '../lib/api'
import { Metrics } from '../types'

export const metricsService = {
  getSummary: () => api.get<Metrics>('/metrics').then(r => r.data),
  exportCsv: async () => {
    const response = await api.get('/metrics/export', { responseType: 'blob' })
    const url = URL.createObjectURL(new Blob([response.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = 'metricas-startupay.csv'
    a.click()
    URL.revokeObjectURL(url)
  },
}
