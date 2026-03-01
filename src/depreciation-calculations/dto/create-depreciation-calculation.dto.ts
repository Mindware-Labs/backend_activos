import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateDepreciationCalculationDto {
  @Min(1900)
  @Max(2100)
  processYear: number;

  @Min(1)
  @Max(12)
  processMonth: number;

  @IsDateString(
    {},
    {
      message:
        'La fecha de proceso debe ser una fecha válida en formato AAAA-MM-DD',
    },
  )
  processDate: string;

  @IsNotEmpty({ message: 'El monto de depreciación es obligatorio' })
  @IsNumber({}, { message: 'El monto de depreciación debe ser un número' })
  @IsPositive({
    message: 'El monto de depreciación debe ser un número positivo',
  })
  amountDepreciation: number;

  @IsNotEmpty({ message: 'La depreciación acumulada es obligatoria' })
  @IsNumber({}, { message: 'La depreciación acumulada debe ser un número' })
  @IsPositive({
    message: 'La depreciación acumulada debe ser un número positivo',
  })
  accumulatedDepreciation: number;

  @IsNotEmpty({ message: 'La cuenta de compra es obligatoria' })
  @IsString({ message: 'La cuenta de compra debe ser una cadena de texto' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  purchaseAccount: string;

  @IsNotEmpty({ message: 'La cuenta de depreciación es obligatoria' })
  @IsString({
    message: 'La cuenta de depreciación debe ser una cadena de texto',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  depreciationAccount: string;

  @IsNotEmpty({ message: 'El ID del activo fijo es obligatorio' })
  @IsNumber({}, { message: 'El ID del activo fijo debe ser un número' })
  @IsPositive({ message: 'El ID del activo fijo debe ser un número positivo' })
  fixedAssetId: number;
}
