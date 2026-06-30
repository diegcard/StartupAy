import { Controller, Get, Res, UseGuards } from '@nestjs/common'
import { Response } from 'express'
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

  @Get('export')
  async exportCsv(@Res() res: Response) {
    const m = await this.metricsService.getSummary()

    const rows: string[] = [
      'Métrica,Valor',
      `Tickets Abiertos,${m.totalOpen}`,
      `Tickets En Progreso,${m.totalInProgress}`,
      `Tickets Resueltos,${m.totalResolved}`,
      `Cumplimiento SLA (%),${m.slaCompliance}`,
      `MTTR Promedio (h),${m.avgMttrHours}`,
      `Tasa Reclasificación (%),${m.reclassificationRate}`,
      `Precisión IA (%),${m.aiPrecision ?? 'Sin datos'}`,
      `Tasa Escalación (%),${m.escalationRate}`,
      `Confianza IA Promedio (%),${m.avgAiConfidence ?? 'Sin datos'}`,
      '',
      'Categoría,Tickets',
      ...m.byCategory.map(c => `"${c.name}",${c.count}`),
      '',
      'Canal,Tickets',
      ...m.byChannel.map(c => `${c.channel},${c.count}`),
    ]

    const csv = rows.join('\n')
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="metricas-startupay.csv"`)
    res.send('﻿' + csv)
  }
}
