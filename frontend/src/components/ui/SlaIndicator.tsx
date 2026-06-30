import { formatDistanceToNow, isPast, differenceInMinutes } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock } from 'lucide-react'

export function SlaIndicator({ deadline }: { deadline?: string }) {
  if (!deadline) return null

  const date = new Date(deadline)
  const breached = isPast(date)
  const minutesLeft = differenceInMinutes(date, new Date())
  const isWarning = !breached && minutesLeft <= 120

  const label = formatDistanceToNow(date, { addSuffix: true, locale: es })
  const formattedDeadline = date.toLocaleString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  const colorClass = breached
    ? 'text-red-600'
    : isWarning
    ? 'text-amber-600'
    : 'text-emerald-600'

  return (
    <span
      title={`SLA: ${formattedDeadline}`}
      className={`flex items-center gap-1 text-xs font-medium ${colorClass}`}
    >
      <Clock className="w-3 h-3 shrink-0" />
      {breached ? `Vencido ${label}` : `Vence ${label}`}
    </span>
  )
}
