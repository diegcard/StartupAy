export enum Channel {
  WEB = 'WEB',
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_CLIENT = 'WAITING_CLIENT',
  ESCALATED = 'ESCALATED',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum AgentRole {
  AGENT = 'AGENT',
  SUPERVISOR = 'SUPERVISOR',
  ADMIN = 'ADMIN',
}

export enum EscalationTrigger {
  REQUIRES_HUMAN = 'REQUIRES_HUMAN',
  LOW_CONFIDENCE = 'LOW_CONFIDENCE',
}
