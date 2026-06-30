import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common'
import { EscalationsService } from './escalations.service'
import { ResolveEscalationDto } from './dto/resolve-escalation.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentAgent } from '../auth/decorators/current-agent.decorator'
import { AgentRole } from '../../entities/enums'

@Controller('escalations')
@UseGuards(JwtAuthGuard)
export class EscalationsController {
  constructor(private readonly escalationsService: EscalationsService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(AgentRole.SUPERVISOR, AgentRole.ADMIN)
  findAllPending() {
    return this.escalationsService.findAllPending()
  }

  @Get('ticket/:ticketId')
  findByTicket(@Param('ticketId') ticketId: string) {
    return this.escalationsService.findByTicket(ticketId)
  }

  @Put(':id/resolve')
  @UseGuards(RolesGuard)
  @Roles(AgentRole.SUPERVISOR, AgentRole.ADMIN)
  resolve(
    @Param('id') id: string,
    @Body() dto: ResolveEscalationDto,
    @CurrentAgent() agent: { agentId: string },
  ) {
    return this.escalationsService.resolve(id, dto, agent.agentId)
  }
}
