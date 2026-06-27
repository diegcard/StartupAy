import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm'
import { Channel, Priority, TicketStatus } from './enums'
import { Category } from './category.entity'
import { Agent } from './agent.entity'
import { TicketHistory } from './ticket-history.entity'
import { Attachment } from './attachment.entity'

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  title: string

  @Column('text')
  description: string

  @Column({ type: 'enum', enum: Channel })
  channel: Channel

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.OPEN })
  status: TicketStatus

  @Column({ type: 'enum', enum: Priority, default: Priority.MEDIUM })
  priority: Priority

  @Column({ nullable: true })
  merchantId: string

  @Column({ nullable: true })
  transactionId: string

  @Column({ nullable: true })
  contactEmail: string

  @Column({ nullable: true })
  contactPhone: string

  @Column({ nullable: true })
  slaDeadline: Date

  @Column({ nullable: true })
  resolvedAt: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Column({ nullable: true })
  categoryId: string

  @ManyToOne(() => Category, category => category.tickets, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category

  @Column({ nullable: true })
  assignedTo: string

  @ManyToOne(() => Agent, agent => agent.assignedTickets, { nullable: true })
  @JoinColumn({ name: 'assignedTo' })
  agent: Agent

  @Column({ nullable: true })
  aiSuggestedCategory: string

  @Column({ type: 'float', nullable: true })
  aiConfidence: number

  @Column('text', { nullable: true })
  aiSummary: string

  @OneToMany(() => TicketHistory, h => h.ticket)
  history: TicketHistory[]

  @OneToMany(() => Attachment, a => a.ticket)
  attachments: Attachment[]
}
