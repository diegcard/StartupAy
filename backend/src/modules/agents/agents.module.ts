import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Agent } from '../../entities/agent.entity'
import { AgentSkill } from '../../entities/agent-skill.entity'
import { AgentsController } from './agents.controller'
import { AgentsService } from './agents.service'

@Module({
  imports: [TypeOrmModule.forFeature([Agent, AgentSkill])],
  controllers: [AgentsController],
  providers: [AgentsService],
})
export class AgentsModule {}
