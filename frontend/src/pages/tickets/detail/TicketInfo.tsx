import { Ticket } from '../../../types'
import { PriorityBadge, StatusBadge, ChannelBadge } from '../../../components/ui/Badge'
import { SlaIndicator } from '../../../components/ui/SlaIndicator'
import { Card } from '../../../components/ui/Card'

interface TicketInfoProps {
  ticket: Ticket
}

export function TicketInfo({ ticket }: TicketInfoProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <h1 className="text-lg font-bold text-gray-900 leading-snug">{ticket.title}</h1>
        <ChannelBadge channel={ticket.channel} />
      </div>
      <div className="flex items-center gap-3 mb-4">
        <StatusBadge status={ticket.status} />
        <PriorityBadge priority={ticket.priority} />
        <SlaIndicator deadline={ticket.slaDeadline} />
      </div>
      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
    </Card>
  )
}
