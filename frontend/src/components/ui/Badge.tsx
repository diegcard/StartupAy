import { Priority, TicketStatus, Channel } from '../../types'

const priorityStyles: Record<Priority, string> = {
  CRITICAL: 'bg-red-100 text-red-800 border border-red-200',
  HIGH: 'bg-orange-100 text-orange-800 border border-orange-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  LOW: 'bg-gray-100 text-gray-600 border border-gray-200',
}

const priorityLabels: Record<Priority, string> = {
  CRITICAL: 'Crítico', HIGH: 'Alto', MEDIUM: 'Medio', LOW: 'Bajo',
}

const statusStyles: Record<TicketStatus, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
  WAITING_CLIENT: 'bg-yellow-100 text-yellow-800',
  ESCALATED: 'bg-red-100 text-red-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-600',
}

const statusLabels: Record<TicketStatus, string> = {
  OPEN: 'Abierto', IN_PROGRESS: 'En progreso', WAITING_CLIENT: 'Esperando cliente',
  ESCALATED: 'Escalado', RESOLVED: 'Resuelto', CLOSED: 'Cerrado',
}

const channelLabels: Record<Channel, string> = {
  WEB: '🌐 Web', EMAIL: '✉️ Email', WHATSAPP: '💬 WhatsApp',
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityStyles[priority]}`}>
      {priorityLabels[priority]}
    </span>
  )
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  )
}

export function ChannelBadge({ channel }: { channel: Channel }) {
  return (
    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
      {channelLabels[channel]}
    </span>
  )
}
