import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { TicketStatus } from '../../entities/enums'
import { Agent } from '../../entities/agent.entity'
import { AgentSkill } from '../../entities/agent-skill.entity'
import { Ticket } from '../../entities/ticket.entity'
import { CreateAgentDto } from './dto/create-agent.dto'
import { UpdateAgentDto } from './dto/update-agent.dto'

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
    @InjectRepository(AgentSkill)
    private readonly agentSkillRepository: Repository<AgentSkill>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll() {
    const agents = await this.agentRepository.find({
      select: ['id', 'name', 'email', 'role', 'isAvailable', 'maxCapacity', 'createdAt'],
      relations: ['skills', 'skills.category'],
      order: { name: 'ASC' },
    })

    const activeCounts = await this.ticketRepository
      .createQueryBuilder('ticket')
      .select('ticket.assignedTo', 'agentId')
      .addSelect('COUNT(*)', 'count')
      .where('ticket.status NOT IN (:...statuses)', {
        statuses: [TicketStatus.RESOLVED, TicketStatus.CLOSED],
      })
      .andWhere('ticket.assignedTo IS NOT NULL')
      .groupBy('ticket.assignedTo')
      .getRawMany<{ agentId: string; count: string }>()

    const countMap = new Map(activeCounts.map(r => [r.agentId, parseInt(r.count)]))

    return agents.map(agent => ({
      ...agent,
      activeTickets: countMap.get(agent.id) ?? 0,
      loadRatio: Math.round(((countMap.get(agent.id) ?? 0) / agent.maxCapacity) * 100) / 100,
    }))
  }

  async findOne(id: string) {
    const agent = await this.agentRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'role', 'isAvailable', 'maxCapacity', 'createdAt'],
      relations: ['skills', 'skills.category'],
    })
    if (!agent) throw new NotFoundException('Agente no encontrado')

    const activeTickets = await this.ticketRepository.count({
      where: [
        { assignedTo: id, status: TicketStatus.OPEN },
        { assignedTo: id, status: TicketStatus.IN_PROGRESS },
        { assignedTo: id, status: TicketStatus.WAITING_CLIENT },
        { assignedTo: id, status: TicketStatus.ESCALATED },
      ],
    })

    return { ...agent, activeTickets, loadRatio: Math.round((activeTickets / agent.maxCapacity) * 100) / 100 }
  }

  async create(dto: CreateAgentDto) {
    const existing = await this.agentRepository.findOne({ where: { email: dto.email } })
    if (existing) throw new ConflictException('Ya existe un agente con ese email')

    const passwordHash = await bcrypt.hash(dto.password, 10)

    return this.dataSource.transaction(async manager => {
      const agent = manager.create(Agent, {
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: dto.role,
        maxCapacity: dto.maxCapacity ?? 10,
        isAvailable: true,
      })
      const saved = await manager.save(Agent, agent)

      if (dto.categoryIds?.length) {
        const skills = dto.categoryIds.map(catId =>
          manager.create(AgentSkill, { agentId: saved.id, categoryId: catId })
        )
        await manager.save(AgentSkill, skills)
      }

      return this.findOne(saved.id)
    })
  }

  async update(id: string, dto: UpdateAgentDto) {
    const agent = await this.agentRepository.findOne({ where: { id } })
    if (!agent) throw new NotFoundException('Agente no encontrado')

    return this.dataSource.transaction(async manager => {
      const updates: Partial<Agent> = {}
      if (dto.name !== undefined) updates.name = dto.name
      if (dto.role !== undefined) updates.role = dto.role
      if (dto.isAvailable !== undefined) updates.isAvailable = dto.isAvailable
      if (dto.maxCapacity !== undefined) updates.maxCapacity = dto.maxCapacity
      if (dto.password) updates.passwordHash = await bcrypt.hash(dto.password, 10)

      if (Object.keys(updates).length) await manager.update(Agent, id, updates)

      if (dto.categoryIds !== undefined) {
        await manager.delete(AgentSkill, { agentId: id })
        if (dto.categoryIds.length) {
          const skills = dto.categoryIds.map(catId =>
            manager.create(AgentSkill, { agentId: id, categoryId: catId })
          )
          await manager.save(AgentSkill, skills)
        }
      }

      return this.findOne(id)
    })
  }

  async remove(id: string) {
    const agent = await this.agentRepository.findOne({ where: { id } })
    if (!agent) throw new NotFoundException('Agente no encontrado')
    await this.agentRepository.update(id, { isAvailable: false })
    return { message: 'Agente desactivado correctamente' }
  }

  async suggestSpecialist(categoryId: string) {
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
      agent: {
        id: best.agent.id,
        name: best.agent.name,
        email: best.agent.email,
        role: best.agent.role,
        isAvailable: best.agent.isAvailable,
      },
      activeTickets: best.activeTickets,
      loadRatio: Math.round(best.loadRatio * 100),
    }
  }
}
