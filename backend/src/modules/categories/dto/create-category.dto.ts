import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsString()
  description: string

  @IsOptional()
  @IsBoolean()
  requiresHuman?: boolean

  @IsOptional()
  @IsNumber()
  @Min(1)
  slaHours?: number
}
