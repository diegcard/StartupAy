import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm'
import { Ticket } from './ticket.entity'

@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  ticketId: string

  @Column()
  filename: string

  @Column()
  url: string

  @Column()
  mimeType: string

  @Column()
  size: number

  @CreateDateColumn()
  createdAt: Date

  @ManyToOne(() => Ticket, ticket => ticket.attachments)
  @JoinColumn({ name: 'ticketId' })
  ticket: Ticket
}
