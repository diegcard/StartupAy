import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Agent } from '../../entities/agent.entity'

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
  ) {}

  findAll() {
    return this.agentRepository.find({
      select: ['id', 'name', 'email', 'role', 'isAvailable', 'maxCapacity'],
      relations: ['skills', 'skills.category'],
      order: { name: 'ASC' },
    })
  }
}
