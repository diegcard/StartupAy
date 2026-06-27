import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Ticket } from '../../entities/ticket.entity'
import { Attachment } from '../../entities/attachment.entity'
import { WebhooksController } from './webhooks.controller'
import { WebhooksService } from './webhooks.service'
import { GeminiModule } from '../../shared/gemini/gemini.module'
import { SlaModule } from '../../shared/sla/sla.module'

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, Attachment]), GeminiModule, SlaModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
