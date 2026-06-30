import { IsOptional, IsString, IsEnum } from 'class-validator'
import { TicketStatus, Priority, Channel } from '../../../entities/enums'

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

  @IsEnum(Channel)
  @IsOptional()
  channel?: Channel

  @IsString()
  @IsOptional()
  search?: string

  @IsString()
  @IsOptional()
  sortBy?: string

  @IsString()
  @IsOptional()
  sortDir?: string

  @IsString()
  @IsOptional()
  page?: string

  @IsString()
  @IsOptional()
  limit?: string
}
