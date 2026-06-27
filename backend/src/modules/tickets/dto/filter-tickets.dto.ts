import { IsOptional, IsString, IsEnum } from 'class-validator'
import { TicketStatus, Priority } from '../../../entities/enums'

export class FilterTicketsDto {
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus

  @IsString()
  @IsOptional()
  categoryId?: string

  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority

  @IsString()
  @IsOptional()
  assignedTo?: string

  @IsString()
  @IsOptional()
  page?: string

  @IsString()
  @IsOptional()
  limit?: string
}
