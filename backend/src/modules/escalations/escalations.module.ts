import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Escalation } from '../../entities/escalation.entity'
import { Ticket } from '../../entities/ticket.entity'
import { TicketHistory } from '../../entities/ticket-history.entity'
import { EscalationsController } from './escalations.controller'
import { EscalationsService } from './escalations.service'

@Module({
  imports: [TypeOrmModule.forFeature([Escalation, Ticket, TicketHistory])],
  controllers: [EscalationsController],
  providers: [EscalationsService],
  exports: [EscalationsService],
})
export class EscalationsModule {}
