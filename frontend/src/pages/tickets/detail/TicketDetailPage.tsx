import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTicket, useUpdateTicket, useClassifyTicket } from '../../../hooks/useTicket'
import { useAuthStore } from '../../../store/auth'
import { Spinner } from '../../../components/ui/Spinner'
import { TicketInfo } from './TicketInfo'
import { AiBanner } from './AiBanner'
import { TicketHistory } from './TicketHistory'
import { TicketSidebar } from './TicketSidebar'
import { UpdateTicketForm } from './UpdateTicketForm'

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { agent } = useAuthStore()

  const { data: ticket, isLoading } = useTicket(id!)
  const updateMutation = useUpdateTicket(id!)
  const classifyMutation = useClassifyTicket(id!)

  const canUpdate =
    agent?.role === 'SUPERVISOR' ||
    agent?.role === 'ADMIN' ||
    ticket?.assignedTo === agent?.id

  if (isLoading || !ticket) return <Spinner text="Cargando ticket..." />

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a tickets
      </button>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <TicketInfo ticket={ticket} />
          <AiBanner
            ticket={ticket}
            onReclassify={() => classifyMutation.mutate()}
            isReclassifying={classifyMutation.isPending}
          />
          <TicketHistory history={ticket.history ?? []} />
        </div>

        <div className="space-y-4">
          <TicketSidebar ticket={ticket} />
          {canUpdate && (
            <UpdateTicketForm
              onUpdate={payload => updateMutation.mutate(payload)}
              isPending={updateMutation.isPending}
            />
          )}
        </div>
      </div>
    </div>
  )
}
