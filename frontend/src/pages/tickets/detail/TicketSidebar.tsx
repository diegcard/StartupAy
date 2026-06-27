import { Ticket } from '../../../types'
import { Card } from '../../../components/ui/Card'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface TicketSidebarProps {
  ticket: Ticket
}

export function TicketSidebar({ ticket }: TicketSidebarProps) {
  const details = [
    { label: 'Categoría', value: ticket.category?.name ?? '—' },
    { label: 'Asignado a', value: ticket.agent?.name ?? '—' },
    { label: 'Merchant ID', value: ticket.merchantId ?? '—' },
    { label: 'Transaction ID', value: ticket.transactionId ?? '—' },
    { label: 'Email contacto', value: ticket.contactEmail ?? '—' },
    { label: 'Teléfono', value: ticket.contactPhone ?? '—' },
    { label: 'Creado', value: format(new Date(ticket.createdAt), 'd MMM yyyy HH:mm', { locale: es }) },
  ]

  return (
    <Card className="p-4 space-y-3">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Detalles</h3>
      {details.map(({ label, value }) => (
        <div key={label}>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-sm text-gray-900">{value}</p>
        </div>
      ))}
    </Card>
  )
}
