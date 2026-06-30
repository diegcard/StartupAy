import { GeminiService } from './gemini.service'

const mockGenerateContent = jest.fn()
const mockGetGenerativeModel = jest.fn(() => ({
  generateContent: mockGenerateContent,
}))

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: mockGetGenerativeModel,
  })),
}))

describe('GeminiService', () => {
  let service: GeminiService

  const mockCategoryRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  }

  const mockCategories = [
    { id: 'cat-1', name: 'Pagos fallidos', description: 'Problemas con pagos rechazados' },
    { id: 'cat-2', name: 'Fraude', description: 'Transacciones sospechosas' },
  ]

  beforeEach(() => {
    service = new GeminiService(mockCategoryRepository as any)
    jest.clearAllMocks()
    process.env.GEMINI_API_KEY = 'test-key'
  })

  describe('classifyTicket', () => {
    it('returns null when no categories exist', async () => {
      mockCategoryRepository.find.mockResolvedValueOnce([])
      const result = await service.classifyTicket('Test ticket', 'Description')
      expect(result).toBeNull()
    })

    it('returns null when Gemini API throws an error', async () => {
      mockCategoryRepository.find.mockResolvedValueOnce(mockCategories)
      mockGenerateContent.mockRejectedValueOnce(new Error('API error'))
      const result = await service.classifyTicket('Test ticket', 'Description')
      expect(result).toBeNull()
    })

    it('returns null when Gemini response has no JSON', async () => {
      mockCategoryRepository.find.mockResolvedValueOnce(mockCategories)
      mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => 'No JSON here just text' },
      })
      const result = await service.classifyTicket('Test ticket', 'Description')
      expect(result).toBeNull()
    })

    it('returns classification when Gemini returns valid JSON', async () => {
      mockCategoryRepository.find.mockResolvedValueOnce(mockCategories)
      const classification = {
        categoryId: 'cat-1',
        categoryName: 'Pagos fallidos',
        confidence: 0.92,
        priority: 'HIGH',
        summary: 'El cliente no puede procesar pagos',
        reasoning: 'Menciona pago rechazado',
      }
      mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => JSON.stringify(classification) },
      })
      const result = await service.classifyTicket(
        'No puedo procesar pagos',
        'Mi pago fue rechazado ayer',
      )
      expect(result).toEqual(classification)
      expect(result?.confidence).toBe(0.92)
      expect(result?.categoryId).toBe('cat-1')
    })

    it('extracts JSON from Gemini response with surrounding text', async () => {
      mockCategoryRepository.find.mockResolvedValueOnce(mockCategories)
      const classification = {
        categoryId: 'cat-2',
        categoryName: 'Fraude',
        confidence: 0.88,
        priority: 'CRITICAL',
        summary: 'Posible fraude detectado',
        reasoning: 'Menciona transacción no reconocida',
      }
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => `Aquí está mi análisis: ${JSON.stringify(classification)} fin.`,
        },
      })
      const result = await service.classifyTicket('Transacción extraña', 'No reconozco este cargo')
      expect(result?.categoryId).toBe('cat-2')
      expect(result?.priority).toBe('CRITICAL')
    })

    it('includes all category IDs and names in the prompt sent to Gemini', async () => {
      mockCategoryRepository.find.mockResolvedValueOnce(mockCategories)
      mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => 'no json' },
      })
      await service.classifyTicket('title', 'description')
      const callArgs = mockGenerateContent.mock.calls[0][0] as string
      expect(callArgs).toContain('cat-1')
      expect(callArgs).toContain('Pagos fallidos')
      expect(callArgs).toContain('cat-2')
      expect(callArgs).toContain('Fraude')
    })
  })
})
