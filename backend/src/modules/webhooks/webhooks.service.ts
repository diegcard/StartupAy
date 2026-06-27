import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Priority } from '../../entities/enums'
import { Ticket } from '../../entities/ticket.entity'
import { Attachment } from '../../entities/attachment.entity'
import { GeminiService } from '../../shared/gemini/gemini.service'
import { SlaService } from '../../shared/sla/sla.service'
import { EmailWebhookDto } from './dto/email-webhook.dto'
import { WhatsAppWebhookDto } from './dto/whatsapp-webhook.dto'

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
    private readonly gemini: GeminiService,
    private readonly sla: SlaService,
  ) {}

  async receiveEmail(dto: EmailWebhookDto) {
    const classification = await this.gemini.classifyTicket(dto.subject, dto.body)
    const priority = (classification?.priority as Priority) ?? Priority.MEDIUM
    const slaDeadline = await this.sla.calculateDeadline(classification?.categoryId ?? null, priority)

    const ticket = this.ticketRepository.create({
      title: dto.subject || 'Ticket sin asunto',
      description: dto.body,
      channel: 'EMAIL' as any,
      contactEmail: dto.from,
      categoryId: classification?.categoryId ?? null,
      priority,
      slaDeadline,
      aiSuggestedCategory: classification?.categoryId ?? null,
      aiConfidence: classification?.confidence ?? null,
      aiSummary: classification?.summary ?? null,
    })

    const saved = await this.ticketRepository.save(ticket)

    if (dto.attachments?.length) {
      const attachments = dto.attachments.map(a =>
        this.attachmentRepository.create({
          ticketId: saved.id,
          filename: a.filename,
          url: a.url,
          mimeType: a.mimeType,
          size: a.size,
        }),
      )
      await this.attachmentRepository.save(attachments)
    }

    return { ticketId: saved.id, aiClassification: classification }
  }

  async receiveWhatsApp(dto: WhatsAppWebhookDto) {
    const title = dto.body.slice(0, 80)
    const classification = await this.gemini.classifyTicket(title, dto.body)
    const priority = (classification?.priority as Priority) ?? Priority.MEDIUM
    const slaDeadline = await this.sla.calculateDeadline(classification?.categoryId ?? null, priority)

    const ticket = this.ticketRepository.create({
      title,
      description: dto.body,
      channel: 'WHATSAPP' as any,
      contactPhone: dto.from,
      categoryId: classification?.categoryId ?? null,
      priority,
      slaDeadline,
      aiSuggestedCategory: classification?.categoryId ?? null,
      aiConfidence: classification?.confidence ?? null,
      aiSummary: classification?.summary ?? null,
    })

    const saved = await this.ticketRepository.save(ticket)
    return { ticketId: saved.id, aiClassification: classification }
  }
}
