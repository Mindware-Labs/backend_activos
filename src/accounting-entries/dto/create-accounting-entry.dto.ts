import { IsInt, Max, Min } from 'class-validator';

export class CreateAccountingEntryDto {
  @IsInt({ message: 'El año debe ser un número entero' })
  @Min(2000)
  @Max(2100)
  year: number;

  @IsInt({ message: 'El mes debe ser un número entero' })
  @Min(1)
  @Max(12)
  month: number;
}
