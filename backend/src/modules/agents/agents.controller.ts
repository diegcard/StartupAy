import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { AgentsService } from './agents.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { AgentRole } from '../../entities/enums'

@Controller('agents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  @Roles(AgentRole.SUPERVISOR, AgentRole.ADMIN)
  findAll() {
    return this.agentsService.findAll()
  }

  @Get('suggest')
  @Roles(AgentRole.SUPERVISOR, AgentRole.ADMIN)
  suggestSpecialist(@Query('categoryId') categoryId: string) {
    return this.agentsService.suggestSpecialist(categoryId)
  }
}
