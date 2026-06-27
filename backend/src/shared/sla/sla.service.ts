import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Priority } from '../../entities/enums'
import { Category } from '../../entities/category.entity'

const PRIORITY_MULTIPLIERS: Record<Priority, number> = {
  [Priority.CRITICAL]: 0.25,
  [Priority.HIGH]: 0.5,
  [Priority.MEDIUM]: 1,
  [Priority.LOW]: 2,
}

@Injectable()
export class SlaService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async calculateDeadline(categoryId: string | null, priority: Priority): Promise<Date> {
    let slaHours = 24
    if (categoryId) {
      const category = await this.categoryRepository.findOne({ where: { id: categoryId } })
      if (category) slaHours = category.slaHours
    }
    const adjustedHours = slaHours * PRIORITY_MULTIPLIERS[priority]
    const deadline = new Date()
    deadline.setHours(deadline.getHours() + adjustedHours)
    return deadline
  }

  isBreached(deadline: Date | null): boolean {
    if (!deadline) return false
    return new Date() > deadline
  }

  getRemainingMinutes(deadline: Date | null): number | null {
    if (!deadline) return null
    return Math.floor((deadline.getTime() - Date.now()) / 60000)
  }
}
