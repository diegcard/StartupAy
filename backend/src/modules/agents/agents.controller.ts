import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, HttpCode } from '@nestjs/common'
import { AgentsService } from './agents.service'
import { CreateAgentDto } from './dto/create-agent.dto'
import { UpdateAgentDto } from './dto/update-agent.dto'
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

  @Get(':id')
  @Roles(AgentRole.SUPERVISOR, AgentRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.agentsService.findOne(id)
  }

  @Post()
  @Roles(AgentRole.ADMIN)
  @HttpCode(201)
  create(@Body() dto: CreateAgentDto) {
    return this.agentsService.create(dto)
  }

  @Put(':id')
  @Roles(AgentRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateAgentDto) {
    return this.agentsService.update(id, dto)
  }

  @Delete(':id')
  @Roles(AgentRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.agentsService.remove(id)
  }
}
