import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Category } from '../../entities/category.entity'

export interface GeminiClassification {
  categoryId: string
  categoryName: string
  confidence: number
  summary: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  reasoning: string
  draftResponse?: string
}

export interface TicketContext {
  channel?: string
  merchantId?: string
  transactionId?: string
  contactEmail?: string
}

@Injectable()
export class GeminiService {
  private readonly genAI: GoogleGenerativeAI

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  }

  async classifyTicket(
    title: string,
    description: string,
    ctx: TicketContext = {},
  ): Promise<GeminiClassification | null> {
    try {
      const categories = await this.categoryRepository.find({
        select: ['id', 'name', 'description', 'requiresHuman', 'slaHours'],
      })

      const categoryList = categories
        .map(c =>
          `- ID: ${c.id} | Nombre: ${c.name} | SLA: ${c.slaHours}h | RequiereHumano: ${c.requiresHuman} | Descripción: ${c.description}`,
        )
        .join('\n')

      const sensitiveIds = categories.filter(c => c.requiresHuman).map(c => c.id)

      const channelCtx = ctx.channel
        ? `Canal de entrada: ${ctx.channel}${ctx.channel === 'WHATSAPP' ? ' (mensaje informal, posiblemente incompleto)' : ctx.channel === 'EMAIL' ? ' (mensaje formal, probablemente más detallado)' : ' (formulario web estructurado)'}`
        : ''

      const metaCtx = [
        ctx.merchantId     ? `Comercio/Merchant: ${ctx.merchantId}` : '',
        ctx.transactionId  ? `ID Transacción: ${ctx.transactionId}` : '',
        ctx.contactEmail   ? `Email contacto: ${ctx.contactEmail}` : '',
      ].filter(Boolean).join('\n')

      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })

      const prompt = `Eres el clasificador de tickets de soporte de StartupAy, una fintech colombiana de pagos digitales.

## CONTEXTO DEL TICKET
${channelCtx}
${metaCtx}
Título: ${title}
Descripción: ${description}

## CATEGORÍAS DISPONIBLES
${categoryList}

## REGLAS DE CLASIFICACIÓN

### Prioridad
- CRITICAL: fraude activo, cuenta comprometida, problema que bloquea pagos de múltiples comercios, datos financieros en riesgo, compliance regulatorio urgente
- HIGH: pago fallido con monto involucrado, webhook caído en producción, cuenta bloqueada, liquidación retrasada >24h, disputa con banco iniciada
- MEDIUM: problema de integración no urgente, acceso sin urgencia, límite alcanzado, verificación pendiente
- LOW: consulta general, configuración del dashboard, reporte, duda sobre funcionalidad

### Confianza (0.0 – 1.0) — calibración obligatoria
- 0.90 – 1.00: descripción clara, keywords exactas de la categoría, sin ambigüedad
- 0.70 – 0.89: descripción suficiente, categoría probable pero con algún elemento incierto
- 0.50 – 0.69: descripción ambigua, podría ser 2 categorías distintas
- 0.00 – 0.49: información insuficiente, contradicción interna o ticket ininteligible → SIEMPRE escalar

### Categorías sensibles (RequiereHumano = true)
IDs sensibles: ${sensitiveIds.join(', ')}
Para estas categorías: asignar aunque la confianza sea baja; el especialista humano decide.

### Borrador de respuesta (draftResponse)
- Genera SOLO si: la categoría NO es sensible (RequiereHumano = false) Y confianza >= 0.70
- El borrador es una respuesta en español, cordial y profesional, de máximo 3 oraciones, que:
  1. Acusa recibo del ticket
  2. Explica brevemente qué pasará a continuación (el especialista revisará / el proceso que aplica)
  3. Indica el tiempo estimado de respuesta según el SLA de la categoría
- Si la categoría es sensible o la confianza < 0.70: devuelve draftResponse como null

## FORMATO DE RESPUESTA
Responde ÚNICAMENTE con JSON válido, sin markdown ni texto adicional:
{
  "categoryId": "<id exacto de la lista>",
  "categoryName": "<nombre exacto>",
  "confidence": <número 0.0–1.0>,
  "priority": "<LOW|MEDIUM|HIGH|CRITICAL>",
  "summary": "<resumen del problema en 1-2 oraciones en español>",
  "reasoning": "<explicación de 1 oración de por qué esta categoría>",
  "draftResponse": "<borrador de respuesta o null>"
}`

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const result = await model.generateContent(prompt)
          const text = result.response.text().trim()
          const jsonMatch = text.match(/\{[\s\S]*\}/)
          if (!jsonMatch) return null
          const parsed = JSON.parse(jsonMatch[0]) as GeminiClassification
          if ((parsed.draftResponse as any) === 'null' || parsed.draftResponse === null) {
            parsed.draftResponse = undefined
          }
          return parsed
        } catch (err: any) {
          if (err?.status !== 429) throw err

          const isDailyQuota = this.isDailyQuotaExhausted(err)
          if (isDailyQuota) {
            console.error(`[Gemini] Cuota diaria agotada en el tier gratuito. El ticket se creará sin clasificación IA hasta que se renueve la cuota (medianoche PT).`)
            throw err
          }

          if (attempt >= 3) throw err

          const retryAfterMs = this.parseRetryDelay(err) ?? attempt * 15_000
          console.warn(`[Gemini] Rate limit por minuto — reintentando en ${retryAfterMs / 1000}s (intento ${attempt}/3)`)
          await new Promise(r => setTimeout(r, retryAfterMs))
        }
      }
      return null
    } catch (err) {
      console.error('[Gemini] Error de clasificación:', err)
      return null
    }
  }

  private isDailyQuotaExhausted(err: any): boolean {
    const violations: any[] = err?.errorDetails?.find(
      (d: any) => d['@type'] === 'type.googleapis.com/google.rpc.QuotaFailure',
    )?.violations ?? []
    return violations.some(v =>
      typeof v.quotaId === 'string' && v.quotaId.toLowerCase().includes('perday'),
    )
  }

  private parseRetryDelay(err: any): number | null {
    const retryInfo = err?.errorDetails?.find(
      (d: any) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo',
    )
    if (!retryInfo?.retryDelay) return null
    const seconds = parseInt(String(retryInfo.retryDelay).replace(/[^0-9]/g, ''), 10)
    return isNaN(seconds) ? null : (seconds + 1) * 1_000
  }
}
