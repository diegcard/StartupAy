import { IsString, IsOptional } from 'class-validator'

export class WhatsAppWebhookDto {
  @IsString()
  from: string

  @IsString()
  body: string

  @IsString()
  timestamp: string

  @IsString()
  @IsOptional()
  mediaUrl?: string
}
