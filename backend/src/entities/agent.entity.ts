import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, OneToMany,
} from 'typeorm'
import { AgentRole } from './enums'
import { AgentSkill } from './agent-skill.entity'
import { Ticket } from './ticket.entity'
import { TicketHistory } from './ticket-history.entity'

@Entity('agents')
export class Agent {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column({ unique: true })
  email: string

  @Column()
  passwordHash: string

  @Column({ type: 'enum', enum: AgentRole, default: AgentRole.AGENT })
  role: AgentRole

  @Column({ default: true })
  isAvailable: boolean

  @Column({ default: 10 })
  maxCapacity: number

  @CreateDateColumn()
  createdAt: Date

  @OneToMany(() => AgentSkill, skill => skill.agent)
  skills: AgentSkill[]

  @OneToMany(() => Ticket, ticket => ticket.agent)
  assignedTickets: Ticket[]

  @OneToMany(() => TicketHistory, h => h.changedBy)
  history: TicketHistory[]
}
