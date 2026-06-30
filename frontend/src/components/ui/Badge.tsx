import { Globe, Mail, MessageCircle } from 'lucide-react'
import { Priority, TicketStatus, Channel } from '../../types'

const priorityConfig: Record<Priority, { label: string; dot: string; cls: string }> = {
  CRITICAL: { label: 'Crítico',  dot: 'bg-red-500',    cls: 'bg-red-50 border-red-200 text-red-700' },
  HIGH:     { label: 'Alto',     dot: 'bg-orange-500', cls: 'bg-orange-50 border-orange-200 text-orange-700' },
  MEDIUM:   { label: 'Medio',    dot: 'bg-amber-400',  cls: 'bg-amber-50 border-amber-200 text-amber-700' },
  LOW:      { label: 'Bajo',     dot: 'bg-slate-400',  cls: 'bg-slate-50 border-slate-200 text-slate-600' },
}

const statusConfig: Record<TicketStatus, { label: string; dot: string; cls: string }> = {
  OPEN:           { label: 'Abierto',       dot: 'bg-blue-500',    cls: 'bg-blue-50 text-blue-700' },
  IN_PROGRESS:    { label: 'En progreso',   dot: 'bg-indigo-500',  cls: 'bg-indigo-50 text-indigo-700' },
  WAITING_CLIENT: { label: 'Esp. cliente',  dot: 'bg-amber-500',   cls: 'bg-amber-50 text-amber-700' },
  ESCALATED:      { label: 'Escalado',      dot: 'bg-red-500',     cls: 'bg-red-50 text-red-700' },
  RESOLVED:       { label: 'Resuelto',      dot: 'bg-emerald-500', cls: 'bg-emerald-50 text-emerald-700' },
  CLOSED:         { label: 'Cerrado',       dot: 'bg-slate-400',   cls: 'bg-slate-100 text-slate-500' },
}

const channelConfig: Record<Channel, { label: string; Icon: React.ElementType; cls: string }> = {
  WEB:       { label: 'Web',       Icon: Globe,          cls: 'bg-blue-50 border-blue-200 text-blue-700' },
  EMAIL:     { label: 'Email',     Icon: Mail,           cls: 'bg-violet-50 border-violet-200 text-violet-700' },
  WHATSAPP:  { label: 'WhatsApp',  Icon: MessageCircle,  cls: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const c = priorityConfig[priority]
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded border ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  )
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  const c = statusConfig[status]
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  )
}

export function ChannelBadge({ channel }: { channel: Channel }) {
  const c = channelConfig[channel] ?? { label: channel, Icon: Globe, cls: 'bg-slate-50 border-slate-200 text-slate-600' }
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border ${c.cls}`}>
      <c.Icon className="w-3 h-3 flex-shrink-0" />
      {c.label}
    </span>
  )
}
