import { Controller, Get, Post, Put, Param, Body, Query, UseGuards, HttpCode } from '@nestjs/common'
import { TicketsService } from './tickets.service'
import { CreateTicketDto } from './dto/create-ticket.dto'
import { UpdateTicketDto } from './dto/update-ticket.dto'
import { FilterTicketsDto } from './dto/filter-tickets.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentAgent } from '../auth/decorators/current-agent.decorator'

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateTicketDto) {
    return this.ticketsService.create(dto)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query() filters: FilterTicketsDto,
    @CurrentAgent() agent: { agentId: string; role: string },
  ) {
    return this.ticketsService.findAll(filters, agent)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
    @CurrentAgent() agent: { agentId: string },
  ) {
    return this.ticketsService.update(id, dto, agent.agentId)
  }

  @Post(':id/classify')
  @UseGuards(JwtAuthGuard)
  classify(@Param('id') id: string) {
    return this.ticketsService.classify(id)
  }
}
