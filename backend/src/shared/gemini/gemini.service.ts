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

  async classifyTicket(title: string, description: string): Promise<GeminiClassification | null> {
    try {
      const categories = await this.categoryRepository.find({
        select: ['id', 'name', 'description'],
      })

      const categoryList = categories
        .map(c => `- ID: ${c.id} | Nombre: ${c.name} | Descripción: ${c.description}`)
        .join('\n')

      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash-8b' })

      const prompt = `Eres un clasificador de tickets de soporte para una plataforma fintech de pagos.

CATEGORÍAS DISPONIBLES:
${categoryList}

TICKET A CLASIFICAR:
Título: ${title}
Descripción: ${description}

Responde ÚNICAMENTE con un JSON válido con esta estructura:
{
  "categoryId": "<id exacto de la categoría>",
  "categoryName": "<nombre de la categoría>",
  "confidence": <número entre 0 y 1>,
  "priority": "<LOW|MEDIUM|HIGH|CRITICAL>",
  "summary": "<resumen del ticket en 1-2 oraciones en español>",
  "reasoning": "<explicación breve de por qué elegiste esta categoría>"
}

Si el ticket menciona fraude, disputas o compliance, asigna priority CRITICAL.
Si hay monto de dinero involucrado, asigna priority HIGH como mínimo.`

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const result = await model.generateContent(prompt)
          const text = result.response.text().trim()
          const jsonMatch = text.match(/\{[\s\S]*\}/)
          if (!jsonMatch) return null
          return JSON.parse(jsonMatch[0]) as GeminiClassification
        } catch (err: any) {
          const isRateLimit = err?.status === 429
          if (isRateLimit && attempt < 3) {
            const delay = attempt * 15_000
            console.warn(`Gemini rate limit, reintentando en ${delay / 1000}s (intento ${attempt}/3)`)
            await new Promise(r => setTimeout(r, delay))
            continue
          }
          throw err
        }
      }
      return null
    } catch (err) {
      console.error('Gemini classification error:', err)
      return null
    }
  }
}
