import { IsDateString, IsInt, IsOptional, Max, Min } from 'class-validator';

export class RunDepreciationCalculationDto {
  @IsInt({ message: 'El anio de proceso debe ser un numero entero' })
  @Min(1900, { message: 'El anio de proceso no es valido' })
  @Max(2100, { message: 'El anio de proceso no es valido' })
  processYear: number;

  @IsInt({ message: 'El mes de proceso debe ser un numero entero' })
  @Min(1, { message: 'El mes de proceso debe estar entre 1 y 12' })
  @Max(12, { message: 'El mes de proceso debe estar entre 1 y 12' })
  processMonth: number;

  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'La fecha de proceso debe ser una fecha valida en formato AAAA-MM-DD',
    },
  )
  processDate?: string;
}
