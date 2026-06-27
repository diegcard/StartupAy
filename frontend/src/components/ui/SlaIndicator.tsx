import { formatDistanceToNow, isPast } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock } from 'lucide-react'

export function SlaIndicator({ deadline }: { deadline?: string }) {
  if (!deadline) return null

  const date = new Date(deadline)
  const breached = isPast(date)
  const label = formatDistanceToNow(date, { addSuffix: true, locale: es })

  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${breached ? 'text-red-600' : 'text-emerald-600'}`}>
      <Clock className="w-3 h-3" />
      {breached ? `Vencido ${label}` : `Vence ${label}`}
    </span>
  )
}
