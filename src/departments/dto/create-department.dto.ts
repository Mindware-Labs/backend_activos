import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({
    description: 'Nombre del departamento',
    example: 'Recursos Humanos',
    minLength: 3,
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'El nombre del departamento es obligatorio' })
  @IsString({
    message: 'El nombre del departamento debe ser una cadena de texto',
  })
  @MinLength(3, {
    message: 'El nombre del departamento debe tener al menos 3 caracteres',
  })
  @MaxLength(255, {
    message: 'El nombre del departamento no puede exceder 255 caracteres',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;

  @ApiProperty({
    description: 'Descripción detallada del departamento',
    example: 'Departamento encargado de la gestión del personal',
    minLength: 10,
    maxLength: 1000,
  })
  @IsNotEmpty({ message: 'La descripción del departamento es obligatoria' })
  @IsString({
    message: 'La descripción del departamento debe ser una cadena de texto',
  })
  @MinLength(10, {
    message: 'La descripción debe tener al menos 10 caracteres',
  })
  @MaxLength(1000, {
    message: 'La descripción no puede exceder 1000 caracteres',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  description: string;
}
