import 'reflect-metadata'
import * as bcrypt from 'bcryptjs'
import dataSource from '../../data-source'
import { Category } from '../entities/category.entity'
import { Agent } from '../entities/agent.entity'
import { AgentSkill } from '../entities/agent-skill.entity'
import { AgentRole } from '../entities/enums'

async function seed() {
  await dataSource.initialize()
  const em = dataSource.manager

  // ── Categorías ──────────────────────────────────────────────────────────────
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
    if (existing) {
      categories.push(existing)
    } else {
      const cat = em.create(Category, data)
      categories.push(await em.save(cat))
    }
  }
  console.log(`✓ ${categories.length} categorías`)

  // ── Agentes ──────────────────────────────────────────────────────────────────
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
    if (existing) {
      agents.push(existing)
    } else {
      const agent = em.create(Agent, data)
      agents.push(await em.save(agent))
    }
  }
  console.log(`✓ ${agents.length} agentes`)

  // ── Skills ───────────────────────────────────────────────────────────────────
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
  console.log(`✓ Skills asignadas`)

  console.log('\nCredenciales:')
  console.log('  Admin:     admin@startupay.com  /  Admin1234!')
  console.log('  Agentes:   *@startupay.com      /  Agent1234!')

  await dataSource.destroy()
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})
