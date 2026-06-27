import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Agent } from './agent.entity'
import { Category } from './category.entity'

@Entity('agent_skills')
export class AgentSkill {
  @PrimaryColumn()
  agentId: string

  @PrimaryColumn()
  categoryId: string

  @ManyToOne(() => Agent, agent => agent.skills)
  @JoinColumn({ name: 'agentId' })
  agent: Agent

  @ManyToOne(() => Category, category => category.agentSkills)
  @JoinColumn({ name: 'categoryId' })
  category: Category
}
