import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useTickets } from '../../../hooks/useTickets'
import { TicketFilters } from './TicketFilters'
import { TicketTable } from './TicketTable'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'

export function TicketListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')

  const { data, isLoading } = useTickets({ status, priority })

  const tickets = data?.tickets.filter(t =>
    !search ||
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.merchantId?.includes(search),
  ) ?? []

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tickets</h1>
          <p className="text-sm text-gray-500">{data?.total ?? 0} tickets en total</p>
        </div>
        <Button onClick={() => navigate('/tickets/new')}>
          <Plus className="w-4 h-4" />
          Nuevo ticket
        </Button>
      </div>

      <TicketFilters
        search={search}
        status={status}
        priority={priority}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onPriorityChange={setPriority}
      />

      <Card className="overflow-hidden">
        <TicketTable tickets={tickets} isLoading={isLoading} />
      </Card>
    </div>
  )
}
