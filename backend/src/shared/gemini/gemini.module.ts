import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GeminiService } from './gemini.service'
import { Category } from '../../entities/category.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  providers: [GeminiService],
  exports: [GeminiService],
})
export class GeminiModule {}
