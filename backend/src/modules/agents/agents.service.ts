import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TicketStatus } from '../../entities/enums'
import { Agent } from '../../entities/agent.entity'
import { AgentSkill } from '../../entities/agent-skill.entity'
import { Ticket } from '../../entities/ticket.entity'

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
    @InjectRepository(AgentSkill)
    private readonly agentSkillRepository: Repository<AgentSkill>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  async findAll() {
    const agents = await this.agentRepository.find({
      select: ['id', 'name', 'email', 'role', 'isAvailable', 'maxCapacity'],
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
