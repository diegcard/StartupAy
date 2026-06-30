import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsBoolean()
  requiresHuman?: boolean

  @IsOptional()
  @IsNumber()
  @Min(1)
  slaHours?: number
}
