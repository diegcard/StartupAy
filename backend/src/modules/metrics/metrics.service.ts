import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Not, IsNull } from 'typeorm'
import { Ticket } from '../../entities/ticket.entity'
import { TicketHistory } from '../../entities/ticket-history.entity'
import { Category } from '../../entities/category.entity'
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

    const [byCategory, byChannel] = await Promise.all([
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
    ])

    const total = totalOpen + totalInProgress + totalResolved
    const slaBreached = allTickets.filter(
      t => t.slaDeadline && t.status !== TicketStatus.RESOLVED && new Date() > t.slaDeadline,
    ).length
    const slaCompliance = total > 0 ? Math.round(((total - slaBreached) / total) * 100) : 100

    const resolved = allTickets.filter(t => t.resolvedAt)
    const avgMttrHours =
      resolved.length > 0
        ? Math.round(
            resolved.reduce((sum, t) => {
              return sum + (t.resolvedAt!.getTime() - t.createdAt.getTime()) / 3_600_000
            }, 0) / resolved.length,
          )
        : 0

    const reclassificationRate = total > 0 ? Math.round((reclassifications / total) * 100) : 0

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
