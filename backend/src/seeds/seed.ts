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
    // requiresHuman = true → always escalate (HITL obligatorio)
    { name: 'Fraude',                  description: 'Transacciones no reconocidas, uso no autorizado de cuenta, robo de identidad, cuenta comprometida',                             requiresHuman: true,  slaHours: 4  },
    { name: 'Compliance',              description: 'Cumplimiento regulatorio, KYC/AML avanzado, documentación legal, reportes regulatorios, auditorías',                           requiresHuman: true,  slaHours: 8  },
    // Categorías operativas — agente puede sugerir/ejecutar
    { name: 'Pago Fallido',            description: 'Transacción rechazada, error de procesamiento, pago declinado por el banco, timeout de pasarela',                              requiresHuman: false, slaHours: 6  },
    { name: 'Disputas y Contracargos', description: 'Contracargos iniciados, pagos duplicados, montos incorrectos, reembolsos pendientes o rechazados',                             requiresHuman: false, slaHours: 12 },
    { name: 'Integración API',         description: 'Errores de integración técnica, webhooks fallidos, problemas de SDK, certificados, autenticación OAuth',                       requiresHuman: false, slaHours: 24 },
    { name: 'Acceso y Cuenta',         description: 'Problemas de login, bloqueo de cuenta, recuperación de contraseña, gestión de usuarios, permisos de rol',                     requiresHuman: false, slaHours: 16 },
    { name: 'Límites y Verificación',  description: 'Límites de transacción alcanzados, verificación de identidad básica, onboarding de usuarios, documentos pendientes',          requiresHuman: false, slaHours: 24 },
    { name: 'Liquidaciones',           description: 'Demoras en desembolso, settlement no recibido, discrepancias en liquidación, conciliación de saldos',                         requiresHuman: false, slaHours: 8  },
    { name: 'Soporte General',         description: 'Consultas sobre funcionalidades, configuración del dashboard, generación de reportes, dudas sobre el producto',               requiresHuman: false, slaHours: 48 },
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
  const fraud        = categories.find(c => c.name === 'Fraude')!
  const compliance   = categories.find(c => c.name === 'Compliance')!
  const api          = categories.find(c => c.name === 'Integración API')!
  const disputes     = categories.find(c => c.name === 'Disputas y Contracargos')!
  const liquidations = categories.find(c => c.name === 'Liquidaciones')!
  const [, ana, carlos, maria] = agents

  const skillsData = [
    { agentId: ana.id,    categoryId: fraud.id },
    { agentId: ana.id,    categoryId: compliance.id },
    { agentId: ana.id,    categoryId: disputes.id },
    { agentId: carlos.id, categoryId: api.id },
    { agentId: carlos.id, categoryId: liquidations.id },
    { agentId: maria.id,  categoryId: fraud.id },
    { agentId: maria.id,  categoryId: disputes.id },
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
