import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotFutureDate } from '../../common/is-not-future-date.decorator';

export class CreateFixedAssetDto {
  @ApiProperty({
    description: 'Nombre del activo fijo',
    example: 'Laptop Dell Precision 5570',
    minLength: 3,
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'El nombre del activo fijo es obligatorio' })
  @IsString({
    message: 'El nombre del activo fijo debe ser una cadena de texto',
  })
  @MinLength(3, {
    message: 'El nombre del activo fijo debe tener al menos 3 caracteres',
  })
  @MaxLength(255, {
    message: 'El nombre del activo fijo no puede exceder 255 caracteres',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;

  @ApiProperty({
    description: 'Descripción detallada del activo fijo',
    example: 'Laptop para desarrollo, Intel i7, 32GB RAM, 1TB SSD',
    minLength: 10,
    maxLength: 1000,
  })
  @IsNotEmpty({ message: 'La descripcion del activo fijo es obligatoria' })
  @IsString({
    message: 'La descripcion del activo fijo debe ser una cadena de texto',
  })
  @MinLength(10, {
    message: 'La descripción del activo fijo debe tener al menos 10 caracteres',
  })
  @MaxLength(1000, {
    message: 'La descripción del activo fijo no puede exceder 1000 caracteres',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  description: string;

  @ApiProperty({
    description: 'Fecha de registro del activo (no puede ser futura)',
    example: '2024-01-15',
    format: 'date',
  })
  @IsNotEmpty({
    message: 'La fecha de registro del activo fijo es obligatoria',
  })
  @IsDateString(
    {},
    {
      message:
        'La fecha de registro del activo fijo debe ser en formato AAAA-MM-DD',
    },
  )
  @IsNotFutureDate({
    message: 'La fecha de registro no puede ser futura',
  })
  registrationDate: string;

  @ApiProperty({
    description: 'Valor de compra del activo',
    example: 75000.0,
    maximum: 999999999.99,
  })
  @IsNotEmpty({ message: 'El valor de compra del activo fijo es obligatorio' })
  @IsNumber(
    {},
    { message: 'El valor de compra del activo fijo debe ser un numero' },
  )
  @IsPositive({
    message: 'El valor de compra del activo fijo debe ser un numero positivo',
  })
  @Max(999999999.99, {
    message: 'El valor de compra no puede exceder 999,999,999.99',
  })
  purchaseValue: number;

  @ApiPropertyOptional({
    description: 'Valor residual del activo al final de su vida útil',
    example: 5000.0,
    minimum: 0,
    maximum: 999999999.99,
  })
  @IsOptional()
  @IsNumber(
    {},
    { message: 'El valor residual del activo fijo debe ser un numero' },
  )
  @Min(0, {
    message: 'El valor residual del activo fijo debe ser mayor o igual a cero',
  })
  @Max(999999999.99, {
    message: 'El valor residual no puede exceder 999,999,999.99',
  })
  residualValue?: number;

  @ApiProperty({
    description: 'Vida útil del activo en meses',
    example: 60,
    minimum: 1,
    maximum: 600,
  })
  @IsNotEmpty({ message: 'La vida util en meses es obligatoria' })
  @IsInt({ message: 'La vida util en meses debe ser un numero entero' })
  @IsPositive({
    message: 'La vida util en meses debe ser un numero positivo',
  })
  @Max(600, {
    message: 'La vida util en meses no puede exceder 600 meses (50 años)',
  })
  usefulLifeMonths: number;

  @ApiProperty({
    description: 'ID del departamento al que pertenece el activo',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del departamento es obligatorio' })
  @IsNumber({}, { message: 'El ID del departamento debe ser un numero' })
  @IsPositive({ message: 'El ID del departamento debe ser un numero positivo' })
  departmentId: number;

  @ApiProperty({
    description: 'ID del tipo de activo (categoría)',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del tipo de activo es obligatorio' })
  @IsNumber({}, { message: 'El ID del tipo de activo debe ser un numero' })
  @IsPositive({
    message: 'El ID del tipo de activo debe ser un numero positivo',
  })
  assetTypeId: number;
}
