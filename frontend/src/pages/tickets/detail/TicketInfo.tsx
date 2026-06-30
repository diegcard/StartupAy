import { Ticket } from '../../../types'
import { PriorityBadge, ChannelBadge } from '../../../components/ui/Badge'
import { SlaIndicator } from '../../../components/ui/SlaIndicator'
import { StatusStepper } from '../../../components/ui/StatusStepper'
import { Card } from '../../../components/ui/Card'

interface TicketInfoProps {
  ticket: Ticket
}

export function TicketInfo({ ticket }: TicketInfoProps) {
  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-lg font-bold text-slate-900 leading-snug">{ticket.title}</h1>
        <ChannelBadge channel={ticket.channel} />
      </div>

      <StatusStepper status={ticket.status as any} />

      <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
        <PriorityBadge priority={ticket.priority} />
        <SlaIndicator deadline={ticket.slaDeadline} />
      </div>

      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
    </Card>
  )
}
