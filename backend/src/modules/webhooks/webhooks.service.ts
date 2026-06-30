import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Priority, TicketStatus, EscalationTrigger } from '../../entities/enums'
import { CONFIDENCE_MIN } from '../../shared/constants'
import { Ticket } from '../../entities/ticket.entity'
import { Attachment } from '../../entities/attachment.entity'
import { Category } from '../../entities/category.entity'
import { GeminiService, GeminiClassification } from '../../shared/gemini/gemini.service'
import { SlaService } from '../../shared/sla/sla.service'
import { EscalationsService } from '../escalations/escalations.service'
import { EmailWebhookDto } from './dto/email-webhook.dto'
import { WhatsAppWebhookDto } from './dto/whatsapp-webhook.dto'

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly gemini: GeminiService,
    private readonly sla: SlaService,
    private readonly escalationsService: EscalationsService,
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

    await this.applyPostClassificationRules(saved.id, classification?.categoryId ?? null, classification, dto.subject)

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

    await this.applyPostClassificationRules(saved.id, classification?.categoryId ?? null, classification, title)

    return { ticketId: saved.id, aiClassification: classification }
  }

  private async applyPostClassificationRules(
    ticketId: string,
    categoryId: string | null,
    classification: GeminiClassification | null,
    ticketTitle?: string,
  ) {
    if (!classification || !categoryId) return

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
      select: ['id', 'name', 'requiresHuman'],
    })

    if (!category) return

    if (category.requiresHuman) {
      await this.ticketRepository.update(ticketId, { status: TicketStatus.ESCALATED })
      await this.escalationsService.create({
        ticketId,
        categoryId,
        trigger: EscalationTrigger.REQUIRES_HUMAN,
        aiConfidence: classification.confidence,
        ticketTitle,
        categoryName: category.name,
      })
      return
    }

    if (classification.confidence < CONFIDENCE_MIN) {
      await this.ticketRepository.update(ticketId, {
        status: TicketStatus.ESCALATED,
        categoryId: null,
      })
      await this.escalationsService.create({
        ticketId,
        categoryId,
        trigger: EscalationTrigger.LOW_CONFIDENCE,
        aiConfidence: classification.confidence,
        ticketTitle,
        categoryName: category.name,
      })
    }
  }
}
