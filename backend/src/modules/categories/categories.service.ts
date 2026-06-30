import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Category } from '../../entities/category.entity'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  findAll() {
    return this.categoryRepository.find({ order: { name: 'ASC' } })
  }

  async findOne(id: string) {
    const cat = await this.categoryRepository.findOne({ where: { id } })
    if (!cat) throw new NotFoundException('Categoría no encontrada')
    return cat
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.categoryRepository.findOne({ where: { name: dto.name } })
    if (existing) throw new ConflictException('Ya existe una categoría con ese nombre')

    const category = this.categoryRepository.create({
      name: dto.name,
      description: dto.description,
      requiresHuman: dto.requiresHuman ?? false,
      slaHours: dto.slaHours ?? 24,
    })
    return this.categoryRepository.save(category)
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({ where: { id } })
    if (!category) throw new NotFoundException('Categoría no encontrada')

    if (dto.name && dto.name !== category.name) {
      const existing = await this.categoryRepository.findOne({ where: { name: dto.name } })
      if (existing) throw new ConflictException('Ya existe una categoría con ese nombre')
    }

    await this.categoryRepository.update(id, dto)
    return this.categoryRepository.findOne({ where: { id } })
  }

  async remove(id: string) {
    const category = await this.categoryRepository.findOne({ where: { id } })
    if (!category) throw new NotFoundException('Categoría no encontrada')
    await this.categoryRepository.delete(id)
    return { message: 'Categoría eliminada correctamente' }
  }
}
