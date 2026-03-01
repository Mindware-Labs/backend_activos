import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PersonType } from '../entities/employee.entity';
import { IsValidCedula } from '../../common/is-valid-cedula.decorator';
import { IsNotFutureDate } from '../../common/is-not-future-date.decorator';

export class CreateEmployeeDto {
  @ApiProperty({
    description: 'Nombre completo del empleado',
    example: 'Juan Pérez',
    minLength: 3,
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'El nombre del empleado es obligatorio' })
  @IsString({ message: 'El nombre del empleado debe ser una cadena de texto' })
  @MinLength(3, {
    message: 'El nombre del empleado debe tener al menos 3 caracteres',
  })
  @MaxLength(255, {
    message: 'El nombre del empleado no puede exceder 255 caracteres',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;

  @ApiProperty({
    description:
      'Cédula de identidad del empleado (válida según algoritmo dominicano)',
    example: '00112345678',
  })
  @IsValidCedula({ message: 'La cédula debe ser válida' })
  cedula: string;

  @ApiProperty({
    description: 'Tipo de persona',
    enum: PersonType,
    example: PersonType.FISICA,
  })
  @IsEnum(PersonType, {
    message: `El tipo de persona debe ser uno de los siguientes valores: ${Object.values(
      PersonType,
    ).join(', ')}`,
  })
  personType: PersonType;

  @ApiProperty({
    description: 'Fecha de contratación del empleado (no puede ser futura)',
    example: '2024-01-15',
    format: 'date',
  })
  @IsDateString(
    {},
    {
      message:
        'La fecha de contratación debe ser una fecha válida en formato AAAA-MM-DD',
    },
  )
  @IsNotFutureDate({
    message: 'La fecha de contratación no puede ser futura',
  })
  hireDate: string;

  @ApiProperty({
    description: 'ID del departamento al que pertenece el empleado',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del departamento es obligatorio' })
  @IsNumber({}, { message: 'El ID del departamento debe ser un número' })
  @IsPositive({ message: 'El ID del departamento debe ser un número positivo' })
  departmentId: number;
}
