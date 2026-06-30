import {
  Injectable, NotFoundException, InternalServerErrorException, ForbiddenException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { Priority, TicketStatus, EscalationTrigger } from '../../entities/enums'
import { CONFIDENCE_AUTO, CONFIDENCE_MIN } from '../../shared/constants'
import { Ticket } from '../../entities/ticket.entity'
import { TicketHistory } from '../../entities/ticket-history.entity'
import { Category } from '../../entities/category.entity'
import { Agent } from '../../entities/agent.entity'
import { AgentSkill } from '../../entities/agent-skill.entity'
import { GeminiService, GeminiClassification } from '../../shared/gemini/gemini.service'
import { SlaService } from '../../shared/sla/sla.service'
import { EscalationsService } from '../escalations/escalations.service'
import { CreateTicketDto } from './dto/create-ticket.dto'
import { UpdateTicketDto } from './dto/update-ticket.dto'
import { FilterTicketsDto } from './dto/filter-tickets.dto'
import { TicketEventsService } from '../../shared/events/ticket-events.service'

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(TicketHistory)
    private readonly historyRepository: Repository<TicketHistory>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
    @InjectRepository(AgentSkill)
    private readonly agentSkillRepository: Repository<AgentSkill>,
    private readonly gemini: GeminiService,
    private readonly sla: SlaService,
    private readonly escalationsService: EscalationsService,
    private readonly dataSource: DataSource,
    private readonly ticketEventsService: TicketEventsService,
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

    // Auto-assign to best available agent
    if (resolvedCategoryId) {
      const suggestion = await this.suggestSpecialistForCategory(resolvedCategoryId)
      if (suggestion) {
        await this.ticketRepository.update(saved.id, { assignedTo: suggestion.agent.id })
      }
    }

    await this.applyPostClassificationRules(saved.id, resolvedCategoryId, classification, dto.title)

    const full = await this.ticketRepository.findOne({
      where: { id: saved.id },
      relations: ['category', 'agent', 'escalations'],
    })

    this.ticketEventsService.emit({ type: 'ticket.created', ticketId: full!.id })
    return { ticket: full, aiClassification: classification }
  }

  async findAll(filters: FilterTicketsDto, agentCtx: { agentId: string; role: string }) {
    const {
      status, categoryId, assignedTo, priority, channel, search,
      sortBy = 'slaDeadline', sortDir = 'ASC',
      page = '1', limit = '20',
    } = filters

    const ORDER_MAP: Record<string, string> = {
      priority:    'ticket.priority',
      slaDeadline: 'ticket.slaDeadline',
      createdAt:   'ticket.createdAt',
      status:      'ticket.status',
    }
    const orderCol = ORDER_MAP[sortBy] ?? 'ticket.slaDeadline'
    const orderDir = (sortDir?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC') as 'ASC' | 'DESC'

    const qb = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.category', 'category')
      .leftJoinAndSelect('ticket.agent', 'agent')
      .orderBy(orderCol, orderDir)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .take(parseInt(limit))

    if (status)     qb.andWhere('ticket.status = :status', { status })
    if (categoryId) qb.andWhere('ticket.categoryId = :categoryId', { categoryId })
    if (priority)   qb.andWhere('ticket.priority = :priority', { priority })
    if (channel)    qb.andWhere('ticket.channel = :channel', { channel })
    if (search?.trim()) {
      qb.andWhere(
        '(LOWER(ticket.title) LIKE :search OR LOWER(ticket.description) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      )
    }
    if (assignedTo) {
      qb.andWhere('ticket.assignedTo = :assignedTo', { assignedTo })
    } else if (agentCtx.role === 'AGENT') {
      qb.andWhere('ticket.assignedTo = :assignedTo', { assignedTo: agentCtx.agentId })
    }

    const [tickets, total] = await qb.getManyAndCount()
    const totalPages = Math.ceil(total / parseInt(limit))
    return { tickets, total, page: parseInt(page), limit: parseInt(limit), totalPages }
  }

  async findOne(id: string) {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: {
        category: true,
        agent: true,
        history: { changedBy: true, fromCategory: true, toCategory: true },
        attachments: true,
        escalations: { assignedTo: true },
      },
      order: { history: { createdAt: 'DESC' } },
    })

    if (!ticket) throw new NotFoundException('Ticket no encontrado')
    return ticket
  }

  async update(id: string, dto: UpdateTicketDto, agentId: string, agentRole?: string) {
    const current = await this.ticketRepository.findOne({ where: { id } })
    if (!current) throw new NotFoundException('Ticket no encontrado')

    // Solo SUPERVISOR/ADMIN pueden reasignar tickets
    if (dto.assignedTo !== undefined && dto.assignedTo !== current.assignedTo) {
      if (!agentRole || !['SUPERVISOR', 'ADMIN'].includes(agentRole)) {
        throw new ForbiddenException('Solo supervisores y administradores pueden reasignar tickets')
      }
    }

    // Boundary enforcement: el agente (aiSuggested=true) no puede enrutar categorías sensibles
    if (dto.aiSuggested && dto.categoryId) {
      const targetCategory = await this.categoryRepository.findOne({
        where: { id: dto.categoryId },
        select: ['id', 'requiresHuman', 'name'],
      })
      if (targetCategory?.requiresHuman) {
        throw new ForbiddenException(
          `La categoría "${targetCategory.name}" requiere decisión humana obligatoria. ` +
          `El agente solo puede sugerir — un especialista debe confirmar.`,
        )
      }
    }

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
        aiSuggested: dto.aiSuggested ?? false,
        isInternal: dto.isInternal ?? false,
      })
      const updated = await manager.findOne(Ticket, {
        where: { id },
        relations: ['category', 'agent', 'escalations'],
      })
      this.ticketEventsService.emit({ type: 'ticket.updated', ticketId: id })
      return updated
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

  async findSimilar(categoryId: string, q?: string) {
    const qb = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.category', 'category')
      .where('ticket.status = :status', { status: TicketStatus.RESOLVED })
      .andWhere('ticket.categoryId = :categoryId', { categoryId })
      .orderBy('ticket.resolvedAt', 'DESC')
      .take(5)

    if (q?.trim()) {
      qb.andWhere(
        '(LOWER(ticket.title) LIKE :q OR LOWER(ticket.description) LIKE :q)',
        { q: `%${q.toLowerCase()}%` },
      )
    }

    return qb.getMany()
  }

  async suggestSpecialist(ticketId: string) {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
      select: ['id', 'categoryId'],
    })
    if (!ticket || !ticket.categoryId) return null

    return this.suggestSpecialistForCategory(ticket.categoryId)
  }

  async suggestSpecialistForCategory(categoryId: string) {
    const skills = await this.agentSkillRepository.find({
      where: { categoryId },
      relations: ['agent'],
    })

    if (!skills.length) return null

    const agentIds = skills.map(s => s.agentId)

    const activeCounts = await this.ticketRepository
      .createQueryBuilder('ticket')
      .select('ticket.assignedTo', 'agentId')
      .addSelect('COUNT(*)', 'count')
      .where('ticket.status NOT IN (:...statuses)', {
        statuses: [TicketStatus.RESOLVED, TicketStatus.CLOSED],
      })
      .andWhere('ticket.assignedTo IN (:...agentIds)', { agentIds })
      .groupBy('ticket.assignedTo')
      .getRawMany<{ agentId: string; count: string }>()

    const countMap = new Map(activeCounts.map(r => [r.agentId, parseInt(r.count)]))

    const candidates = skills
      .filter(s => s.agent.isAvailable)
      .map(s => ({
        agent: s.agent,
        activeTickets: countMap.get(s.agentId) ?? 0,
        loadRatio: (countMap.get(s.agentId) ?? 0) / s.agent.maxCapacity,
      }))
      .sort((a, b) => a.loadRatio - b.loadRatio)

    if (!candidates.length) return null

    const best = candidates[0]
    return {
      agent: { id: best.agent.id, name: best.agent.name, email: best.agent.email, role: best.agent.role },
      activeTickets: best.activeTickets,
      loadRatio: Math.round(best.loadRatio * 100),
    }
  }

  // ── Reglas post-clasificación (Brecha 2 + 3) ──────────────────────────────

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
      // Categoría sensible → HITL obligatorio sin importar la confianza
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
      // Confianza insuficiente → escalar y limpiar categoría (evita categoría incierta aplicada)
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

    // confidence >= CONFIDENCE_MIN y !requiresHuman: aplicar categoría (A1 o A2 según umbral)
    // El ticket ya tiene categoryId aplicado desde create() — no se necesita acción extra
  }
}
