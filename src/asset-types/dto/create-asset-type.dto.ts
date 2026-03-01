import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssetTypeDto {
  @ApiProperty({
    description: 'Nombre del tipo de activo',
    example: 'Equipos de Computación',
    minLength: 3,
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'El nombre del Tipo de Activo es obligatorio' })
  @IsString({
    message: 'El nombre del Tipo de Activo debe ser una cadena de texto',
  })
  @MinLength(3, {
    message: 'El nombre del Tipo de Activo debe tener al menos 3 caracteres',
  })
  @MaxLength(255, {
    message: 'El nombre del Tipo de Activo no puede exceder 255 caracteres',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;

  @ApiProperty({
    description: 'Descripción detallada del tipo de activo',
    example: 'Computadoras, laptops, monitores y periféricos relacionados',
    minLength: 10,
    maxLength: 1000,
  })
  @IsNotEmpty({ message: 'La descripción del Tipo de Activo es obligatoria' })
  @IsString({
    message: 'La descripción del Tipo de Activo debe ser una cadena de texto',
  })
  @MinLength(10, {
    message:
      'La descripción del Tipo de Activo debe tener al menos 10 caracteres',
  })
  @MaxLength(1000, {
    message:
      'La descripción del Tipo de Activo no puede exceder 1000 caracteres',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  description: string;

  @ApiProperty({
    description: 'Cuenta contable de compra',
    example: '1205-001',
    maxLength: 30,
  })
  @IsNotEmpty({
    message: 'La cuenta de compra del Tipo de Activo es obligatoria',
  })
  @IsString({
    message:
      'La cuenta de compra del Tipo de Activo debe ser una cadena de texto',
  })
  @MaxLength(30, {
    message: 'La cuenta de compra no puede exceder 30 caracteres',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  purchaseAccount: string;

  @ApiProperty({
    description: 'Cuenta contable de depreciación',
    example: '5105-001',
    maxLength: 30,
  })
  @IsNotEmpty({
    message: 'La cuenta de depreciación del Tipo de Activo es obligatoria',
  })
  @IsString({
    message:
      'La cuenta de depreciación del Tipo de Activo debe ser una cadena de texto',
  })
  @MaxLength(30, {
    message: 'La cuenta de depreciación no puede exceder 30 caracteres',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  depreciationAccount: string;
}
