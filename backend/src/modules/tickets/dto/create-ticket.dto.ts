import { IsString, IsOptional, IsEnum } from 'class-validator'
import { Channel } from '../../../entities/enums'

export class CreateTicketDto {
  @IsString()
  title: string

  @IsString()
  description: string

  @IsEnum(Channel)
  channel: Channel

  @IsString()
  @IsOptional()
  merchantId?: string

  @IsString()
  @IsOptional()
  transactionId?: string

  @IsString()
  @IsOptional()
  contactEmail?: string

  @IsString()
  @IsOptional()
  contactPhone?: string

  @IsString()
  @IsOptional()
  categoryId?: string
}
