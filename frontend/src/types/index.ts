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
  createdAt?: string
  skills?: { category: Category }[]
  _count?: { assignedTickets: number }
  activeTickets?: number
  loadRatio?: number
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
  escalations?: Escalation[]
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

export interface Escalation {
  id: string
  ticketId: string
  categoryId?: string
  trigger: string
  aiConfidence?: number
  assignedToId?: string
  resolvedAt?: string
  wasAiCorrect?: boolean
  resolutionNote?: string
  createdAt: string
}

export type EscalationWithTicket = Escalation & {
  ticket?: Pick<Ticket, 'id' | 'title' | 'category'>
}

export interface Metrics {
  totalOpen: number
  totalInProgress: number
  totalResolved: number
  slaCompliance: number
  avgMttrHours: number
  reclassificationRate: number
  aiPrecision: number | null
  escalationRate: number
  avgAiConfidence: number | null
  confidenceDistribution?: { low: number; medium: number; high: number }
  byCategory: { name: string; count: number }[]
  byChannel: { channel: string; count: number }[]
}
