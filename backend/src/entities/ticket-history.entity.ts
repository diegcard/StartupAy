import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm'
import { Ticket } from './ticket.entity'
import { Agent } from './agent.entity'
import { Category } from './category.entity'

@Entity('ticket_history')
export class TicketHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  ticketId: string

  @Column()
  changedById: string

  @Column({ nullable: true })
  fromCategoryId: string

  @Column({ nullable: true })
  toCategoryId: string

  @Column({ nullable: true })
  fromAgentId: string

  @Column({ nullable: true })
  toAgentId: string

  @Column({ nullable: true })
  fromStatus: string

  @Column({ nullable: true })
  toStatus: string

  @Column('text', { nullable: true })
  reason: string

  @Column({ default: false })
  aiSuggested: boolean

  @Column({ type: 'float', nullable: true })
  aiConfidence: number

  @CreateDateColumn()
  createdAt: Date

  @ManyToOne(() => Ticket, ticket => ticket.history)
  @JoinColumn({ name: 'ticketId' })
  ticket: Ticket

  @ManyToOne(() => Agent, agent => agent.history)
  @JoinColumn({ name: 'changedById' })
  changedBy: Agent

  @ManyToOne(() => Category, category => category.historyFrom, { nullable: true })
  @JoinColumn({ name: 'fromCategoryId' })
  fromCategory: Category

  @ManyToOne(() => Category, category => category.historyTo, { nullable: true })
  @JoinColumn({ name: 'toCategoryId' })
  toCategory: Category
}
