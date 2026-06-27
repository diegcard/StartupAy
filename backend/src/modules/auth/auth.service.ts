import { Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { Agent } from '../../entities/agent.entity'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const agent = await this.agentRepository.findOne({ where: { email: dto.email } })
    if (!agent) throw new UnauthorizedException('Credenciales inválidas')

    const valid = await bcrypt.compare(dto.password, agent.passwordHash)
    if (!valid) throw new UnauthorizedException('Credenciales inválidas')

    const token = this.jwt.sign({ agentId: agent.id, role: agent.role })

    return {
      token,
      agent: { id: agent.id, name: agent.name, email: agent.email, role: agent.role },
    }
  }

  async getProfile(agentId: string) {
    return this.agentRepository.findOne({
      where: { id: agentId },
      select: ['id', 'name', 'email', 'role', 'isAvailable'],
      relations: ['skills', 'skills.category'],
    })
  }
}
