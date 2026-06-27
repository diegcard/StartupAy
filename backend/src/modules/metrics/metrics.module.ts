import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Ticket } from '../../entities/ticket.entity'
import { TicketHistory } from '../../entities/ticket-history.entity'
import { Category } from '../../entities/category.entity'
import { MetricsController } from './metrics.controller'
import { MetricsService } from './metrics.service'

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, TicketHistory, Category])],
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class MetricsModule {}
