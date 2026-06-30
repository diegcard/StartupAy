import { Injectable, NotFoundException, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, IsNull } from 'typeorm'
import { EscalationTrigger } from '../../entities/enums'
import { Escalation } from '../../entities/escalation.entity'
import { Ticket } from '../../entities/ticket.entity'
import { TicketHistory } from '../../entities/ticket-history.entity'
import { ResolveEscalationDto } from './dto/resolve-escalation.dto'

interface CreateEscalationParams {
  ticketId: string
  categoryId: string | null
  trigger: EscalationTrigger
  aiConfidence: number | null
  ticketTitle?: string
  categoryName?: string
}

@Injectable()
export class EscalationsService {
  private readonly logger = new Logger(EscalationsService.name)

  constructor(
    @InjectRepository(Escalation)
    private readonly escalationRepository: Repository<Escalation>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(TicketHistory)
    private readonly historyRepository: Repository<TicketHistory>,
  ) {}

  async create(params: CreateEscalationParams) {
    const escalation = this.escalationRepository.create({
      ticketId: params.ticketId,
      categoryId: params.categoryId ?? undefined,
      trigger: params.trigger,
      aiConfidence: params.aiConfidence ?? undefined,
    })
    const saved = await this.escalationRepository.save(escalation)

    this.sendNotification(saved, params).catch(err =>
      this.logger.warn(`Notification webhook failed: ${err?.message}`)
    )

    return saved
  }

  findByTicket(ticketId: string) {
    return this.escalationRepository.find({
      where: { ticketId },
      relations: ['assignedTo'],
      order: { createdAt: 'DESC' },
    })
  }

  findAllPending() {
    return this.escalationRepository.find({
      where: { resolvedAt: IsNull() },
      relations: ['assignedTo', 'ticket', 'ticket.category'],
      order: { createdAt: 'ASC' },
    })
  }

  async resolve(id: string, dto: ResolveEscalationDto, resolvedById: string) {
    const escalation = await this.escalationRepository.findOne({
      where: { id },
      relations: ['ticket'],
    })
    if (!escalation) throw new NotFoundException('Escalación no encontrada')

    await this.escalationRepository.update(id, {
      resolvedAt: new Date(),
      wasAiCorrect: dto.wasAiCorrect,
      resolutionNote: dto.resolutionNote ?? null,
    })

    // Re-evaluación post-resolución: si el especialista provee la categoría correcta,
    // actualizar el ticket y escribir el evento en el historial
    if (dto.correctCategoryId && dto.correctCategoryId !== escalation.ticket?.categoryId) {
      const prevCategoryId = escalation.ticket?.categoryId ?? null
      await this.ticketRepository.update(escalation.ticketId, {
        categoryId: dto.correctCategoryId,
      })
      await this.historyRepository.save({
        ticketId: escalation.ticketId,
        changedById: resolvedById,
        fromCategoryId: prevCategoryId,
        toCategoryId: dto.correctCategoryId,
        fromStatus: escalation.ticket?.status,
        toStatus: escalation.ticket?.status,
        reason: dto.resolutionNote ?? 'Corrección de categoría post-escalación',
        aiSuggested: false,
      })
    }

    return this.escalationRepository.findOne({ where: { id }, relations: ['assignedTo'] })
  }

  // ── Notificación a n8n (fire-and-forget) ─────────────────────────────────

  private async sendNotification(
    escalation: Escalation,
    params: CreateEscalationParams,
  ) {
    const webhookUrl = process.env.ESCALATION_WEBHOOK_URL
    if (!webhookUrl) return

    const triggerLabel =
      params.trigger === EscalationTrigger.REQUIRES_HUMAN
        ? 'Categoría sensible (Fraude/Compliance)'
        : 'Baja confianza IA'

    const body = JSON.stringify({
      event: 'escalation.created',
      escalationId: escalation.id,
      ticketId: escalation.ticketId,
      ticketTitle: params.ticketTitle ?? '(sin título)',
      trigger: params.trigger,
      triggerLabel,
      categoryName: params.categoryName ?? '(sin categoría)',
      aiConfidence: params.aiConfidence != null
        ? `${Math.round(params.aiConfidence * 100)}%`
        : null,
      createdAt: escalation.createdAt,
      ticketUrl: `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/tickets/${escalation.ticketId}`,
    })

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: AbortSignal.timeout(5000),
    })
  }
}
