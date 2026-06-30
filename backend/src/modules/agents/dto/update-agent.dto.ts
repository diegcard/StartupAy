import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { AgentRole } from '../../../entities/enums'

export class UpdateAgentDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsEnum(AgentRole)
  role?: AgentRole

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxCapacity?: number

  @IsOptional()
  @IsString()
  password?: string

  @IsOptional()
  categoryIds?: string[]
}
