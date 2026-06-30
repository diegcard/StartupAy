import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm'
import { EscalationTrigger } from './enums'
import { Ticket } from './ticket.entity'
import { Agent } from './agent.entity'

@Entity('escalations')
export class Escalation {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  ticketId: string

  @Column({ nullable: true })
  categoryId: string

  @Column({ type: 'enum', enum: EscalationTrigger })
  trigger: EscalationTrigger

  @Column({ type: 'float', nullable: true })
  aiConfidence: number

  @Column({ nullable: true })
  assignedToId: string

  @Column({ nullable: true })
  resolvedAt: Date

  @Column({ type: 'boolean', nullable: true })
  wasAiCorrect: boolean

  @Column('text', { nullable: true })
  resolutionNote: string

  @CreateDateColumn()
  createdAt: Date

  @ManyToOne(() => Ticket, ticket => ticket.escalations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticketId' })
  ticket: Ticket

  @ManyToOne(() => Agent, { nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: Agent
}
