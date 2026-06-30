import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Ticket } from '../../entities/ticket.entity'
import { TicketHistory } from '../../entities/ticket-history.entity'
import { Category } from '../../entities/category.entity'
import { Agent } from '../../entities/agent.entity'
import { AgentSkill } from '../../entities/agent-skill.entity'
import { TicketsController } from './tickets.controller'
import { TicketsService } from './tickets.service'
import { TicketEventsService } from '../../shared/events/ticket-events.service'
import { GeminiModule } from '../../shared/gemini/gemini.module'
import { SlaModule } from '../../shared/sla/sla.module'
import { EscalationsModule } from '../escalations/escalations.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, TicketHistory, Category, Agent, AgentSkill]),
    GeminiModule,
    SlaModule,
    EscalationsModule,
  ],
  controllers: [TicketsController],
  providers: [TicketsService, TicketEventsService],
  exports: [TicketEventsService],
})
export class TicketsModule {}
