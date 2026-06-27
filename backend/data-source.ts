import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
import { Category } from './src/entities/category.entity'
import { Agent } from './src/entities/agent.entity'
import { AgentSkill } from './src/entities/agent-skill.entity'
import { Ticket } from './src/entities/ticket.entity'
import { TicketHistory } from './src/entities/ticket-history.entity'
import { Attachment } from './src/entities/attachment.entity'

dotenv.config()

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Category, Agent, AgentSkill, Ticket, TicketHistory, Attachment],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
})
