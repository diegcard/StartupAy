import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Not, IsNull } from 'typeorm'
import { Ticket } from '../../entities/ticket.entity'
import { TicketHistory } from '../../entities/ticket-history.entity'
import { Category } from '../../entities/category.entity'
import { Escalation } from '../../entities/escalation.entity'
import { TicketStatus } from '../../entities/enums'

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(TicketHistory)
    private readonly historyRepository: Repository<TicketHistory>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Escalation)
    private readonly escalationRepository: Repository<Escalation>,
  ) {}

  async getSummary() {
    const [totalOpen, totalInProgress, totalResolved, allTickets, reclassifications] =
      await Promise.all([
        this.ticketRepository.count({ where: { status: TicketStatus.OPEN } }),
        this.ticketRepository.count({ where: { status: TicketStatus.IN_PROGRESS } }),
        this.ticketRepository.count({ where: { status: TicketStatus.RESOLVED } }),
        this.ticketRepository.find({
          where: { slaDeadline: Not(IsNull()) },
          select: ['slaDeadline', 'resolvedAt', 'createdAt', 'status'],
        }),
        this.historyRepository.count({
          where: { fromCategoryId: Not(IsNull()), toCategoryId: Not(IsNull()) },
        }),
      ])

    const [byCategory, byChannel, aiMetrics, escalationCount] = await Promise.all([
      this.ticketRepository
        .createQueryBuilder('ticket')
        .select('ticket.categoryId', 'categoryId')
        .addSelect('COUNT(*)', 'count')
        .groupBy('ticket.categoryId')
        .getRawMany<{ categoryId: string; count: string }>(),

      this.ticketRepository
        .createQueryBuilder('ticket')
        .select('ticket.channel', 'channel')
        .addSelect('COUNT(*)', 'count')
        .groupBy('ticket.channel')
        .getRawMany<{ channel: string; count: string }>(),

      // Métricas de precisión AI: tickets con sugerencia vs categoría final aplicada
      this.ticketRepository
        .createQueryBuilder('ticket')
        .select([
          'COUNT(CASE WHEN ticket.aiSuggestedCategory IS NOT NULL THEN 1 END) AS withSuggestion',
          'COUNT(CASE WHEN ticket.aiSuggestedCategory IS NOT NULL AND ticket.categoryId = ticket.aiSuggestedCategory THEN 1 END) AS matching',
          'AVG(CASE WHEN ticket.aiConfidence IS NOT NULL THEN ticket.aiConfidence END) AS avgConfidence',
          'COUNT(CASE WHEN ticket.aiConfidence < 0.70 AND ticket.aiConfidence IS NOT NULL THEN 1 END) AS confLow',
          'COUNT(CASE WHEN ticket.aiConfidence >= 0.70 AND ticket.aiConfidence < 0.90 THEN 1 END) AS confMedium',
          'COUNT(CASE WHEN ticket.aiConfidence >= 0.90 THEN 1 END) AS confHigh',
        ])
        .getRawOne<{
          withSuggestion: string; matching: string; avgConfidence: string
          confLow: string; confMedium: string; confHigh: string
        }>(),

      // Total de tickets que tuvieron al menos una escalación
      this.escalationRepository
        .createQueryBuilder('esc')
        .select('COUNT(DISTINCT esc.ticketId)', 'count')
        .getRawOne<{ count: string }>(),
    ])

    const total = totalOpen + totalInProgress + totalResolved

    // SLA
    const slaBreached = allTickets.filter(
      t => t.slaDeadline && t.status !== TicketStatus.RESOLVED && new Date() > t.slaDeadline,
    ).length
    const slaCompliance = total > 0 ? Math.round(((total - slaBreached) / total) * 100) : 100

    // MTTR
    const resolved = allTickets.filter(t => t.resolvedAt)
    const avgMttrHours =
      resolved.length > 0
        ? Math.round(
            resolved.reduce((sum, t) => {
              return sum + (t.resolvedAt!.getTime() - t.createdAt.getTime()) / 3_600_000
            }, 0) / resolved.length,
          )
        : 0

    // Reclasificaciones
    const reclassificationRate = total > 0 ? Math.round((reclassifications / total) * 100) : 0

    // Precisión AI (% tickets donde categoría final = sugerencia AI)
    const withSuggestion = parseInt(aiMetrics?.withSuggestion ?? '0')
    const matching = parseInt(aiMetrics?.matching ?? '0')
    const aiPrecision = withSuggestion > 0 ? Math.round((matching / withSuggestion) * 100) : null

    // Tasa de escalación
    const escalated = parseInt(escalationCount?.count ?? '0')
    const escalationRate = total > 0 ? Math.round((escalated / total) * 100) : 0

    // Confianza media
    const avgAiConfidence =
      aiMetrics?.avgConfidence != null
        ? Math.round(parseFloat(aiMetrics.avgConfidence) * 100)
        : null

    // Distribución de confianza (% del total con sugerencia)
    const confLow = parseInt(aiMetrics?.confLow ?? '0')
    const confMedium = parseInt(aiMetrics?.confMedium ?? '0')
    const confHigh = parseInt(aiMetrics?.confHigh ?? '0')

    // Categorías
    const categoryIds = byCategory.map(b => b.categoryId).filter(Boolean)
    const categories = await this.categoryRepository.find({
      where: categoryIds.map(id => ({ id })),
      select: ['id', 'name'],
    })
    const categoryMap = Object.fromEntries(categories.map(c => [c.id, c.name]))

    return {
      totalOpen,
      totalInProgress,
      totalResolved,
      slaCompliance,
      avgMttrHours,
      reclassificationRate,
      aiPrecision,
      escalationRate,
      avgAiConfidence,
      confidenceDistribution: { low: confLow, medium: confMedium, high: confHigh },
      byCategory: byCategory.map(b => ({
        name: b.categoryId ? (categoryMap[b.categoryId] ?? 'Sin categoría') : 'Sin categoría',
        count: Number(b.count),
      })),
      byChannel: byChannel.map(b => ({
        channel: b.channel,
        count: Number(b.count),
      })),
    }
  }
}
