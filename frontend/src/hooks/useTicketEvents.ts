import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/auth'

export function useTicketEvents() {
  const qc = useQueryClient()
  const token = useAuthStore(s => s.token)

  useEffect(() => {
    if (!token) return

    const es = new EventSource(`/api/tickets/events?token=${encodeURIComponent(token)}`)

    es.onmessage = (event) => {
      try {
        const { type } = JSON.parse(event.data)
        if (type === 'ticket.created' || type === 'ticket.updated') {
          qc.invalidateQueries({ queryKey: ['tickets'] })
        }
      } catch {
        // ignore parse errors
      }
    }

    es.onerror = () => {
      // EventSource reconnects automatically on error
    }

    return () => es.close()
  }, [token, qc])
}
