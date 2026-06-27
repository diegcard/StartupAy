import { Controller, Get, UseGuards } from '@nestjs/common'
import { MetricsService } from './metrics.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { AgentRole } from '../../entities/enums'

@Controller('metrics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AgentRole.SUPERVISOR, AgentRole.ADMIN)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  getSummary() {
    return this.metricsService.getSummary()
  }
}
