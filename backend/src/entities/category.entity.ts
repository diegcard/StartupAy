import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  OneToMany,
} from 'typeorm'
import { Ticket } from './ticket.entity'
import { AgentSkill } from './agent-skill.entity'
import { TicketHistory } from './ticket-history.entity'

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  name: string

  @Column()
  description: string

  @Column({ default: false })
  requiresHuman: boolean

  @Column({ default: 24 })
  slaHours: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(() => Ticket, ticket => ticket.category)
  tickets: Ticket[]

  @OneToMany(() => AgentSkill, skill => skill.category)
  agentSkills: AgentSkill[]

  @OneToMany(() => TicketHistory, h => h.fromCategory)
  historyFrom: TicketHistory[]

  @OneToMany(() => TicketHistory, h => h.toCategory)
  historyTo: TicketHistory[]
}
