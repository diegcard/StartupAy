import { SlaService } from './sla.service'
import { Priority } from '../../entities/enums'

describe('SlaService', () => {
  let service: SlaService

  const mockCategoryRepository = {
    findOne: jest.fn(),
  }

  beforeEach(() => {
    service = new SlaService(mockCategoryRepository as any)
    jest.clearAllMocks()
  })

  describe('isBreached', () => {
    it('returns false when deadline is null', () => {
      expect(service.isBreached(null)).toBe(false)
    })

    it('returns false when deadline is in the future', () => {
      const future = new Date(Date.now() + 3600000)
      expect(service.isBreached(future)).toBe(false)
    })

    it('returns true when deadline is in the past', () => {
      const past = new Date(Date.now() - 1000)
      expect(service.isBreached(past)).toBe(true)
    })
  })

  describe('getRemainingMinutes', () => {
    it('returns null when deadline is null', () => {
      expect(service.getRemainingMinutes(null)).toBeNull()
    })

    it('returns positive number for future deadline (approx 60 min)', () => {
      const future = new Date(Date.now() + 3600000)
      const remaining = service.getRemainingMinutes(future)
      expect(remaining).toBeGreaterThan(58)
      expect(remaining).toBeLessThan(62)
    })

    it('returns negative number for past deadline', () => {
      const past = new Date(Date.now() - 3600000)
      const remaining = service.getRemainingMinutes(past)
      expect(remaining).toBeLessThan(0)
    })
  })

  describe('calculateDeadline', () => {
    it('uses 24h default when no categoryId', async () => {
      const before = Date.now()
      const deadline = await service.calculateDeadline(null, Priority.MEDIUM)
      const after = Date.now()
      const expectedMs = 24 * 60 * 60 * 1000
      expect(deadline.getTime()).toBeGreaterThan(before + expectedMs - 5000)
      expect(deadline.getTime()).toBeLessThan(after + expectedMs + 5000)
    })

    it('applies CRITICAL multiplier (0.25x on 24h = 6h)', async () => {
      const before = Date.now()
      const deadline = await service.calculateDeadline(null, Priority.CRITICAL)
      const expectedMs = 6 * 60 * 60 * 1000
      expect(deadline.getTime()).toBeGreaterThan(before + expectedMs - 5000)
      expect(deadline.getTime()).toBeLessThan(before + expectedMs + 5000)
    })

    it('applies HIGH multiplier (0.5x on 24h = 12h)', async () => {
      const before = Date.now()
      const deadline = await service.calculateDeadline(null, Priority.HIGH)
      const expectedMs = 12 * 60 * 60 * 1000
      expect(deadline.getTime()).toBeGreaterThan(before + expectedMs - 5000)
      expect(deadline.getTime()).toBeLessThan(before + expectedMs + 5000)
    })

    it('applies LOW multiplier (2x on 24h = 48h)', async () => {
      const before = Date.now()
      const deadline = await service.calculateDeadline(null, Priority.LOW)
      const expectedMs = 48 * 60 * 60 * 1000
      expect(deadline.getTime()).toBeGreaterThan(before + expectedMs - 5000)
      expect(deadline.getTime()).toBeLessThan(before + expectedMs + 5000)
    })

    it('uses slaHours from category when categoryId provided', async () => {
      mockCategoryRepository.findOne.mockResolvedValueOnce({ id: 'cat1', slaHours: 8 })
      const before = Date.now()
      const deadline = await service.calculateDeadline('cat1', Priority.MEDIUM)
      const expectedMs = 8 * 60 * 60 * 1000
      expect(deadline.getTime()).toBeGreaterThan(before + expectedMs - 5000)
      expect(deadline.getTime()).toBeLessThan(before + expectedMs + 5000)
    })

    it('multiplies category slaHours by CRITICAL factor (8h * 0.25 = 2h)', async () => {
      mockCategoryRepository.findOne.mockResolvedValueOnce({ id: 'cat1', slaHours: 8 })
      const before = Date.now()
      const deadline = await service.calculateDeadline('cat1', Priority.CRITICAL)
      const expectedMs = 2 * 60 * 60 * 1000
      expect(deadline.getTime()).toBeGreaterThan(before + expectedMs - 5000)
      expect(deadline.getTime()).toBeLessThan(before + expectedMs + 5000)
    })

    it('falls back to 24h default when categoryId not found', async () => {
      mockCategoryRepository.findOne.mockResolvedValueOnce(null)
      const before = Date.now()
      const deadline = await service.calculateDeadline('nonexistent', Priority.MEDIUM)
      const expectedMs = 24 * 60 * 60 * 1000
      expect(deadline.getTime()).toBeGreaterThan(before + expectedMs - 5000)
      expect(deadline.getTime()).toBeLessThan(before + expectedMs + 5000)
    })
  })
})
