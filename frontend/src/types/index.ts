export type Channel = 'WEB' | 'EMAIL' | 'WHATSAPP'
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_CLIENT' | 'ESCALATED' | 'RESOLVED' | 'CLOSED'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type AgentRole = 'AGENT' | 'SUPERVISOR' | 'ADMIN'

export interface Category {
  id: string
  name: string
  description: string
  requiresHuman: boolean
  slaHours: number
}

export interface Agent {
  id: string
  name: string
  email: string
  role: AgentRole
  isAvailable: boolean
  maxCapacity: number
  skills?: { category: Category }[]
  _count?: { assignedTickets: number }
}

export interface Ticket {
  id: string
  title: string
  description: string
  channel: Channel
  status: TicketStatus
  priority: Priority
  merchantId?: string
  transactionId?: string
  contactEmail?: string
  contactPhone?: string
  slaDeadline?: string
  resolvedAt?: string
  createdAt: string
  updatedAt: string
  categoryId?: string
  category?: Category
  assignedTo?: string
  agent?: Pick<Agent, 'id' | 'name' | 'email'>
  aiSuggestedCategory?: string
  aiConfidence?: number
  aiSummary?: string
  history?: TicketHistoryEntry[]
}

export interface TicketHistoryEntry {
  id: string
  ticketId: string
  changedBy: Pick<Agent, 'id' | 'name'>
  fromCategory?: Category
  toCategory?: Category
  fromStatus?: string
  toStatus?: string
  reason?: string
  aiSuggested: boolean
  aiConfidence?: number
  isInternal: boolean
  createdAt: string
}

export interface Metrics {
  totalOpen: number
  totalInProgress: number
  totalResolved: number
  slaCompliance: number
  avgMttrHours: number
  reclassificationRate: number
  byCategory: { name: string; count: number }[]
  byChannel: { channel: string; count: number }[]
}
