import {
  Controller, Get, Post, Put, Param, Body, Query,
  UseGuards, HttpCode, Sse, UnauthorizedException,
} from '@nestjs/common'
import { Observable, merge, interval } from 'rxjs'
import { map } from 'rxjs/operators'
import * as jwt from 'jsonwebtoken'
import { TicketsService } from './tickets.service'
import { CreateTicketDto } from './dto/create-ticket.dto'
import { UpdateTicketDto } from './dto/update-ticket.dto'
import { FilterTicketsDto } from './dto/filter-tickets.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentAgent } from '../auth/decorators/current-agent.decorator'
import { TicketEventsService } from '../../shared/events/ticket-events.service'

@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly ticketEventsService: TicketEventsService,
  ) {}

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateTicketDto) {
    return this.ticketsService.create(dto)
  }

  @Get('similar')
  @UseGuards(JwtAuthGuard)
  findSimilar(
    @Query('categoryId') categoryId: string,
    @Query('q') q?: string,
  ) {
    return this.ticketsService.findSimilar(categoryId, q)
  }

  @Sse('events')
  ticketEvents(@Query('token') token: string): Observable<MessageEvent> {
    try {
      jwt.verify(token, process.env.JWT_SECRET || '')
    } catch {
      throw new UnauthorizedException('Token inválido')
    }
    const events$ = this.ticketEventsService.stream.pipe(
      map(event => ({ data: JSON.stringify(event) } as MessageEvent)),
    )
    const heartbeat$ = interval(25000).pipe(
      map(() => ({ data: JSON.stringify({ type: 'heartbeat' }) } as MessageEvent)),
    )
    return merge(events$, heartbeat$)
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
    @CurrentAgent() agent: { agentId: string; role: string },
  ) {
    return this.ticketsService.update(id, dto, agent.agentId, agent.role)
  }

  @Post(':id/classify')
  @UseGuards(JwtAuthGuard)
  classify(@Param('id') id: string) {
    return this.ticketsService.classify(id)
  }

  @Get(':id/suggest-specialist')
  @UseGuards(JwtAuthGuard)
  suggestSpecialist(@Param('id') id: string) {
    return this.ticketsService.suggestSpecialist(id)
  }
}
