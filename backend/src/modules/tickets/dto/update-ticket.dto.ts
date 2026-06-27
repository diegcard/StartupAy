import { IsString, IsOptional, IsEnum } from 'class-validator'
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
}
