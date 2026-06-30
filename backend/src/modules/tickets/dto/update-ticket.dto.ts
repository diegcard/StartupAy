import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator'
import { TicketStatus, Priority } from '../../../entities/enums'

export class UpdateTicketDto {
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus

  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority

  @IsString()
  @IsOptional()
  categoryId?: string

  @IsString()
  @IsOptional()
  assignedTo?: string

  @IsString()
  @IsOptional()
  reason?: string

  @IsBoolean()
  @IsOptional()
  aiSuggested?: boolean

  @IsBoolean()
  @IsOptional()
  isInternal?: boolean
}
