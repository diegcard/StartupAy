import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Ticket } from '../../entities/ticket.entity'
import { TicketHistory } from '../../entities/ticket-history.entity'
import { TicketsController } from './tickets.controller'
import { TicketsService } from './tickets.service'
import { GeminiModule } from '../../shared/gemini/gemini.module'
import { SlaModule } from '../../shared/sla/sla.module'

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, TicketHistory]), GeminiModule, SlaModule],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
