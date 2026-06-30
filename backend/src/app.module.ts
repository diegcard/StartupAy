import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { Category } from './entities/category.entity'
import { Agent } from './entities/agent.entity'
import { AgentSkill } from './entities/agent-skill.entity'
import { Ticket } from './entities/ticket.entity'
import { TicketHistory } from './entities/ticket-history.entity'
import { Attachment } from './entities/attachment.entity'
import { Escalation } from './entities/escalation.entity'
import { GeminiModule } from './shared/gemini/gemini.module'
import { SlaModule } from './shared/sla/sla.module'
import { AuthModule } from './modules/auth/auth.module'
import { TicketsModule } from './modules/tickets/tickets.module'
import { CategoriesModule } from './modules/categories/categories.module'
import { AgentsModule } from './modules/agents/agents.module'
import { WebhooksModule } from './modules/webhooks/webhooks.module'
import { MetricsModule } from './modules/metrics/metrics.module'
import { EscalationsModule } from './modules/escalations/escalations.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Category, Agent, AgentSkill, Ticket, TicketHistory, Attachment, Escalation],
      synchronize: true,
      logging: false,
    }),
    GeminiModule,
    SlaModule,
    AuthModule,
    TicketsModule,
    CategoriesModule,
    AgentsModule,
    WebhooksModule,
    MetricsModule,
    EscalationsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
