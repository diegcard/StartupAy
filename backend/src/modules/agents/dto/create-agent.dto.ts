import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { AgentRole } from '../../../entities/enums'

export class CreateAgentDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsString()
  password: string

  @IsOptional()
  @IsEnum(AgentRole)
  role?: AgentRole

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxCapacity?: number

  @IsOptional()
  categoryIds?: string[]
}
