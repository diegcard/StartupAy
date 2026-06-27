import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource, Not, IsNull } from 'typeorm'
import { Priority, TicketStatus } from '../../entities/enums'
import { Ticket } from '../../entities/ticket.entity'
import { TicketHistory } from '../../entities/ticket-history.entity'
import { GeminiService } from '../../shared/gemini/gemini.service'
import { SlaService } from '../../shared/sla/sla.service'
import { CreateTicketDto } from './dto/create-ticket.dto'
import { UpdateTicketDto } from './dto/update-ticket.dto'
import { FilterTicketsDto } from './dto/filter-tickets.dto'

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(TicketHistory)
    private readonly historyRepository: Repository<TicketHistory>,
    private readonly gemini: GeminiService,
    private readonly sla: SlaService,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateTicketDto) {
    const classification = await this.gemini.classifyTicket(dto.title, dto.description)
    const resolvedCategoryId = dto.categoryId ?? classification?.categoryId ?? null
    const priority = (classification?.priority as Priority) ?? Priority.MEDIUM
    const slaDeadline = await this.sla.calculateDeadline(resolvedCategoryId, priority)

    const ticket = this.ticketRepository.create({
      title: dto.title,
      description: dto.description,
      channel: dto.channel,
      merchantId: dto.merchantId,
      transactionId: dto.transactionId,
      contactEmail: dto.contactEmail,
      contactPhone: dto.contactPhone,
      categoryId: resolvedCategoryId,
      priority,
      slaDeadline,
      aiSuggestedCategory: classification?.categoryId ?? null,
      aiConfidence: classification?.confidence ?? null,
      aiSummary: classification?.summary ?? null,
    })

    const saved = await this.ticketRepository.save(ticket)
    const full = await this.ticketRepository.findOne({
      where: { id: saved.id },
      relations: ['category', 'agent'],
    })

    return { ticket: full, aiClassification: classification }
  }

  async findAll(filters: FilterTicketsDto, agentCtx: { agentId: string; role: string }) {
    const { status, categoryId, assignedTo, priority, page = '1', limit = '20' } = filters

    const qb = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.category', 'category')
      .leftJoinAndSelect('ticket.agent', 'agent')
      .orderBy('ticket.priority', 'DESC')
      .addOrderBy('ticket.slaDeadline', 'ASC')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .take(parseInt(limit))

    if (status) qb.andWhere('ticket.status = :status', { status })
    if (categoryId) qb.andWhere('ticket.categoryId = :categoryId', { categoryId })
    if (priority) qb.andWhere('ticket.priority = :priority', { priority })
    if (assignedTo) {
      qb.andWhere('ticket.assignedTo = :assignedTo', { assignedTo })
    } else if (agentCtx.role === 'AGENT') {
      qb.andWhere('ticket.assignedTo = :assignedTo', { assignedTo: agentCtx.agentId })
    }

    const [tickets, total] = await qb.getManyAndCount()
    return { tickets, total, page: parseInt(page), limit: parseInt(limit) }
  }

  async findOne(id: string) {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: {
        category: true,
        agent: true,
        history: { changedBy: true, fromCategory: true, toCategory: true },
        attachments: true,
      },
      order: { history: { createdAt: 'DESC' } },
    })

    if (!ticket) throw new NotFoundException('Ticket no encontrado')
    return ticket
  }

  async update(id: string, dto: UpdateTicketDto, agentId: string) {
    const current = await this.ticketRepository.findOne({ where: { id } })
    if (!current) throw new NotFoundException('Ticket no encontrado')

    const updates: Partial<Ticket> = {}
    if (dto.categoryId !== undefined) updates.categoryId = dto.categoryId
    if (dto.assignedTo !== undefined) updates.assignedTo = dto.assignedTo
    if (dto.status !== undefined) updates.status = dto.status as TicketStatus
    if (dto.priority !== undefined) updates.priority = dto.priority as Priority
    if (dto.status === TicketStatus.RESOLVED) updates.resolvedAt = new Date()

    return this.dataSource.transaction(async manager => {
      await manager.update(Ticket, id, updates)
      await manager.save(TicketHistory, {
        ticketId: id,
        changedById: agentId,
        fromCategoryId: current.categoryId,
        toCategoryId: dto.categoryId ?? current.categoryId,
        fromAgentId: current.assignedTo,
        toAgentId: dto.assignedTo ?? current.assignedTo,
        fromStatus: current.status,
        toStatus: dto.status ?? current.status,
        reason: dto.reason ?? null,
        aiSuggested: false,
      })
      return manager.findOne(Ticket, { where: { id }, relations: ['category', 'agent'] })
    })
  }

  async classify(id: string) {
    const ticket = await this.ticketRepository.findOne({ where: { id } })
    if (!ticket) throw new NotFoundException('Ticket no encontrado')

    const classification = await this.gemini.classifyTicket(ticket.title, ticket.description)
    if (!classification) throw new InternalServerErrorException('Error al clasificar con Gemini')

    await this.ticketRepository.update(id, {
      aiSuggestedCategory: classification.categoryId,
      aiConfidence: classification.confidence,
      aiSummary: classification.summary,
    })

    return classification
  }
}
