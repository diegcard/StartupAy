import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SlaService } from './sla.service'
import { Category } from '../../entities/category.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  providers: [SlaService],
  exports: [SlaService],
})
export class SlaModule {}
