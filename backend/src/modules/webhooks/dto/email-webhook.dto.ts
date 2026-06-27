import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

class AttachmentDto {
  @IsString()
  filename: string

  @IsString()
  url: string

  @IsString()
  mimeType: string

  size: number
}

export class EmailWebhookDto {
  @IsString()
  from: string

  @IsString()
  subject: string

  @IsString()
  body: string

  @IsString()
  date: string

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[]
}
