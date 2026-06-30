import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { DataSource } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { AppModule } from './app.module'
import { Category } from './entities/category.entity'
import { Agent } from './entities/agent.entity'
import { AgentSkill } from './entities/agent-skill.entity'
import { AgentRole } from './entities/enums'

async function runSeed(ds: DataSource) {
  const em = ds.manager

  const categoryData = [
    { name: 'Fraude', description: 'Transacciones no reconocidas, uso no autorizado de cuenta, robo de identidad', requiresHuman: true, slaHours: 4 },
    { name: 'Compliance', description: 'Cumplimiento regulatorio, KYC, AML, documentación legal requerida', requiresHuman: true, slaHours: 8 },
    { name: 'Disputas de Pago', description: 'Contracargos, pagos duplicados, montos incorrectos, reembolsos pendientes', requiresHuman: false, slaHours: 12 },
    { name: 'Integración API', description: 'Errores de integración técnica, webhooks fallidos, problemas de SDK', requiresHuman: false, slaHours: 24 },
    { name: 'Acceso y Cuenta', description: 'Problemas de login, bloqueo de cuenta, gestión de usuarios y permisos', requiresHuman: false, slaHours: 16 },
    { name: 'Operaciones Generales', description: 'Consultas sobre funcionalidades, configuración del dashboard, reportes', requiresHuman: false, slaHours: 48 },
  ]

  const categories: Category[] = []
  for (const data of categoryData) {
    const existing = await em.findOne(Category, { where: { name: data.name } })
    categories.push(existing ?? await em.save(em.create(Category, data)))
  }

  const adminHash = await bcrypt.hash('Admin1234!', 10)
  const agentHash = await bcrypt.hash('Agent1234!', 10)

  const agentData = [
    { name: 'Admin StartupAy', email: 'admin@startupay.com', passwordHash: adminHash, role: AgentRole.ADMIN, maxCapacity: 999 },
    { name: 'Ana García', email: 'ana@startupay.com', passwordHash: agentHash, role: AgentRole.AGENT, maxCapacity: 15 },
    { name: 'Carlos López', email: 'carlos@startupay.com', passwordHash: agentHash, role: AgentRole.AGENT, maxCapacity: 15 },
    { name: 'María Torres', email: 'maria@startupay.com', passwordHash: agentHash, role: AgentRole.SUPERVISOR, maxCapacity: 10 },
  ]

  const agents: Agent[] = []
  for (const data of agentData) {
    const existing = await em.findOne(Agent, { where: { email: data.email } })
    agents.push(existing ?? await em.save(em.create(Agent, data)))
  }

  const fraud = categories.find(c => c.name === 'Fraude')!
  const compliance = categories.find(c => c.name === 'Compliance')!
  const api = categories.find(c => c.name === 'Integración API')!
  const [, ana, carlos, maria] = agents

  const skillsData = [
    { agentId: ana.id, categoryId: fraud.id },
    { agentId: ana.id, categoryId: compliance.id },
    { agentId: carlos.id, categoryId: api.id },
    { agentId: maria.id, categoryId: fraud.id },
  ]
  for (const data of skillsData) {
    const existing = await em.findOne(AgentSkill, { where: data })
    if (!existing) await em.save(em.create(AgentSkill, data))
  }

  console.log(`Seed completado: ${categories.length} categorías, ${agents.length} agentes`)
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.enableCors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' })

  const port = process.env.PORT ?? 3001
  await app.listen(port)
  console.log(`Backend corriendo en http://localhost:${port}`)

  const dataSource = app.get(DataSource)
  await runSeed(dataSource)
}

bootstrap()
