import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class ResolveEscalationDto {
  @IsBoolean()
  @IsNotEmpty()
  wasAiCorrect: boolean

  @IsString()
  @IsOptional()
  resolutionNote?: string

  // Si wasAiCorrect=false, el especialista puede indicar la categoría correcta
  // para actualizar el ticket en el mismo paso (re-evaluación post-resolución)
  @IsString()
  @IsOptional()
  correctCategoryId?: string
}
